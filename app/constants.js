/**
 * Constants.js - Constantes do Sistema de Rastreamento (Versão Otimizada)
 * Centraliza todos os valores hardcoded para facilitar manutenção
 */

// Tamanhos de códigos de rastreamento e documentos
export const CODE_LENGTHS = Object.freeze({
    TRACKING_CODE: 13,
    CPF: 11,
    CNPJ: 14,
    CPF_ALTERNATIVE: 12,
    TRACKING_MAX: 260 // máximo 20 objetos * 13 caracteres
});

// Classes CSS utilizadas
export const CSS_CLASSES = Object.freeze({
    HIDDEN: 'esconde',
    OPENED: 'aberto',
    INVALID: 'invalid',
    HAS_BUTTON: 'has-btn',
    NO_BUTTON: 'has-no-btn',
    ICON_HAS_BUTTON: 'icon-has-btn',
    CONTRAST: 'contrast',
    LOADING: 'visivel',
    DISABLED: 'disabled',
    SELECTED: 'sel',
    MENU_OPENED: 'menu-aberto'
});

// IDs de elementos DOM (frozen para imutabilidade)
export const DOM_IDS = Object.freeze({
    TRACKING_INPUT: 'objeto',
    CAPTCHA_INPUT: 'captcha',
    CAPTCHA_IMAGE: 'captcha_image',
    SEARCH_BUTTON: 'b-pesquisar',
    REFRESH_BUTTON: 'captcha_refresh_btn',
    INVOKE_BUTTON: 'b-invoked',
    BREADCRUMB: 'trilha',
    PAGE_TITLE: 'titulo-pagina',
    TRACKING_TABS: 'tabs-rastreamento',
    LOADING: 'loading',
    PRINT_BUTTON: 'print',
    TOOLTIP_ELEMENT: 'tooltip-vermais',
    MENU: 'menu',
    ALERTA: 'alerta'
});

// Seletores otimizados (cache-friendly)
export const SELECTORS = Object.freeze({
    TRACKING_BUTTONS: '.barra-btns',
    TRACKING_DETAILS: '.rastrosUnicos',
    BUTTON_BARS: 'div[data-name="barra-botoes"]',
    TRACKING_LINKS: 'table div.objeto-info a',
    SHARE_BUTTONS: "a[title='Compartilhar']",
    OBJECT_INFO_ICONS: 'div.objeto-info a>i',
    LOCKER_BUTTONS: '.btnLckIcon',
    FORM_CONTROLS: 'input, select, textarea',
    NAVIGATION_LINKS: 'nav a',
    MODAL_ELEMENTS: '.modal'
});

// URLs e endpoints
export const ENDPOINTS = Object.freeze({
    RESULT: 'resultado.php',
    CONTROL: 'controle.php',
    MULTI_TRACKING: 'rastroMulti.php',
    QR_LOCKER: 'qrLocker.php',
    SECURIMAGE_SHOW: '../core/securimage/securimage_show.php',
    SECURIMAGE_PLAY: '../core/securimage/securimage_play.php',
    LOGIN: '../core/seguranca/entrar.php',
    VALIDATE_CAPTCHA: 'validate_captcha.php'
});

// Configurações de ambiente
export const ENVIRONMENT_CONFIGS = Object.freeze({
    DEVELOPMENT: 'D',
    HOMOLOGATION: 'H',
    PRODUCTION: 'P'
});

// Configurações de timeout e delays (otimizadas)
export const TIMING = Object.freeze({
    LOADING_TIMEOUT: 30000,     // 30 segundos
    DEBOUNCE_DELAY: 300,        // 300ms para input validation
    THROTTLE_DELAY: 100,        // 100ms para scroll/resize
    ALERT_TIMEOUT: 10000,       // 10 segundos para alertas
    ANIMATION_DURATION: 300,    // Duração padrão de animações
    CACHE_TTL: 300000,          // 5 minutos TTL para cache
    RETRY_DELAY: 1000,          // 1 segundo para retry
    IDLE_CALLBACK_TIMEOUT: 5000 // 5 segundos para idle callbacks
});

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = Object.freeze({
    INVALID_CAPTCHA: 'Captcha inválido',
    FILL_CAPTCHA: 'Preencha o campo captcha',
    INVALID_CODE: 'Código de objeto, CPF ou CNPJ informado não está válido',
    MAX_OBJECTS: 'Por favor, informe no máximo 20 objetos',
    INVALID_INPUT: 'Favor informar de 1 a 20 códigos de objetos ou um CPF ou um CNPJ válido',
    NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
    GENERIC_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
    TIMEOUT_ERROR: 'Tempo limite excedido. Tente novamente.',
    CANCELLED_ERROR: 'Operação cancelada.',
    SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
    VALIDATION_ERROR: 'Dados inválidos fornecidos.',
    ACCESS_DENIED: 'Acesso negado.',
    NOT_FOUND: 'Recurso não encontrado.'
});

// Mensagens de sucesso
export const SUCCESS_MESSAGES = Object.freeze({
    DATA_LOADED: 'Dados carregados com sucesso',
    OPERATION_COMPLETED: 'Operação realizada com sucesso',
    SETTINGS_SAVED: 'Configurações salvas'
});

// Templates de texto para formatação
export const TEXT_TEMPLATES = Object.freeze({
    TRACKING_CODE_FORMAT: 'XX XXX XXX XXX XX',
    DATE_FORMAT: 'DD/MM/YYYY',
    DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
    PHONE_FORMAT: '(XX) XXXXX-XXXX',
    CPF_FORMAT: 'XXX.XXX.XXX-XX',
    CNPJ_FORMAT: 'XX.XXX.XXX/XXXX-XX'
});

// Configurações de modal e interface
export const UI_CONFIG = Object.freeze({
    MODAL_ANIMATION_DURATION: 300,
    TOOLTIP_DELAY: 500,
    CAROUSEL_INTERVAL: 10000,
    PRINT_TITLE_PREFIX: 'Rastreamento - ',
    MAX_VISIBLE_ITEMS: 50,       // Para virtual scrolling
    SCROLL_THRESHOLD: 100,       // Para lazy loading
    INTERSECTION_THRESHOLD: 0.1, // Para intersection observer
    ANIMATION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
});

// Regex patterns para validação (compilados para performance)
export const VALIDATION_PATTERNS = Object.freeze({
    TRACKING_CODE: /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/,
    NUMBERS_ONLY: /^[0-9]+$/,
    CLEAN_INPUT: /[-,;. ]/g,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\(\d{2}\)\d{4,5}-\d{4}$/,
    URL: /^https?:\/\/.+/,
    ALPHA_NUMERIC: /^[a-zA-Z0-9]+$/,
    WHITESPACE: /\s+/g
});

// Configurações de cache
export const CACHE_CONFIG = Object.freeze({
    DOM_ELEMENTS: true,
    API_RESPONSES: true,          // Habilitado para performance
    TEMPLATE_CACHE: true,
    VALIDATION_CACHE: true,       // Novo: cache de validações
    MAX_CACHE_SIZE: 100,
    DEFAULT_TTL: 300000,          // 5 minutos
    STORAGE_KEY_PREFIX: 'tracking_app_'
});

// Configurações de Performance
export const PERFORMANCE_CONFIG = Object.freeze({
    ENABLE_LAZY_LOADING: true,
    ENABLE_VIRTUAL_SCROLLING: true,
    ENABLE_REQUEST_DEDUPLICATION: true,
    ENABLE_BATCH_DOM_UPDATES: true,
    ENABLE_MEMOIZATION: true,
    MAX_CONCURRENT_REQUESTS: 6,
    CHUNK_SIZE: 20,               // Para processamento em chunks
    IDLE_WORK_THRESHOLD: 50       // ms
});

// Event Names (para consistency)
export const EVENTS = Object.freeze({
    SEARCH_START: 'search:start',
    SEARCH_SUCCESS: 'search:success',
    SEARCH_ERROR: 'search:error',
    TRACKING_LOADED: 'tracking:loaded',
    MODAL_OPENED: 'modal:opened',
    MODAL_CLOSED: 'modal:closed',
    CONTRAST_CHANGED: 'contrast:changed',
    NAVIGATION_CHANGED: 'navigation:changed',
    VALIDATION_CHANGED: 'validation:changed',
    CACHE_UPDATED: 'cache:updated'
});

// Accessibility Settings
export const ACCESSIBILITY = Object.freeze({
    KEYBOARD_SHORTCUTS: {
        SEARCH: 'Enter',
        NAVIGATE_CONTENT: 'Alt+1',
        NAVIGATE_MENU: 'Alt+2',
        NAVIGATE_SEARCH: 'Alt+3',
        NAVIGATE_FOOTER: 'Alt+4',
        TOGGLE_CONTRAST: 'Alt+C',
        CLOSE_MODAL: 'Escape'
    },
    ARIA_LABELS: {
        SEARCH_BUTTON: 'Buscar objetos',
        REFRESH_CAPTCHA: 'Atualizar captcha',
        TOGGLE_CONTRAST: 'Alternar alto contraste',
        CLOSE_MODAL: 'Fechar modal',
        SHARE_BUTTON: 'Compartilhar',
        PRINT_BUTTON: 'Imprimir resultados'
    },
    FOCUS_TRAP: true,
    SCREEN_READER_ANNOUNCEMENTS: true
});

// API Configuration
export const API_CONFIG = Object.freeze({
    BASE_URL: window.location.origin,
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    ENABLE_COMPRESSION: true,
    ENABLE_CACHING: true,
    REQUEST_HEADERS: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/html, */*'
    }
});

// Feature Flags (para A/B testing e gradual rollout)
export const FEATURE_FLAGS = Object.freeze({
    ENABLE_ANALYTICS: true,
    ENABLE_ERROR_REPORTING: true,
    ENABLE_PERFORMANCE_MONITORING: true,
    ENABLE_NEW_UI: false,
    ENABLE_PWA_FEATURES: false,
    ENABLE_OFFLINE_MODE: false,
    ENABLE_PUSH_NOTIFICATIONS: false
});

// Browser Support Detection
export const BROWSER_FEATURES = Object.freeze({
    INTERSECTION_OBSERVER: 'IntersectionObserver' in window,
    REQUEST_IDLE_CALLBACK: 'requestIdleCallback' in window,
    WEB_WORKERS: 'Worker' in window,
    SERVICE_WORKER: 'serviceWorker' in navigator,
    LOCAL_STORAGE: 'localStorage' in window,
    SESSION_STORAGE: 'sessionStorage' in window,
    CUSTOM_ELEMENTS: 'customElements' in window,
    MODULES: 'noModule' in HTMLScriptElement.prototype,
    COMPRESSION_STREAM: 'CompressionStream' in window
});

// Development/Debug Settings
export const DEBUG_CONFIG = Object.freeze({
    ENABLE_LOGGING: process?.env?.NODE_ENV === 'development' || window.location.hostname.includes('localhost'),
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    ENABLE_PERFORMANCE_MARKS: true,
    ENABLE_CONSOLE_GROUPS: true,
    SHOW_CACHE_STATS: false
});

// Export all as default for convenience
export default {
    CODE_LENGTHS,
    CSS_CLASSES,
    DOM_IDS,
    SELECTORS,
    ENDPOINTS,
    ENVIRONMENT_CONFIGS,
    TIMING,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    TEXT_TEMPLATES,
    UI_CONFIG,
    VALIDATION_PATTERNS,
    CACHE_CONFIG,
    PERFORMANCE_CONFIG,
    EVENTS,
    ACCESSIBILITY,
    API_CONFIG,
    FEATURE_FLAGS,
    BROWSER_FEATURES,
    DEBUG_CONFIG
};