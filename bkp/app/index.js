import * as alerta from '../core/templates/bunker/js/alerta.js'
import * as forms from '../core/templates/bunker/js/forms.js'
import * as CodigoObjeto from '../core/js/rastroGeral.js'
import * as rastroUnico from '../core/js/rastroUnico.js'
import * as rastroMulti from '../core/js/rastroMulti.js'
import * as botoes from '../core/js/botoes.js'
import * as modal from '../core/templates/bunker/js/modal.js'


const validarcampoObjeto = async () => {
    const input_objeto = document.getElementById('objeto');
    const objetoLimpo = input_objeto.value.replace(new RegExp('[-,;. ]', 'g'), '');

    if ((isNaN(objetoLimpo[0]) && (objetoLimpo.length >= 13 && objetoLimpo.length % 13 === 0)) ||
        !isNaN(objetoLimpo[0]) && (objetoLimpo.length === 11 || objetoLimpo.length === 14)) {
        const retorno = CodigoObjeto.validarCodigoObjeto(objetoLimpo);
        forms.setValidade(input_objeto, retorno.mensagem);
    }

    if (!isNaN(objetoLimpo[0]) && ((objetoLimpo.length === 12) || (objetoLimpo.length === 13))) {
        forms.setValidade(input_objeto, '');
    }
    if ((!isNaN(objetoLimpo[0])) && objetoLimpo.length > 14) {
        forms.setValidade(input_objeto, 'Favor informar de 1 a 20 códigos de objetos ou um CPF ou um CNPJ válido');
    }
}
const validarcampoCaptcha = () => {
    const input_captcha = document.getElementById('captcha');
    const captcha = input_captcha.value;
    forms.setValidade(input_captcha, '');
    if (!captcha.length) {
        forms.setValidade(input_captcha, 'Preencha o campo captcha');
        return false;
    }
    return true;
}
const formatoApresentacaoCodigoObjeto = (objeto) => {

    return `${objeto.substr(0, 2)} ${objeto.substr(2, 3)} ${objeto.substr(5, 3)} ${objeto.substr(8, 3)} ${objeto.substr(-2)}`;
}
const cabecalhoRastro = (objeto) => {
    const mensagem = objeto.situacao === 'T' ?
        (objeto.atrasado ?
            `<p class="text text-head noPrint">Para obter mais informações sobre o objeto, clique <a href="${objeto.urlFaleComOsCorreios}" target="_blank">aqui</a> e registre uma manifestação</p>` :
            objeto.dataPrevista !== "" ?
            `<p class="text text-head">Previsão de Entrega: ${objeto.dtPrevista}</p>` : ""

        ) :
        '';
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
					${mensagem}     	
                </div>                                                
            </ul>        
			<div class="share-bar noPrint">
				<a title="Compartilhar" class="btn btn-light"  data-objeto="${objeto.codObjeto}">
					<i class="fa fa-share-alt" aria-hidden="true"></i>
				</a>
			</div>
		</div>		
    `;
}
const rastroUnicoComVerMais = (objeto, cabPrevisao = 'N') => {

    const cabecalho = cabecalhoRastro(objeto);
    const ul = rastroUnico.ul(objeto);
    //ver mais
    const ulVerMais = rastroUnico.verMais(objeto);
    let html = "";
    if (ulVerMais === '') {
        html = `
			${cabPrevisao === 'S' ? cabecalho : ''}
			${ul}
		`;
    } else {
        html = `
			<div id="ver-mais" style="display: block;">
				${cabPrevisao === 'S' ? cabecalho : ''}
				${ulVerMais}
				
			</div>
			<div id="ver-rastro-unico" style="display: none;">
				${cabPrevisao === 'S' ? cabecalho : ''}
				${ul}
			</div>
		`;
    }
    return {
        html: html,
        temVerMais: ulVerMais !== ''
    };
}
const busca = async () => {

    const input_objeto = document.getElementById('objeto');
    const captcha = document.getElementById('captcha');
    const retorno = CodigoObjeto.validarCodigoObjeto(input_objeto.value.toUpperCase());
    if (retorno.erro) {
        forms.setValidade(input_objeto, retorno.mensagem);
        return false;
    }
    forms.setValidade(input_objeto, '');
    let objetos = retorno['objetosLimpos'];

    if (objetos.length === 13) {
        try {
            //Validar Captcha
            if (!validarcampoCaptcha()) {
                return false;
            }
            alerta.abre('Buscando...');
            document.getElementById('tabs-rastreamento').innerHTML = "";
            const res = await fetch(`resultado.php?objeto=${objetos}&captcha=${captcha.value}&mqs=S`);
            const r = await res.json();
            objetoUnico(r);
            atribuiClickShare();
            refreshCaptcha();
        } catch (err) {
            alerta.abre(err.message, 10, 'OK');
        }
    } else {
        //CPF e ou CNPJ
        if (objetos.length === 11 || objetos.length === 14) {
            location.href = `../core/seguranca/entrar.php?objetos=${objetos}&captcha=${captcha.value}`;
        } else {
            try {
                //Validar Captcha
                if (!validarcampoCaptcha()) {
                    return false;
                }
                alerta.abre('Buscando...')
                const res = await fetch(`rastroMulti.php?objeto=${objetos}&captcha=${captcha.value}`)
                const r = await res.json()
                if (r.erro) {
                    if (r.mensagem === 'Captcha inválido') {
                        alerta.fecha();
                        forms.setValidade(captcha, r.mensagem);
                    } else {
                        alerta.abre(r.mensagem, 10, 'OK');
                    }
                    refreshCaptcha();
                    return;
                }
                document.getElementById('trilha').innerHTML = `
					<a>Portal Correios</a>
					<a>Rastreamento</a>`;

                document.getElementById('titulo-pagina').innerHTML =
                    `<h3 style='text-align: justify;'>Rastreamento</h3>
					<div class="print-bar noPrint">						
						<a id="print"    href='javascript:window.print()'><i  class="fa fa-print fa-lg disabled" aria-hidden="true"></i></a>
					</div>
				`;
                const tabsRastreamento = document.querySelector("#tabs-rastreamento");
                tabsRastreamento.innerHTML = rastroMulti.render(r, 'tabs2');
                tabsRastreamento.display = 'block';
                document.getElementById('objeto').value = '';
                $('#multirastro-tab a').on('click', function(e) {
                    e.preventDefault()
                    if (!!document.getElementById('em-transito') && !!document.getElementById('entregue')) {
                        $(this).tab('show')
                    }
                })
                const links = document.querySelectorAll('table div.objeto-info a');
                for (let i = 0; i < links.length; ++i) {
                    links[i].addEventListener('click', mostrarDetalhes);
                }
                atribuiClickShare();
                alerta.fecha();
            } catch (err) {
                alerta.abre(err.message, 10, 'OK');
            }
            refreshCaptcha();
        }
    }
}
const atribuiClickShare = () => {
    const btns = document.querySelectorAll("a[title='Compartilhar']");
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            showButtons(e);
        })
    })
}
const showButtons = (ev) => {
    const divDestino = document.getElementById("msharebuttons");
    const codigoGarregado = divDestino.dataset.codigo;
    const section = divDestino.closest('section');
    const link = ev.target;
    const codigo = link.closest('a').dataset.objeto;
    if (codigo !== codigoGarregado) {
        divDestino.innerHTML = '';
        const html = `
		<a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https://rastreamento.correios.com.br/app/index.php?objetos=${codigo}&title=Detalhes do Pacote nos Correios"><i class="fa fa-facebook-official fa-lg" aria-hidden="true"></i></a>
		<a target="_blank" href="https://wa.me/?text=https://rastreamento.correios.com.br/app/index.php?objetos=${codigo}"><i  class="fa fa-whatsapp fa-lg" aria-hidden="true"></i></a>
		<a target="_blank" href="https://twitter.com/share?url=https://rastreamento.correios.com.br/app/index.php?objetos=${codigo}&text=Detalhes do meu pacote objetos nos Correios&hashtags=Correios"><img class="xtwiter" src="../static/svg/icons8-twitterx.svg" aria-hidden="true" ></a>
	`;
        divDestino.innerHTML = html;
    }
    modal.abre('modalshare');
    const botaoOffSet = link.getBoundingClientRect();
    const sectionOffSet = section.getBoundingClientRect();
    const larguraJanela = window.innerWidth;
    const posicaoHorizontal = sectionOffSet.left + sectionOffSet.width;
    section.style.position = "absolute";
    section.style.left = botaoOffSet.left + (botaoOffSet.width - sectionOffSet.width) / 2 + 'px';
    section.style.top = botaoOffSet.top + botaoOffSet.height + 11 + 'px';
    divDestino.classList.remove('vertical');
    if (posicaoHorizontal > larguraJanela) {
        divDestino.classList.add('vertical');
    }
}
const mostrarDetalhes = async (evento) => {

    evento.preventDefault();
    const codObjeto = evento.currentTarget.dataset.codobjeto;
    //console.log(codObjeto);
    const td = document.getElementById(codObjeto);
    if (td === null) return false;
    let iconeClasses = td.querySelector("a>i").classList
    const divRastrosUnico = td.querySelector('div[data-name="rastrosUnicos"]');
    const divsBotoes = td.querySelectorAll('div[data-name="barra-botoes"]');


    if (iconeClasses.contains("fa-plus-circle")) {
        fecharTodasDivs();
        iconeClasses.replace("fa-plus-circle", "fa-minus-circle");
    } else {
        divRastrosUnico.classList.toggle('esconde');
        document.querySelectorAll(".barra-btns").forEach(el => el.classList.add('esconde'));
        iconeClasses.replace("fa-minus-circle", "fa-plus-circle");
        return;
    }
    if (!divRastrosUnico.innerHTML.trim().length) {

        if (!validarcampoCaptcha()) {
            iconeClasses.replace("fa-minus-circle", "fa-plus-circle");
            return false;
        }
        alerta.abre('Buscando...')
        const captcha = document.getElementById('captcha');
        const res = await fetch(`resultado.php?objeto=${codObjeto}&captcha=${captcha.value}&mqs=N`)
        const r = await res.json()
        if (r.erro) {
            iconeClasses.replace("fa-minus-circle", "fa-plus-circle");
            if (r.mensagem === 'Captcha inválido') {
                forms.setValidade(captcha, r.mensagem);
            } else {
                alerta.abre(r.mensagem, 10, 'OK')
            }
        } else {
            // carregar a div de resultado .

            const objetoss = r;
            const cabecalho = cabecalhoRastro(objetoss);
            const ul = rastroUnico.ul(objetoss, 'T');
            divRastrosUnico.innerHTML = `${cabecalho} ${ul}`;
            const btns = botoes.btnsNacRastroUnico(objetoss);
            divsBotoes.forEach(el => {
                el.innerHTML += btns
            });
            // calcular e exibir somente objetos em transito.
            // if(objetoss.situacao !== 'E') {
            // 	if (divPrazoEntrega.innerHTML.trim().toString()==='Clique no "+" para exibir'.toString()) {
            // 		alerta.abre('Buscando a data de entrega...');
            // 		const dtPrevista = await verifyDataPrevista(objetoss);
            // 		if (dtPrevista !== '') {
            // 			const cabecalhoContent = divRastrosUnico.querySelector('.cabecalho-content');
            // 			const p = `<p class="text text-head">Previsão de Entrega: ${dtPrevista}</p>`;
            // 			cabecalhoContent.insertAdjacentHTML("afterbegin", p);
            // 			divPrazoEntrega.innerHTML = dtPrevista;
            // 		}else{
            // 			divPrazoEntrega.innerHTML = 'Informação indisponível';
            // 		}
            // 	}
            // }
            const btnsLocker = td.querySelectorAll('.btnLckIcon');
            eventShowLocker(codObjeto, btnsLocker);

        }
        refreshCaptcha();
        alerta.fecha()
    }
    divRastrosUnico.classList.toggle('esconde');

    divsBotoes.forEach(el => {
        if (el.innerHTML.trim().length) {
            el.classList.toggle("esconde")
        }
    });

}
const fecharTodasDivs = () => {
    document.querySelectorAll(".barra-btns").forEach(el => el.classList.add('esconde'));
    document.querySelectorAll(".rastrosUnicos").forEach(el => el.classList.add('esconde'));
    document.querySelectorAll("div.objeto-info a>i").forEach(el => el.classList.replace("fa-minus-circle", "fa-plus-circle"));
}
const refreshCaptcha = () => {
    if (typeof window.captcha_image_audioObj !== 'undefined') captcha_image_audioObj.refresh();
    const captcha_image = document.getElementById('captcha_image');
    const captcha = document.getElementById('captcha');
    captcha.value = '';
    captcha_image.src = '../core/securimage/securimage_show.php?' + Math.random();
    captcha_image.blur();
    return false;
}
const buscaRastroCpfCnpj = (function(cpfCnpj = '') {

    const module = {};

    module._html = async () => {

        try {
            alerta.abre('Buscando...')

            const res = await fetch(`rastrocpfcnpj.php?cpfcnpj=${cpfCnpj}`);
            //const res = await fetch(`teste.php?cpfcnpj=${cpfCnpj}`);
            const r = await res.json();
            if (r.erro) {
                alerta.abre(r.mensagem, 10, 'OK')
            } else {
                alerta.fecha();
                document.getElementById('objeto').value = '';
                document.getElementById('trilha').innerHTML = `
			 <a>Portal Correios</a>
			 <a>Rastreamento</a>
			 <a>Meus Rastreamentos</a>
				`;
                //document.getElementById('titulo-pagina').innerHTML = `<h3 style='text-align: justify;'>Rastreamento</h3>`;
                document.getElementById('titulo-pagina').innerHTML =
                    `<h3 style='text-align: justify;'>Rastreamento</h3>
					<div class="print-bar noPrint">						
						<a id="print"    href='javascript:window.print()'><i  class="fa fa-print fa-lg disabled" aria-hidden="true"></i></a>
					</div>
				`;


                const keys = Object.keys(r);
                let html = "";

                const tabsRastreamento = document.querySelector("#tabs-rastreamento");
                //remove all elements into div tabsRastreamento
                while (tabsRastreamento.lastElementChild) {
                    tabsRastreamento.removeChild(tabsRastreamento.lastElementChild);
                }
                const legenda = {
                    html: function(lg) {
                        return `
							<div class="barPrint">
								<span style="text-align: justify; font-size: 17px; color: #0071AD;" >${lg}</span>
							</div>
						`;
                    }
                }
                for (const key of keys) {
                    let rr = r[key];
                    let id = `tab-${key}`;
                    let multiObjetos = rastroMulti.render(rr, id);
                    let lg = '';
                    switch (key) {
                        case 'enviadoParaVoce':
                            if (multiObjetos.length > 197) {
                                lg = legenda.html('Enviado para você');
                                const divParaVc = document.createElement("div");
                                divParaVc.id = "divParaVc";
                                divParaVc.innerHTML = `${lg}${multiObjetos}<br><br>`;
                                tabsRastreamento.insertBefore(divParaVc, null);
                                document.getElementById('divParaVc').display = 'block';
                            }
                            break;
                        case 'enviadoPorVoce':
                            if (multiObjetos.length > 197) {
                                lg = legenda.html('Enviado por você');
                                const divPorVc = document.createElement("div");
                                divPorVc.id = "divPorVc";
                                divPorVc.innerHTML = `${lg}${multiObjetos}<br><br>`;
                                tabsRastreamento.insertBefore(divPorVc, null);
                                document.getElementById('divPorVc').display = 'block';
                            }
                            break;
                        default:
                    }
                }

                $('#multirastro-tab a').on('click', function(e) {
                    e.preventDefault()
                    if (!!document.getElementById('em-transito') && !!document.getElementById('entregue')) {
                        $(this).tab('show')
                    }
                })
                const links = document.querySelectorAll('table div.objeto-info a');
                for (let i = 0; i < links.length; ++i) {
                    links[i].addEventListener('click', mostrarDetalhes);
                }
                atribuiClickShare();
            }
        } catch (err) {
            alerta.abre(err.message, 10);
        }

    };


    return {
        html: module._html,
    };

})();
const mudaVisaoRastroUnico = () => {
    document.querySelector('#ver-mais').style.display = "none";
    document.querySelector('#ver-rastro-unico').style.display = "block";
}
const imprimirRastroUnico = () => {
    const verMais = document.querySelectorAll('#ver-mais');
    if (verMais.length) {
        mudaVisaoRastroUnico();
    }
    window.print();
}
async function controladora() {

    try {
        const res = await fetch(`controle.php`);
        const r = await res.json(); //extract a JSON object from the response

        if (r.form_retorno === 'rastreamento') {
            if (r.listaObjetos.length) {
                const obj = document.getElementById('objeto');
                obj.value = r.listaObjetos;
                //busca();
            }

        } else {
            if (r.logado) {
                buscaRastroCpfCnpj.html();
            }
        }
    } catch (err) {
        alerta.abre(err.message, 10, 'OK');
    }
}
const objetoUnico = async (r) => {

    try {
        if (r.erro) {
            if (r.mensagem === 'Captcha inválido') {
                alerta.fecha();
                const captcha = document.getElementById('captcha');
                forms.setValidade(captcha, r.mensagem);
            } else {
                alerta.abre(r.mensagem, 10, 'OK')
            }

        } else {
            document.getElementById('objeto').value = "";
            //const objetoCorreio = JSON.parse(r).objetos[0];
            //const objetoCorreio = r.objetos[0];
            const objetoCorreio = r;
            const objetos = objetoCorreio.codObjeto;
            const rastroUn = rastroUnicoComVerMais(objetoCorreio, 'S');
            //const botao = await btnsRastroUnico(objetoCorreio);
            const botaoInterNac = botoes.btnsIntRastroUnico(objetoCorreio);
            const botaoNac = botoes.btnsNacRastroUnico(objetoCorreio);

            const html = `
				${rastroUn.html}
				${botaoInterNac}
				${botaoNac}
			`;

            document.getElementById('tabs-rastreamento').innerHTML = html; /*rastroUn.html;*/
            if (rastroUn.temVerMais) {
                document.getElementById('a-ver-mais').addEventListener('click', mudaVisaoRastroUnico);
            }
            const btns = document.querySelectorAll('.btnLckIcon');
            eventShowLocker(objetos, btns);

            document.getElementById('titulo-pagina').innerHTML =
                `<h3 style='text-align: justify;'>${formatoApresentacaoCodigoObjeto(objetos)}</h3>
					<div class="print-bar noPrint">
						<a id="print" href="#"><i  class="fa fa-print fa-lg" aria-hidden="true"></i></a>
					</div>				
				`;
            document.getElementById('print').addEventListener('click', () => {
                imprimirRastroUnico();
            })
            document.getElementById('trilha').innerHTML = `
				<a>Portal Correios</a>
				<a>Rastreamento</a>
				<a>${objetos}</a>
			`;
            // if(objetoCorreio.situacao !== 'E') {
            // 	const dtPrevista = await verifyDataPrevista(objetoCorreio);
            // 	if (dtPrevista !== '') {
            // 		const p = `<p class="text text-head">Previsão de Entrega: ${dtPrevista}</p>`;
            // 		const cabecalhosContent = document.querySelectorAll('.cabecalho-content');
            // 		cabecalhosContent.forEach(cabecalhoContent=>{
            // 			cabecalhoContent.insertAdjacentHTML("afterbegin", p);
            // 		})
            // 	}
            // }
            alerta.fecha()
        }
    } catch (err) {
        alerta.abre(err.message, 10, 'OK');
    }


}
const mostrarQrLock = async (objeto) => {
    try {
        const modal1 = document.getElementById('m1');
        if (!modal1.innerHTML.length || modal1.dataset.objeto !== objeto) {
            const res = await fetch(`qrLocker.php?objeto=${objeto}`);
            const r = await res.json(); //extract a JSON object from the response

            if (r.erro) {
                alerta.abre(r.mensagem, 10, 'OK')
                return;
            }

            let iframe = document.getElementById('ifLocker');
            if (!modal1.getElementsByTagName('iframe').length) {
                iframe = document.createElement('iframe');
                iframe.className = 'lckrIframe';
                iframe.id = 'ifLocker';
            }
            iframe.src = r.shortLinkQRCode;
            modal1.appendChild(iframe);
            modal1.dataset.objeto = objeto;
        }
        modal.abre('m1');
    } catch (err) {
        alerta.abre(err.message, 10);
    }
}
const eventShowLocker = (objetos, btns) => {
    //const btns = document.querySelectorAll('.btnLckIcon');
    if (btns.length) {
        btns.forEach(function(elem) {
            elem.addEventListener('click', () => {
                mostrarQrLock(objetos)
            }, false);
        })
    }
}
$(document).ready(function() {
    $(window).keydown(function(event) {
        if (event.keyCode === 13) {
            busca();
            return false;
        }
    });
    document.getElementById('b-pesquisar').addEventListener('click', () => {
        busca()
    }, false);
    document.getElementById('objeto').addEventListener('input', () => {
        validarcampoObjeto()
    }, false);
    document.getElementById('captcha_refresh_btn').addEventListener('click', () => {
        refreshCaptcha()
    }, false);
    document.getElementById('b-invoked').addEventListener('click', controladora());
});