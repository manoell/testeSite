/**
 * acessaDados.js - Módulo de Acesso a Dados Otimizado
 * Versão otimizada: melhor error handling, timeout configurável, retry automático
 */

// === CONFIGURAÇÕES ===
const CONFIG = {
    TIMEOUT: 30000, // 30 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 segundo
};

/**
 * Utilitário para delay
 * @param {number} ms - Milissegundos
 * @returns {Promise}
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Dispara uma promessa para acessar dados do banco
 * @param {Object} parametros - Parâmetros da requisição
 * @param {string} parametros.endpoint - Endpoint da API
 * @param {string} parametros.acao - Ação a ser executada
 * @param {number} [parametros.timeout] - Timeout personalizado
 * @param {number} [parametros.retries] - Número de tentativas
 * 
 * @example
 * const parametros = {
 *   acao: 'abreChat',
 *   id_chat: id_chat,
 *   id_origem: $("#carteiro").val(),
 *   endpoint: 'chat.php'
 * }
 * 
 * @returns {Promise<Object>} Dados da resposta
 */
const acessaDados = async (parametros) => {
    const { 
        endpoint, 
        timeout = CONFIG.TIMEOUT,
        retries = CONFIG.RETRY_ATTEMPTS,
        ...params 
    } = parametros;

    // Validação básica
    if (!endpoint) {
        throw new Error('Endpoint é obrigatório');
    }

    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Timeout controller
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    parametros: params
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Verificar se a resposta é válida
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Tentar fazer parse do JSON
            const data = await response.json();
            
            // Verificar se há erro na resposta
            if (data.erro && typeof data.erro === 'boolean' && data.erro === true) {
                throw new Error(data.mensagem || 'Erro na resposta do servidor');
            }

            return data;

        } catch (error) {
            lastError = error;
            
            // Se é o último attempt, lançar o erro
            if (attempt === retries) {
                break;
            }
            
            // Se é erro de abort (timeout), não fazer retry
            if (error.name === 'AbortError') {
                throw new Error('Tempo limite excedido');
            }
            
            // Se é erro de rede, fazer retry após delay
            if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
                await delay(CONFIG.RETRY_DELAY * (attempt + 1));
                continue;
            }
            
            // Para outros erros, não fazer retry
            break;
        }
    }

    // Tratar diferentes tipos de erro
    if (lastError.name === 'AbortError') {
        throw new Error('Tempo limite excedido. Tente novamente.');
    }
    
    if (lastError.message.includes('fetch') || lastError.message.includes('NetworkError')) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
    
    if (lastError.message.includes('JSON')) {
        throw new Error('Erro no formato da resposta do servidor.');
    }

    throw lastError;
};

/**
 * Versão simplificada para GET requests
 * @param {string} endpoint - URL do endpoint
 * @param {Object} params - Parâmetros da query string
 * @returns {Promise<Object>}
 */
const acessaDadosGet = async (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        if (error.message.includes('fetch')) {
            throw new Error('Erro de conexão. Tente novamente.');
        }
        throw error;
    }
};

export { 
    acessaDados,
    acessaDadosGet
};