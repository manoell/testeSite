/**
 * Constants.js - Constantes Otimizadas do Sistema
 * Versão otimizada: removidas constantes não utilizadas, agrupadas por funcionalidade
 */

// === CONFIGURAÇÕES PRINCIPAIS ===
export const CODE_LENGTHS = {
    TRACKING_CODE: 13,
    CPF: 11,
    CNPJ: 14,
    CPF_ALTERNATIVE: 12,
    TRACKING_MAX: 260 // 20 objetos * 13 caracteres
};

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
    PRINT_BUTTON: 'print'
};

// === SELETORES OTIMIZADOS ===
export const SELECTORS = {
    TRACKING_BUTTONS: '.barra-btns',
    TRACKING_DETAILS: '.rastrosUnicos',
    BUTTON_BARS: 'div[data-name="barra-botoes"]',
    TRACKING_LINKS: 'table div.objeto-info a',
    SHARE_BUTTONS: "a[title='Compartilhar']",
    OBJECT_INFO_ICONS: 'div.objeto-info a>i',
    LOCKER_BUTTONS: '.btnLckIcon'
};

// === ENDPOINTS ===
export const ENDPOINTS = {
    RESULT: 'resultado.php',
    CONTROL: 'controle.php',
    MULTI_TRACKING: 'rastroMulti.php',
    QR_LOCKER: 'qrLocker.php',
    SECURIMAGE_SHOW: '../core/securimage/securimage_show.php',
    LOGIN: '../core/seguranca/entrar.php'
};

// === CONFIGURAÇÕES DE TIMING ===
export const TIMING = {
    LOADING_TIMEOUT: 30000,
    DEBOUNCE_DELAY: 300,
    ALERT_TIMEOUT: 10000
};

// === MENSAGENS DE ERRO ===
export const ERROR_MESSAGES = {
    INVALID_CAPTCHA: 'Captcha inválido',
    FILL_CAPTCHA: 'Preencha o campo captcha',
    INVALID_CODE: 'Código de objeto, CPF ou CNPJ informado não está válido',
    MAX_OBJECTS: 'Por favor, informe no máximo 20 objetos',
    INVALID_INPUT: 'Favor informar 1 código de objeto ou um CPF ou um CNPJ válido',
    NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
    GENERIC_ERROR: 'Ocorreu um erro inesperado. Tente novamente.'
};

// === PADRÕES DE VALIDAÇÃO ===
export const VALIDATION_PATTERNS = {
    TRACKING_CODE: /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/,
    NUMBERS_ONLY: /^[0-9]+$/,
    CLEAN_INPUT: /[-,;. ]/g
};