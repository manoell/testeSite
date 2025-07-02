/**
 * irParaArchor.js - Navegação e Acessibilidade Otimizado
 * Módulo para navegação por âncoras e controle de menus de acessibilidade
 * 
 * Melhorias implementadas:
 * - Cache de elementos DOM
 * - Constantes para seletores
 * - Validação de elementos
 * - Performance otimizada
 * - Código mais legível
 */

/**
 * Constantes para seletores e classes
 */
const NAVIGATION_SELECTORS = {
    ACCESSIBILITY_MENU: '#acessibilidade a',
    ACCESSIBILITY_DROPDOWN: '#acess-drop-down',
    HAMBURGER: '#menu .hamburger',
    MENU_CONTAINER: '#menu > .menu'
};

const CSS_CLASSES = {
    OPENED: 'aberto',
    HIDDEN: 'oculto',
    MENU_OPENED: 'menu-aberto'
};

/**
 * Cache de elementos DOM para performance
 */
class NavigationDOMCache {
    constructor() {
        this.cache = new Map();
        this.initializeCache();
    }

    initializeCache() {
        // Pre-carrega elementos frequentemente utilizados
        Object.entries(NAVIGATION_SELECTORS).forEach(([key, selector]) => {
            this.cache.set(key, document.querySelector(selector));
        });
        this.cache.set('BODY', document.body);
    }

    get(key) {
        return this.cache.get(key);
    }

    refresh(key) {
        if (NAVIGATION_SELECTORS[key]) {
            this.cache.set(key, document.querySelector(NAVIGATION_SELECTORS[key]));
        }
        return this.cache.get(key);
    }
}

/**
 * Módulo principal de navegação otimizado
 */
const irPara = (function() {
    // Cache de elementos DOM
    const domCache = new NavigationDOMCache();
    
    // Interface pública do módulo
    const module = {
        jumpTo,
        fechaMenuAcessibilidade,
        abreMenuLateral,
        init: initializeModule,
        destroy: cleanup
    };

    /**
     * Navega para elemento específico com validação
     * @param {string} anchor - ID do elemento de destino
     */
    function jumpTo(anchor) {
        if (!anchor) {
            console.warn('irPara.jumpTo: anchor não fornecido');
            return;
        }

        const targetElement = document.getElementById(anchor);
        
        if (!targetElement) {
            console.warn(`irPara.jumpTo: elemento '${anchor}' não encontrado`);
            return;
        }

        // Scroll suave para o elemento
        try {
            targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        } catch (error) {
            // Fallback para navegadores mais antigos
            targetElement.scrollIntoView(true);
        }

        // Fecha menu de acessibilidade após navegação
        fechaMenuAcessibilidade();

        // Abre menu lateral se o destino for o menu
        if (anchor === 'menu') {
            abreMenuLateral();
        }
    }

    /**
     * Fecha menu de acessibilidade de forma otimizada
     */
    function fechaMenuAcessibilidade() {
        const menu = domCache.get('ACCESSIBILITY_MENU');
        const dropdown = domCache.get('ACCESSIBILITY_DROPDOWN');

        if (menu) {
            menu.classList.remove(CSS_CLASSES.OPENED);
        }

        if (dropdown) {
            dropdown.classList.remove(CSS_CLASSES.OPENED);
        }
    }

    /**
     * Abre menu lateral com validação
     */
    function abreMenuLateral() {
        const hamburger = domCache.get('HAMBURGER');
        const container = domCache.get('MENU_CONTAINER');
        const body = domCache.get('BODY');

        if (hamburger) {
            hamburger.classList.add(CSS_CLASSES.OPENED);
        }

        if (container) {
            container.classList.remove(CSS_CLASSES.HIDDEN);
        }

        if (body) {
            body.classList.add(CSS_CLASSES.MENU_OPENED);
        }
    }

    /**
     * Inicializa o módulo com event listeners otimizados
     */
    function initializeModule() {
        // Configura event listeners se necessário
        setupAccessibilityShortcuts();
    }

    /**
     * Configura atalhos de teclado para acessibilidade
     */
    function setupAccessibilityShortcuts() {
        document.addEventListener('keydown', handleKeyboardNavigation);
    }

    /**
     * Manipula navegação por teclado
     * @param {KeyboardEvent} event - Evento de teclado
     */
    function handleKeyboardNavigation(event) {
        // Alt + 1: Ir para conteúdo
        if (event.altKey && event.key === '1') {
            event.preventDefault();
            jumpTo('tabs-rastreamento');
        }
        
        // Alt + 2: Ir para menu
        if (event.altKey && event.key === '2') {
            event.preventDefault();
            jumpTo('menu');
        }
        
        // Alt + 3: Ir para busca
        if (event.altKey && event.key === '3') {
            event.preventDefault();
            jumpTo('titulo-pagina');
        }
        
        // Alt + 4: Ir para rodapé
        if (event.altKey && event.key === '4') {
            event.preventDefault();
            jumpTo('rodape');
        }
        
        // Escape: Fechar menus
        if (event.key === 'Escape') {
            fechaMenuAcessibilidade();
        }
    }

    /**
     * Valida se um elemento existe
     * @param {string} elementId - ID do elemento
     * @returns {boolean} Se o elemento existe
     */
    function validateElement(elementId) {
        const element = document.getElementById(elementId);
        return element !== null;
    }

    /**
     * Obtém informações de navegação atuais
     * @returns {Object} Informações de navegação
     */
    function getNavigationInfo() {
        const currentHash = window.location.hash;
        const currentElement = currentHash ? document.querySelector(currentHash) : null;
        
        return {
            currentHash,
            hasValidTarget: currentElement !== null,
            visibleElements: getVisibleNavigationTargets()
        };
    }

    /**
     * Obtém alvos de navegação visíveis
     * @returns {Array} Lista de elementos visíveis
     */
    function getVisibleNavigationTargets() {
        const targets = ['tabs-rastreamento', 'menu', 'titulo-pagina', 'rodape'];
        
        return targets.filter(targetId => {
            const element = document.getElementById(targetId);
            return element && isElementVisible(element);
        });
    }

    /**
     * Verifica se elemento está visível
     * @param {Element} element - Elemento a verificar
     * @returns {boolean} Se está visível
     */
    function isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        
        return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0'
        );
    }

    /**
     * Smooth scroll personalizado para melhor compatibilidade
     * @param {Element} element - Elemento de destino
     * @param {number} duration - Duração da animação em ms
     */
    function smoothScrollTo(element, duration = 300) {
        const targetPosition = element.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    /**
     * Cleanup para remover event listeners
     */
    function cleanup() {
        document.removeEventListener('keydown', handleKeyboardNavigation);
        console.log('🧹 Módulo irPara limpo');
    }

    /**
     * Utilitário para debug - mostra elementos de navegação disponíveis
     * @returns {Object} Informações de debug
     */
    function debug() {
        const info = getNavigationInfo();
        console.group('🔍 Debug irPara');
        console.log('Hash atual:', info.currentHash);
        console.log('Alvo válido:', info.hasValidTarget);
        console.log('Elementos visíveis:', info.visibleElements);
        console.log('Cache DOM:', domCache.cache);
        console.groupEnd();
        return info;
    }

    // Adiciona método de debug apenas em desenvolvimento
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
        module.debug = debug;
        module.getNavigationInfo = getNavigationInfo;
    }

    return module;
})();

// Auto-inicialização quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', irPara.init);
} else {
    irPara.init();
}

// Cleanup ao sair da página
window.addEventListener('beforeunload', irPara.destroy);

// Exporta para uso global (mantém compatibilidade)
window.irPara = irPara;

// Exporta como módulo ES6 se suportado
if (typeof module !== 'undefined' && module.exports) {
    module.exports = irPara;
}