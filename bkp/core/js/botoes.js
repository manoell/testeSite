// modulo de operações/ interações com objetos

//Nacionais:
//  SMS
//  Suspensão de Entrega
//  Ar Eletrônico
//  Chat dos Carteiros
//  Locker


//Internacionais
//  Despacho Postal
//  Auto Declaração
const is_validURL = (str) => {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}
const btnsNacRastroUnico = ({
    codObjeto,
    bloqueioObjeto,
    arEletronico,
    percorridaCarteiro,
    eventos
}) => {

    let btns = "";
    if (bloqueioObjeto) {
        //suspender entrega
        btns += `
				<a class="btn btn-outline-primary p-1 btn-rastro" href="suspensaoEntrega/index.php?objeto=${codObjeto}">
                      <i class="fa fa-hand-paper-o" aria-hidden="true"></i>
                      Suspender Entrega
                </a>
				`;
    }

    //Chat dos Carteiros
    if (percorridaCarteiro) {
        //iconeChatCarteiros.PNG
        let linkApp = `https://chat.correios.com.br/app/index.php?objeto=${codObjeto}`
        if (AMBIENTE_EXECUCAO === 'D') {
            linkApp = `https://chatdes.correios.com.br/app/index.php?objeto=${codObjeto}`
        } else if (AMBIENTE_EXECUCAO === 'H') {
            linkApp = `https://chathom.correios.com.br/app/index.php?objeto=${codObjeto}`
        }

        if (eventos[0].comentario !== null && is_validURL(eventos[0].comentario)) {
            linkApp = eventos[0].comentario;
        }
        btns += `
				<a class="btn btn-outline-primary p-1 btn-rastro" href="${linkApp}" target="_blank">
                     <img src="../static/rastreamento-internet/imgs/iconeChatCarteiros.PNG" class="icone-btn" aria-hidden="true" />
                     Acompanhe a entrega
                </a>
				`;
    }
    if (arEletronico) {
        //iconeVinculacao.PNG
        btns += `
				<a class="btn btn-outline-primary p-1 btn-rastro" href="arEletronico/index.php?objeto=${codObjeto}" target="_blank">
				 	<img src="../static/rastreamento-internet/imgs/AR-eletronico.png"  class="icone-btn" aria-hidden="true" />
					AR Eletrônico
				</a>
				`;
    }
    return btns;

}
const btnsIntRastroUnico = ({
    codObjeto,
    autoDeclaracao,
    encargoImportacao
}) => {
    let link = `https://apps.correios.com.br/portalimportador/?encomenda=${codObjeto}`;
    if (AMBIENTE_EXECUCAO === 'H') {
        link = `https://apphom.correios.com.br/portalimportador/?encomenda=${codObjeto}`;
    } else if (AMBIENTE_EXECUCAO === 'D') {
        link = `https://jdes.correiosnet.int/portalimportador/?encomenda=${codObjeto}`;
    }


    let btns = "";
    if (encargoImportacao) {
        btns += `
				<a class="btn btn-outline-primary p-1 btn-rastro" href="${link}" target="_blank">
                    <i class="fa fa-credit-card" aria-hidden="true"></i>
                    Gerar boleto
                </a>
				`;
    }
    if (autoDeclaracao) {
        btns += `
				<a class="btn btn-outline-primary p-1 btn-rastro" href="${link}" target="_blank">
				 	<img src="../static/rastreamento-internet/imgs/iconeVinculacao.PNG"  class="icone-btn" aria-hidden="true" />
					Informar Documento Fiscal
				</a>
				`;
    }
    return btns;
}


export {
    btnsIntRastroUnico,
    btnsNacRastroUnico
}