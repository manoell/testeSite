/**
 * rastroMulti.js - Rastreamento Múltiplo Otimizado
 * Versão otimizada: templates consolidados, formatação unificada, lógica simplificada
 */

import { ul } from "./rastroUnico.js";
import { btnsNacRastroUnico } from "./botoes.js";

// === CONFIGURAÇÕES OTIMIZADAS ===
const MULTI_CONFIG = {
    BUTTON_TYPES: {
        BTN_AUTO_DECLARACAO: 'BTN_AUTO_DECLARACAO',
        BNT_PAGAR_DESP_POSTAL: 'BNT_PAGAR_DESP_POSTAL'
    },
    
    PORTAL_URLS: {
        PROD: 'https://apps.correios.com.br/portalimportador',
        HOM: 'https://apphom.correios.com.br/portalimportador', 
        DEV: 'https://jdes.correiosnet.int/portalimportador'
    }
};

// === TEMPLATES CONSOLIDADOS ===
const TEMPLATES = {
    mainTabs: (divId, navEmTransito, navEntregue, tableEmTransito, tableEntregue) => `
        <div id="${divId}" class="tabs tab tabs-rastro">
            <nav>
                ${navEmTransito}
                ${navEntregue}
            </nav>
            <section>
                ${tableEmTransito}
                ${tableEntregue}
            </section>
        </div>
    `,
    
    tableContainer: (title, content) => `
        <div>
            ${title ? `<p class="print bgGrayPrint">${title}</p>` : ''}
            <div class="ctn-tabela">
                <div class="dados2">
                    <table class="th-fixo cards tab">
                        <thead>
                            <tr class="d-table-row justify-content-center">
                                <th class="w-25 pl-3">Objeto</th>
                                <th class="w-50 pl-1">Status</th>
                                <th class="w-25 pl-1">${title === 'Entregue' ? 'Data da entrega' : 'Previsão de entrega'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${content}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,
    
    objectRow: (classBotoes, codObjeto, codigo, descricao, location, dataEvento, dataPrevista, cabecalho, uls, barra_botoes, btns) => `
        <tr>
            <td colspan="3" class="${classBotoes}" id="${codObjeto}">
                <div class="infos-rastro pl-2 pt-2">
                    <div class="objeto-info">
                        <a href="#" target="_blank" data-codObjeto="${codObjeto}">
                            <i class="fa fa-plus-circle fa-2x ${classBotoes === 'has-btn' ? 'icon-has-btn' : ''}"></i>
                        </a>
                        <span data-th="Objeto">${codigo}</span>
                    </div>
                    <div class="status-info" data-th="Status">
                        ${descricao}<br>
                        <span class="unidade-endereco">
                            ${location}<br>
                            ${formataDataHora(dataEvento)}
                        </span>
                    </div>
                    <div class="prazoEntrega-info" data-th="Prazo-Entrega">${dataPrevista}</div>
                </div>                       
                <div data-name="rastrosUnicos" class="rastrosUnicos esconde">
                    ${cabecalho}
                    ${uls}
                </div>
                <div data-name="barra-botoes" class="barra-btns esconde">${barra_botoes}${btns}</div>                        
            </td>
        </tr>
    `,
    
    errorRow: (codObjeto, codigo, mensagem) => `
        <tr>
            <td colspan="3" class="no-has-btn" id="${codObjeto}">
                <div class="infos-rastro pl-2 pt-2">
                    <div class="objeto-info">
                        <a href="javascript:void(0)" aria-disabled="true" data-codObjeto="${codObjeto}" class="disabled" tabindex="-1" target="_blank">
                            <i class="fa fa-times-circle-o fa-2x"></i>
                        </a>
                        <span data-th="Objeto">${codigo}</span>
                    </div>
                    <div class="status-info" data-th="Status">${mensagem}</div>
                    <div class="prazoEntrega-info" data-th="Prazo-Entrega">&nbsp;</div>
                </div>
            </td>
        </tr>
    `,
    
    cabecalhoRastro: (objeto) => `
        <div id="cabecalho-rastro" class="d-flex justify-content-between">
            <ul class="cabecalho-rastro">
                <div class="arrow-dashed justify-content-start">
                    <div class="circle">
                        <img class="circle-logo" src="../static/rastreamento-internet/imgs/correios-sf.png" width="35px" height="35px">
                    </div>                    
                </div>    
                <div class="cabecalho-content">
                    <p class="text text-content">${objeto.tipoPostal.categoria}</p>
                </div>
            </ul>
            <div class="share-bar noPrint">
                <a title="Compartilhar" class="btn btn-light" data-objeto="${objeto.codObjeto}">
                    <i class="fa fa-share-alt" aria-hidden="true"></i>
                </a>
            </div>
        </div>
    `
};

/**
 * Formatação de data/hora unificada
 */
const formataDataHora = (dataHora) => {
    const dh = dataHora === "" ? '0000-00-00T00:00:00' : dataHora;
    const dataFormatada = dh.substring(0, 10).split('-').reverse().join('/');
    const horaFormatada = dh.substring(0, 16).slice(-5);
    return `${dataFormatada} ${horaFormatada}`;
};

/**
 * Formatação de data simples
 */
const formataData = (dataHora) => {
    if (!dataHora) return '00/00/0000';
    return dataHora.substring(0, 10).split('-').reverse().join('/');
};

/**
 * Obtém URL do portal baseado no ambiente
 */
const getPortalURL = () => {
    const ambiente = window.AMBIENTE_EXECUCAO || 'P';
    const urls = MULTI_CONFIG.PORTAL_URLS;
    
    switch (ambiente) {
        case 'D': return urls.DEV;
        case 'H': return urls.HOM;
        default: return urls.PROD;
    }
};

/**
 * Seleciona botão baseado no tipo
 */
const selectBtn = (button, codObjeto) => {
    const portalURL = getPortalURL();
    const { BUTTON_TYPES } = MULTI_CONFIG;
    
    switch (button) {
        case BUTTON_TYPES.BTN_AUTO_DECLARACAO:
            return `
                <a class="btn btn-outline-primary p-1 btn-rastro" href="${portalURL}" target="_blank">
                    <img src="../static/rastreamento-internet/imgs/iconeVinculacao.PNG" class="icone-btn" aria-hidden="true" />
                    Informar Documento Fiscal
                </a> 
            `;
            
        case BUTTON_TYPES.BNT_PAGAR_DESP_POSTAL:
            return `
                <a class="btn btn-outline-primary p-1 btn-rastro" href="${portalURL}?encomenda=${codObjeto}" target="_blank">
                    <i class="fa fa-credit-card" aria-hidden="true"></i>
                    Gerar boleto
                </a>
            `;
            
        default:
            return '';
    }
};

/**
 * Gera linha para objeto entregue
 */
const gerarLinhaEntregue = (e) => {
    const temBotoes = !!e.botoes?.length;
    const classBotoes = temBotoes ? 'has-btn' : 'has-no-btn';
    
    let barraBotoes = '';
    if (temBotoes) {
        barraBotoes = e.botoes.map(b => selectBtn(b)).join('');
    }
    
    const cabecalho = TEMPLATES.cabecalhoRastro(e.objeto);
    const uls = ul(e.objeto);
    const btns = btnsNacRastroUnico(e.objeto);
    const location = e.cidade !== '' ? `${e.cidade}/` : '';
    
    return TEMPLATES.objectRow(
        classBotoes,
        e.cod_objeto_,
        e.cod_objeto,
        e.descricao,
        `${location}${e.uf}`,
        e.data_evento.date,
        formataData(e.data_evento.date),
        cabecalho,
        uls,
        barraBotoes,
        btns
    );
};

/**
 * Gera linha para objeto em trânsito
 */
const gerarLinhaTransito = (t) => {
    // Objeto com mensagem de erro
    if (t.hasOwnProperty('mensagem')) {
        return TEMPLATES.errorRow(t.cod_objeto_, t.cod_objeto, t.mensagem_h);
    }
    
    const temBotoes = !!t.botoes?.length;
    const classBotoes = temBotoes ? 'has-btn' : 'has-no-btn';
    
    let barraBotoes = '';
    if (temBotoes) {
        barraBotoes = t.botoes.map(b => selectBtn(b, t.cod_objeto)).join('');
    }
    
    const dataPrevista = t.data_prevista?.length 
        ? t.data_prevista 
        : (t.objeto?.atrasado 
            ? `<p class="text text-head noPrint">Para obter mais informações sobre o objeto, clique <a href="${t.objeto.urlFaleComOsCorreios}" target="_blank">aqui</a> e registre uma manifestação.</p>`
            : 'Informação indisponível'
        );
    
    const cabecalho = TEMPLATES.cabecalhoRastro(t.objeto);
    const uls = ul(t.objeto);
    const btns = btnsNacRastroUnico(t.objeto);
    const location = t.cidade !== '' ? `${t.cidade}/` : '';
    
    return TEMPLATES.objectRow(
        classBotoes,
        t.cod_objeto_,
        t.cod_objeto,
        t.descricao,
        `${location}${t.uf}`,
        t.data_evento.date,
        dataPrevista,
        cabecalho,
        uls,
        barraBotoes,
        btns
    );
};

/**
 * Gera seção de objetos entregues
 */
const entregue = (rastros) => {
    const trs = rastros.entregue.map(gerarLinhaEntregue).join('');
    return TEMPLATES.tableContainer('Entregue', trs);
};

/**
 * Gera seção de objetos em trânsito
 */
const emTransito = (rastros) => {
    const trs = rastros.transito.map(gerarLinhaTransito).join('');
    return TEMPLATES.tableContainer('', trs);
};

/**
 * Renderiza o componente principal
 */
const render = (jsonRastros, divId) => {
    const rastros = typeof jsonRastros === "string" ? JSON.parse(jsonRastros) : jsonRastros;

    const temEntregue = !!(rastros.entregue?.length);
    const temEmTransito = !!(rastros.transito?.length);

    const navEmTransito = temEmTransito 
        ? `<a class="noPrint">Em trânsito</a><p class="print bgGrayPrint">Em trânsito</p>` 
        : '';
    const navEntregue = temEntregue 
        ? `<a class="noPrint">Entregue</a>` 
        : '';
    
    const tableEmTransito = temEmTransito ? emTransito(rastros) : '';
    const tableEntregue = temEntregue ? entregue(rastros) : '';

    return TEMPLATES.mainTabs(divId, navEmTransito, navEntregue, tableEmTransito, tableEntregue);
};

export {
    render,
    formataDataHora,
    formataData
};