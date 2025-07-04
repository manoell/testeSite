/**
 * API.js - Módulo de API Otimizado
 * Versão otimizada: removidos logs desnecessários, simplificado error handling
 */

import { ENDPOINTS, TIMING, ERROR_MESSAGES } from './constants.js';

const DEFAULT_CONFIG = {
    timeout: TIMING.LOADING_TIMEOUT,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
    }
};

/**
 * Classe principal para gerenciar operações de API
 */
export class APIManager {
    constructor() {
        this.abortControllers = new Map();
    }

    async request(url, options = {}, requestId = null) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_CONFIG.timeout);
        
        if (requestId) {
            this.abortControllers.get(requestId)?.abort();
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
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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

    async get(url, params = {}, requestId = null) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        try {
            const response = await this.request(fullUrl, { method: 'GET' }, requestId);
            const data = await response.json();
            
            if (data.erro) {
                throw new Error(data.mensagem || ERROR_MESSAGES.GENERIC_ERROR);
            }

            return data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

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
            
            if (responseData.erro) {
                throw new Error(responseData.mensagem || ERROR_MESSAGES.GENERIC_ERROR);
            }

            return responseData;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
		if (error.message.includes('timeout') || error.message.includes('cancelado')) {
			return new Error('Tempo limite excedido. Tente novamente.');
		}

		if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
			return new Error(ERROR_MESSAGES.NETWORK_ERROR);
		}

		// ← MANTER ESTA VERIFICAÇÃO ESPECÍFICA:
		if (error.message.includes('Captcha inválido')) {
			return new Error(ERROR_MESSAGES.INVALID_CAPTCHA);
		}

		return error;
	}

    cancelAllRequests() {
        this.abortControllers.forEach(controller => controller.abort());
        this.abortControllers.clear();
    }

    cancelRequest(requestId) {
        if (this.abortControllers.has(requestId)) {
            this.abortControllers.get(requestId).abort();
            this.abortControllers.delete(requestId);
        }
    }
}

// Instância global
export const apiManager = new APIManager();

/**
 * API específica para rastreamento
 */
export class TrackingAPI {
    static async searchSingle(codigo, captcha, mqs = 'S') {
        return await apiManager.get(ENDPOINTS.RESULT, {
            objeto: codigo,
            captcha: captcha,
            mqs: mqs
        }, 'search-single');
    }

    static async searchMultiple(codigos, captcha) {
        return await apiManager.get(ENDPOINTS.MULTI_TRACKING, {
            objeto: codigos,
            captcha: captcha
        }, 'search-multiple');
    }

    static async getControlData() {
        return await apiManager.get(ENDPOINTS.CONTROL, {}, 'control-data');
    }

    static async getLockerQR(codigo) {
        return await apiManager.get(ENDPOINTS.QR_LOCKER, {
            objeto: codigo
        }, 'locker-qr');
    }

    static async searchByDocument(documento) {
        return await apiManager.get('rastrocpfcnpj.php', {
            cpfcnpj: documento
        }, 'search-document');
    }
}

/**
 * API para captcha
 */
export class CaptchaAPI {
    static async validate(captcha) {
        return await apiManager.post('validate_captcha.php', {
            captcha: captcha
        }, 'validate-captcha');
    }

    static refreshImage() {
        return `${ENDPOINTS.SECURIMAGE_SHOW}?${Math.random()}`;
    }
}