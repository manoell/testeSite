/**
 * irParaArchor.js - Navegação e Acessibilidade Otimizado
 * Versão otimizada: removidas funcionalidades de debug, simplificado cache
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
 * Cache DOM simplificado
 */
class NavigationDOMCache {
    constructor() {
        this.cache = new Map();
        this.initializeCache();
    }

    initializeCache() {
        Object.entries(NAVIGATION_SELECTORS).forEach(([key, selector]) => {
            this.cache.set(key, document.querySelector(selector));
        });
        this.cache.set('BODY', document.body);
    }

    get(key) {
        return this.cache.get(key);
    }
}

/**
 * Módulo principal de navegação otimizado
 */
const irPara = (function() {
    const domCache = new NavigationDOMCache();
    
    const module = {
        jumpTo,
        fechaMenuAcessibilidade,
        abreMenuLateral,
        init: initializeModule,
        destroy: cleanup
    };

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

        try {
            targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        } catch (error) {
            targetElement.scrollIntoView(true);
        }

        fechaMenuAcessibilidade();

        if (anchor === 'menu') {
            abreMenuLateral();
        }
    }

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

    function initializeModule() {
        setupAccessibilityShortcuts();
    }

    function setupAccessibilityShortcuts() {
        document.addEventListener('keydown', handleKeyboardNavigation);
    }

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

    function cleanup() {
        document.removeEventListener('keydown', handleKeyboardNavigation);
    }

    return module;
})();

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', irPara.init);
} else {
    irPara.init();
}

// Cleanup ao sair
window.addEventListener('beforeunload', irPara.destroy);

// Exporta para uso global
window.irPara = irPara;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = irPara;
}