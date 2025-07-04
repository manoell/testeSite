/**
 * botoes.js - Módulo de Botões Otimizado
 * Versão otimizada: consolidadas constantes, simplificado template generation
 */

// === CONFIGURAÇÕES DE AMBIENTE ===
const ENVIRONMENT_CONFIGS = {
    D: { // Desenvolvimento
        chat: 'https://chatdes.correios.com.br/app/index.php',
        portal: 'https://jdes.correiosnet.int/portalimportador'
    },
    H: { // Homologação  
        chat: 'https://chathom.correios.com.br/app/index.php',
        portal: 'https://apphom.correios.com.br/portalimportador'
    },
    P: { // Produção (default)
        chat: 'https://chat.correios.com.br/app/index.php',
        portal: 'https://apps.correios.com.br/portalimportador'
    }
};

// === TEMPLATES DE BOTÕES ===
const BUTTON_TEMPLATES = {
    suspenderEntrega: (codObjeto) => `
        <a class="btn btn-outline-primary p-1 btn-rastro" href="suspensaoEntrega/index.php?objeto=${codObjeto}">
            <i class="fa fa-hand-paper-o" aria-hidden="true"></i>
            Suspender Entrega
        </a>
    `,
    
    chatCarteiros: (linkApp) => `
        <a class="btn btn-outline-primary p-1 btn-rastro" href="${linkApp}" target="_blank">
            <img src="../static/rastreamento-internet/imgs/iconeChatCarteiros.PNG" class="icone-btn" aria-hidden="true" />
            Acompanhe a entrega
        </a>
    `,
    
    arEletronico: (codObjeto) => `
        <a class="btn btn-outline-primary p-1 btn-rastro" href="arEletronico/index.php?objeto=${codObjeto}" target="_blank">
            <img src="../static/rastreamento-internet/imgs/AR-eletronico.png" class="icone-btn" aria-hidden="true" />
            AR Eletrônico
        </a>
    `,
    
    gerarBoleto: (link) => `
        <a class="btn btn-outline-primary p-1 btn-rastro" href="${link}" target="_blank">
            <i class="fa fa-credit-card" aria-hidden="true"></i>
            Gerar boleto
        </a>
    `,
    
    informarDocumento: (link) => `
        <a class="btn btn-outline-primary p-1 btn-rastro" href="${link}" target="_blank">
            <img src="../static/rastreamento-internet/imgs/iconeVinculacao.PNG" class="icone-btn" aria-hidden="true" />
            Informar Documento Fiscal
        </a>
    `
};

/**
 * Valida se URL é válida
 */
const isValidURL = (str) => {
    const pattern = new RegExp('^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$', 'i');
    return !!pattern.test(str);
};

/**
 * Obtém configuração baseada no ambiente
 */
const getEnvironmentConfig = () => {
    const ambiente = window.AMBIENTE_EXECUCAO || 'P';
    return ENVIRONMENT_CONFIGS[ambiente] || ENVIRONMENT_CONFIGS.P;
};

/**
 * Gera link do chat dos carteiros
 */
const getChatLink = (codObjeto, eventos) => {
    const config = getEnvironmentConfig();
    let linkApp = `${config.chat}?objeto=${codObjeto}`;
    
    // Verifica se existe URL customizada no comentário do primeiro evento
    if (eventos && eventos[0] && eventos[0].comentario && isValidURL(eventos[0].comentario)) {
        linkApp = eventos[0].comentario;
    }
    
    return linkApp;
};

/**
 * Gera link do portal do importador
 */
const getPortalLink = (codObjeto) => {
    const config = getEnvironmentConfig();
    return `${config.portal}/?encomenda=${codObjeto}`;
};

/**
 * Gera botões nacionais para rastreamento único
 */
const btnsNacRastroUnico = ({
    codObjeto,
    bloqueioObjeto,
    arEletronico,
    percorridaCarteiro,
    eventos
}) => {
    let btns = "";

    // Suspender entrega
    if (bloqueioObjeto) {
        btns += BUTTON_TEMPLATES.suspenderEntrega(codObjeto);
    }

    // Chat dos Carteiros
    if (percorridaCarteiro) {
        const linkApp = getChatLink(codObjeto, eventos);
        btns += BUTTON_TEMPLATES.chatCarteiros(linkApp);
    }

    // AR Eletrônico
    if (arEletronico) {
        btns += BUTTON_TEMPLATES.arEletronico(codObjeto);
    }

    return btns;
};

/**
 * Gera botões internacionais para rastreamento único
 */
const btnsIntRastroUnico = ({
    codObjeto,
    autoDeclaracao,
    encargoImportacao
}) => {
    let btns = "";
    const link = getPortalLink(codObjeto);

    // Gerar boleto
    if (encargoImportacao) {
        btns += BUTTON_TEMPLATES.gerarBoleto(link);
    }

    // Informar documento fiscal
    if (autoDeclaracao) {
        btns += BUTTON_TEMPLATES.informarDocumento(link);
    }

    return btns;
};

export {
    btnsIntRastroUnico,
    btnsNacRastroUnico
};