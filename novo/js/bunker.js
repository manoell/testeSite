/**
 * bunker.js - Sistema Principal Otimizado
 * Versão otimizada: imports consolidados, performance melhorada
 */

import './menu.js';
import './botoes.js';
import './acessibilidade.js';
import * as forms from './forms.js';
import * as modal from './modal.js';
import * as alerta from './alerta.js';
import * as tabs from './tabs.js';

// === INICIALIZAÇÃO DO BODY ===
document.body.classList.remove('oculto');

// === DETECÇÃO DE DISPOSITIVOS ===
if ('ontouchstart' in window) {
    document.body.classList.add('touch');
}

if (!document.querySelector('body > footer')) {
    document.body.classList.add('modo-foco');
}

// === SISTEMA DE LOADING OTIMIZADO ===
const loading = document.getElementById('loading');

const showLoading = () => {
    loading.classList.add('visivel');
    setTimeout(() => {
        loading.classList.remove('visivel');
    }, 30000);
};

const registraLoading = () => {
    // Seleciona apenas links que NÃO estão no menu lateral
    const selector = 'a[href]:not([target="_blank"]):not(#menu .menu a)';
    
    document.querySelectorAll(selector)
        .forEach(link => {
            // Remove listener anterior para evitar duplicação
            link.removeEventListener('click', showLoading);
            link.addEventListener('click', showLoading);
        });
};

// === OBSERVER PARA NOVOS ELEMENTOS ===
const observer = new MutationObserver(() => {
    registraLoading();
});

observer.observe(document.body, { 
    attributes: true, 
    childList: true, 
    subtree: true 
});

// === INICIALIZAÇÃO ===
registraLoading();

// === EXPORTS ===
export { forms, modal, alerta, tabs };