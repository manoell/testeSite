/**
 * API.js - Módulo centralizado para operações de API
 * Gerencia todas as chamadas HTTP, cache e tratamento de erros
 */

import { ENDPOINTS, TIMING, ERROR_MESSAGES } from './constants.js';
import { globalCache } from './utils.js';

/**
 * Configurações padrão para requests
 */
const DEFAULT_CONFIG = {
    timeout: TIMING.LOADING_TIMEOUT,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
    }
};

/**
 * Classe para gerenciar operações de API
 */
export class APIManager {
    constructor() {
        this.abortControllers = new Map();
    }

    /**
     * Executa request HTTP com timeout e abort controller
     * @param {string} url - URL do endpoint
     * @param {Object} options - Opções do fetch
     * @param {string} requestId - ID único para controle
     * @returns {Promise} Response
     */
    async request(url, options = {}, requestId = null) {
        // Cria abort controller para cancelar request se necessário
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_CONFIG.timeout);
        
        if (requestId) {
            // Cancela request anterior se existir
            if (this.abortControllers.has(requestId)) {
                this.abortControllers.get(requestId).abort();
            }
            this.abortControllers.set(requestId, controller);
        }

        try {
            const response = await fetch(url, {
                ...DEFAULT_CONFIG,
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request cancelado ou timeout');
            }
            
            throw error;
        } finally {
            if (requestId) {
                this.abortControllers.delete(requestId);
            }
        }
    }

    /**
     * Executa GET request com cache opcional
     * @param {string} url - URL do endpoint
     * @param {Object} params - Parâmetros da query
     * @param {boolean} useCache - Se deve usar cache
     * @param {string} requestId - ID único para controle
     * @returns {Promise} Response JSON
     */
    async get(url, params = {}, useCache = false, requestId = null) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        
        // Verifica cache se habilitado
        if (useCache) {
            const cached = globalCache.get(fullUrl);
            if (cached) {
                return cached;
            }
        }

        try {
            const response = await this.request(fullUrl, { method: 'GET' }, requestId);
            const data = await response.json();
            
            // Verifica se response indica erro
            if (data.erro) {
                throw new Error(data.mensagem || ERROR_MESSAGES.GENERIC_ERROR);
            }

            // Salva no cache se habilitado
            if (useCache) {
                globalCache.set(fullUrl, data);
            }

            return data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Executa POST request
     * @param {string} url - URL do endpoint
     * @param {Object} data - Dados para envio
     * @param {string} requestId - ID único para controle
     * @returns {Promise} Response JSON
     */
    async post(url, data = {}, requestId = null) {
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const response = await this.request(url, {
                method: 'POST',
                body: formData
            }, requestId);
            
            const responseData = await response.json();
            
            // Verifica se response indica erro
            if (responseData.erro) {
                throw new Error(responseData.mensagem || ERROR_MESSAGES.GENERIC_ERROR);
            }

            return responseData;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Trata erros de API de forma padronizada
     * @param {Error} error - Erro original
     * @returns {Error} Erro tratado
     */
    handleError(error) {
        console.error('API Error:', error);

        // Mapeia erros específicos
        if (error.message.includes('timeout') || error.message.includes('cancelado')) {
            return new Error('Tempo limite excedido. Tente novamente.');
        }

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }

        if (error.message.includes('Captcha inválido')) {
            return new Error(ERROR_MESSAGES.INVALID_CAPTCHA);
        }

        // Retorna erro original se não foi mapeado
        return error;
    }

    /**
     * Cancela todos os requests ativos
     */
    cancelAllRequests() {
        this.abortControllers.forEach(controller => controller.abort());
        this.abortControllers.clear();
    }

    /**
     * Cancela request específico
     * @param {string} requestId - ID do request
     */
    cancelRequest(requestId) {
        if (this.abortControllers.has(requestId)) {
            this.abortControllers.get(requestId).abort();
            this.abortControllers.delete(requestId);
        }
    }
}

// Instância global do API Manager
export const apiManager = new APIManager();

/**
 * API específica para operações de rastreamento
 */
export class TrackingAPI {
    /**
     * Busca informações de um objeto único
     * @param {string} codigo - Código do objeto
     * @param {string} captcha - Valor do captcha
     * @param {string} mqs - Flag MQS
     * @returns {Promise} Dados do objeto
     */
    static async searchSingle(codigo, captcha, mqs = 'S') {
        return await apiManager.get(ENDPOINTS.RESULT, {
            objeto: codigo,
            captcha: captcha,
            mqs: mqs
        }, false, 'search-single');
    }

    /**
     * Busca múltiplos objetos
     * @param {string} codigos - Códigos concatenados
     * @param {string} captcha - Valor do captcha
     * @returns {Promise} Dados dos objetos
     */
    static async searchMultiple(codigos, captcha) {
        return await apiManager.get(ENDPOINTS.MULTI_TRACKING, {
            objeto: codigos,
            captcha: captcha
        }, false, 'search-multiple');
    }

    /**
     * Busca dados de controle/sessão
     * @returns {Promise} Dados de controle
     */
    static async getControlData() {
        return await apiManager.get(ENDPOINTS.CONTROL, {}, true, 'control-data');
    }

    /**
     * Busca QR Code do locker
     * @param {string} codigo - Código do objeto
     * @returns {Promise} Dados do QR Code
     */
    static async getLockerQR(codigo) {
        return await apiManager.get(ENDPOINTS.QR_LOCKER, {
            objeto: codigo
        }, false, 'locker-qr');
    }

    /**
     * Busca rastreamento por CPF/CNPJ
     * @param {string} documento - CPF ou CNPJ
     * @returns {Promise} Dados dos objetos
     */
    static async searchByDocument(documento) {
        return await apiManager.get('rastrocpfcnpj.php', {
            cpfcnpj: documento
        }, false, 'search-document');
    }
}

/**
 * API para validação de captcha
 */
export class CaptchaAPI {
    /**
     * Valida captcha
     * @param {string} captcha - Valor do captcha
     * @returns {Promise} Resultado da validação
     */
    static async validate(captcha) {
        return await apiManager.post('validate_captcha.php', {
            captcha: captcha
        }, 'validate-captcha');
    }

    /**
     * Atualiza imagem do captcha
     * @returns {string} Nova URL do captcha
     */
    static refreshImage() {
        return `${ENDPOINTS.SECURIMAGE_SHOW}?${Math.random()}`;
    }
}

/**
 * Interceptadores para logging e monitoramento
 */
export class APIInterceptors {
    static requestCount = 0;
    static errorCount = 0;
    static totalResponseTime = 0;

    /**
     * Intercepta request antes do envio
     * @param {string} url - URL do request
     * @param {Object} options - Opções do request
     * @returns {Object} Request modificado
     */
    static beforeRequest(url, options) {
        this.requestCount++;
        console.log(`[API] Request #${this.requestCount} para: ${url}`);
        
        // Adiciona timestamp para medir performance
        options._startTime = Date.now();
        
        return { url, options };
    }

    /**
     * Intercepta response após recebimento
     * @param {Response} response - Response recebido
     * @param {Object} options - Opções originais
     * @returns {Response} Response
     */
    static afterResponse(response, options) {
        if (options._startTime) {
            const responseTime = Date.now() - options._startTime;
            this.totalResponseTime += responseTime;
            console.log(`[API] Response em ${responseTime}ms`);
        }

        return response;
    }

    /**
     * Intercepta erros
     * @param {Error} error - Erro ocorrido
     * @returns {Error} Erro
     */
    static onError(error) {
        this.errorCount++;
        console.error(`[API] Erro #${this.errorCount}:`, error.message);
        
        return error;
    }

    /**
     * Retorna estatísticas de performance
     * @returns {Object} Estatísticas
     */
    static getStats() {
        return {
            totalRequests: this.requestCount,
            totalErrors: this.errorCount,
            averageResponseTime: this.requestCount > 0 
                ? Math.round(this.totalResponseTime / this.requestCount) 
                : 0,
            errorRate: this.requestCount > 0 
                ? Math.round((this.errorCount / this.requestCount) * 100) 
                : 0
        };
    }

    /**
     * Reseta estatísticas
     */
    static resetStats() {
        this.requestCount = 0;
        this.errorCount = 0;
        this.totalResponseTime = 0;
    }
}

/**
 * Monitor de conectividade
 */
export class ConnectivityMonitor {
    static isOnline = navigator.onLine;
    static callbacks = [];

    static init() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyCallbacks('online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyCallbacks('offline');
        });
    }

    static onStatusChange(callback) {
        this.callbacks.push(callback);
    }

    static notifyCallbacks(status) {
        this.callbacks.forEach(callback => callback(status));
    }

    static checkConnection() {
        return new Promise((resolve) => {
            // Tenta fazer uma request simples para verificar conectividade
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = '/favicon.ico?' + Date.now();
        });
    }
}

// Inicializa monitor de conectividade
ConnectivityMonitor.init();