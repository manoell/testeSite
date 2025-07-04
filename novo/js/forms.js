/**
 * forms.js - Sistema de Formulários Otimizado
 * Versão otimizada: melhor gerenciamento de estado, performance aprimorada
 */

import { validacoesPadrao } from './validacoes-padrao.js';

// === ESTADO GLOBAL ===
const registrados = new Set();
const validacoes = new Map(validacoesPadrao.map(v => [v.sel, v]));

// === REGISTRO DE FORMULÁRIOS ===
const registra = form => {
    if (form.tagName === 'FORM') {
        form.noValidate = true;
        form.addEventListener('submit', ev => {
            ev.preventDefault();
        });
    }
    
    registrados.add(form);
    
    const observer = new MutationObserver(() => {
        avaliaRegistrados();
    });
    
    form.observer = observer;
    observer.observe(form, { 
        attributes: true, 
        childList: true, 
        subtree: true 
    });
    
    avaliaForm(form);
};

// === AVALIAÇÃO DE FORMULÁRIOS ===
const avaliaRegistrados = () => {
    for (let form of registrados) {
        avaliaForm(form);
    }
};

const updateValidListener = ev => {
    if (ev && ev.type === 'keydown' && ev.key !== 'Enter') return;
    updateValid(ev.currentTarget);
};

const updateValid = element => {
    let messageContainer;
    
    if (['radio', 'checkbox'].includes(element.type)) {
        messageContainer = element.parentNode.parentNode.parentNode.querySelector('.mensagem');
    } else {
        messageContainer = element.parentNode.parentNode.querySelector('.mensagem');
    }
    
    if (messageContainer) {
        messageContainer.textContent = element.validationMessage || element.mensagemPadrao;
    }
    
    if (element.validationMessage) {
        element.classList.add('invalid');
    } else {
        element.classList.remove('invalid');
    }
};

const avaliaForm = form => {
    // Inicializa mensagens padrão
    [...form.querySelectorAll('input, select, textarea, form')]
        .filter(el => !el.hasOwnProperty('mensagemPadrao'))
        .forEach(el => {
            const messageContainer = el.parentNode.parentNode.querySelector('.mensagem');
            el.mensagemPadrao = messageContainer ? messageContainer.textContent : '';
        });
    
    // Aplica validações customizadas
    for (let [selector, validacao] of validacoes.entries()) {
        [...form.querySelectorAll(selector)]
            .filter(el => !el.avaliadoForm)
            .forEach(el => {
                if (validacao.ini) validacao.ini(el);
                el.avaliadoForm = true;
                el.removeAttribute('pattern');
                
                el.addEventListener('blur', ev => {
                    const element = ev.currentTarget;
                    let validade = validacao.val(element, ev);
                    if (validade === undefined) validade = '';
                    element.setCustomValidity(validade);
                });
                
                el.addEventListener('keydown', ev => {
                    if (ev.key !== 'Enter') return;
                    const element = ev.currentTarget;
                    let validade = validacao.val(element, ev);
                    if (validade === undefined) validade = '';
                    element.setCustomValidity(validade);
                });
            });
    }
    
    // Configura listeners gerais
    form.querySelectorAll('input, select, textarea, form').forEach(el => {
        el.addEventListener('blur', updateValidListener);
        el.addEventListener('keydown', updateValidListener);
        
        form.observer.disconnect();
        
        if (el.required) {
            el.parentNode.parentNode.classList.add('required');
        } else {
            el.parentNode.parentNode.classList.remove('required');
        }
        
        form.observer.observe(form, { 
            attributes: true, 
            childList: true, 
            subtree: true 
        });
    });
};

// === FUNÇÕES UTILITÁRIAS ===

/**
 * Adiciona validação customizada
 * @param {string} seletor - Seletor CSS
 * @param {Function} validacao - Função de validação
 * @param {Function} ini - Função de inicialização
 */
const adicionaValidacao = (seletor, validacao, ini = null) => {
    validacoes.set(seletor, { sel: seletor, val: validacao, ini: ini });
};

/**
 * Reporta campos inválidos
 * @param {Element} form - Formulário
 */
const reportaInvalidos = form => {
    let erro = false;
    
    for (let [selector, validacao] of validacoes.entries()) {
        [...form.querySelectorAll(selector)].forEach(el => {
            let validade = validacao.val(el);
            if (validade === undefined) validade = '';
            el.setCustomValidity(validade);
        });
    }
    
    form.querySelectorAll(':invalid').forEach(el => {
        erro = true;
        updateValid(el);
    });
    
    return erro;
};

/**
 * Define validade de campo
 * @param {HTMLElement} element - Elemento
 * @param {string} msg - Mensagem
 */
const setValidade = (element, msg = '') => {
    if (!msg) msg = '';
    element.setCustomValidity(msg);
    updateValid(element);
    if (msg === '') {
        element.classList.remove('invalid');
    }
};

/**
 * Verifica se campo é válido
 * @param {HTMLElement} element - Elemento
 */
const valido = element => {
    return element.checkValidity();
};

/**
 * Define mensagem customizada
 * @param {HTMLElement} element - Elemento
 * @param {string} msg - Mensagem
 */
const setMensagem = (element, msg = '') => {
    const messageContainer = element.parentNode.parentNode.querySelector('.mensagem');
    if (!messageContainer) return;
    messageContainer.textContent = msg;
};

/**
 * Oculta campo
 * @param {HTMLElement} element - Elemento
 */
const oculta = element => {
    element.parentNode.parentNode.classList.add('oculto');
};

/**
 * Mostra campo
 * @param {HTMLElement} element - Elemento
 */
const mostra = element => {
    element.parentNode.parentNode.classList.remove('oculto');
};

/**
 * POST request
 * @param {Element} form - Formulário
 * @param {string} url - URL
 */
const post = async (form, url) => {
    const formData = new FormData(form);
    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });
    
    const result = await response.json();
    if (result.erro) throw new Error(result.mensagem);
    return result;
};

/**
 * GET request
 * @param {Element} form - Formulário
 * @param {string} url - URL
 * @param {boolean} text - Retornar texto
 */
const get = async (form, url, text = false) => {
    const formData = new FormData(form);
    const queryString = new URLSearchParams(formData);
    const response = await fetch(`${url}?${queryString.toString()}`);
    
    if (!text) {
        const result = await response.json();
        if (result.erro) throw new Error(result.mensagem);
        return result;
    }
    
    return await response.text();
};

/**
 * Auto height para textarea
 * @param {Event|HTMLElement} e - Evento ou elemento
 */
const autoHeight = e => {
    let element = e.currentTarget || e;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight + 8}px`;
};

export {
    registra,
    adicionaValidacao,
    reportaInvalidos,
    setValidade,
    valido,
    setMensagem,
    post,
    get,
    mostra,
    oculta,
    autoHeight,
};