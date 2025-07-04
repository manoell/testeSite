/**
 * Utils.js - Utilitários Otimizados
 * Versão otimizada: removidas funcionalidades não utilizadas, consolidado cache
 */

import { CODE_LENGTHS, VALIDATION_PATTERNS, ERROR_MESSAGES } from './constants.js';

/**
 * Cache de elementos DOM otimizado
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
 * Debounce otimizado
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
 * Validador consolidado
 */
export class CodeValidator {
    static cleanInput(input) {
        if (!input) return '';
        return input.replace(VALIDATION_PATTERNS.CLEAN_INPUT, '').toUpperCase();
    }

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

        // Determina tipo baseado no comprimento
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
                result.isValid = true;
                break;
            default:
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

    static validateTrackingCode(code) {
        return VALIDATION_PATTERNS.TRACKING_CODE.test(code);
    }

    static validateMultipleTrackingCodes(codes) {
        const codeCount = codes.length / CODE_LENGTHS.TRACKING_CODE;
        if (codeCount > 20) return false;

        for (let i = 0; i < codeCount; i++) {
            const start = i * CODE_LENGTHS.TRACKING_CODE;
            const code = codes.substring(start, start + CODE_LENGTHS.TRACKING_CODE);
            if (!this.validateTrackingCode(code)) {
                return false;
            }
        }
        return true;
    }

    static validateCPF(cpf) {
        if (cpf.length !== 11) return false;
        
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

    static validateCNPJ(cnpj) {
        if (cnpj.length !== 14) return false;

        const invalidCNPJs = [
            '00000000000000', '11111111111111', '22222222222222', '33333333333333',
            '44444444444444', '55555555555555', '66666666666666', '77777777777777',
            '88888888888888', '99999999999999'
        ];
        
        if (invalidCNPJs.includes(cnpj)) return false;

        // Validação dos dígitos verificadores
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
 * Utilitários DOM consolidados
 */
export class DOMUtils {
    static addClass(element, className) {
        if (element && !element.classList.contains(className)) {
            element.classList.add(className);
        }
    }

    static removeClass(element, className) {
        if (element && element.classList.contains(className)) {
            element.classList.remove(className);
        }
    }

    static toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    }

    static hasClass(element, className) {
        return element && element.classList.contains(className);
    }

    static setHTML(element, html) {
        if (element) {
            element.innerHTML = html;
        }
    }

    static setText(element, text) {
        if (element) {
            element.textContent = text;
        }
    }

    static show(element) {
        this.removeClass(element, 'esconde');
    }

    static hide(element) {
        this.addClass(element, 'esconde');
    }
}

/**
 * Utilitários de URL
 */
export class URLUtils {
    static buildURL(base, params = {}) {
        const url = new URL(base, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    }

    static redirect(url) {
        window.location.href = url;
    }
}

/**
 * Utilitários de formatação
 */
export class FormatUtils {
    static formatDateTime(dateTimeString) {
        if (!dateTimeString) return '';
        
        const dt = dateTimeString === "" ? '0000-00-00T00:00:00' : dateTimeString;
        const formattedDate = dt.substring(0, 10).split('-').reverse().join('/');
        const formattedTime = dt.substring(0, 16).slice(-5);
        
        return `${formattedDate} ${formattedTime}`;
    }

    static formatDate(dateTimeString) {
        if (!dateTimeString) return '00/00/0000';
        
        return dateTimeString.substring(0, 10)
            .split('-')
            .reverse()
            .join('/');
    }
}