/**
 * global.js - Utilitários Globais Otimizados
 * Versão otimizada: melhor performance, funções consolidadas, tipos explícitos
 */

import * as acessaBanco from './acessaDados.js';

// === VERIFICAÇÕES DE TIPOS ===

/**
 * Verifica se objeto está vazio
 * @param {Object} obj - Objeto a ser verificado
 * @returns {boolean}
 */
export const isE = (obj) => {
    if (obj === null || obj === undefined) return true;
    if (typeof obj !== 'object') return false;
    return Object.keys(obj).length === 0;
};

/**
 * Verifica se dados estão vazios (otimizado)
 * @param {*} data - Dados a serem verificados
 * @returns {boolean}
 */
export const isEmpty = (data) => {
    // Null ou undefined
    if (data === null || data === undefined) return true;
    
    // String
    if (typeof data === 'string') {
        return data.trim() === '';
    }
    
    // Number
    if (typeof data === 'number') {
        return isNaN(data);
    }
    
    // Array
    if (Array.isArray(data)) {
        return data.length === 0;
    }
    
    // Object
    if (typeof data === 'object') {
        return Object.keys(data).length === 0;
    }
    
    return false;
};

// === SISTEMA DE STORAGE OTIMIZADO ===

/**
 * Sistema de localStorage otimizado
 */
export const ls = {
    name: 'sroRastro',
    
    /**
     * Salva dados no localStorage
     * @param {*} data - Dados a serem salvos
     * @param {string} [name] - Nome personalizado da chave
     * @returns {*} Dados salvos
     */
    save(data, name) {
        const key = name || this.name;
        
        if (isEmpty(data)) {
            console.warn('ls.save: Tentativa de salvar dados vazios');
            return data;
        }
        
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            return data;
        } catch (error) {
            console.error('ls.save: Erro ao salvar no localStorage:', error);
            return null;
        }
    },
    
    /**
     * Carrega dados do localStorage
     * @param {string} [name] - Nome da chave
     * @returns {*} Dados carregados ou null
     */
    load(name) {
        const key = name || this.name;
        
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;
            
            return this._parseJSON(stored);
        } catch (error) {
            console.error('ls.load: Erro ao carregar do localStorage:', error);
            return null;
        }
    },
    
    /**
     * Remove item do localStorage
     * @param {string} [name] - Nome da chave
     */
    remove(name) {
        const key = name || this.name;
        
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('ls.remove: Erro ao remover do localStorage:', error);
        }
    },
    
    /**
     * Limpa todo o localStorage
     */
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('ls.clear: Erro ao limpar localStorage:', error);
        }
    },
    
    /**
     * Verifica se chave existe
     * @param {string} [name] - Nome da chave
     * @returns {boolean}
     */
    exists(name) {
        const key = name || this.name;
        return localStorage.getItem(key) !== null;
    },
    
    /**
     * Parse JSON seguro
     * @private
     * @param {string} str - String JSON
     * @returns {*}
     */
    _parseJSON(str) {
        if (!str || str === '') return null;
        
        try {
            return JSON.parse(str);
        } catch (error) {
            // Se não é JSON válido, retorna como string
            return str;
        }
    }
};

// === DETECÇÃO DE DISPOSITIVOS ===

/**
 * Detecta se é dispositivo móvel
 * @returns {boolean}
 */
export const isMobile = () => {
    // Usar matchMedia é mais confiável que User-Agent
    const match = window.matchMedia || window.msMatchMedia;
    if (match) {
        const mq = match("(pointer:coarse)");
        return mq.matches;
    }
    
    // Fallback para navegadores antigos
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Detecta se é tablet
 * @returns {boolean}
 */
export const isTablet = () => {
    const match = window.matchMedia || window.msMatchMedia;
    if (match) {
        const mq = match("(min-width: 768px) and (max-width: 1024px) and (pointer:coarse)");
        return mq.matches;
    }
    
    return /iPad|Android/i.test(navigator.userAgent) && !isMobile();
};

/**
 * Detecta se é desktop
 * @returns {boolean}
 */
export const isDesktop = () => {
    return !isMobile() && !isTablet();
};

// === CÓDIGOS DE TECLAS OTIMIZADOS ===

/**
 * Mapeamento de códigos de teclas (mais utilizados)
 */
export const keyCodes = {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    16: 'shift',
    17: 'ctrl',
    18: 'alt',
    27: 'escape',
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    46: 'delete',
    112: 'f1',
    113: 'f2',
    114: 'f3',
    115: 'f4',
    116: 'f5'
};

/**
 * Obtém nome da tecla pelo código
 * @param {number} code - Código da tecla
 * @returns {string}
 */
export const getKeyName = (code) => {
    return keyCodes[code] || `key-${code}`;
};

// === UTILITÁRIOS DE DEBUG ===

/**
 * Mostra informações do elemento clicado
 * @param {Event} e - Evento de click
 */
export const whichElement = (e) => {
    if (!e) e = window.event;
    
    const target = e.target || e.srcElement;
    const tagName = target.tagName.toLowerCase();
    const id = target.id ? `#${target.id}` : '';
    const className = target.className ? `.${target.className.split(' ').join('.')}` : '';
    
    console.log(`Elemento clicado: ${tagName}${id}${className}`);
    console.log('Elemento:', target);
};

// === SISTEMA DE SESSÃO ===

/**
 * Recupera objeto da sessão
 * @param {string} objeto - Nome do objeto
 * @returns {Promise<*>}
 */
export const recuperaObjetoSessao = async (objeto) => {
    try {
        const parametros = {
            origem: objeto,
            endpoint: '../verifica-online.php'
        };

        const dados = await acessaBanco.acessaDados(parametros);
        
        if (!isEmpty(dados.erro) && dados.erro) {
            return false;
        }
        
        return dados;
    } catch (error) {
        console.error('Erro ao recuperar objeto da sessão:', error);
        return false;
    }
};

// === UTILITÁRIOS DE PERFORMANCE ===

/**
 * Throttle function
 * @param {Function} func - Função a ser throttled
 * @param {number} limit - Limite em ms
 * @returns {Function}
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
 * Debounce function
 * @param {Function} func - Função a ser debounced
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function}
 */
export const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

// === UTILITÁRIOS DE FORMATAÇÃO ===

/**
 * Formata número como moeda brasileira
 * @param {number} value - Valor numérico
 * @returns {string}
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

/**
 * Formata data para padrão brasileiro
 * @param {Date|string} date - Data
 * @returns {string}
 */
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
};

// === EXPORTS PARA COMPATIBILIDADE ===
export { acessaBanco };