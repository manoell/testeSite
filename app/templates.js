/**
 * Templates.js - Módulo de Templates HTML
 * Centraliza todos os templates HTML para melhor organização e reutilização
 */

/**
 * Formata código de objeto para apresentação visual
 * @param {string} codigo - Código do objeto
 * @returns {string} Código formatado (XX XXX XXX XXX XX)
 */
export const formatTrackingCode = (codigo) => {
    if (!codigo || codigo.length !== 13) return codigo;
    return `${codigo.substring(0, 2)} ${codigo.substring(2, 5)} ${codigo.substring(5, 8)} ${codigo.substring(8, 11)} ${codigo.substring(11, 13)}`;
};

/**
 * Template do cabeçalho de rastreamento
 * @param {Object} objeto - Dados do objeto
 * @returns {string} HTML do cabeçalho
 */
export const trackingHeaderTemplate = (objeto) => {
    const messageContent = objeto.situacao === 'T' 
        ? (objeto.atrasado 
            ? `<p class="text text-head noPrint">Para obter mais informações sobre o objeto, clique <a href="${objeto.urlFaleComOsCorreios}" target="_blank">aqui</a> e registre uma manifestação</p>`
            : (objeto.dataPrevista !== ""
                ? `<p class="text text-head">Previsão de Entrega: ${objeto.dtPrevista}</p>`
                : ""
            )
        ) : '';

    return `
        <div id="cabecalho-rastro" class="d-flex justify-content-between">
            <ul class="cabecalho-rastro">                
                <div class="arrow-dashed justify-content-start">
                    <div class="circle">
                        <img class="circle-logo" src="../static/rastreamento-internet/imgs/correios-sf.png" width="35px" height="35px">
                    </div>
                </div>
                <div class="cabecalho-content">
                    <p class="text text-content">${objeto.tipoPostal.categoria}</p>                    	
                    ${messageContent}     	
                </div>                                                
            </ul>        
            <div class="share-bar noPrint">
                <a title="Compartilhar" class="btn btn-light" data-objeto="${objeto.codObjeto}">
                    <i class="fa fa-share-alt" aria-hidden="true"></i>
                </a>
            </div>
        </div>		
    `;
};

/**
 * Template para breadcrumb
 * @param {...string} items - Itens do breadcrumb
 * @returns {string} HTML do breadcrumb
 */
export const breadcrumbTemplate = (...items) => {
    return items.map(item => `<a>${item}</a>`).join('');
};

/**
 * Template do título da página
 * @param {string} titulo - Título principal
 * @param {boolean} showPrint - Se deve mostrar botão de impressão
 * @returns {string} HTML do título
 */
export const pageTitleTemplate = (titulo, showPrint = false) => {
    const printButton = showPrint 
        ? `<div class="print-bar noPrint">
               <a id="print" href="#"><i class="fa fa-print fa-lg" aria-hidden="true"></i></a>
           </div>`
        : '';
    
    return `
        <h3 style='text-align: justify;'>${titulo}</h3>
        ${printButton}
    `;
};

/**
 * Template para botões de compartilhamento social
 * @param {string} codigo - Código do objeto
 * @returns {string} HTML dos botões sociais
 */
export const socialShareTemplate = (codigo) => {
    const baseUrl = 'https://rastreamento.correios.com.br/app/index.php?objetos=';
    const trackingUrl = `${baseUrl}${codigo}`;
    
    return `
        <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${trackingUrl}&title=Detalhes do Pacote nos Correios">
            <i class="fa fa-facebook-official fa-lg" aria-hidden="true"></i>
        </a>
        <a target="_blank" href="https://wa.me/?text=${trackingUrl}">
            <i class="fa fa-whatsapp fa-lg" aria-hidden="true"></i>
        </a>
        <a target="_blank" href="https://twitter.com/share?url=${trackingUrl}&text=Detalhes do meu pacote objetos nos Correios&hashtags=Correios">
            <img class="xtwiter" src="../static/svg/icons8-twitterx.svg" aria-hidden="true">
        </a>
    `;
};

/**
 * Template para estrutura completa de rastreamento único
 * @param {Object} objeto - Dados do objeto
 * @param {string} ulContent - Conteúdo da lista de eventos
 * @param {boolean} showHeader - Se deve mostrar cabeçalho
 * @returns {string} HTML completo
 */
export const singleTrackingTemplate = (objeto, ulContent, showHeader = true) => {
    const header = showHeader ? trackingHeaderTemplate(objeto) : '';
    
    return `
        ${header}
        ${ulContent}
    `;
};

/**
 * Template para seção "Ver Mais"
 * @param {Object} objeto - Dados do objeto
 * @param {string} shortContent - Conteúdo resumido
 * @param {string} fullContent - Conteúdo completo
 * @param {boolean} showHeader - Se deve mostrar cabeçalho
 * @returns {Object} HTML estruturado e flag se tem "ver mais"
 */
export const viewMoreTemplate = (objeto, shortContent, fullContent, showHeader = true) => {
    if (!shortContent) {
        return {
            html: singleTrackingTemplate(objeto, fullContent, showHeader),
            hasViewMore: false
        };
    }

    return {
        html: `
            <div id="ver-mais" style="display: block;">
                ${showHeader ? trackingHeaderTemplate(objeto) : ''}
                ${shortContent}
            </div>
            <div id="ver-rastro-unico" style="display: none;">
                ${showHeader ? trackingHeaderTemplate(objeto) : ''}
                ${fullContent}
            </div>
        `,
        hasViewMore: true
    };
};

/**
 * Cache de templates renderizados (otimização)
 */
const templateCache = new Map();

/**
 * Função helper para cache de templates
 * @param {string} key - Chave do cache
 * @param {Function} templateFn - Função do template
 * @param {...any} args - Argumentos para o template
 * @returns {string} HTML renderizado
 */
export const getCachedTemplate = (key, templateFn, ...args) => {
    if (templateCache.has(key)) {
        return templateCache.get(key);
    }
    
    const rendered = templateFn(...args);
    templateCache.set(key, rendered);
    return rendered;
};

/**
 * Limpa o cache de templates
 */
export const clearTemplateCache = () => {
    templateCache.clear();
};

/**
 * Templates específicos para estados de erro
 */
export const ErrorTemplates = {
    /**
     * Template para erro de captcha
     */
    invalidCaptcha: () => `
        <div class="alert alert-danger">
            <i class="fa fa-exclamation-triangle"></i>
            Captcha inválido. Por favor, tente novamente.
        </div>
    `,
    
    /**
     * Template para erro de conexão
     */
    networkError: () => `
        <div class="alert alert-warning">
            <i class="fa fa-wifi"></i>
            Erro de conexão. Verifique sua internet e tente novamente.
        </div>
    `,
    
    /**
     * Template para erro genérico
     */
    genericError: (message = 'Ocorreu um erro inesperado') => `
        <div class="alert alert-danger">
            <i class="fa fa-exclamation-circle"></i>
            ${message}
        </div>
    `
};

/**
 * Templates para estados de loading
 */
export const LoadingTemplates = {
    /**
     * Template para loading simples
     */
    simple: (message = 'Carregando...') => `
        <div class="text-center p-3">
            <i class="fa fa-spinner fa-spin fa-2x"></i>
            <p class="mt-2">${message}</p>
        </div>
    `,
    
    /**
     * Template para loading inline
     */
    inline: () => `<i class="fa fa-spinner fa-spin"></i>`,
    
    /**
     * Template para loading overlay
     */
    overlay: (message = 'Processando...') => `
        <div class="loading-overlay">
            <div class="loading-content">
                <i class="fa fa-spinner fa-spin fa-3x"></i>
                <p>${message}</p>
            </div>
        </div>
    `
};