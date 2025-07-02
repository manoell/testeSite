/**
 * API.js - Módulo centralizado para operações de API (Versão Otimizada)
 * Gerencia todas as chamadas HTTP, cache, timeout, retry e tratamento de erros
 */

import { 
    ENDPOINTS, 
    TIMING, 
    ERROR_MESSAGES,
    API_CONFIG,
    PERFORMANCE_CONFIG,
    BROWSER_FEATURES,
    EVENTS
} from './constants.js';
import { globalCache, performanceMonitor } from './utils.js';

/**
 * Request Deduplicator para evitar requests duplicados
 */
class RequestDeduplicator {
    constructor() {
        this.pendingRequests = new Map();
    }

    async deduplicate(key, requestFn) {
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key);
        }

        const promise = requestFn().finally(() => {
            this.pendingRequests.delete(key);
        });

        this.pendingRequests.set(key, promise);
        return promise;
    }

    clear() {
        this.pendingRequests.clear();
    }

    cancel(key) {
        if (this.pendingRequests.has(key)) {
            this.pendingRequests.delete(key);
        }
    }
}

/**
 * Connection Pool para gerenciar conexões HTTP
 */
class ConnectionPool {
    constructor(maxConnections = API_CONFIG.CONCURRENT_LIMIT || 6) {
        this.maxConnections = maxConnections;
        this.activeConnections = 0;
        this.queue = [];
        this.connectionStats = {
            total: 0,
            successful: 0,
            failed: 0,
            avgResponseTime: 0
        };
    }

    async executeRequest(requestFn) {
        return new Promise((resolve, reject) => {
            const execute = async () => {
                if (this.activeConnections >= this.maxConnections) {
                    this.queue.push(execute);
                    return;
                }

                this.activeConnections++;
                this.connectionStats.total++;
                const startTime = performance.now();

                try {
                    const result = await requestFn();
                    const endTime = performance.now();
                    const responseTime = endTime - startTime;
                    
                    this.connectionStats.successful++;
                    this.updateAvgResponseTime(responseTime);
                    
                    resolve(result);
                } catch (error) {
                    this.connectionStats.failed++;
                    reject(error);
                } finally {
                    this.activeConnections--;
                    if (this.queue.length > 0) {
                        const nextRequest = this.queue.shift();
                        // Executar próximo request de forma assíncrona
                        setTimeout(nextRequest, 0);
                    }
                }
            };

            execute();
        });
    }

    updateAvgResponseTime(responseTime) {
        const total = this.connectionStats.successful;
        const currentAvg = this.connectionStats.avgResponseTime;
        this.connectionStats.avgResponseTime = ((currentAvg * (total - 1)) + responseTime) / total;
    }

    getStats() {
        return {
            ...this.connectionStats,
            activeConnections: this.activeConnections,
            queueLength: this.queue.length,
            maxConnections: this.maxConnections,
            successRate: this.connectionStats.total > 0 ? 
                (this.connectionStats.successful / this.connectionStats.total * 100).toFixed(2) + '%' : '0%'
        };
    }

    clear() {
        this.queue = [];
        this.activeConnections = 0;
    }
}

/**
 * Retry Manager com exponential backoff
 */
class RetryManager {
    constructor() {
        this.defaultRetries = API_CONFIG.RETRY_ATTEMPTS || 3;
        this.baseDelay = API_CONFIG.RETRY_DELAY || 1000;
        this.maxDelay = 10000; // 10 segundos max
    }

    async withRetry(requestFn, retries = this.defaultRetries, customDelay = null) {
        let lastError;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;
                
                // Não fazer retry em certos tipos de erro
                if (this.shouldNotRetry(error) || attempt === retries) {
                    throw error;
                }

                // Calcular delay com exponential backoff
                const delay = customDelay || Math.min(
                    this.baseDelay * Math.pow(2, attempt),
                    this.maxDelay
                );

                performanceMonitor.mark(`retry_${attempt}_start`);
                await this.delay(delay);
                performanceMonitor.mark(`retry_${attempt}_end`);
                performanceMonitor.measure(`retry_${attempt}`, `retry_${attempt}_start`, `retry_${attempt}_end`);
            }
        }

        throw lastError;
    }

    shouldNotRetry(error) {
        // Não fazer retry para erros 4xx (exceto 408, 429)
        if (error.status >= 400 && error.status < 500) {
            return ![408, 429].includes(error.status);
        }
        
        // Não fazer retry para erros de rede específicos
        if (error.name === 'AbortError' || error.message.includes('cancelado')) {
            return true;
        }

        return false;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Response Cache Manager com estratégias avançadas
 */
class ResponseCacheManager {
    constructor() {
        this.cache = globalCache;
        this.cacheStrategies = {
            'network-first': this.networkFirst.bind(this),
            'cache-first': this.cacheFirst.bind(this),
            'network-only': this.networkOnly.bind(this),
            'cache-only': this.cacheOnly.bind(this)
        };
    }

    async executeWithStrategy(key, requestFn, strategy = 'network-first', ttl = null) {
        const strategyFn = this.cacheStrategies[strategy];
        if (!strategyFn) {
            throw new Error(`Estratégia de cache desconhecida: ${strategy}`);
        }

        return strategyFn(key, requestFn, ttl);
    }

    async networkFirst(key, requestFn, ttl) {
        try {
            const response = await requestFn();
            this.cache.set(key, response, ttl);
            return response;
        } catch (error) {
            const cached = this.cache.get(key);
            if (cached) {
                console.warn('Retornando dados do cache devido a erro de rede:', error.message);
                return cached;
            }
            throw error;
        }
    }

    async cacheFirst(key, requestFn, ttl) {
        const cached = this.cache.get(key);
        if (cached) {
            // Atualizar cache em background (stale-while-revalidate)
            requestFn().then(response => {
                this.cache.set(key, response, ttl);
            }).catch(() => {
                // Silently fail background update
            });
            
            return cached;
        }

        const response = await requestFn();
        this.cache.set(key, response, ttl);
        return response;
    }

    async networkOnly(key, requestFn, ttl) {
        return requestFn();
    }

    async cacheOnly(key, requestFn, ttl) {
        const cached = this.cache.get(key);
        if (cached) {
            return cached;
        }
        throw new Error('Dados não encontrados no cache');
    }

    generateKey(url, params = {}) {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((result, key) => {
                result[key] = params[key];
                return result;
            }, {});
        
        return `${url}_${JSON.stringify(sortedParams)}`;
    }

    invalidatePattern(pattern) {
        const keys = Array.from(this.cache.keys());
        keys.forEach(key => {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        });
    }
}

/**
 * Classe principal para gerenciar operações de API
 */
export class APIManager {
    constructor() {
        this.abortControllers = new Map();
        this.requestDeduplicator = new RequestDeduplicator();
        this.connectionPool = new ConnectionPool(PERFORMANCE_CONFIG.MAX_CONCURRENT_REQUESTS);
        this.retryManager = new RetryManager();
        this.cacheManager = new ResponseCacheManager();
        this.interceptors = {
            request: [],
            response: [],
            error: []
        };
        this.setupDefaultInterceptors();
    }

    setupDefaultInterceptors() {
        // Request interceptor para logging
        this.addRequestInterceptor((config) => {
            performanceMonitor.mark(`request_${config.url}_start`);
            return config;
        });

        // Response interceptor para métricas
        this.addResponseInterceptor((response, config) => {
            performanceMonitor.mark(`request_${config.url}_end`);
            performanceMonitor.measure(
                `request_${config.url}`, 
                `request_${config.url}_start`, 
                `request_${config.url}_end`
            );
            return response;
        });

        // Error interceptor
        this.addErrorInterceptor((error) => {
            console.error('API Error:', error);
            this.dispatchEvent(EVENTS.SEARCH_ERROR, { error });
            return Promise.reject(error);
        });
    }

    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }

    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
    }

    addErrorInterceptor(interceptor) {
        this.interceptors.error.push(interceptor);
    }

    async executeRequestInterceptors(config) {
        let processedConfig = config;
        for (const interceptor of this.interceptors.request) {
            processedConfig = await interceptor(processedConfig);
        }
        return processedConfig;
    }

    async executeResponseInterceptors(response, config) {
        let processedResponse = response;
        for (const interceptor of this.interceptors.response) {
            processedResponse = await interceptor(processedResponse, config);
        }
        return processedResponse;
    }

    async executeErrorInterceptors(error) {
        for (const interceptor of this.interceptors.error) {
            try {
                return await interceptor(error);
            } catch (e) {
                // Continue to next interceptor
            }
        }
        throw error;
    }

    /**
     * Executa request HTTP com todas as otimizações
     */
    async request(url, options = {}, requestId = null, config = {}) {
        const {
            retries = 3,
            cacheStrategy = 'network-first',
            cacheTTL = null,
            deduplicate = true,
            timeout = API_CONFIG.TIMEOUT
        } = config;

        // Configuração base do request
        let requestConfig = {
            url,
            method: options.method || 'GET',
            headers: {
                ...API_CONFIG.REQUEST_HEADERS,
                ...options.headers
            },
            timeout,
            ...options
        };

        // Executar interceptors de request
        requestConfig = await this.executeRequestInterceptors(requestConfig);

        // Gerar chave para cache e deduplicação
        const cacheKey = this.cacheManager.generateKey(url, options.body || {});
        
        // Request function
        const executeRequest = async () => {
            return this.connectionPool.executeRequest(async () => {
                // Criar abort controller
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                
                if (requestId) {
                    // Cancelar request anterior se existir
                    if (this.abortControllers.has(requestId)) {
                        this.abortControllers.get(requestId).abort();
                    }
                    this.abortControllers.set(requestId, controller);
                }

                try {
                    const response = await fetch(url, {
                        ...requestConfig,
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        const error = new Error(`HTTP Error: ${response.status} ${response.statusText}`);
                        error.status = response.status;
                        error.response = response;
                        throw error;
                    }

                    // Executar interceptors de response
                    const processedResponse = await this.executeResponseInterceptors(response, requestConfig);
                    return processedResponse;

                } catch (error) {
                    clearTimeout(timeoutId);
                    
                    if (error.name === 'AbortError') {
                        const abortError = new Error(ERROR_MESSAGES.CANCELLED_ERROR);
                        abortError.name = 'AbortError';
                        throw abortError;
                    }
                    
                    // Executar interceptors de erro
                    throw await this.executeErrorInterceptors(error);
                } finally {
                    if (requestId) {
                        this.abortControllers.delete(requestId);
                    }
                }
            });
        };

        // Aplicar estratégias de otimização
        let finalRequest = executeRequest;

        // Aplicar retry
        if (retries > 0) {
            finalRequest = () => this.retryManager.withRetry(executeRequest, retries);
        }

        // Aplicar deduplicação
        if (deduplicate && PERFORMANCE_CONFIG.ENABLE_REQUEST_DEDUPLICATION) {
            finalRequest = () => this.requestDeduplicator.deduplicate(cacheKey, finalRequest);
        }

        // Aplicar cache strategy
        if (cacheStrategy !== 'network-only') {
            return this.cacheManager.executeWithStrategy(cacheKey, finalRequest, cacheStrategy, cacheTTL);
        }

        return finalRequest();
    }

    /**
     * GET request otimizado
     */
    async get(url, params = {}, options = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        
        try {
            const response = await this.request(fullUrl, { 
                method: 'GET',
                ...options 
            }, options.requestId, options.config);
            
            const data = await response.json();
            
            if (data.erro) {
                throw new Error(data.mensagem || ERROR_MESSAGES.GENERIC_ERROR);
            }

            this.dispatchEvent(EVENTS.SEARCH_SUCCESS, { data, url: fullUrl });
            return data;
            
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * POST request otimizado
     */
    async post(url, data = {}, options = {}) {
        try {
            const body = this.prepareRequestBody(data, options.contentType);
            const headers = this.prepareHeaders(options);

            const response = await this.request(url, {
                method: 'POST',
                headers,
                body,
                ...options
            }, options.requestId, options.config);
            
            const responseData = await response.json();
            
            if (responseData.erro) {
                throw new Error(responseData.mensagem || ERROR_MESSAGES.GENERIC_ERROR);
            }

            this.dispatchEvent(EVENTS.SEARCH_SUCCESS, { data: responseData, url });
            return responseData;
            
        } catch (error) {
            throw this.handleError(error);
        }
    }

    prepareRequestBody(data, contentType = 'form') {
        if (contentType === 'json') {
            return JSON.stringify(data);
        }
        
        // FormData por padrão
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });
        return formData;
    }

    prepareHeaders(options) {
        const headers = { ...API_CONFIG.REQUEST_HEADERS };
        
        if (options.contentType === 'json') {
            headers['Content-Type'] = 'application/json';
        }
        
        if (BROWSER_FEATURES.COMPRESSION_STREAM && API_CONFIG.ENABLE_COMPRESSION) {
            headers['Accept-Encoding'] = 'gzip, deflate, br';
        }
        
        return { ...headers, ...options.headers };
    }

    /**
     * Tratamento de erros otimizado
     */
    handleError(error) {
        console.error('API Error:', error);

        // Mapear erros específicos
        if (error.message.includes('timeout') || error.message.includes('cancelado')) {
            return new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
        }

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }

        if (error.message.includes('Captcha inválido')) {
            return new Error(ERROR_MESSAGES.INVALID_CAPTCHA);
        }

        if (error.status >= 500) {
            return new Error(ERROR_MESSAGES.SERVER_ERROR);
        }

        if (error.status === 404) {
            return new Error(ERROR_MESSAGES.NOT_FOUND);
        }

        if (error.status === 403) {
            return new Error(ERROR_MESSAGES.ACCESS_DENIED);
        }

        return error;
    }

    /**
     * Cancelar todos os requests ativos
     */
    cancelAllRequests() {
        this.abortControllers.forEach(controller => controller.abort());
        this.abortControllers.clear();
        this.requestDeduplicator.clear();
        this.connectionPool.clear();
    }

    /**
     * Cancelar request específico
     */
    cancelRequest(requestId) {
        if (this.abortControllers.has(requestId)) {
            this.abortControllers.get(requestId).abort();
            this.abortControllers.delete(requestId);
        }
        this.requestDeduplicator.cancel(requestId);
    }

    /**
     * Obter estatísticas da API
     */
    getStats() {
        return {
            connectionPool: this.connectionPool.getStats(),
            cache: this.cacheManager.cache.getStats(),
            performance: performanceMonitor.getMetrics(),
            activeRequests: this.abortControllers.size,
            pendingRequests: this.requestDeduplicator.pendingRequests.size
        };
    }

    /**
     * Invalidar cache por padrão
     */
    invalidateCache(pattern) {
        this.cacheManager.invalidatePattern(pattern);
    }

    /**
     * Dispatch custom events
     */
    dispatchEvent(eventName, detail) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.cancelAllRequests();
        this.cacheManager.cache.clear();
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
     */
    static async searchSingle(codigo, captcha, mqs = 'S') {
        return await apiManager.get(ENDPOINTS.RESULT, {
            objeto: codigo,
            captcha: captcha,
            mqs: mqs
        }, {
            requestId: 'search-single',
            config: {
                cacheStrategy: 'network-first',
                cacheTTL: TIMING.CACHE_TTL,
                retries: 2
            }
        });
    }

    /**
     * Busca múltiplos objetos
     */
    static async searchMultiple(codigos, captcha) {
        return await apiManager.get(ENDPOINTS.MULTI_TRACKING, {
            objeto: codigos,
            captcha: captcha
        }, {
            requestId: 'search-multiple',
            config: {
                cacheStrategy: 'network-first',
                cacheTTL: TIMING.CACHE_TTL,
                retries: 2
            }
        });
    }

    /**
     * Busca dados de controle/sessão
     */
    static async getControlData() {
        return await apiManager.get(ENDPOINTS.CONTROL, {}, {
            requestId: 'control-data',
            config: {
                cacheStrategy: 'cache-first',
                cacheTTL: TIMING.CACHE_TTL * 2, // Cache mais longo para dados de controle
                retries: 1
            }
        });
    }

    /**
     * Busca QR Code do locker
     */
    static async getLockerQR(codigo) {
        return await apiManager.get(ENDPOINTS.QR_LOCKER, {
            objeto: codigo
        }, {
            requestId: 'locker-qr',
            config: {
                cacheStrategy: 'cache-first',
                cacheTTL: TIMING.CACHE_TTL * 3, // Cache ainda mais longo para QR codes
                retries: 2
            }
        });
    }

    /**
     * Busca rastreamento por CPF/CNPJ
     */
    static async searchByDocument(documento) {
        return await apiManager.get('rastrocpfcnpj.php', {
            cpfcnpj: documento
        }, {
            requestId: 'search-document',
            config: {
                cacheStrategy: 'network-first',
                cacheTTL: TIMING.CACHE_TTL,
                retries: 2
            }
        });
    }

    /**
     * Invalidar cache de rastreamento
     */
    static invalidateTrackingCache(codigo = null) {
        if (codigo) {
            apiManager.invalidateCache(codigo);
        } else {
            apiManager.invalidateCache('rastro');
            apiManager.invalidateCache('objeto');
        }
    }
}

/**
 * API para validação de captcha
 */
export class CaptchaAPI {
    /**
     * Valida captcha
     */
    static async validate(captcha) {
        return await apiManager.post(ENDPOINTS.VALIDATE_CAPTCHA, {
            captcha: captcha
        }, {
            requestId: 'validate-captcha',
            contentType: 'form',
            config: {
                cacheStrategy: 'network-only', // Nunca cachear validação de captcha
                retries: 1
            }
        });
    }

    /**
     * Atualiza imagem do captcha
     */
    static refreshImage() {
        return `${ENDPOINTS.SECURIMAGE_SHOW}?${Math.random()}`;
    }

    /**
     * Obter áudio do captcha
     */
    static getAudioURL() {
        return `${ENDPOINTS.SECURIMAGE_PLAY}?${Math.random()}`;
    }
}

/**
 * Monitor de conectividade otimizado
 */
export class ConnectivityMonitor {
    static isOnline = navigator.onLine;
    static callbacks = [];
    static checkInterval = null;
    static lastCheckTime = 0;
    static pingEndpoint = '/favicon.ico';

    static init() {
        // Event listeners básicos
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyCallbacks('online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyCallbacks('offline');
        });

        // Check periódico mais inteligente
        this.startPeriodicCheck();
    }

    static startPeriodicCheck() {
        if (this.checkInterval) return;

        this.checkInterval = setInterval(async () => {
            const now = Date.now();
            // Só verificar se passou tempo suficiente desde a última verificação
            if (now - this.lastCheckTime < 30000) return; // 30 segundos

            const actualStatus = await this.checkConnection();
            if (actualStatus !== this.isOnline) {
                this.isOnline = actualStatus;
                this.notifyCallbacks(actualStatus ? 'online' : 'offline');
            }
            
            this.lastCheckTime = now;
        }, 60000); // Verificar a cada minuto
    }

    static stopPeriodicCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    static onStatusChange(callback) {
        this.callbacks.push(callback);
        
        // Retornar função para remover o callback
        return () => {
            const index = this.callbacks.indexOf(callback);
            if (index > -1) {
                this.callbacks.splice(index, 1);
            }
        };
    }

    static notifyCallbacks(status) {
        this.callbacks.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Erro em callback de conectividade:', error);
            }
        });
    }

    static async checkConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(this.pingEndpoint + '?' + Date.now(), {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    static getStatus() {
        return {
            isOnline: this.isOnline,
            lastCheck: this.lastCheckTime,
            callbacksCount: this.callbacks.length
        };
    }

    static destroy() {
        this.stopPeriodicCheck();
        this.callbacks = [];
    }
}

/**
 * Request Queue para requests offline
 */
export class OfflineRequestQueue {
    constructor() {
        this.queue = [];
        this.storageKey = 'offline_request_queue';
        this.loadFromStorage();
        this.setupOnlineHandler();
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.queue = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Erro ao carregar queue de requests offline:', error);
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
        } catch (error) {
            console.error('Erro ao salvar queue de requests offline:', error);
        }
    }

    enqueue(request) {
        this.queue.push({
            ...request,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });
        this.saveToStorage();
    }

    async processQueue() {
        if (!ConnectivityMonitor.isOnline || this.queue.length === 0) {
            return;
        }

        const requests = [...this.queue];
        this.queue = [];
        this.saveToStorage();

        const results = await Promise.allSettled(
            requests.map(request => this.executeQueuedRequest(request))
        );

        // Re-enfileirar requests que falharam
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                this.enqueue(requests[index]);
            }
        });
    }

    async executeQueuedRequest(request) {
        return apiManager.request(request.url, request.options, request.requestId, request.config);
    }

    setupOnlineHandler() {
        ConnectivityMonitor.onStatusChange((status) => {
            if (status === 'online') {
                this.processQueue();
            }
        });
    }

    clear() {
        this.queue = [];
        this.saveToStorage();
    }

    getQueueStats() {
        return {
            length: this.queue.length,
            oldestRequest: this.queue.length > 0 ? 
                Math.min(...this.queue.map(r => r.timestamp)) : null
        };
    }
}

// Instâncias globais
export const offlineRequestQueue = new OfflineRequestQueue();

// Inicializar monitor de conectividade
ConnectivityMonitor.init();

// Cleanup global
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        apiManager.destroy();
        ConnectivityMonitor.destroy();
    });
}