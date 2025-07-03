/**
 * Utils.js - Utilitários e Helpers
 * Funções auxiliares reutilizáveis para validação, formatação e operações DOM
 */

import { CODE_LENGTHS, VALIDATION_PATTERNS, ERROR_MESSAGES } from './constants.js';

/**
 * Cache de elementos DOM para otimização de performance
 */
class DOMCache {
    constructor() {
        this.cache = new Map();
    }

    get(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, document.querySelector(selector));
        }
        return this.cache.get(selector);
    }

    getAll(selector) {
        const cacheKey = `all:${selector}`;
        if (!this.cache.has(cacheKey)) {
            this.cache.set(cacheKey, document.querySelectorAll(selector));
        }
        return this.cache.get(cacheKey);
    }

    clear() {
        this.cache.clear();
    }

    refresh(selector) {
        this.cache.delete(selector);
        this.cache.delete(`all:${selector}`);
        return this.get(selector);
    }
}

export const domCache = new DOMCache();

/**
 * Debounce function para otimizar eventos frequentes
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @param {boolean} immediate - Se deve executar imediatamente
 * @returns {Function} Função debounced
 */
export const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
};

/**
 * Throttle function para limitar execuções
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Limite em ms
 * @returns {Function} Função throttled
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Validador de códigos de rastreamento e documentos
 */
export class CodeValidator {
    /**
     * Limpa string removendo caracteres especiais
     * @param {string} input - String de entrada
     * @returns {string} String limpa
     */
    static cleanInput(input) {
        if (!input) return '';
        return input.replace(VALIDATION_PATTERNS.CLEAN_INPUT, '').toUpperCase();
    }

    /**
     * Valida código de objeto completo
     * @param {string} input - Input do usuário
     * @returns {Object} Resultado da validação
     */
    static validateTrackingInput(input) {
        const cleaned = this.cleanInput(input);
        
        const result = {
            isValid: false,
            type: null,
            cleanedInput: cleaned,
            message: '',
            error: false
        };

        if (!cleaned) {
            result.error = true;
            result.message = ERROR_MESSAGES.INVALID_INPUT;
            return result;
        }

        if (cleaned.length > CODE_LENGTHS.TRACKING_MAX) {
            result.error = true;
            result.message = ERROR_MESSAGES.MAX_OBJECTS;
            return result;
        }

        // Determina o tipo baseado no comprimento
        switch (cleaned.length) {
            case CODE_LENGTHS.CPF:
                result.type = 'CPF';
                result.isValid = this.validateCPF(cleaned);
                break;
            case CODE_LENGTHS.CNPJ:
                result.type = 'CNPJ';
                result.isValid = this.validateCNPJ(cleaned);
                break;
            case CODE_LENGTHS.TRACKING_CODE:
                result.type = 'TRACKING_SINGLE';
                result.isValid = this.validateTrackingCode(cleaned);
                break;
            case CODE_LENGTHS.CPF_ALTERNATIVE:
                result.type = 'CPF_ALTERNATIVE';
                result.isValid = true; // Aceita 12 dígitos como válido
                break;
            default:
                // Múltiplos códigos
                if (cleaned.length % CODE_LENGTHS.TRACKING_CODE === 0) {
                    result.type = 'TRACKING_MULTIPLE';
                    result.isValid = this.validateMultipleTrackingCodes(cleaned);
                } else {
                    result.error = true;
                    result.message = ERROR_MESSAGES.INVALID_CODE;
                }
        }

        if (!result.isValid && !result.error) {
            result.error = true;
            result.message = ERROR_MESSAGES.INVALID_CODE;
        }

        return result;
    }

    /**
     * Valida código de rastreamento único
     * @param {string} code - Código limpo
     * @returns {boolean} Válido ou não
     */
    static validateTrackingCode(code) {
        return VALIDATION_PATTERNS.TRACKING_CODE.test(code);
    }

    /**
     * Valida múltiplos códigos de rastreamento
     * @param {string} codes - Códigos concatenados
     * @returns {boolean} Válido ou não
     */
    static validateMultipleTrackingCodes(codes) {
        const codeCount = codes.length / CODE_LENGTHS.TRACKING_CODE;
        if (codeCount > 20) return false; // máximo 20 objetos

        for (let i = 0; i < codeCount; i++) {
            const start = i * CODE_LENGTHS.TRACKING_CODE;
            const code = codes.substring(start, start + CODE_LENGTHS.TRACKING_CODE);
            if (!this.validateTrackingCode(code)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Valida CPF
     * @param {string} cpf - CPF limpo (11 dígitos)
     * @returns {boolean} Válido ou não
     */
    static validateCPF(cpf) {
        if (cpf.length !== 11) return false;
        
        // Verifica CPFs inválidos conhecidos
        const invalidCPFs = [
            '00000000000', '11111111111', '22222222222', '33333333333',
            '44444444444', '55555555555', '66666666666', '77777777777',
            '88888888888', '99999999999'
        ];
        
        if (invalidCPFs.includes(cpf)) return false;

        // Valida primeiro dígito
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;

        // Valida segundo dígito
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        
        return remainder === parseInt(cpf.charAt(10));
    }

    /**
     * Valida CNPJ
     * @param {string} cnpj - CNPJ limpo (14 dígitos)
     * @returns {boolean} Válido ou não
     */
    static validateCNPJ(cnpj) {
        if (cnpj.length !== 14) return false;

        // Verifica CNPJs inválidos conhecidos
        const invalidCNPJs = [
            '00000000000000', '11111111111111', '22222222222222', '33333333333333',
            '44444444444444', '55555555555555', '66666666666666', '77777777777777',
            '88888888888888', '99999999999999'
        ];
        
        if (invalidCNPJs.includes(cnpj)) return false;

        // Valida primeiro dígito verificador
        let size = cnpj.length - 2;
        let numbers = cnpj.substring(0, size);
        let digits = cnpj.substring(size);
        let sum = 0;
        let pos = size - 7;
        
        for (let i = size; i >= 1; i--) {
            sum += numbers.charAt(size - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) return false;

        // Valida segundo dígito verificador
        size = size + 1;
        numbers = cnpj.substring(0, size);
        sum = 0;
        pos = size - 7;
        
        for (let i = size; i >= 1; i--) {
            sum += numbers.charAt(size - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        return result === parseInt(digits.charAt(1));
    }
}

/**
 * Utilitários para manipulação DOM
 */
export class DOMUtils {
    /**
     * Adiciona classe com verificação
     * @param {Element} element - Elemento DOM
     * @param {string} className - Nome da classe
     */
    static addClass(element, className) {
        if (element && !element.classList.contains(className)) {
            element.classList.add(className);
        }
    }

    /**
     * Remove classe com verificação
     * @param {Element} element - Elemento DOM
     * @param {string} className - Nome da classe
     */
    static removeClass(element, className) {
        if (element && element.classList.contains(className)) {
            element.classList.remove(className);
        }
    }

    /**
     * Toggle classe
     * @param {Element} element - Elemento DOM
     * @param {string} className - Nome da classe
     */
    static toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    }

    /**
     * Verifica se elemento tem classe
     * @param {Element} element - Elemento DOM
     * @param {string} className - Nome da classe
     * @returns {boolean} Tem a classe ou não
     */
    static hasClass(element, className) {
        return element && element.classList.contains(className);
    }

    /**
     * Define atributo de forma segura
     * @param {Element} element - Elemento DOM
     * @param {string} attribute - Nome do atributo
     * @param {string} value - Valor do atributo
     */
    static setAttribute(element, attribute, value) {
        if (element) {
            element.setAttribute(attribute, value);
        }
    }

    /**
     * Remove atributo de forma segura
     * @param {Element} element - Elemento DOM
     * @param {string} attribute - Nome do atributo
     */
    static removeAttribute(element, attribute) {
        if (element) {
            element.removeAttribute(attribute);
        }
    }

    /**
     * Define conteúdo HTML de forma segura
     * @param {Element} element - Elemento DOM
     * @param {string} html - Conteúdo HTML
     */
    static setHTML(element, html) {
        if (element) {
            element.innerHTML = html;
        }
    }

    /**
     * Define texto de forma segura
     * @param {Element} element - Elemento DOM
     * @param {string} text - Conteúdo de texto
     */
    static setText(element, text) {
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Mostra elemento
     * @param {Element} element - Elemento DOM
     */
    static show(element) {
        this.removeClass(element, 'esconde');
    }

    /**
     * Esconde elemento
     * @param {Element} element - Elemento DOM
     */
    static hide(element) {
        this.addClass(element, 'esconde');
    }
}

/**
 * Utilitários para URL e navegação
 */
export class URLUtils {
    /**
     * Constrói URL com parâmetros
     * @param {string} base - URL base
     * @param {Object} params - Parâmetros
     * @returns {string} URL completa
     */
    static buildURL(base, params = {}) {
        const url = new URL(base, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    }

    /**
     * Redireciona de forma segura
     * @param {string} url - URL de destino
     */
    static redirect(url) {
        window.location.href = url;
    }

    /**
     * Abre em nova aba
     * @param {string} url - URL de destino
     */
    static openNewTab(url) {
        window.open(url, '_blank');
    }
}

/**
 * Utilitários para formatação
 */
export class FormatUtils {
    /**
     * Formata data/hora
     * @param {string} dateTimeString - String de data/hora
     * @returns {string} Data/hora formatada
     */
    static formatDateTime(dateTimeString) {
        if (!dateTimeString) return '';
        
        const dt = dateTimeString === "" ? '0000-00-00T00:00:00' : dateTimeString;
        const formattedDate = dt.substring(0, 10).split('-').reverse().join('/');
        const formattedTime = dt.substring(0, 16).slice(-5);
        
        return `${formattedDate} ${formattedTime}`;
    }

    /**
     * Formata apenas data
     * @param {string} dateTimeString - String de data/hora
     * @returns {string} Data formatada
     */
    static formatDate(dateTimeString) {
        if (!dateTimeString) return '00/00/0000';
        
        return dateTimeString.substring(0, 10)
            .split('-')
            .reverse()
            .join('/');
    }

    /**
     * Gera ID único
     * @returns {string} ID único
     */
    static generateUniqueId() {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Utilitários para arrays e objetos
 */
export class DataUtils {
    /**
     * Verifica se valor está vazio
     * @param {any} value - Valor a verificar
     * @returns {boolean} Se está vazio
     */
    static isEmpty(value) {
        return value === null || 
               value === undefined || 
               value === '' || 
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'object' && Object.keys(value).length === 0);
    }

    /**
     * Remove duplicatas de array
     * @param {Array} array - Array com possíveis duplicatas
     * @returns {Array} Array sem duplicatas
     */
    static removeDuplicates(array) {
        return [...new Set(array)];
    }

    /**
     * Clona objeto profundo
     * @param {Object} obj - Objeto a clonar
     * @returns {Object} Objeto clonado
     */
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
}

/**
 * Sistema de cache simples para performance
 */
export class SimpleCache {
    constructor(maxSize = 100, ttl = 300000) { // 5 minutos TTL default
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    clear() {
        this.cache.clear();
    }

    has(key) {
        return this.cache.has(key);
    }
}

// Instância global de cache
export const globalCache = new SimpleCache();