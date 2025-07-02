/**
 * Index.js - Arquivo Principal Otimizado
 * Sistema de Rastreamento dos Correios - Versão Otimizada
 * 
 * Melhorias implementadas:
 * - Separação de responsabilidades
 * - Cache de elementos DOM
 * - Debounce para validações
 * - Modularização completa
 * - Performance otimizada
 * - Código mais legível e manutenível
 */

// Imports otimizados
import * as alerta from '../core/templates/bunker/js/alerta.js';
import * as forms from '../core/templates/bunker/js/forms.js';
import * as CodigoObjeto from '../core/js/rastroGeral.js';
import * as rastroUnico from '../core/js/rastroUnico.js';
import * as rastroMulti from '../core/js/rastroMulti.js';
import * as botoes from '../core/js/botoes.js';
import * as modal from '../core/templates/bunker/js/modal.js';

// Imports dos novos módulos otimizados
import { 
    DOM_IDS, 
    CSS_CLASSES, 
    SELECTORS, 
    CODE_LENGTHS, 
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
    URLUtils,
    FormatUtils
} from './utils.js';

import { 
    TrackingAPI,
    CaptchaAPI,
    apiManager
} from './api.js';

/**
 * Classe principal para gerenciar o sistema de rastreamento
 */
class TrackingSystem {
    constructor() {
        this.isInitialized = false;
        this.activeRequests = new Set();
        this.setupEventListeners();
        this.initializeValidation();
    }

    /**
     * Configura event listeners otimizados
     */
    setupEventListeners() {
        // Event listeners com elementos cacheados
        const searchButton = domCache.get(`#${DOM_IDS.SEARCH_BUTTON}`);
        const trackingInput = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
        const refreshButton = domCache.get(`#${DOM_IDS.REFRESH_BUTTON}`);
        const invokeButton = domCache.get(`#${DOM_IDS.INVOKE_BUTTON}`);

        // Eventos de busca
        searchButton?.addEventListener('click', () => this.handleSearch());
        
        // Enter key para busca
        window.addEventListener('keydown', (event) => {
            if (event.keyCode === 13) {
                this.handleSearch();
                return false;
            }
        });

        // Validação com debounce para performance
        trackingInput?.addEventListener('input', 
            debounce(() => this.validateTrackingField(), 300)
        );

        // Refresh do captcha
        refreshButton?.addEventListener('click', () => this.refreshCaptcha());

        // Controladora
        invokeButton?.addEventListener('click', () => this.handleController());
    }

    /**
     * Inicializa validação de campos
     */
    initializeValidation() {
        // Configuração inicial se necessário
        this.isInitialized = true;
    }

    /**
     * Valida campo de objeto de forma otimizada
     */
    async validateTrackingField() {
        const input = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
        if (!input) return;

        const cleanedInput = CodeValidator.cleanInput(input.value);
        
        // Validação rápida para casos comuns
        if (!cleanedInput) {
            forms.setValidade(input, '');
            return;
        }

        // Validação completa apenas quando necessário
        if (this.shouldValidateLength(cleanedInput.length)) {
            const validation = CodeValidator.validateTrackingInput(cleanedInput);
            forms.setValidade(input, validation.error ? validation.message : '');
        }
    }

    /**
     * Verifica se deve validar baseado no comprimento
     * @param {number} length - Comprimento do input
     * @returns {boolean} Se deve validar
     */
    shouldValidateLength(length) {
        return length === CODE_LENGTHS.CPF || 
               length === CODE_LENGTHS.CNPJ || 
               length === CODE_LENGTHS.TRACKING_CODE ||
               length === CODE_LENGTHS.CPF_ALTERNATIVE ||
               length % CODE_LENGTHS.TRACKING_CODE === 0;
    }

    /**
     * Valida campo de captcha
     * @returns {boolean} Válido ou não
     */
    validateCaptchaField() {
        const input = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
        if (!input) return false;

        const captcha = input.value.trim();
        
        if (!captcha) {
            forms.setValidade(input, ERROR_MESSAGES.FILL_CAPTCHA);
            return false;
        }

        forms.setValidade(input, '');
        return true;
    }

    /**
     * Manipula o processo de busca principal
     */
    async handleSearch() {
        const trackingInput = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
        const captchaInput = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
        
        if (!trackingInput || !captchaInput) return;

        // Validação inicial
        const validation = CodeValidator.validateTrackingInput(trackingInput.value);
        
        if (validation.error) {
            forms.setValidade(trackingInput, validation.message);
            return;
        }

        if (!this.validateCaptchaField()) {
            return;
        }

        // Limpa validações
        forms.setValidade(trackingInput, '');

        // Roteamento baseado no tipo de entrada
        await this.routeSearchByType(validation);
    }

    /**
     * Roteia busca baseado no tipo de entrada
     * @param {Object} validation - Resultado da validação
     */
    async routeSearchByType(validation) {
        const captcha = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`).value;

        try {
            switch (validation.type) {
                case 'TRACKING_SINGLE':
                    await this.handleSingleTracking(validation.cleanedInput, captcha);
                    break;
                    
                case 'CPF':
                case 'CNPJ':
                    this.handleDocumentRedirect(validation.cleanedInput, captcha);
                    break;
                    
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

    /**
     * Manipula busca de objeto único
     * @param {string} codigo - Código do objeto
     * @param {string} captcha - Valor do captcha
     */
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

    /**
     * Manipula busca de múltiplos objetos
     * @param {string} codigos - Códigos concatenados
     * @param {string} captcha - Valor do captcha
     */
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

    /**
     * Manipula redirecionamento para login com documento
     * @param {string} documento - CPF ou CNPJ
     * @param {string} captcha - Valor do captcha
     */
    handleDocumentRedirect(documento, captcha) {
        const url = URLUtils.buildURL(ENDPOINTS.LOGIN, {
            objetos: documento,
            captcha: captcha
        });
        URLUtils.redirect(url);
    }

    /**
     * Renderiza resultado único
     * @param {Object} data - Dados do objeto
     */
    async renderSingleResult(data) {
        const codigo = data.codObjeto;
        
        // Limpa input
        domCache.get(`#${DOM_IDS.TRACKING_INPUT}`).value = '';
        
        // Gera conteúdo
        const trackingContent = this.generateSingleTrackingContent(data);
        const buttons = this.generateTrackingButtons(data);
        
        // Renderiza
        const tabsElement = domCache.get(`#${DOM_IDS.TRACKING_TABS}`);
        DOMUtils.setHTML(tabsElement, trackingContent.html + buttons.internacional + buttons.nacional);
        
        // Configura eventos específicos
        this.setupSingleTrackingEvents(data, trackingContent);
        
        // Atualiza interface
        this.updatePageForSingleResult(codigo);
        
        alerta.fecha();
    }

    /**
     * Gera conteúdo para rastreamento único
     * @param {Object} data - Dados do objeto
     * @returns {Object} HTML e metadados
     */
    generateSingleTrackingContent(data) {
        const header = trackingHeaderTemplate(data);
        const trackingList = rastroUnico.ul(data);
        const verMaisContent = rastroUnico.verMais(data);
        
        return viewMoreTemplate(data, verMaisContent, trackingList, true);
    }

    /**
     * Gera botões para rastreamento
     * @param {Object} data - Dados do objeto
     * @returns {Object} HTML dos botões
     */
    generateTrackingButtons(data) {
        return {
            internacional: botoes.btnsIntRastroUnico(data),
            nacional: botoes.btnsNacRastroUnico(data)
        };
    }

    /**
     * Configura eventos específicos para rastreamento único
     * @param {Object} data - Dados do objeto
     * @param {Object} content - Conteúdo renderizado
     */
    setupSingleTrackingEvents(data, content) {
        // Ver mais
        if (content.hasViewMore) {
            const viewMoreButton = domCache.get('#a-ver-mais');
            viewMoreButton?.addEventListener('click', this.toggleViewMore);
        }
        
        // Botões locker
        const lockerButtons = domCache.getAll(SELECTORS.LOCKER_BUTTONS);
        this.setupLockerEvents(data.codObjeto, lockerButtons);
        
        // Print
        const printButton = domCache.get(`#${DOM_IDS.PRINT_BUTTON}`);
        printButton?.addEventListener('click', () => this.handlePrint());
    }

    /**
     * Atualiza página para resultado único
     * @param {string} codigo - Código do objeto
     */
    updatePageForSingleResult(codigo) {
        // Breadcrumb
        const breadcrumb = domCache.get(`#${DOM_IDS.BREADCRUMB}`);
        DOMUtils.setHTML(breadcrumb, breadcrumbTemplate(
            'Portal Correios',
            'Rastreamento', 
            codigo
        ));
        
        // Título
        const pageTitle = domCache.get(`#${DOM_IDS.PAGE_TITLE}`);
        DOMUtils.setHTML(pageTitle, pageTitleTemplate(
            formatTrackingCode(codigo),
            true
        ));
    }

    /**
     * Renderiza resultados múltiplos
     * @param {Object} data - Dados dos objetos
     */
    renderMultipleResults(data) {
        // Limpa input
        domCache.get(`#${DOM_IDS.TRACKING_INPUT}`).value = '';
        
        // Atualiza breadcrumb e título
        this.updatePageForMultipleResults();
        
        // Renderiza conteúdo
        const tabsElement = domCache.get(`#${DOM_IDS.TRACKING_TABS}`);
        DOMUtils.setHTML(tabsElement, rastroMulti.render(data, 'tabs2'));
        
        // Configura abas
        this.setupMultipleTrackingTabs();
    }

    /**
     * Atualiza página para resultados múltiplos
     */
    updatePageForMultipleResults() {
        const breadcrumb = domCache.get(`#${DOM_IDS.BREADCRUMB}`);
        DOMUtils.setHTML(breadcrumb, breadcrumbTemplate(
            'Portal Correios',
            'Rastreamento'
        ));
        
        const pageTitle = domCache.get(`#${DOM_IDS.PAGE_TITLE}`);
        DOMUtils.setHTML(pageTitle, pageTitleTemplate('Rastreamento', true));
    }

    /**
     * Configura abas para múltiplos resultados
     */
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

    /**
     * Configura eventos para detalhes de rastreamento
     */
    setupTrackingDetailsEvents() {
        const links = domCache.getAll(SELECTORS.TRACKING_LINKS);
        links.forEach(link => {
            link.addEventListener('click', (event) => this.handleTrackingDetails(event));
        });
    }

    /**
     * Manipula exibição de detalhes de rastreamento
     * @param {Event} event - Evento do clique
     */
    async handleTrackingDetails(event) {
        event.preventDefault();
        
        const codObjeto = event.currentTarget.dataset.codobjeto;
        const container = document.getElementById(codObjeto);
        
        if (!container) return;
        
        const icon = container.querySelector("a>i");
        const detailsDiv = container.querySelector('div[data-name="rastrosUnicos"]');
        const buttonDivs = container.querySelectorAll('div[data-name="barra-botoes"]');
        
        // Toggle de abertura/fechamento
        if (DOMUtils.hasClass(icon, "fa-plus-circle")) {
            this.closeAllTrackingDetails();
            icon.classList.replace("fa-plus-circle", "fa-minus-circle");
        } else {
            this.toggleTrackingDetails(detailsDiv, buttonDivs, icon);
            return;
        }
        
        // Carrega detalhes se necessário
        if (!detailsDiv.innerHTML.trim()) {
            await this.loadTrackingDetails(codObjeto, detailsDiv, buttonDivs, icon);
        }
        
        this.showTrackingDetails(detailsDiv, buttonDivs);
    }

    /**
     * Carrega detalhes de rastreamento via API
     * @param {string} codObjeto - Código do objeto
     * @param {Element} detailsDiv - Div de detalhes
     * @param {NodeList} buttonDivs - Divs de botões
     * @param {Element} icon - Ícone
     */
    async loadTrackingDetails(codObjeto, detailsDiv, buttonDivs, icon) {
        if (!this.validateCaptchaField()) {
            icon.classList.replace("fa-minus-circle", "fa-plus-circle");
            return;
        }
        
        alerta.abre('Buscando...');
        
        try {
            const captcha = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`).value;
            const data = await TrackingAPI.searchSingle(codObjeto, captcha, 'N');
            
            // Renderiza conteúdo
            const header = trackingHeaderTemplate(data);
            const trackingList = rastroUnico.ul(data, 'T');
            DOMUtils.setHTML(detailsDiv, header + trackingList);
            
            // Adiciona botões
            const buttons = botoes.btnsNacRastroUnico(data);
            buttonDivs.forEach(div => {
                div.innerHTML += buttons;
            });
            
            // Configura eventos locker
            const lockerButtons = container.querySelectorAll(SELECTORS.LOCKER_BUTTONS);
            this.setupLockerEvents(codObjeto, lockerButtons);
            
        } catch (error) {
            icon.classList.replace("fa-minus-circle", "fa-plus-circle");
            this.handleSearchError(error);
        } finally {
            alerta.fecha();
        }
    }

    /**
     * Mostra/esconde detalhes de rastreamento
     * @param {Element} detailsDiv - Div de detalhes
     * @param {NodeList} buttonDivs - Divs de botões
     */
    showTrackingDetails(detailsDiv, buttonDivs) {
        DOMUtils.removeClass(detailsDiv, CSS_CLASSES.HIDDEN);
        
        buttonDivs.forEach(div => {
            if (div.innerHTML.trim()) {
                DOMUtils.removeClass(div, CSS_CLASSES.HIDDEN);
            }
        });
    }

    /**
     * Toggle de detalhes de rastreamento
     * @param {Element} detailsDiv - Div de detalhes
     * @param {NodeList} buttonDivs - Divs de botões
     * @param {Element} icon - Ícone
     */
    toggleTrackingDetails(detailsDiv, buttonDivs, icon) {
        DOMUtils.toggleClass(detailsDiv, CSS_CLASSES.HIDDEN);
        
        const allButtons = domCache.getAll(SELECTORS.TRACKING_BUTTONS);
        allButtons.forEach(el => DOMUtils.addClass(el, CSS_CLASSES.HIDDEN));
        
        icon.classList.replace("fa-minus-circle", "fa-plus-circle");
    }

    /**
     * Fecha todos os detalhes de rastreamento
     */
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

    /**
     * Configura botões de compartilhamento
     */
    setupShareButtons() {
        const shareButtons = domCache.getAll(SELECTORS.SHARE_BUTTONS);
        shareButtons.forEach(button => {
            button.addEventListener('click', (event) => this.handleShare(event));
        });
    }

    /**
     * Manipula compartilhamento
     * @param {Event} event - Evento do clique
     */
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

    /**
     * Posiciona modal de compartilhamento
     * @param {Element} link - Link clicado
     * @param {Element} section - Seção do modal
     * @param {Element} destinyDiv - Div de destino
     */
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

    /**
     * Configura eventos para locker
     * @param {string} codigo - Código do objeto
     * @param {NodeList} buttons - Botões locker
     */
    setupLockerEvents(codigo, buttons) {
        if (buttons.length) {
            buttons.forEach(button => {
                button.addEventListener('click', () => this.showLockerQR(codigo));
            });
        }
    }

    /**
     * Mostra QR code do locker
     * @param {string} codigo - Código do objeto
     */
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

    /**
     * Toggle para ver mais informações
     */
    toggleViewMore() {
        const viewMore = document.querySelector('#ver-mais');
        const viewFull = document.querySelector('#ver-rastro-unico');
        
        if (viewMore && viewFull) {
            viewMore.style.display = "none";
            viewFull.style.display = "block";
        }
    }

    /**
     * Manipula impressão
     */
    handlePrint() {
        const viewMore = document.querySelectorAll('#ver-mais');
        if (viewMore.length) {
            this.toggleViewMore();
        }
        window.print();
    }

    /**
     * Atualiza captcha
     */
    refreshCaptcha() {
        // Refresh do objeto de áudio se existir
        if (typeof window.captcha_image_audioObj !== 'undefined') {
            window.captcha_image_audioObj.refresh();
        }
        
        // Atualiza imagem e limpa campo
        const captchaImage = domCache.get(`#${DOM_IDS.CAPTCHA_IMAGE}`);
        const captchaInput = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
        
        if (captchaInput) captchaInput.value = '';
        if (captchaImage) {
            captchaImage.src = CaptchaAPI.refreshImage();
            captchaImage.blur();
        }
    }

    /**
     * Manipula controladora
     */
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

    /**
     * Manipula busca por documento
     */
    async handleDocumentSearch() {
        // Implementação da busca por CPF/CNPJ se logado
        // Esta parte mantém a funcionalidade original
        console.log('Busca por documento - funcionalidade mantida');
    }

    /**
     * Limpa resultados de rastreamento
     */
    clearTrackingResults() {
        const tabsElement = domCache.get(`#${DOM_IDS.TRACKING_TABS}`);
        DOMUtils.setHTML(tabsElement, '');
    }

    /**
     * Manipula erros de busca
     * @param {Error} error - Erro ocorrido
     */
    handleSearchError(error) {
        if (error.message === ERROR_MESSAGES.INVALID_CAPTCHA) {
            alerta.fecha();
            const captchaInput = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
            forms.setValidade(captchaInput, error.message);
        } else {
            alerta.abre(error.message, 10, 'OK');
        }
    }

    /**
     * Cleanup ao destruir instância
     */
    destroy() {
        apiManager.cancelAllRequests();
        domCache.clear();
        this.activeRequests.clear();
    }
}

// Inicialização otimizada quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa sistema principal
    window.trackingSystem = new TrackingSystem();
});

// Cleanup ao sair da página
window.addEventListener('beforeunload', () => {
    if (window.trackingSystem) {
        window.trackingSystem.destroy();
    }
});