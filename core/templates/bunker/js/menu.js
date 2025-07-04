/**
 * menu.js - Sistema de Menu Otimizado  
 * Versão otimizada: melhor gerenciamento de estado, performance aprimorada
 */

import { enterClick } from './events.js';

// === CONFIGURAÇÃO ===
const desktop = window.matchMedia('(min-width: 1024px)').matches;

// === CACHE DE ELEMENTOS ===
const elements = {
    hamburger: document.querySelector('#menu .hamburger'),
    container: document.querySelector('#menu > .menu'),
    menuUsuario: document.querySelector('#menu a.nome'),
    dropdownUsuario: document.querySelector('#menu > .dd'),
    menuUsuarioMobile: document.querySelector('#menu > .menu section a.nome-usuario-logado'),
    dropdownUsuarioMobile: document.querySelector('#menu .menu div.dd-mobile')
};

// === ESTADO GLOBAL ===
let pilha = [];
let config = {
    aberto: false,
    abertos: []
};

// === FUNÇÕES PRINCIPAIS ===
function abre() {
    elements.hamburger.classList.add('aberto');
    elements.container.classList.remove('oculto');
    document.body.classList.add('menu-aberto');
    addHash();
    config.aberto = true;
    saveConfig();
}

function fecha() {
    elements.hamburger.classList.remove('aberto');
    elements.container.classList.add('oculto');
    document.body.classList.remove('menu-aberto');
    
    const abertos = elements.container.querySelectorAll('.aberto');
    abertos.forEach(el => el.classList.remove('aberto'));
    
    pilha = [];
    removeHash();
    config.aberto = false;
    config.abertos = [];
    saveConfig();
}

function abreSubmenu(ev, anchor) {
    let element;
    if (ev) {
        element = ev.currentTarget;
    } else {
        element = anchor;
    }
    
    if (element.classList.contains('nome-usuario-logado')) return;
    
    let submenu = element.nextSibling.nextSibling;
    if (submenu.tagName !== 'DIV') return;
    
    submenu.classList.add('aberto');
    pilha.push(submenu.querySelector('.voltar'));
    submenu.querySelectorAll(':scope > a').forEach(a => a.tabIndex = 1);
    
    setTimeout(() => {
        submenu.querySelector('.voltar').focus();
    }, 0);
    
    if (ev) {
        addHash();
        config.abertos.push([...element.parentNode.childNodes].indexOf(element));
        saveConfig();
    }
    
    elements.container.scrollTop = 0;
}

function fechaSubmenu(ev) {
    let element;
    if (ev) {
        element = ev.currentTarget;
    } else {
        element = pilha.pop();
    }
    
    let submenu = element.parentNode;
    submenu.classList.remove('aberto');
    submenu.querySelectorAll('a').forEach(a => a.tabIndex = -1);
    
    if (ev) {
        subHash();
    }
    
    config.abertos.pop();
    saveConfig();
}

// === GERENCIAMENTO DE HASH ===
function getHash() {
    const params = new URLSearchParams(location.hash.substr(1));
    return params.get('menu');
}

function removeHash() {
    if (desktop) return;
    
    if (location.hash) {
        const params = new URLSearchParams(location.hash.substr(1));
        if (params.has('menu')) {
            const newParams = new URLSearchParams();
            for (let [key, value] of params.entries()) {
                if (key === 'menu') continue;
                newParams.set(key, value);
            }
            history.pushState(null, null, '#' + newParams.toString());
        }
    }
}

function addHash() {
    if (desktop) return;
    
    const params = new URLSearchParams(location.hash.substr(1));
    let nivel = 1;
    
    if (!params.has('menu')) {
        params.set('menu', nivel.toString());
    } else {
        nivel = parseInt(params.get('menu')) + 1;
        params.set('menu', nivel.toString());
    }
    
    history.pushState(nivel.toString(), null, '#' + params);
}

function subHash() {
    if (desktop) return;
    
    const params = new URLSearchParams(location.hash.substr(1));
    if (!params.has('menu')) return;
    
    history.back();
}

// === MENUS DE USUÁRIO ===
function abreFechaMenuUsuario(ev) {
    ev.stopPropagation();
    
    if (elements.menuUsuario.classList.contains('aberto')) {
        elements.menuUsuario.classList.remove('aberto');
        elements.dropdownUsuario.classList.remove('aberto');
    } else {
        elements.menuUsuario.classList.add('aberto');
        elements.dropdownUsuario.classList.add('aberto');
    }
}

function abreFechaMenuUsuarioMobile(ev) {
    ev.stopPropagation();
    
    if (elements.menuUsuarioMobile.classList.contains('aberto')) {
        elements.menuUsuarioMobile.classList.remove('aberto');
        elements.dropdownUsuarioMobile.classList.remove('aberto');
    } else {
        elements.menuUsuarioMobile.classList.add('aberto');
        elements.dropdownUsuarioMobile.classList.add('aberto');
    }
}

// === CONFIGURAÇÃO PERSISTENTE ===
function readConfig() {
    const stored = localStorage.getItem('menu');
    if (!stored) return;
    
    try {
        config = JSON.parse(stored);
    } catch (error) {
        config = { aberto: false, abertos: [] };
    }
}

function saveConfig() {
    localStorage.setItem('menu', JSON.stringify(config));
}

// === INICIALIZAÇÃO ===
function init() {
    readConfig();
    
    // Event listener do hamburger
    elements.hamburger.addEventListener('click', ev => {
        const ham = ev.currentTarget;
        if (ham.classList.contains('aberto')) {
            fecha();
        } else {
            abre();
        }
    });
    
    elements.container.classList.add('oculto');
    
    // Ajuste dinâmico da altura
    setInterval(() => {
        const altura = window.innerHeight - elements.hamburger.getBoundingClientRect().bottom;
        elements.container.style.height = (altura - 9) + 'px';
    }, 500);
    
    // Event listeners globais
    document.body.addEventListener('click', () => {
        if (!desktop) {
            fecha();
        }
    });
    
    elements.hamburger.addEventListener('click', ev => ev.stopPropagation());
    elements.container.addEventListener('click', ev => ev.stopPropagation());
    
    // Adiciona botões voltar aos submenus
    const submenus = elements.container.querySelectorAll('div');
    submenus.forEach(submenu => {
        if (submenu.classList.contains('dd-mobile')) {
            return;
        }
        
        let voltar = document.createElement('a');
        voltar.textContent = 'Voltar';
        voltar.className = 'voltar';
        submenu.insertAdjacentElement('afterbegin', voltar);
    });
    
    // Configura tabindex
    elements.container.querySelectorAll('a').forEach(a => {
        a.tabIndex = 1;
    });
    
    elements.container.querySelectorAll(':scope > div a').forEach(a => {
        a.tabIndex = -1;
    });
    
    // Event listeners dos links
    const linksSemHref = elements.container.querySelectorAll('a:not([href])');
    linksSemHref.forEach(link => {
        if (link.classList.contains('voltar')) {
            link.addEventListener('click', fechaSubmenu);
        } else {
            link.addEventListener('click', abreSubmenu);
        }
        enterClick(link);
    });
	
	setupLinkClickHandlers();
    
    // PopState handler
    window.addEventListener('popstate', ev => {
        if (desktop) return;
        
        const nivel = parseInt(getHash());
        const pilhaLength = pilha.length;
        
        if (pilhaLength === nivel) {
            fechaSubmenu();
        } else {
            fecha();
        }
    });
    
    removeHash();
    
    // Restaura estado
    if (desktop && config.aberto) abre();
    
    try {
        let submenu = elements.container;
        for (let i = 0; i < config.abertos.length; i++) {
            let link = submenu.childNodes[config.abertos[i]];
            abreSubmenu(null, link);
            if (!desktop) {
                addHash();
            }
            submenu = link.nextSibling.nextSibling;
        }
    } catch {
        config.abertos = [];
        saveConfig();
    }
    
    enterClick(elements.hamburger);
    
    // Menu de usuário
    if (elements.menuUsuario) {
        elements.menuUsuario.addEventListener('click', abreFechaMenuUsuario);
        elements.menuUsuarioMobile.addEventListener('click', abreFechaMenuUsuarioMobile);
        elements.dropdownUsuario.addEventListener('click', ev => ev.stopPropagation());
        elements.dropdownUsuarioMobile.addEventListener('click', ev => ev.stopPropagation());
        
        document.body.addEventListener('click', () => {
            elements.menuUsuario.classList.remove('aberto');
            elements.menuUsuarioMobile.classList.remove('aberto');
            elements.dropdownUsuario.classList.remove('aberto');
            elements.dropdownUsuarioMobile.classList.remove('aberto');
        });
        
        enterClick(elements.menuUsuario);
    }
}

// === FECHAR MENU AO CLICAR EM LINKS ===
function setupLinkClickHandlers() {
    // Seleciona todos os links do menu que têm href (são clicáveis)
    const menuLinks = elements.container.querySelectorAll('a[href]');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', (ev) => {
            // Só fecha se não for link para submenu
            if (!link.nextSibling || !link.nextSibling.nextSibling || 
                link.nextSibling.nextSibling.tagName !== 'DIV') {
                
                // Fecha o menu
                fecha();
            }
        });
    });
}

init();