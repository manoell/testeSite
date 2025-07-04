/**
 * high-contrast.js - Sistema de Alto Contraste Otimizado
 * Versão otimizada: removidas funcionalidades de debug, simplificado cache
 */

const CONTRAST_CONFIG = {
    STORAGE_KEY: 'contrastState',
    CSS_CLASS: 'contrast',
    TOOLTIP_CLASSES: {
        normal: 'title',
        contrast: 'title-c'
    },
    SELECTORS: {
        BODY: 'body',
        TOOLTIP: '#tooltip-vermais'
    }
};

/**
 * Cache DOM simplificado
 */
class ContrastDOMCache {
    constructor() {
        this.cache = new Map();
        this.initializeCache();
    }

    initializeCache() {
        this.cache.set('BODY', document.body);
        this.cache.set('TOOLTIP', document.querySelector(CONTRAST_CONFIG.SELECTORS.TOOLTIP));
    }

    get(key) {
        return this.cache.get(key);
    }

    refresh(key) {
        if (key === 'TOOLTIP') {
            this.cache.set('TOOLTIP', document.querySelector(CONTRAST_CONFIG.SELECTORS.TOOLTIP));
        }
        return this.cache.get(key);
    }
}

/**
 * Sistema de Alto Contraste Otimizado
 */
const ContrastSystem = (function() {
    const domCache = new ContrastDOMCache();
    let currentState = null;
    let isInitialized = false;

    const Contrast = {
        storage: CONTRAST_CONFIG.STORAGE_KEY,
        cssClass: CONTRAST_CONFIG.CSS_CLASS,
        currentState: null,
        check: checkContrast,
        getState: getContrastState,
        setState: setContrastState,
        toggle: toggleContrast,
        updateView: updateViewContrast,
        init: initializeSystem,
        destroy: cleanup
    };

    function initializeSystem() {
        if (isInitialized) return;

        try {
            checkContrast();
            setupGlobalFunction();
            setupEventListeners();
            isInitialized = true;
        } catch (error) {
            console.error('Erro ao inicializar sistema de contraste:', error);
        }
    }

    function setupGlobalFunction() {
        window.toggleContrast = function() {
            Contrast.toggle();
        };
    }

    function setupEventListeners() {
        window.addEventListener('storage', handleStorageChange);
        
        const observer = new MutationObserver(handleDOMChanges);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }

    function handleStorageChange(event) {
        if (event.key === CONTRAST_CONFIG.STORAGE_KEY) {
            currentState = event.newValue === 'true';
            updateViewContrast();
        }
    }

    function handleDOMChanges(mutations) {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tooltip = node.querySelector?.(CONTRAST_CONFIG.SELECTORS.TOOLTIP);
                    if (tooltip) {
                        domCache.refresh('TOOLTIP');
                        updateViewContrast();
                    }
                }
            });
        });
    }

    function checkContrast() {
        currentState = getContrastState();
        updateViewContrast();
    }

    function getContrastState() {
        try {
            const stored = localStorage.getItem(CONTRAST_CONFIG.STORAGE_KEY);
            return stored === 'true';
        } catch (error) {
            console.warn('Erro ao acessar localStorage:', error);
            return false;
        }
    }

    function setContrastState(state) {
        try {
            const normalizedState = Boolean(state);
            localStorage.setItem(CONTRAST_CONFIG.STORAGE_KEY, String(normalizedState));
            currentState = normalizedState;
            Contrast.currentState = normalizedState;
            updateViewContrast();
        } catch (error) {
            console.error('Erro ao salvar estado do contraste:', error);
        }
    }

    function updateViewContrast() {
        const body = domCache.get('BODY');
        const tooltip = domCache.get('TOOLTIP');

        if (!body) return;

        if (currentState === null) {
            currentState = getContrastState();
        }

        if (currentState) {
            enableContrastMode(body, tooltip);
        } else {
            disableContrastMode(body, tooltip);
        }
    }

    function enableContrastMode(body, tooltip) {
        body.classList.add(CONTRAST_CONFIG.CSS_CLASS);
        
        if (tooltip) {
            tooltip.classList.remove(CONTRAST_CONFIG.TOOLTIP_CLASSES.normal);
            tooltip.classList.add(CONTRAST_CONFIG.TOOLTIP_CLASSES.contrast);
        }

        dispatchContrastEvent('enabled');
    }

    function disableContrastMode(body, tooltip) {
        body.classList.remove(CONTRAST_CONFIG.CSS_CLASS);
        
        if (tooltip) {
            tooltip.classList.remove(CONTRAST_CONFIG.TOOLTIP_CLASSES.contrast);
            tooltip.classList.add(CONTRAST_CONFIG.TOOLTIP_CLASSES.normal);
        }

        dispatchContrastEvent('disabled');
    }

    function toggleContrast() {
        const newState = !currentState;
        setContrastState(newState);
    }

    function dispatchContrastEvent(action) {
        const event = new CustomEvent('contrastchange', {
            detail: {
                enabled: currentState,
                action: action,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }

    function forceUpdate() {
        domCache.refresh('TOOLTIP');
        checkContrast();
    }

    function cleanup() {
        window.removeEventListener('storage', handleStorageChange);
        isInitialized = false;
    }

    // Adiciona métodos extras
    Contrast.forceUpdate = forceUpdate;

    return Contrast;
})();

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ContrastSystem.init);
} else {
    ContrastSystem.init();
}

// Cleanup ao sair
window.addEventListener('beforeunload', ContrastSystem.destroy);

// Exporta sistema
window.ContrastSystem = ContrastSystem;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContrastSystem;
}