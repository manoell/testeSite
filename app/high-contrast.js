/**
 * high-contrast.js - Sistema de Alto Contraste Otimizado
 * Módulo para controle de modo de alto contraste com melhorias de performance
 * 
 * Melhorias implementadas:
 * - Corrigido typo 'toogle' → 'toggle'
 * - Cache de elementos DOM
 * - Validação de elementos
 * - Nomenclatura padronizada
 * - Performance otimizada
 * - Sistema de eventos robusto
 */

/**
 * Constantes do sistema de contraste
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
 * Cache de elementos DOM para performance
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
    // Cache de elementos DOM
    const domCache = new ContrastDOMCache();
    
    // Estado do sistema
    let currentState = null;
    let isInitialized = false;

    /**
     * Configuração do objeto Contrast (mantém compatibilidade)
     */
    const Contrast = {
        storage: CONTRAST_CONFIG.STORAGE_KEY,
        cssClass: CONTRAST_CONFIG.CSS_CLASS,
        currentState: null,
        check: checkContrast,
        getState: getContrastState,
        setState: setContrastState,
        toggle: toggleContrast, // Corrigido: 'toogle' → 'toggle'
        updateView: updateViewContrast,
        init: initializeSystem,
        destroy: cleanup
    };

    /**
     * Inicializa o sistema de contraste
     */
    function initializeSystem() {
        if (isInitialized) return;

        try {
            checkContrast();
            setupGlobalFunction();
            setupEventListeners();
            isInitialized = true;
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema de contraste:', error);
        }
    }

    /**
     * Configura função global para compatibilidade
     */
    function setupGlobalFunction() {
        window.toggleContrast = function() {
            Contrast.toggle();
        };
    }

    /**
     * Configura event listeners otimizados
     */
    function setupEventListeners() {
        // Listener para mudanças no localStorage de outras abas
        window.addEventListener('storage', handleStorageChange);
        
        // Listener para mudanças no DOM (tooltip dinâmico)
        const observer = new MutationObserver(handleDOMChanges);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }

    /**
     * Manipula mudanças no localStorage
     * @param {StorageEvent} event - Evento de mudança no storage
     */
    function handleStorageChange(event) {
        if (event.key === CONTRAST_CONFIG.STORAGE_KEY) {
            currentState = event.newValue === 'true';
            updateViewContrast();
        }
    }

    /**
     * Manipula mudanças no DOM
     * @param {MutationRecord[]} mutations - Lista de mutações
     */
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

    /**
     * Verifica e inicializa estado do contraste
     */
    function checkContrast() {
        currentState = getContrastState();
        updateViewContrast();
    }

    /**
     * Obtém estado do contraste do localStorage
     * @returns {boolean} Estado do contraste
     */
    function getContrastState() {
        try {
            const stored = localStorage.getItem(CONTRAST_CONFIG.STORAGE_KEY);
            return stored === 'true';
        } catch (error) {
            console.warn('Erro ao acessar localStorage:', error);
            return false;
        }
    }

    /**
     * Define estado do contraste
     * @param {boolean} state - Novo estado
     */
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

    /**
     * Atualiza visualização do contraste
     */
    function updateViewContrast() {
        const body = domCache.get('BODY');
        const tooltip = domCache.get('TOOLTIP');

        if (!body) {
            console.warn('Elemento body não encontrado');
            return;
        }

        // Determina estado atual se não foi definido
        if (currentState === null) {
            currentState = getContrastState();
        }

        // Aplica ou remove classe de contraste
        if (currentState) {
            enableContrastMode(body, tooltip);
        } else {
            disableContrastMode(body, tooltip);
        }
    }

    /**
     * Ativa modo de alto contraste
     * @param {Element} body - Elemento body
     * @param {Element} tooltip - Elemento tooltip
     */
    function enableContrastMode(body, tooltip) {
        body.classList.add(CONTRAST_CONFIG.CSS_CLASS);
        
        if (tooltip) {
            tooltip.classList.remove(CONTRAST_CONFIG.TOOLTIP_CLASSES.normal);
            tooltip.classList.add(CONTRAST_CONFIG.TOOLTIP_CLASSES.contrast);
        }

        // Dispara evento customizado
        dispatchContrastEvent('enabled');
    }

    /**
     * Desativa modo de alto contraste
     * @param {Element} body - Elemento body
     * @param {Element} tooltip - Elemento tooltip
     */
    function disableContrastMode(body, tooltip) {
        body.classList.remove(CONTRAST_CONFIG.CSS_CLASS);
        
        if (tooltip) {
            tooltip.classList.remove(CONTRAST_CONFIG.TOOLTIP_CLASSES.contrast);
            tooltip.classList.add(CONTRAST_CONFIG.TOOLTIP_CLASSES.normal);
        }

        // Dispara evento customizado
        dispatchContrastEvent('disabled');
    }

    /**
     * Alterna modo de contraste
     */
    function toggleContrast() {
        const newState = !currentState;
        setContrastState(newState);
    }

    /**
     * Dispara evento customizado de mudança de contraste
     * @param {string} action - Ação executada (enabled/disabled)
     */
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

    /**
     * Obtém informações do sistema de contraste
     * @returns {Object} Informações do sistema
     */
    function getSystemInfo() {
        return {
            isEnabled: currentState,
            isInitialized: isInitialized,
            storageKey: CONTRAST_CONFIG.STORAGE_KEY,
            cssClass: CONTRAST_CONFIG.CSS_CLASS,
            tooltipElement: domCache.get('TOOLTIP') !== null,
            browserSupport: {
                localStorage: typeof Storage !== 'undefined',
                customEvents: typeof CustomEvent !== 'undefined',
                mutationObserver: typeof MutationObserver !== 'undefined'
            }
        };
    }

    /**
     * Força atualização do sistema
     */
    function forceUpdate() {
        domCache.refresh('TOOLTIP');
        checkContrast();
    }

    /**
     * Reseta sistema para estado padrão
     */
    function reset() {
        try {
            localStorage.removeItem(CONTRAST_CONFIG.STORAGE_KEY);
            currentState = false;
            updateViewContrast();
            console.log('✅ Sistema de contraste resetado');
        } catch (error) {
            console.error('❌ Erro ao resetar sistema:', error);
        }
    }

    /**
     * Cleanup do sistema
     */
    function cleanup() {
        window.removeEventListener('storage', handleStorageChange);
        isInitialized = false;
        console.log('🧹 Sistema de Alto Contraste limpo');
    }

    /**
     * Utilitário para debug
     * @returns {Object} Informações de debug
     */
    function debug() {
        const info = getSystemInfo();
        console.group('🔍 Debug Alto Contraste');
        console.log('Estado atual:', info.isEnabled);
        console.log('Inicializado:', info.isInitialized);
        console.log('Cache DOM:', domCache.cache);
        console.log('Suporte do navegador:', info.browserSupport);
        console.groupEnd();
        return info;
    }

    // Adiciona métodos extras ao objeto Contrast
    Contrast.getSystemInfo = getSystemInfo;
    Contrast.forceUpdate = forceUpdate;
    Contrast.reset = reset;

    // Adiciona métodos de debug apenas em desenvolvimento
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
        Contrast.debug = debug;
    }

    return Contrast;
})();

// Auto-inicialização quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ContrastSystem.init);
} else {
    ContrastSystem.init();
}

// Cleanup ao sair da página
window.addEventListener('beforeunload', ContrastSystem.destroy);

// Exporta sistema para uso global (mantém compatibilidade total)
window.ContrastSystem = ContrastSystem;

// Exporta como módulo ES6 se suportado
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContrastSystem;
}