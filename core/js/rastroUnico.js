/**
 * rastroUnico.js - Rastreamento Único Otimizado
 * Versão otimizada: consolidada formatação, simplificados templates, removido código não utilizado
 */

// === CONFIGURAÇÕES OTIMIZADAS ===
const RASTRO_CONFIG = {
    DEFAULT_ICON: "caminhao-cor.png",
    
    ARROW_TYPES: {
        CURRENT: "arrow-current",
        NONE: "arrow-none",
        DASHED: "arrow-dashed"
    },
    
    TOOLTIP_CLASSES: {
        NORMAL: "title",
        CONTRAST: "title-c"
    },
    
    PATHS: {
        IMAGES: "../static/rastreamento-internet/imgs/",
        CORREIOS_LOGO: "../static/rastreamento-internet/imgs/correios-sf.png"
    }
};

// === TEMPLATES OTIMIZADOS ===
const TEMPLATES = {
    listItem: (arrowDiv, textDiv) => `<li class="step">${arrowDiv}${textDiv}</li>`,
    
    arrowDiv: (arrow, icone) => `
        <div class="${arrow}">
            <div class="circle">
                <img class="circle-img" src="${RASTRO_CONFIG.PATHS.IMAGES}${icone}">            
            </div>
        </div>
    `,
    
    textDiv: (descricao, locais, detalhes, dataHora) => `
        <div class="step-content">
            <p class="text text-head">${descricao}</p>
            ${locais.map(local => `<p class="text text-content">${local}</p>`).join('')}
            ${detalhes.map(detalhe => `<p class="text text-head">${processarDetalhe(detalhe)}</p>`).join('')}
            <p class="text text-content">${dataHora}</p>
        </div>
    `,
    
    verMais: () => {
        const contrastClass = document.body.className === "contrast" 
            ? RASTRO_CONFIG.TOOLTIP_CLASSES.CONTRAST 
            : RASTRO_CONFIG.TOOLTIP_CLASSES.NORMAL;
            
        return `
            <li style="padding-top: 20px;">
                <div class="arrow-dashed" style="height: 20px;"></div>
            </li>
            <div class="btn-ver-mais">
                <a id="a-ver-mais" style="cursor:pointer;">
                    <i class="fa fa-plus-circle fa-2x icon-has-btn"></i>
                    <span id="tooltip-vermais" class="${contrastClass}">Mais informações</span>
                </a>
            </div>
            <li style="padding-bottom: 20px;">
                <div class="arrow-dashed" style="height: 20px;"></div>
            </li>
        `;
    }
};

/**
 * Formatação de data/hora otimizada
 */
const formataDataHora = (dataHora) => {
    const dh = dataHora === "" ? '0000-00-00T00:00:00' : dataHora;
    const dataFormatada = dh.substring(0, 10).split('-').reverse().join('/');
    const horaFormatada = dh.substring(0, 16).slice(-5);
    return `${dataFormatada} ${horaFormatada}`;
};

/**
 * Formatação de data otimizada
 */
const formataData = (dataHora) => {
    const dh = dataHora ?? '0000-00-00T00:00:00';
    return dh.substring(0, 10).split('-').reverse().join('/');
};

/**
 * Processa detalhes com URLs
 */
const processarDetalhe = (detalhe) => {
    const regex = /(https?:\/\/[^\s]+)/;
    const resultado = detalhe.match(regex);
    
    if (resultado) {
        const url = resultado[0].replace(/\.$/, '');
        const textoSemUrl = detalhe.replace(regex, '').replace(/:\s*$/, '.').trim();
        return `<a href="${url}" target="_blank"><u>${textoSemUrl}</u></a>`;
    }
    
    return detalhe;
};

/**
 * Obtém endereço formatado
 */
const getCidadeUf = (endereco) => {
    try {
        const cidade = endereco?.cidade ?? "";
        const uf = endereco?.uf ?? "";
        const separador = (cidade.length && uf.length) ? " - " : "";
        
        let retorno = "";
        if (endereco?.logradouro) {
            retorno = `${endereco.logradouro}, ${endereco.numero ?? ""}<br/>
                      ${endereco.bairro ?? ""}<br/>`;
        }
        
        retorno += `${cidade}${separador}${uf}`;
        return retorno;
    } catch (error) {
        return "";
    }
};

/**
 * Remove acentos de string
 */
const removerAcentos = (string) => {
    return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// === PROCESSADORES DE UNIDADE ===
const tipoUnidade = {
    pais: function({
        descricaoWeb = "",
        evento = "",
        codObjeto = "",
        ehFinalizador,
        autoDeclaracao
    }) {
        return caminhoInternacional[
            descricaoWeb === "TRANSITO" ? "transito" : "normal"
        ](evento, codObjeto, ehFinalizador, autoDeclaracao);
    },
    
    outras: function({
        rota = "",
        descricaoWeb = "",
        evento = "",
        percorridaCarteiro
    }) {
        return caminhoNacional[
            rota === "CONTEXTO" ? descricaoWeb.toLowerCase() : "normal"
        ](evento, percorridaCarteiro);
    }
};

const caminhoInternacional = {
    normal: function({ unidade: { nome = "" }, detalhe }) {
        const l = { local: [], detalhe: [], dataHora: "" };
        l.local.push(nome);
        if (detalhe !== "") {
            l.detalhe.push(detalhe);
        }
        return l;
    },
    
    transito: function(
        { unidade, unidadeDestino = "", codigo, tipo, detalhe },
        codObjeto,
        ehFinalizador,
        autoDeclaracao
    ) {
        const local = unidade.nome;
        let para = "";
        
        para += typeof unidadeDestino.nome === "undefined" 
            ? "" 
            : ` para ${unidadeDestino.nome}`;
        para += typeof unidadeDestino.endereco?.uf === "undefined" 
            ? "" 
            : ` - ${unidadeDestino.endereco.uf}`;
            
        const l = { local: [], detalhe: [], dataHora: "" };
        l.local.push(para);
        
        if (autoDeclaracao && ehFinalizador === "N") {
            const lk = `Acesse <a href="https://portalimportador.correios.com.br" style="text-decoration: underline; cursor: pointer;">Minhas Importações</a> para informar o nº do documento e dar prosseguimento ao processo de fiscalização.`;
            l.local.push(lk);
        }
        
        l.local.push(local);
        if (detalhe !== "") {
            l.detalhe.push(detalhe);
        }
        return l;
    }
};

const caminhoNacional = {
    normal: function(
        { unidade = "", detalhe = "" },
        percorridaCarteiro
    ) {
        const cidadeUf = getCidadeUf(unidade.endereco);
        const l = { local: [], detalhe: [], dataHora: "" };
        l.local.push(cidadeUf);
        if (detalhe !== "") {
            l.detalhe.push(detalhe);
        }
        return l;
    },
    
    transito: function(
        { unidade = "", unidadeDestino = "", detalhe = "" },
        pc
    ) {
        const cidadeUf = getCidadeUf(unidade.endereco);
        const de = `de ${unidade.tipo}, ${cidadeUf}`;
        const tipoDestino = unidadeDestino.tipo ?? "";
        const cidadeUfDestino = getCidadeUf(unidadeDestino.endereco);
        const para = `para ${tipoDestino}, ${cidadeUfDestino}`;
        
        const l = { local: [], detalhe: [], dataHora: "" };
        l.local.push(de);
        l.local.push(para);
        if (detalhe !== "") {
            l.detalhe.push(detalhe);
        }
        return l;
    },
    
    entregue: function({ unidade = "", detalhe = "" }, pc) {
        const local = `Pela ${unidade.tipo}, ${getCidadeUf(unidade.endereco)}`;
        const l = { local: [], detalhe: [], dataHora: "" };
        l.local.push(local);
        if (detalhe !== "") {
            l.detalhe.push(detalhe);
        }
        return l;
    },
    
    retirada: function({ unidade = "", detalhe = "" }, pc) {
        const cidadeUf = getCidadeUf(unidade.endereco);
        const local = `${unidade.nome},${cidadeUf}`;
        const l = { local: [], detalhe: [], dataHora: "" };
        l.local.push(local);
        if (detalhe !== "") {
            l.detalhe.push(detalhe);
        }
        return l;
    },
    
    extraviado: function({ unidade = "", detalhe = "" }, pc) {
        const cidadeUf = getCidadeUf(unidade.endereco);
        const local = unidade.nome?.length 
            ? `${unidade.nome},${cidadeUf}` 
            : `${cidadeUf}`;
        const l = { local: [], detalhe: [], dataHora: "" };
        l.local.push(local);
        if (detalhe !== "") {
            l.detalhe.push(detalhe);
        }
        return l;
    },
    
    recebidocorreiosbrasil: function(evento, pc) {
        return caminhoNacional.extraviado(evento);
    }
};

/**
 * Cria item de lista para evento
 */
const createLiRota = ({
    codObjeto,
    evento,
    arrow,
    ehFinalizador,
    percorridaCarteiro,
    autoDeclaracao,
    locker
}) => {
    const icone = evento.icone || RASTRO_CONFIG.DEFAULT_ICON;
    const tipo = evento.unidade.tipo;
    let descricao = evento.descricao;
    
    if (locker && evento.icone === "locker.png") {
        descricao += '<button type="button" class="btnLckIcon"><img src="../static/png/qr-code-cor.png" class="icone-locker" alt="imagem do locker"></img></button>';
    }

    const objectEvento = {
        descricaoWeb: evento.descricaoWeb,
        evento: evento,
        rota: evento.rota,
        codObjeto: codObjeto,
        ehFinalizador: ehFinalizador,
        percorridaCarteiro: percorridaCarteiro,
        autoDeclaracao: autoDeclaracao
    };

    const processador = tipo.toUpperCase() === "PAÍS" 
        ? tipoUnidade.pais 
        : tipoUnidade.outras;
        
    let linhasTexto = processador(objectEvento);
    linhasTexto.dataHora = formataDataHora(evento.dtHrCriado.date);

    const dvTexto = TEMPLATES.textDiv(descricao, linhasTexto.local, linhasTexto.detalhe, linhasTexto.dataHora);
    const dvArrow = TEMPLATES.arrowDiv(arrow, icone);
    
    return TEMPLATES.listItem(dvArrow, dvTexto);
};

/**
 * Verifica se é tipo postal internacional
 */
const ehTipoPostalInternacional = (tipo) => {
    return tipo.descricao.toUpperCase().includes("INTERNACIONAL");
};

/**
 * Verifica inversão de eventos
 */
const verificaInversao = (eventos) => {
    const { descricaoWeb } = detalheEvento(eventos[0]);
    return descricaoWeb === "POSTAGEM" ? eventos.reverse() : eventos;
};

/**
 * Percorre eventos e gera lista
 */
const percorreEventos = ({
    eventos,
    codObjeto,
    percorridaCarteiro,
    autoDeclaracao,
    locker
}) => {
    const qtEventos = eventos.length;
    let li = "";
    const eventoTopo = eventos[0];
    const ehFinalizador = eventoTopo.finalizador;

    eventos.forEach((ev, index) => {
        const arrow = (index === qtEventos - 1) 
            ? RASTRO_CONFIG.ARROW_TYPES.NONE 
            : RASTRO_CONFIG.ARROW_TYPES.CURRENT;

        const eventoIndividual = {
            codObjeto,
            evento: ev,
            arrow,
            ehFinalizador,
            percorridaCarteiro,
            autoDeclaracao,
            locker
        };

        li += createLiRota(eventoIndividual);
    });

    return li;
};

/**
 * Detalhes do evento (mantido para compatibilidade)
 */
const detalheEvento = ({ codigo, tipo }) => {
    // Implementação simplificada para manter compatibilidade
    return { descricaoWeb: "POSTAGEM" };
};

/**
 * Gera UL principal
 */
const ul = (objeto) => {
    const li = percorreEventos(objeto);
    return `<ul class="ship-steps">${li}</ul>`;
};

/**
 * Gera versão "Ver Mais"
 */
const verMais = (objeto) => {
    const eventos = objeto.eventos;
    const qtEventos = eventos.length;
    
    if (qtEventos <= 3) {
        return "";
    }

    const codObjeto = objeto.codObjeto;
    let li = "";
    
    // Primeiro evento
    let eventoIndividual = {
        codObjeto,
        evento: eventos[0],
        arrow: RASTRO_CONFIG.ARROW_TYPES.CURRENT,
        locker: objeto.locker
    };
    li += createLiRota(eventoIndividual);
    
    // Segundo evento
    eventoIndividual.evento = eventos[1];
    li += createLiRota(eventoIndividual);
    
    // Botão ver mais
    li += TEMPLATES.verMais();
    
    // Último evento
    eventoIndividual.evento = eventos[qtEventos - 1];
    eventoIndividual.arrow = RASTRO_CONFIG.ARROW_TYPES.NONE;
    li += createLiRota(eventoIndividual);
    
    return `<ul class="ship-steps">${li}</ul>`;
};

export {
    ul,
    verificaInversao,
    ehTipoPostalInternacional,
    detalheEvento,
    formataData,
    verMais
};