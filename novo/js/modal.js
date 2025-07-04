/**
 * modal.js - Sistema de Modais Otimizado
 * Versão otimizada: melhor gerenciamento de estado, performance aprimorada
 */

// === ESTADO GLOBAL ===
let numAbertos = 0;
let inPopstate = false;
const desktop = window.matchMedia('(min-width: 1024px)').matches;

// === FUNÇÃO PRINCIPAL PARA ABRIR MODAL ===
const abre = id => {
    const modal = document.getElementById(id);
    if (!modal) return;
    
    escModal(modal);
    
    const botaoFechar = modal.querySelector('a.fechar');
    if (botaoFechar) {
        botaoFechar.addEventListener('click', fecha);
    }
    
    modal.classList.add('aberto');
    modal.addEventListener('click', modalClick);
    
    const section = modal.querySelector('section');
    if (section) {
        section.addEventListener('click', sectionClick);
    }
    
    document.body.classList.add('modal-aberto');
    numAbertos++;
    
    if (inPopstate || desktop) return;
    
    const params = new URLSearchParams(window.location.hash.substr(1));
    params.set('mc', numAbertos.toString());
    
    if (!desktop) {
        window.history.pushState(null, null, '#' + params);
    }
};

// === EVENT HANDLERS ===
const modalClick = ev => {
    fecha();
};

const sectionClick = ev => {
    ev.stopPropagation();
};

// === FUNÇÃO PARA FECHAR MODAL ===
const fecha = () => {
    if (numAbertos === 0) {
        escModal(null);
        return;
    }
    
    const abertos = [...document.querySelectorAll('.modal.aberto')];
    const ultimo = abertos.pop();
    
    ultimo.classList.remove('aberto');
    numAbertos--;
    
    if (numAbertos === 0) {
        escModal(null);
        document.body.classList.remove('modal-aberto');
    }
    
    escModal(abertos.pop());
    
    if (inPopstate || desktop) return;
    
    window.history.back();
};

// === GERENCIAMENTO DA TECLA ESC ===
const teclaEsc = ev => {
    if (ev.key === 'Escape') {
        fecha();
    }
};

const escModal = modal => {
    if (!modal || !modal.dataset.hasOwnProperty('esc')) {
        document.body.removeEventListener('keydown', teclaEsc);
    } else {
        document.body.addEventListener('keydown', teclaEsc);
    }
};

// === POPSTATE HANDLER ===
window.addEventListener('popstate', ev => {
    if (desktop) return;
    
    inPopstate = true;
    const params = new URLSearchParams(window.location.hash.substr(1));
    const modalCount = parseFloat(params.get('mc'));
    
    if (isNaN(modalCount) || modalCount < numAbertos) {
        fecha();
    }
    
    inPopstate = false;
});

export { abre, fecha };