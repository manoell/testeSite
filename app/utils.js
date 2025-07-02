/**
 * Utils.js - Utilitários e Helpers (Versão Otimizada)
 * Funções auxiliares reutilizáveis para validação, formatação e operações DOM
 */

import { 
    CODE_LENGTHS, 
    VALIDATION_PATTERNS, 
    ERROR_MESSAGES, 
    TIMING,
    CACHE_CONFIG,
    PERFORMANCE_CONFIG,
    BROWSER_FEATURES
} from './constants.js';

/**
 * Cache de elementos DOM otimizado com WeakMap e verificação de conectividade
 */
class OptimizedDOMCache {
    constructor() {
        this.selectorCache = new Map();
        this.queryCache = new Map();
        this.observedElements = new WeakSet();
        this.mutationObserver = null;
        this.initMutationObserver();
    }

    initMutationObserver() {
        if (!BROWSER_FEATURES.INTERSECTION_OBSERVER) return;
        
        this.mutationObserver = new MutationObserver((mutations) => {
            let shouldClearCache = false;
            
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && 
                    (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                    shouldClearCache = true;
                    break;
                }
            }
            
            if (shouldClearCache) {
                this.clearInvalidEntries();
            }
        });
        
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    get(selector) {
        // Verificar cache primeiro
        if (this.selectorCache.has(selector)) {
            const element = this.selectorCache.get(selector);
            if (element && element.isConnected) {
                return element;
            }
            this.selectorCache.delete(selector);
        }
        
        // Buscar elemento
        const element = document.querySelector(selector);
        if (element) {
            this.selectorCache.set(selector, element);
            if (CACHE_CONFIG.DOM_ELEMENTS) {
                this.observedElements.add(element);
            }
        }
        return element;
    }

    getAll(selector) {
        const cacheKey = `all:${selector}`;
        
        if (this.queryCache.has(cacheKey)) {
            const elements = this.queryCache.get(cacheKey);
            // Verificar se todos os elementos ainda estão conectados
            if (elements.every(el => el.isConnected)) {
                return elements;
            }
            this.queryCache.delete(cacheKey);
        }
        
        const elements = Array.from(document.querySelectorAll(selector));
        if (elements.length > 0) {
            this.queryCache.set(cacheKey, elements);
        }
        return elements;
    }

    clear() {
        this.selectorCache.clear();
        this.queryCache.clear();
    }

    refresh(selector) {
        this.selectorCache.delete(selector);
        this.queryCache.delete(`all:${selector}`);
        return this.get(selector);
    }

    clearInvalidEntries() {
        // Limpar entradas inválidas do cache
        for (const [selector, element] of this.selectorCache.entries()) {
            if (!element.isConnected) {
                this.selectorCache.delete(selector);
            }
        }
        
        for (const [key, elements] of this.queryCache.entries()) {
            if (!elements.every(el => el.isConnected)) {
                this.queryCache.delete(key);
            }
        }
    }

    destroy() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        this.clear();
    }
}

export const domCache = new OptimizedDOMCache();

/**
 * Debounce otimizado com cancelamento
 */
export const debounce = (func, wait, immediate = false) => {
    let timeout;
    let result;
    
    const debounced = function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) result = func.apply(this, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) result = func.apply(this, args);
        return result;
    };
    
    debounced.cancel = () => {
        clearTimeout(timeout);
        timeout = null;
    };
    
    return debounced;
};

/**
 * Throttle otimizado com trailing edge
 */
export const throttle = (func, limit, options = {}) => {
    let inThrottle;
    let lastFunc;
    let lastRan;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            lastRan = Date.now();
            inThrottle = true;
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};

/**
 * Memoização com LRU Cache
 */
class MemoizationCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key) {
        if (this.cache.has(key)) {
            // Move para o final (mais recente)
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return undefined;
    }

    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Remove o mais antigo
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    clear() {
        this.cache.clear();
    }
}

const memoCache = new MemoizationCache(CACHE_CONFIG.MAX_CACHE_SIZE);

/**
 * Memoização de funções com cache LRU
 */
export const memoize = (fn, keyGenerator) => {
    return function(...args) {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
        
        if (memoCache.get(key)) {
            return memoCache.get(key);
        }
        
        const result = fn.apply(this, args);
        memoCache.set(key, result);
        return result;
    };
};

/**
 * Validador de códigos otimizado com memoização
 */
export class CodeValidator {
    static validationCache = new Map();

    /**
     * Limpa string removendo caracteres especiais
     */
    static cleanInput(input) {
        if (!input) return '';
        return input.replace(VALIDATION_PATTERNS.CLEAN_INPUT, '').toUpperCase();
    }

    /**
     * Valida código de objeto completo com cache
     */
    static validateTrackingInput(input) {
        const cleaned = this.cleanInput(input);
        
        // Verificar cache primeiro
        if (this.validationCache.has(cleaned)) {
            return this.validationCache.get(cleaned);
        }
        
        const result = this._performValidation(cleaned);
        
        // Cache do resultado
        if (this.validationCache.size > 100) {
            const firstKey = this.validationCache.keys().next().value;
            this.validationCache.delete(firstKey);
        }
        this.validationCache.set(cleaned, result);
        
        return result;
    }

    static _performValidation(cleaned) {
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

    /**
     * Valida código de rastreamento único
     */
    static validateTrackingCode(code) {
        return VALIDATION_PATTERNS.TRACKING_CODE.test(code);
    }

    /**
     * Valida múltiplos códigos com otimização de batch
     */
    static validateMultipleTrackingCodes(codes) {
        const codeCount = codes.length / CODE_LENGTHS.TRACKING_CODE;
        if (codeCount > 20) return false;

        // Processar em chunks para melhor performance
        const chunkSize = Math.min(10, codeCount);
        
        for (let chunk = 0; chunk < codeCount; chunk += chunkSize) {
            const endChunk = Math.min(chunk + chunkSize, codeCount);
            
            for (let i = chunk; i < endChunk; i++) {
                const start = i * CODE_LENGTHS.TRACKING_CODE;
                const code = codes.substring(start, start + CODE_LENGTHS.TRACKING_CODE);
                if (!this.validateTrackingCode(code)) {
                    return false;
                }
            }
            
            // Yield para não bloquear a UI
            if (endChunk < codeCount && BROWSER_FEATURES.REQUEST_IDLE_CALLBACK) {
                return new Promise(resolve => {
                    requestIdleCallback(() => {
                        resolve(this.validateMultipleTrackingCodes(codes.substring(endChunk * CODE_LENGTHS.TRACKING_CODE)));
                    });
                });
            }
        }
        
        return true;
    }

    /**
     * Valida CPF com memoização
     */
    static validateCPF = memoize((cpf) => {
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
    }, (cpf) => `cpf_${cpf}`);

    /**
     * Valida CNPJ com memoização
     */
    static validateCNPJ = memoize((cnpj) => {
        if (cnpj.length !== 14) return false;

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
    }, (cnpj) => `cnpj_${cnpj}`);

    /**
     * Limpa cache de validação
     */
    static clearCache() {
        this.validationCache.clear();
    }
}

/**
 * Batch DOM Updater para otimizar múltiplas atualizações
 */
class BatchDOMUpdater {
    constructor() {
        this.updates = [];
        this.scheduled = false;
    }
    
    schedule(updateFn) {
        this.updates.push(updateFn);
        if (!this.scheduled) {
            this.scheduled = true;
            requestAnimationFrame(() => this.flush());
        }
    }
    
    flush() {
        // Processar todas as atualizações em batch
        this.updates.forEach(update => update());
        this.updates = [];
        this.scheduled = false;
    }
    
    clear() {
        this.updates = [];
        this.scheduled = false;
    }
}

const batchUpdater = new BatchDOMUpdater();

/**
 * Utilitários para manipulação DOM otimizados
 */
export class DOMUtils {
    /**
     * Adiciona classe com batch update
     */
    static addClass(element, className) {
        if (!element || element.classList.contains(className)) return;
        
        if (PERFORMANCE_CONFIG.ENABLE_BATCH_DOM_UPDATES) {
            batchUpdater.schedule(() => element.classList.add(className));
        } else {
            element.classList.add(className);
        }
    }

    /**
     * Remove classe com batch update
     */
    static removeClass(element, className) {
        if (!element || !element.classList.contains(className)) return;
        
        if (PERFORMANCE_CONFIG.ENABLE_BATCH_DOM_UPDATES) {
            batchUpdater.schedule(() => element.classList.remove(className));
        } else {
            element.classList.remove(className);
        }
    }

    /**
     * Toggle classe
     */
    static toggleClass(element, className) {
        if (!element) return;
        
        if (PERFORMANCE_CONFIG.ENABLE_BATCH_DOM_UPDATES) {
            batchUpdater.schedule(() => element.classList.toggle(className));
        } else {
            element.classList.toggle(className);
        }
    }

    /**
     * Verifica se elemento tem classe
     */
    static hasClass(element, className) {
        return element && element.classList.contains(className);
    }

    /**
     * Define atributo de forma segura
     */
    static setAttribute(element, attribute, value) {
        if (!element) return;
        
        if (PERFORMANCE_CONFIG.ENABLE_BATCH_DOM_UPDATES) {
            batchUpdater.schedule(() => element.setAttribute(attribute, value));
        } else {
            element.setAttribute(attribute, value);
        }
    }

    /**
     * Remove atributo de forma segura
     */
    static removeAttribute(element, attribute) {
        if (!element) return;
        
        if (PERFORMANCE_CONFIG.ENABLE_BATCH_DOM_UPDATES) {
            batchUpdater.schedule(() => element.removeAttribute(attribute));
        } else {
            element.removeAttribute(attribute);
        }
    }

    /**
     * Define conteúdo HTML com DocumentFragment para performance
     */
    static setHTML(element, html) {
        if (!element) return;
        
        if (PERFORMANCE_CONFIG.ENABLE_BATCH_DOM_UPDATES) {
            batchUpdater.schedule(() => {
                if (html.length > 1000) {
                    // Usar DocumentFragment para HTML grande
                    const template = document.createElement('template');
                    template.innerHTML = html;
                    element.innerHTML = '';
                    element.appendChild(template.content);
                } else {
                    element.innerHTML = html;
                }
            });
        } else {
            element.innerHTML = html;
        }
    }

    /**
     * Define texto de forma segura
     */
    static setText(element, text) {
        if (!element) return;
        
        if (PERFORMANCE_CONFIG.ENABLE_BATCH_DOM_UPDATES) {
            batchUpdater.schedule(() => element.textContent = text);
        } else {
            element.textContent = text;
        }
    }

    /**
     * Mostra elemento
     */
    static show(element) {
        this.removeClass(element, 'esconde');
    }

    /**
     * Esconde elemento
     */
    static hide(element) {
        this.addClass(element, 'esconde');
    }

    /**
     * Cria DocumentFragment otimizado
     */
    static createFragment(html) {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content.cloneNode(true);
    }

    /**
     * Força flush de batch updates
     */
    static flushUpdates() {
        batchUpdater.flush();
    }
}

/**
 * Utilitários para URL e navegação
 */
export class URLUtils {
    /**
     * Constrói URL com parâmetros (memoizado)
     */
    static buildURL = memoize((base, params = {}) => {
        const url = new URL(base, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    }, (base, params) => `${base}_${JSON.stringify(params)}`);

    /**
     * Redireciona de forma segura
     */
    static redirect(url) {
        window.location.href = url;
    }

    /**
     * Abre em nova aba
     */
    static openNewTab(url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    /**
     * Verifica se URL é válida
     */
    static isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

/**
 * Utilitários para formatação
 */
export class FormatUtils {
    /**
     * Formata data/hora (memoizado)
     */
    static formatDateTime = memoize((dateTimeString) => {
        if (!dateTimeString) return '';
        
        const dt = dateTimeString === "" ? '0000-00-00T00:00:00' : dateTimeString;
        const formattedDate = dt.substring(0, 10).split('-').reverse().join('/');
        const formattedTime = dt.substring(0, 16).slice(-5);
        
        return `${formattedDate} ${formattedTime}`;
    });

    /**
     * Formata apenas data (memoizado)
     */
    static formatDate = memoize((dateTimeString) => {
        if (!dateTimeString) return '00/00/0000';
        
        return dateTimeString.substring(0, 10)
            .split('-')
            .reverse()
            .join('/');
    });

    /**
     * Gera ID único com timestamp
     */
    static generateUniqueId() {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Formata código de rastreamento para exibição
     */
    static formatTrackingCode = memoize((codigo) => {
        if (!codigo || codigo.length !== 13) return codigo;
        return `${codigo.substring(0, 2)} ${codigo.substring(2, 5)} ${codigo.substring(5, 8)} ${codigo.substring(8, 11)} ${codigo.substring(11, 13)}`;
    });

    /**
     * Formata CPF
     */
    static formatCPF = memoize((cpf) => {
        if (!cpf) return '';
        const cleaned = cpf.replace(/\D/g, '');
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    });

    /**
     * Formata CNPJ
     */
    static formatCNPJ = memoize((cnpj) => {
        if (!cnpj) return '';
        const cleaned = cnpj.replace(/\D/g, '');
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    });
}

/**
 * Utilitários para arrays e objetos
 */
export class DataUtils {
    /**
     * Verifica se valor está vazio
     */
    static isEmpty(value) {
        return value === null || 
               value === undefined || 
               value === '' || 
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'object' && Object.keys(value).length === 0);
    }

    /**
     * Remove duplicatas de array (otimizado)
     */
    static removeDuplicates(array) {
        return [...new Set(array)];
    }

    /**
     * Clona objeto profundo (otimizado)
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
        return obj;
    }

    /**
     * Chunka array em pedaços menores
     */
    static chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Processa array em chunks com callback assíncrono
     */
    static async processInChunks(array, chunkSize, processor) {
        const chunks = this.chunk(array, chunkSize);
        const results = [];
        
        for (const chunk of chunks) {
            const chunkResult = await processor(chunk);
            results.push(...chunkResult);
            
            // Yield para não bloquear a UI
            if (BROWSER_FEATURES.REQUEST_IDLE_CALLBACK) {
                await new Promise(resolve => requestIdleCallback(resolve));
            }
        }
        
        return results;
    }
}

/**
 * Sistema de cache avançado com TTL e LRU
 */
export class AdvancedCache {
    constructor(maxSize = 100, ttl = 300000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
        this.timers = new Map();
        this.accessOrder = new Map();
    }

    set(key, value, customTTL = null) {
        const currentTTL = customTTL || this.ttl;
        
        // Remove entrada antiga se existir
        if (this.cache.has(key)) {
            this.delete(key);
        }
        
        // Verifica limite de tamanho (LRU)
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.accessOrder.keys().next().value;
            this.delete(oldestKey);
        }

        // Adiciona nova entrada
        const timestamp = Date.now();
        this.cache.set(key, { value, timestamp });
        this.accessOrder.set(key, timestamp);

        // Configura timer de expiração
        if (currentTTL > 0) {
            const timer = setTimeout(() => {
                this.delete(key);
            }, currentTTL);
            this.timers.set(key, timer);
        }
    }

    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }

        const entry = this.cache.get(key);
        const now = Date.now();

        // Verifica se expirou
        if (this.ttl > 0 && (now - entry.timestamp) > this.ttl) {
            this.delete(key);
            return null;
        }

        // Atualiza ordem de acesso (LRU)
        this.accessOrder.delete(key);
        this.accessOrder.set(key, now);

        return entry.value;
    }

    delete(key) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
        
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
    }

    clear() {
        this.cache.clear();
        this.accessOrder.clear();
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();
    }

    has(key) {
        return this.cache.has(key) && this.get(key) !== null;
    }

    size() {
        return this.cache.size;
    }

    keys() {
        return this.cache.keys();
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            ttl: this.ttl,
            usage: (this.cache.size / this.maxSize * 100).toFixed(2) + '%'
        };
    }
}

// Instância global de cache
export const globalCache = new AdvancedCache(CACHE_CONFIG.MAX_CACHE_SIZE, CACHE_CONFIG.DEFAULT_TTL);

/**
 * Worker Manager para processamento assíncrono
 */
export class WorkerManager {
    constructor() {
        this.workers = new Map();
        this.workerPool = [];
        this.maxWorkers = navigator.hardwareConcurrency || 4;
    }

    async createWorker(name, workerScript) {
        if (!BROWSER_FEATURES.WEB_WORKERS) {
            throw new Error('Web Workers não suportados');
        }

        const worker = new Worker(workerScript);
        this.workers.set(name, worker);
        return worker;
    }

    async executeInWorker(workerName, data) {
        const worker = this.workers.get(workerName);
        if (!worker) {
            throw new Error(`Worker ${workerName} não encontrado`);
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Worker timeout'));
            }, TIMING.LOADING_TIMEOUT);

            worker.onmessage = (event) => {
                clearTimeout(timeout);
                resolve(event.data);
            };

            worker.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
            };

            worker.postMessage(data);
        });
    }

    terminateWorker(name) {
        const worker = this.workers.get(name);
        if (worker) {
            worker.terminate();
            this.workers.delete(name);
        }
    }

    terminateAll() {
        this.workers.forEach(worker => worker.terminate());
        this.workers.clear();
    }
}

// Instância global do worker manager
export const workerManager = new WorkerManager();

/**
 * Performance Monitor para métricas
 */
export class PerformanceMonitor {
    constructor() {
        this.marks = new Map();
        this.measures = new Map();
        this.enabled = PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_MONITORING;
    }

    mark(name) {
        if (!this.enabled) return;
        
        const timestamp = performance.now();
        this.marks.set(name, timestamp);
        
        if (performance.mark) {
            performance.mark(name);
        }
    }

    measure(name, startMark, endMark = null) {
        if (!this.enabled) return;
        
        const endTime = endMark ? this.marks.get(endMark) : performance.now();
        const startTime = this.marks.get(startMark);
        
        if (startTime && endTime) {
            const duration = endTime - startTime;
            this.measures.set(name, duration);
            
            if (performance.measure) {
                try {
                    performance.measure(name, startMark, endMark);
                } catch (e) {
                    // Silently fail if marks don't exist
                }
            }
            
            return duration;
        }
    }

    getMetrics() {
        return {
            marks: Object.fromEntries(this.marks),
            measures: Object.fromEntries(this.measures),
            navigation: performance.getEntriesByType ? 
                performance.getEntriesByType('navigation')[0] : null
        };
    }

    clear() {
        this.marks.clear();
        this.measures.clear();
        
        if (performance.clearMarks) {
            performance.clearMarks();
        }
        if (performance.clearMeasures) {
            performance.clearMeasures();
        }
    }
}

// Instância global do performance monitor
export const performanceMonitor = new PerformanceMonitor();

/**
 * Cleanup global ao sair da página
 */
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        domCache.destroy();
        globalCache.clear();
        workerManager.terminateAll();
        CodeValidator.clearCache();
        memoCache.clear();
        performanceMonitor.clear();
    });
}