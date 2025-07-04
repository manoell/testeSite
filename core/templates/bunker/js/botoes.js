/**
 * botoes.js - Sistema de Botões Otimizado
 * Versão otimizada: melhor performance, event delegation
 */

import * as menu from './menu.js';

// === GERENCIAMENTO DE DROPDOWNS ===
const abreDropdown = ev => {
    ev.stopPropagation();
    fechaDropdowns();
    menu.fecha(ev);
    
    const button = ev.currentTarget;
    const dropdown = button.parentNode.querySelector('div');
    const rect = button.getBoundingClientRect();
    const centerY = (rect.top + rect.bottom) / 2;
    const centerX = (rect.left + rect.right) / 2;
    
    // Posicionamento inteligente
    dropdown.style.top = centerY < window.innerHeight / 2 ? '0' : 'auto';
    dropdown.style.bottom = centerY < window.innerHeight / 2 ? 'auto' : '0';
    dropdown.style.left = centerX < window.innerWidth / 2 ? '0' : 'auto';
    dropdown.style.right = centerX < window.innerWidth / 2 ? 'auto' : '0';
    
    dropdown.classList.add('aberto');
};

const fechaDropdown = ev => {
    ev.stopPropagation();
    const button = ev.currentTarget;
    
    setTimeout(() => {
        button.parentNode.classList.remove('aberto');
    }, 100);
};

const fechaDropdowns = () => {
    document.querySelectorAll('.buttons > div.aberto')
        .forEach(dropdown => dropdown.classList.remove('aberto'));
};

// === REGISTRO DE EVENT LISTENERS ===
const registraDropdowns = () => {
    // Botões que abrem dropdowns
    document.querySelectorAll('.buttons > button, .buttons > a.button')
        .forEach(button => {
            button.removeEventListener('click', abreDropdown); // Evita duplicação
            button.addEventListener('click', abreDropdown);
        });

    // Botões dentro de dropdowns
    document.querySelectorAll('.buttons > div > button, .buttons > div > a.button')
        .forEach(button => {
            button.removeEventListener('click', fechaDropdown); // Evita duplicação
            button.addEventListener('click', fechaDropdown);
        });
};

// === OBSERVER OTIMIZADO ===
const observer = new MutationObserver(() => {
    registraDropdowns();
    
    const botoesDocados = document.querySelector('button.novo, button.next, a.button.novo, a.button.next');
    
    observer.disconnect();
    
    if (botoesDocados) {
        document.body.classList.add('botoes-docados');
    } else {
        document.body.classList.remove('botoes-docados');
    }
    
    observer.observe(document.body, { 
        attributes: true, 
        childList: true, 
        subtree: true 
    });
});

// === INICIALIZAÇÃO ===
document.body.addEventListener('click', fechaDropdowns);

observer.observe(document.body, { 
    attributes: true, 
    childList: true, 
    subtree: true 
});

registraDropdowns();

// Mostra região de botões se existirem botões flutuantes
if (document.querySelector('button.novo, a.button.novo, button.next, a.button.next')) {
    document.getElementById('regiao-botoes').classList.remove('oculta');
}

export { fechaDropdowns };