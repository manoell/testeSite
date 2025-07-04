/**
 * Constants.js - Constantes do Sistema de Rastreamento
 * Centraliza todos os valores hardcoded para facilitar manutenção
 */

// Tamanhos de códigos de rastreamento e documentos
export const CODE_LENGTHS = {
    TRACKING_CODE: 13,
    CPF: 11,
    CNPJ: 14,
    CPF_ALTERNATIVE: 12,
    TRACKING_MAX: 13 // máximo 20 objetos * 13 caracteres
};

// Classes CSS utilizadas
export const CSS_CLASSES = {
    HIDDEN: 'esconde',
    OPENED: 'aberto',
    INVALID: 'invalid',
    HAS_BUTTON: 'has-btn',
    NO_BUTTON: 'has-no-btn',
    ICON_HAS_BUTTON: 'icon-has-btn',
    CONTRAST: 'contrast',
    LOADING: 'visivel'
};

// IDs de elementos DOM
export const DOM_IDS = {
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
    TOOLTIP_ELEMENT: 'tooltip-vermais'
};

// Seletores otimizados (cache)
export const SELECTORS = {
    TRACKING_BUTTONS: '.barra-btns',
    TRACKING_DETAILS: '.rastrosUnicos',
    BUTTON_BARS: 'div[data-name="barra-botoes"]',
    TRACKING_LINKS: 'table div.objeto-info a',
    SHARE_BUTTONS: "a[title='Compartilhar']",
    OBJECT_INFO_ICONS: 'div.objeto-info a>i',
    LOCKER_BUTTONS: '.btnLckIcon'
};

// URLs e endpoints
export const ENDPOINTS = {
    RESULT: 'resultado.php',
    CONTROL: 'controle.php',
    MULTI_TRACKING: 'rastroMulti.php',
    QR_LOCKER: 'qrLocker.php',
    SECURIMAGE_SHOW: '../core/securimage/securimage_show.php',
    LOGIN: '../core/seguranca/entrar.php'
};

// Configurações de ambiente (se necessário)
export const ENVIRONMENT_CONFIGS = {
    DEVELOPMENT: 'D',
    HOMOLOGATION: 'H',
    PRODUCTION: 'P'
};

// Configurações de timeout e delays
export const TIMING = {
    LOADING_TIMEOUT: 30000, // 30 segundos
    DEBOUNCE_DELAY: 300,     // 300ms para input validation
    ALERT_TIMEOUT: 10000     // 10 segundos para alertas
};

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
    INVALID_CAPTCHA: 'Captcha inválido',
    FILL_CAPTCHA: 'Preencha o campo captcha',
    INVALID_CODE: 'Código de objeto, CPF ou CNPJ informado não está válido',
    MAX_OBJECTS: 'Por favor, informe no máximo 20 objetos',
    INVALID_INPUT: 'Favor informar 1 código de objeto ou um CPF ou um CNPJ válido',
    NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
    GENERIC_ERROR: 'Ocorreu um erro inesperado. Tente novamente.'
};

// Templates de texto para formatação
export const TEXT_TEMPLATES = {
    TRACKING_CODE_FORMAT: 'XX XXX XXX XXX XX',
    DATE_FORMAT: 'DD/MM/YYYY',
    DATETIME_FORMAT: 'DD/MM/YYYY HH:mm'
};

// Configurações de modal e interface
export const UI_CONFIG = {
    MODAL_ANIMATION_DURATION: 300,
    TOOLTIP_DELAY: 500,
    CAROUSEL_INTERVAL: 10000,
    PRINT_TITLE_PREFIX: 'Rastreamento - '
};

// Regex patterns para validação
export const VALIDATION_PATTERNS = {
    TRACKING_CODE: /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/,
    NUMBERS_ONLY: /^[0-9]+$/,
    CLEAN_INPUT: /[-,;. ]/g
};

// Configurações de cache
export const CACHE_CONFIG = {
    DOM_ELEMENTS: true,
    API_RESPONSES: false, // não cachear respostas da API por enquanto
    TEMPLATE_CACHE: true
};