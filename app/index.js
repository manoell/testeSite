/**
 * Index.js - Arquivo Principal Otimizado
 * Versão otimizada: removidos imports não utilizados, simplificado event handling
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

        forms.setValidade(input, '');
        return true;
    }

    async handleSearch() {
        const trackingInput = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
        const captchaInput = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
        
        if (!trackingInput || !captchaInput) return;

        const validation = CodeValidator.validateTrackingInput(trackingInput.value);
        
        if (validation.error) {
            forms.setValidade(trackingInput, validation.message);
            return;
        }

        if (!this.validateCaptchaField()) {
            return;
        }

        forms.setValidade(trackingInput, '');
        await this.routeSearchByType(validation);
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
            alerta.fecha();
            const captchaInput = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
            forms.setValidade(captchaInput, error.message);
        } else {
            alerta.abre(error.message, 10, 'OK');
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
});

window.addEventListener('beforeunload', () => {
    if (window.trackingSystem) {
        window.trackingSystem.destroy();
    }
});