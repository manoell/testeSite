const registra = () => {
    document.querySelectorAll('.tabs').forEach(tab => {
        if (tab.tabsRegistrada) {
            return;
        }
        tab.tabsRegistrada = true;
        const menus = tab.querySelectorAll(':scope > nav > a');
        const conteudos = tab.querySelectorAll(':scope > section > div');
        if (menus.length != conteudos.length) {
            throw 'tabs: número de tabs e conteúdos devem ser iguais';
        }
        const n = menus.length;
        if (n == 0) {
            return;
        }
        for (let i = 0; i < n; i++) {
            menus[i].tabsConteudo = conteudos[i];
            menus[i].tabsIndice = i;
            menus[i].addEventListener('click', sel);
        }
        mostra(tab.id, 0);
    });
};
const sel = ev => {
    const menu = ev.currentTarget;
    const nav = menu.parentNode;
    const menuAnterior = nav.querySelector('.sel');
    const tabs = nav.parentNode;
    const desabilitado = menu.classList.contains('disabled');
    if (desabilitado) {
        // alerta.abre('Acesso bloqueado: ' + menu.text, 3, 'OK');
        return;
    }
    if (menuAnterior) {
        menuAnterior.classList.remove('sel');
    }
    menu.classList.add('sel');
    const conteudoAnterior = nav.parentNode.querySelector(':scope > section > div.sel');
    if (conteudoAnterior) {
        conteudoAnterior.classList.remove('sel');
    }
    menu.tabsConteudo.classList.add('sel');
    menu.scrollIntoView({
        block: 'center'
    });
    if (tabs.tabsOnShow) {
        tabs.tabsOnShow(menu.tabsIndice, menu);
    }
};
const mostra = (tabId, indice) => {
    const menu = document.getElementById(tabId).querySelector(`:scope > nav > a:nth-child(${indice + 1})`);
    if (!menu) {
        throw 'tabs mostra: menu não encontrado';
    }
    setTimeout(() => {
        menu.click();
    }, 0);

};
const onMostra = (tabId, cb) => {
    document.getElementById(tabId).tabsOnShow = cb;
};
const habilita = (tabId, indice) => {
    const menu = document.getElementById(tabId).querySelector(`nav > a:nth-child(${indice + 1})`);
    menu.classList.remove('disabled');
};
const desabilita = (tabId, indice) => {
    const menu = document.getElementById(tabId).querySelector(`nav > a:nth-child(${indice + 1})`);
    menu.classList.add('disabled');
};
const observer = new MutationObserver(() => {
    registra();
});
observer.observe(document.querySelector('main'), {
    attributes: true,
    childList: true,
    subtree: true
});
registra();
export {
    mostra,
    onMostra,
    habilita,
    desabilita
};