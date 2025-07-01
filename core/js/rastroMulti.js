import {
    ul
} from "./rastroUnico.js";
import {
    btnsNacRastroUnico
} from "./botoes.js";

const formataDataHora = (dataHora) => {
    let dh = dataHora === "" ? '0000-00-00T00:00:00' : dataHora;
    const dataFormatada = dh.substring(0, 10).split('-').reverse().join('/');
    const horaFormatada = dh.substring(0, 16).slice(-5);

    return dataFormatada + " " + horaFormatada;
}


const formataData = (dataHora) => {
    let dh = dataHora ? ? '0000-00-00T00:00:00';

    const dataFormatada = dh.substring(0, 10).split('-').reverse().join('/').substring(0, 10);
    return dataFormatada;
}

const render = (jsonRastros, divId) => {
    const rastros = typeof(jsonRastros) === "string" ? JSON.parse(jsonRastros) : jsonRastros;

    const temEntregue = (!!rastros['entregue']) ? !!rastros['entregue'].length : false;
    const temEmTransito = (!!rastros['transito']) ? !!rastros['transito'].length : false;

    let navEmTransito = temEmTransito ? `<a class="noPrint">Em trânsito</a><p class="print bgGrayPrint">Em trânsito</p>` : '';
    let navEntregue = temEntregue ? `<a class="noPrint">Entregue</a>` : '';
    let tableEmTransito = temEmTransito ? emTransito(rastros) : '';
    let tableEntregue = temEntregue ? entregue(rastros) : '';

    return `
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
    `;

}

const emTransito = (rastros) => {
    //Botoes
    let temBotoes = false;
    let barra_botoes = '';
    let class_botoes = '';
    let class_icones = '';
    let trs = '';
    for (let t of rastros['transito']) {
        if (t.hasOwnProperty('mensagem')) {

            trs += trsEmTransitoComMsg(t);
        } else {
            temBotoes = false;
            barra_botoes = '';
            class_botoes = 'has-no-btn';
            class_icones = '';
            temBotoes = !!t['botoes'].length
            if (temBotoes) {
                class_botoes = 'has-btn';
                class_icones = 'icon-has-btn';
                for (let b of t['botoes']) {
                    barra_botoes += selectBtn(b, t['cod_objeto']);
                }
            }

            trs += trsEmTransitoSemMsg(class_botoes, t, class_icones, barra_botoes);
        }
    }

    return `
    <div>
        <div class="ctn-tabela">
            <div class="dados2">
                <table class="th-fixo cards tab">
                    <thead>
                        <tr class="d-table-row justify-content-center">
                            <th class="w-25 pl-3">Objeto</th>
                            <th class="w-50 pl-1">Status</th>
                            <th class="w-25 pl-1">Previsão de entrega</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${trs}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;
}

const entregue = (rastros) => {

    let trs = '';
    let temBotoes;
    let barra_botoes;
    let class_botoes;
    let class_icones;
    for (let e of rastros['entregue']) {
        temBotoes = false;
        barra_botoes = '';
        class_botoes = 'has-no-btn';
        class_icones = '';
        temBotoes = !!e['botoes'].length;
        if (temBotoes) {
            class_botoes = 'has-btn';
            class_icones = 'icon-has-btn';
            for (let b of e['botoes']) {
                barra_botoes += selectBtn(b);
            }
        }

        trs += trsEntregue(class_botoes, e, class_icones, barra_botoes);
    }

    return `
    <div>
        <div class="ctn-tabela">
        <p class="print bgGrayPrint">Entregue</p>
            <div class="dados2">
                <table class="th-fixo cards tab">
                    <thead>
                        <tr class="d-table-row justify-content-center">
                            <th class="w-25 pl-3">Objeto</th>
                            <th class="w-50 pl-1">Status</th>
                            <th class="w-25 pl-1">Data da entrega</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${trs}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
`;
}

const trsEntregue = (class_botoes, e, class_icones, barra_botoes) => {
    let dataPrevista = '';
    const cabecalho = cabecalhoRastro(e.objeto);
    const uls = ul(e.objeto);
    const btns = btnsNacRastroUnico(e.objeto);
    return `<tr>
            <td colspan="3" class="${class_botoes}" id="${e['cod_objeto_']}">
                <div class="infos-rastro pl-2 pt-2">
                    <div class="objeto-info"><a href="#" target="_blank" data-codObjeto="${e['cod_objeto_']}">
                                                <i class="fa fa-plus-circle fa-2x ${class_icones}"></i>
                                            </a><span data-th="Objeto">${e['cod_objeto']}</span></div>
                    <div class="status-info" data-th="Status">${e['descricao']}<br>
                            ${e['cidade']!==''?e['cidade']+'/':''}${e['uf']}<br>
                            ${formataDataHora(e['data_evento']['date'])}
                        </div>
                    <div class="prazoEntrega-info" data-th="Prazo-Entrega">${formataData(e['data_evento']['date'])}</div>
                </div>                       
                <div data-name="rastrosUnicos" class="rastrosUnicos esconde">
                    ${cabecalho}
                    ${uls}
                </div>
                <div data-name="barra-botoes" class="barra-btns esconde">${barra_botoes}${btns}</div>                        
            </td>
        </tr>`;
}

const trsEmTransitoComMsg = (t) => {
    return `<tr>
            <td colspan="3" class="no-has-btn" id="${t['cod_objeto_']}">
            <div class="infos-rastro pl-2 pt-2">
                <div class="objeto-info"><a href="javascript:void(0)" aria-disabled="true" data-codObjeto="t['cod_objeto_']" class="disabled" tabindex="-1" target="_blank"><i
                    class="fa fa-times-circle-o fa-2x"></i> </a><span
                                data-th="Objeto">${t['cod_objeto']}</span></div>
                <div class="status-info" data-th="Status">${t['mensagem_h']}</div>
                <div class="prazoEntrega-info" data-th="Prazo-Entrega">&nbsp;</div>
            </div>
            </td>
        </tr>`
}

const trsEmTransitoSemMsg = (class_botoes, t, class_icones, barra_botoes) => {
    let dataPrevista = t['data_prevista'].length ? t['data_prevista'] : t['objeto']['atrasado'] ? `<p class="text text-head noPrint">Para obter mais informações sobre o objeto, clique <a href="${t['objeto']['urlFaleComOsCorreios']}" target="_blank">aqui</a> e registre uma manifestação.</p>` : 'Informação indisponível';
    const cabecalho = cabecalhoRastro(t.objeto);
    const uls = ul(t.objeto);
    const btns = btnsNacRastroUnico(t.objeto);
    return `<tr>
            <td colspan="3" class="${class_botoes}" id="${t['cod_objeto_']}">
                <div class="infos-rastro pl-2 pt-2">
                    <div class="objeto-info"><a href="#" target="_blank" data-codObjeto="${t['cod_objeto_']}"><i
                                        class="fa fa-plus-circle fa-2x ${class_icones}"></i> </a><span
                                    data-th="Objeto">${t['cod_objeto']}</span></div>
                    <div class="status-info" data-th="Status">${t['descricao']}<br>
                        <span class="unidade-endereco">
                            ${t['cidade']!==''?t['cidade']+'/':''}${t['uf']}<br>
                            ${formataDataHora(t['data_evento']['date'])}
                        </span>    
                        </div>
                    <div class="prazoEntrega-info" data-th="Prazo-Entrega">${dataPrevista}</div>
                </div>
                <div data-name="rastrosUnicos" class="rastrosUnicos esconde">
                    ${cabecalho} ${uls}
                </div>
                <div data-name="barra-botoes" class="barra-btns esconde">${barra_botoes} ${btns}</div>                        
            </td>
        </tr>`;
}

const selectBtn = (button, codObjeto) => {
    let btn = '';
    switch (button) {
        case 'BTN_AUTO_DECLARACAO':
            btn = `
            <a class="btn btn-outline-primary p-1 btn-rastro" href="https://apps.correios.com.br/portalimportador/" target="_blank">
                <img src="../static/rastreamento-internet/imgs/iconeVinculacao.PNG"  class="icone-btn" aria-hidden="true" />
                Informar Documento Fiscal
            </a> 
            `;

            break;
        case 'BNT_PAGAR_DESP_POSTAL':
            btn = `
                <a class="btn btn-outline-primary p-1 btn-rastro" href="https://apps.correios.com.br/portalimportador?encomenda=${codObjeto}" target="_blank">
                    <i class="fa fa-credit-card" aria-hidden="true"></i>
                    Gerar boleto
                </a>
              `;
            break;
        default:
    }
    return btn;
}
const cabecalhoRastro = (objeto) => {
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
                </div>
            </ul>
            <div class="share-bar noPrint">
                  <a title="Compartilhar" class="btn btn-light" data-objeto="${objeto.codObjeto}">
					<i class="fa fa-share-alt" aria-hidden="true"></i>
				</a>
     		</div>
        </div>
    `;
}
export {
    render
}