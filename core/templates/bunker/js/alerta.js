/**
 * alerta.js - Sistema de Alertas Otimizado
 * Versão otimizada: melhor gerenciamento de timer, código simplificado
 */

// === CACHE DE ELEMENTOS ===
const elements = {
    container: document.querySelector('#alerta'),
    message: document.querySelector('#alerta .msg'),
    actions: document.querySelector('#alerta .act')
};

let timer;

// === FUNÇÃO PRINCIPAL ===
const abre = (msg, seg = 3600, ...acoes) => {
    clearTimeout(timer);
    
    if (!seg) seg = 3600;
    
    // Define mensagem
    elements.message.textContent = msg;
    
    // Limpa ações anteriores
    elements.actions.innerHTML = '';
    
    // Processa ações
    acoes.forEach(acao => processarAcao(acao));
    
    // Controla exibição das ações
    elements.actions.style.display = elements.actions.childNodes.length ? 'flex' : 'none';
    
    // Posiciona e exibe alerta
    elements.container.style.bottom = -(elements.container.offsetHeight) + 'px';
    
    setTimeout(() => {
        elements.container.classList.add('aberto');
        timer = setTimeout(fecha, 1000 * seg);
    }, 0);
};

// === FUNÇÃO SIMPLIFICADA ===
const abreOK = (msg, seg = 3600) => {
    abre(msg, seg, 'OK');
};

// === PROCESSAR AÇÕES ===
const processarAcao = (acao) => {
    const link = document.createElement('a');
    
    if (typeof acao === 'string') {
        link.textContent = acao;
        link.addEventListener('click', fecha);
    } else if (Array.isArray(acao)) {
        link.textContent = acao[0];
        
        if (typeof acao[1] === 'string') {
            link.href = acao[1];
            if (acao[2]) link.target = '_blank';
            link.addEventListener('click', fecha);
        } else {
            link.addEventListener('click', () => {
                fecha();
                acao[1]();
            });
        }
    }
    
    elements.actions.appendChild(link);
};

// === FECHAR ALERTA ===
const fecha = () => {
    clearTimeout(timer);
    
    setTimeout(() => {
        elements.container.style.bottom = -(elements.container.offsetHeight) + 'px';
        elements.container.classList.remove('aberto');
    }, 0);
};

export { abre, fecha, abreOK };