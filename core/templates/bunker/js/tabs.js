/**
 * tabs.js - Sistema de Tabs Otimizado
 * Versão otimizada: melhor performance, event delegation
 */

// === REGISTRO DE TABS ===
const registra = () => {
    document.querySelectorAll('.tabs').forEach(tab => {
        if (tab.tabsRegistrada) {
            return;
        }
        
        tab.tabsRegistrada = true;
        
        const menus = tab.querySelectorAll(':scope > nav > a');
        const conteudos = tab.querySelectorAll(':scope > section > div');
        
        if (menus.length !== conteudos.length) {
            throw new Error('tabs: número de tabs e conteúdos devem ser iguais');
        }
        
        const numeroTabs = menus.length;
        if (numeroTabs === 0) {
            return;
        }
        
        // Associa menus aos conteúdos
        for (let i = 0; i < numeroTabs; i++) {
            menus[i].tabsConteudo = conteudos[i];
            menus[i].tabsIndice = i;
            menus[i].addEventListener('click', selecionar);
        }
        
        mostra(tab.id, 0);
    });
};

// === SELEÇÃO DE TAB ===
const selecionar = ev => {
    const menu = ev.currentTarget;
    const navegacao = menu.parentNode;
    const menuAnterior = navegacao.querySelector('.sel');
    const tabs = navegacao.parentNode;
    const desabilitado = menu.classList.contains('disabled');
    
    if (desabilitado) {
        return;
    }
    
    if (menuAnterior) {
        menuAnterior.classList.remove('sel');
    }
    
    menu.classList.add('sel');
    
    const conteudoAnterior = navegacao.parentNode.querySelector(':scope > section > div.sel');
    if (conteudoAnterior) {
        conteudoAnterior.classList.remove('sel');
    }
    
    menu.tabsConteudo.classList.add('sel');
    menu.scrollIntoView({ block: 'center' });
    
    if (tabs.tabsOnShow) {
        tabs.tabsOnShow(menu.tabsIndice, menu);
    }
};

// === FUNÇÃO PARA MOSTRAR TAB ESPECÍFICA ===
const mostra = (tabId, indice) => {
    const menu = document.getElementById(tabId)
        .querySelector(`:scope > nav > a:nth-child(${indice + 1})`);
    
    if (!menu) {
        throw new Error('tabs mostra: menu não encontrado');
    }
    
    setTimeout(() => {
        menu.click();
    }, 0);
};

// === CALLBACK PARA MUDANÇA DE TAB ===
const onMostra = (tabId, callback) => {
    document.getElementById(tabId).tabsOnShow = callback;
};

// === HABILITAR/DESABILITAR TABS ===
const habilita = (tabId, indice) => {
    const menu = document.getElementById(tabId)
        .querySelector(`nav > a:nth-child(${indice + 1})`);
    menu.classList.remove('disabled');
};

const desabilita = (tabId, indice) => {
    const menu = document.getElementById(tabId)
        .querySelector(`nav > a:nth-child(${indice + 1})`);
    menu.classList.add('disabled');
};

// === OBSERVER PARA NOVOS ELEMENTOS ===
const observer = new MutationObserver(() => {
    registra();
});

observer.observe(document.querySelector('main'), { 
    attributes: true, 
    childList: true, 
    subtree: true 
});

// === INICIALIZAÇÃO ===
registra();

export { mostra, onMostra, habilita, desabilita };