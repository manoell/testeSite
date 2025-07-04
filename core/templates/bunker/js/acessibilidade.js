/**
 * acessibilidade.js - Sistema de Acessibilidade Otimizado
 * Versão otimizada: simplificado event handling, melhor performance
 */

import { enterClick } from './events.js';

// === CACHE DE ELEMENTOS ===
const elements = {
    menu: document.querySelector('#acessibilidade a'),
    dropdown: document.querySelector('#acess-drop-down'),
    close: document.querySelector('#acess-drop-down .close')
};

// === FUNÇÕES PRINCIPAIS ===
const toggle = () => {
    elements.menu.classList.toggle('aberto');
    elements.dropdown.classList.toggle('aberto');
};

const abre = () => {
    elements.menu.classList.add('aberto');
    elements.dropdown.classList.add('aberto');
};

const fecha = () => {
    elements.menu.classList.remove('aberto');
    elements.dropdown.classList.remove('aberto');
};

// === INICIALIZAÇÃO ===
if (elements.menu && elements.dropdown && elements.close) {
    // Event listeners otimizados
    elements.menu.addEventListener('click', ev => {
        ev.stopPropagation();
        toggle();
    });
    
    elements.dropdown.addEventListener('click', ev => ev.stopPropagation());
    elements.close.addEventListener('click', () => fecha());
    
    // Fechar ao clicar fora
    document.body.addEventListener('click', () => fecha());
    
    // Suporte a teclado
    enterClick(elements.menu);
    enterClick(elements.dropdown);
    enterClick(elements.close);
}