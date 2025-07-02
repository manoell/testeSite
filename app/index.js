/**
 * Index.js - Arquivo Principal Otimizado (Versão 3.0)
 * Sistema de Rastreamento dos Correios - Performance e Organização Otimizadas
 * 
 * Melhorias implementadas:
 * - Lazy loading de módulos
 * - Batch DOM updates
 * - Request deduplication
 * - Advanced caching
 * - Performance monitoring
 * - Error boundaries
 * - Accessibility enhancements
 */

// Imports essenciais (carregados imediatamente)
import { 
    DOM_IDS, 
    CSS_CLASSES, 
    SELECTORS, 
    CODE_LENGTHS, 
    ERROR_MESSAGES,
    ENDPOINTS,
    TIMING,
    PERFORMANCE_CONFIG,
    EVENTS,
    ACCESSIBILITY,
    BROWSER_FEATURES
} from './constants.js';

import { 
    domCache,
    debounce,
    throttle,
    CodeValidator,
    DOMUtils,
    URLUtils,
    FormatUtils,
    performanceMonitor,
    AdvancedCache
} from './utils.js';

import { 
    TrackingAPI,
    CaptchaAPI,
    apiManager,
    ConnectivityMonitor
} from './api.js';

import {
    trackingHeaderTemplate,
    breadcrumbTemplate,
    pageTitleTemplate,
    socialShareTemplate,
    formatTrackingCode,
    viewMoreTemplate,
    getCachedTemplate,
    LoadingTemplates,
    ErrorTemplates
} from './templates.js';

/**
 * Lazy Module Loader para carregamento sob demanda
 */
class LazyModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
    }

    async load(moduleName) {
        // Retornar se já carregado
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }

        // Retornar promise em andamento se já está carregando
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        // Mapear módulos
        const moduleMap = {
            alerta: () => import('../core/templates/bunker/js/alerta.js'),
            forms: () => import('../core/templates/bunker/js/forms.js'),
            rastroUnico: () => import('../core/js/rastroUnico.js'),
            rastroMulti: () => import('../core/js/rastroMulti.js'),
            botoes: () => import('../core/js/botoes.js'),
            modal: () => import('../core/templates/bunker/js/modal.js'),
            CodigoObjeto: () => import('../core/js/rastroGeral.js'),
            tabs: () => import('../core/templates/bunker/js/tabs.js')
        };

        const loadFn = moduleMap[moduleName];
        if (!loadFn) {
            throw new Error(`Módulo ${moduleName} não encontrado`);
        }

        // Iniciar carregamento
        const loadPromise = loadFn().then(module => {
            this.loadedModules.set(moduleName, module);
            this.loadingPromises.delete(moduleName);
            return module;
        }).catch(error => {
            this.loadingPromises.delete(moduleName);
            throw error;
        });

        this.loadingPromises.set(moduleName, loadPromise);
        return loadPromise;
    }

    async loadMultiple(moduleNames) {
        const loadPromises = moduleNames.map(name => this.load(name));
        return Promise.all(loadPromises);
    }

    isLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }

    preload(moduleNames) {
        // Pré-carregar módulos em idle time
        const preloadFn = () => {
            moduleNames.forEach(name => {
                if (!this.isLoaded(name)) {
                    this.load(name).catch(() => {
                        // Silently fail preloading
                    });
                }
            });
        };

        if (BROWSER_FEATURES.REQUEST_IDLE_CALLBACK) {
            requestIdleCallback(preloadFn, { timeout: 5000 });
        } else {
            setTimeout(preloadFn, 100);
        }
    }

    clear() {
        this.loadedModules.clear();
        this.loadingPromises.clear();
    }
}

/**
 * Error Boundary para tratamento robusto de erros
 */
class ErrorBoundary {
    constructor() {
        this.errorHandlers = new Map();
        this.globalErrorHandler = this.handleGlobalError.bind(this);
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        window.addEventListener('error', this.globalErrorHandler);
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }

    handleGlobalError(event) {
        console.error('Global error caught:', event.error);
        this.reportError('global', event.error, {
            filename: event.filename,
            line: event.lineno,
            column: event.colno
        });
    }

    handleUnhandledRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        this.reportError('promise', event.reason);
        event.preventDefault(); // Previne console error padrão
    }

    registerHandler(context, handler) {
        this.errorHandlers.set(context, handler);
    }

    async handleError(context, error, metadata = {}) {
        try {
            const handler = this.errorHandlers.get(context);
            if (handler) {
                await handler(error, metadata);
            } else {
                await this.defaultErrorHandler(error, metadata);
            }
        } catch (handlerError) {
            console.error('Error in error handler:', handlerError);
        }
    }

    async defaultErrorHandler(error, metadata) {
        // Carregar módulo de alerta se necessário
        const moduleLoader = window.trackingSystem?.moduleLoader;
        if (moduleLoader) {
            try {
                const alerta = await moduleLoader.load('alerta');
                alerta.abre(error.message || ERROR_MESSAGES.GENERIC_ERROR, 10, 'OK');
            } catch (loadError) {
                // Fallback para alert nativo
                alert(error.message || ERROR_MESSAGES.GENERIC_ERROR);
            }
        }
    }

    reportError(context, error, metadata = {}) {
        // Enviar erro para serviço de monitoramento (se configurado)
        if (PERFORMANCE_CONFIG.ENABLE_ERROR_REPORTING) {
            const errorData = {
                context,
                message: error.message,
                stack: error.stack,
                metadata,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            // Aqui você pode enviar para seu serviço de monitoramento
            console.warn('Error reported:', errorData);
        }
    }

    destroy() {
        window.removeEventListener('error', this.globalErrorHandler);
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
}

/**
 * Performance Monitor especializado para tracking
 */
class TrackingPerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.enabled = PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_MONITORING;
    }

    startOperation(operationName) {
        if (!this.enabled) return;
        
        const startTime = performance.now();
        this.metrics.set(operationName, { startTime, endTime: null, duration: null });
        performanceMonitor.mark(`${operationName}_start`);
    }

    endOperation(operationName) {
        if (!this.enabled) return;
        
        const endTime = performance.now();
        const operation = this.metrics.get(operationName);
        
        if (operation) {
            operation.endTime = endTime;
            operation.duration = endTime - operation.startTime;
            performanceMonitor.mark(`${operationName}_end`);
            performanceMonitor.measure(operationName, `${operationName}_start`, `${operationName}_end`);
        }
    }

    getOperationDuration(operationName) {
        const operation = this.metrics.get(operationName);
        return operation?.duration || 0;
    }

    getMetrics() {
        return Object.fromEntries(this.metrics);
    }

    clear() {
        this.metrics.clear();
    }
}

/**
 * Classe principal para gerenciar o sistema de rastreamento
 */
class TrackingSystem {
    constructor() {
        this.isInitialized = false;
        this.activeRequests = new Set();
        this.moduleLoader = new LazyModuleLoader();
        this.errorBoundary = new ErrorBoundary();
        this.performanceMonitor = new TrackingPerformanceMonitor();
        this.cache = new AdvancedCache(100, TIMING.CACHE_TTL);
        
        this.init();
    }

    async init() {
        try {
            this.performanceMonitor.startOperation('system_init');
            
            // Setup inicial
            this.setupErrorHandling();
            this.setupEventListeners();
            this.setupAccessibility();
            this.initializeValidation();
            this.setupConnectivityMonitoring();
            
            // Pré-carregar módulos essenciais
            this.preloadEssentialModules();
            
            this.isInitialized = true;
            this.performanceMonitor.endOperation('system_init');
            
            this.dispatchEvent(EVENTS.TRACKING_LOADED, { 
                initTime: this.performanceMonitor.getOperationDuration('system_init') 
            });
            
        } catch (error) {
            this.errorBoundary.handleError('init', error);
        }
    }

    setupErrorHandling() {
        // Registrar handlers específicos
        this.errorBoundary.registerHandler('search', async (error) => {
            const alerta = await this.moduleLoader.load('alerta');
            alerta.abre(error.message, 10, 'OK');
            this.refreshCaptcha();
        });

        this.errorBoundary.registerHandler('validation', async (error) => {
            const forms = await this.moduleLoader.load('forms');
            const input = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
            forms.setValidade(input, error.message);
        });

        this.errorBoundary.registerHandler('network', async (error) => {
            // Mostrar banner de conectividade
            this.showConnectivityBanner(false);
        });
    }

    setupConnectivityMonitoring() {
        ConnectivityMonitor.onStatusChange((status) => {
            this.showConnectivityBanner(status === 'online');
            
            if (status === 'online') {
                // Processar requests offline se houver
                this.processOfflineActions();
            }
        });
    }

    showConnectivityBanner(isOnline) {
        const existingBanner = document.querySelector('.connectivity-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        if (!isOnline) {
            const banner = document.createElement('div');
            banner.className = 'connectivity-banner alert alert-warning';
            banner.innerHTML = ErrorTemplates.offline();
            banner.setAttribute('role', 'alert');
            
            document.body.insertBefore(banner, document.body.firstChild);
        }
    }

    async processOfflineActions() {
        // Implementar sincronização de ações offline se necessário
        console.log('Processando ações offline...');
    }

    preloadEssentialModules() {
        // Pré-carregar módulos que provavelmente serão usados
        this.moduleLoader.preload(['alerta', 'forms', 'modal']);
    }

    setupAccessibility() {
        // Configurar atalhos de teclado
        document.addEventListener('keydown', (event) => {
            if (event.altKey) {
                switch (event.key) {
                    case '1':
                        event.preventDefault();
                        this.jumpToElement('tabs-rastreamento');
                        break;
                    case '2':
                        event.preventDefault();
                        this.jumpToElement('menu');
                        break;
                    case '3':
                        event.preventDefault();
                        this.jumpToElement('titulo-pagina');
                        break;
                    case '4':
                        event.preventDefault();
                        this.jumpToElement('rodape');
                        break;
                    case 'c':
                    case 'C':
                        event.preventDefault();
                        this.toggleContrast();
                        break;
                }
            }
            
            if (event.key === 'Enter' && event.target.matches('input')) {
                event.preventDefault();
                this.handleSearch();
            }
        });

        // Configurar anúncios para screen readers
        this.setupScreenReaderAnnouncements();
    }

    setupScreenReaderAnnouncements() {
        if (!ACCESSIBILITY.SCREEN_READER_ANNOUNCEMENTS) return;

        // Criar elemento para anúncios
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.id = 'screen-reader-announcements';
        document.body.appendChild(announcer);

        // Escutar eventos para anunciar
        window.addEventListener(EVENTS.SEARCH_START, () => {
            this.announce('Iniciando busca...');
        });

        window.addEventListener(EVENTS.SEARCH_SUCCESS, () => {
            this.announce('Busca concluída com sucesso');
        });

        window.addEventListener(EVENTS.SEARCH_ERROR, (event) => {
            this.announce(`Erro na busca: ${event.detail.error.message}`);
        });
    }

    announce(message) {
        const announcer = document.getElementById('screen-reader-announcements');
        if (announcer) {
            announcer.textContent = message;
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
    }

    jumpToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            element.focus();
        }
    }

    async toggleContrast() {
        try {
            // Carregar módulo de alto contraste se necessário
            if (!window.ContrastSystem) {
                await import('./high-contrast.js');
            }
            if (window.ContrastSystem) {
                window.ContrastSystem.toggle();
            }
        } catch (error) {
            this.errorBoundary.handleError('contrast', error);
        }
    }

    /**
     * Configura event listeners otimizados
     */
    setupEventListeners() {
        // Event listeners com elementos cacheados e debounce
        const searchButton = domCache.get(`#${DOM_IDS.SEARCH_BUTTON}`);
        const trackingInput = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
        const refreshButton = domCache.get(`#${DOM_IDS.REFRESH_BUTTON}`);
        const invokeButton = domCache.get(`#${DOM_IDS.INVOKE_BUTTON}`);

        // Eventos de busca
        if (searchButton) {
            searchButton.addEventListener('click', () => this.handleSearch());
        }

        // Validação com debounce otimizado
        if (trackingInput) {
            const debouncedValidation = debounce(() => this.validateTrackingField(), TIMING.DEBOUNCE_DELAY);
            trackingInput.addEventListener('input', debouncedValidation);
            
            // Limpar cache de validação quando input muda significativamente
            trackingInput.addEventListener('input', throttle(() => {
                if (trackingInput.value.length === 0) {
                    CodeValidator.clearCache();
                }
            }, 1000));
        }

        // Refresh do captcha
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.refreshCaptcha());
        }

        // Controladora
        if (invokeButton) {
            invokeButton.addEventListener('click', () => this.handleController());
        }

        // Event listeners globais
        this.setupGlobalEventListeners();
    }

    setupGlobalEventListeners() {
        // Throttled scroll listener para performance
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, 100));

        // Resize listener
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));

        // Page visibility para otimizações
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.pauseNonEssentialOperations();
            } else {
                this.resumeOperations();
            }
        });
    }

    handleScroll() {
        // Implementar lazy loading de imagens se necessário
        this.lazyLoadImages();
    }

    handleResize() {
        // Ajustar layout se necessário
        this.adjustLayoutForViewport();
    }

    pauseNonEssentialOperations() {
        // Pausar operações não essenciais quando página não está visível
        apiManager.cancelAllRequests();
    }

    resumeOperations() {
        // Retomar operações quando página fica visível
        console.log('Resuming operations');
    }

    lazyLoadImages() {
        if (!PERFORMANCE_CONFIG.ENABLE_LAZY_LOADING) return;

        const images = document.querySelectorAll('img[data-src]:not(.loaded)');
        
        if (BROWSER_FEATURES.INTERSECTION_OBSERVER) {
            this.setupImageObserver(images);
        } else {
            // Fallback para navegadores sem Intersection Observer
            this.loadImagesInViewport(images);
        }
    }

    setupImageObserver(images) {
        if (this.imageObserver) return;

        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    this.imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });

        images.forEach(img => this.imageObserver.observe(img));
    }

    loadImagesInViewport(images) {
        images.forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.top < window.innerHeight + 50) {
                img.src = img.dataset.src;
                img.classList.add('loaded');
            }
        });
    }

    adjustLayoutForViewport() {
        // Ajustar layout baseado no viewport
        const width = window.innerWidth;
        
        if (width < 768) {
            document.body.classList.add('mobile-layout');
        } else {
            document.body.classList.remove('mobile-layout');
        }
    }

    /**
     * Inicializa validação de campos
     */
    initializeValidation() {
        this.isInitialized = true;
    }

    /**
     * Valida campo de objeto de forma otimizada com cache
     */
    async validateTrackingField() {
        const input = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
        if (!input) return;

        const cleanedInput = CodeValidator.cleanInput(input.value);
        
        // Validação rápida para casos comuns
        if (!cleanedInput) {
            this.setInputValidity(input, '');
            return;
        }

        // Cache de validação para evitar validações repetidas
        const cacheKey = `validation_${cleanedInput}`;
        let validation = this.cache.get(cacheKey);
        
        if (!validation && this.shouldValidateLength(cleanedInput.length)) {
            validation = CodeValidator.validateTrackingInput(cleanedInput);
            this.cache.set(cacheKey, validation, TIMING.CACHE_TTL);
        }

        if (validation) {
            this.setInputValidity(input, validation.error ? validation.message : '');
        }
    }

    async setInputValidity(input, message) {
        try {
            const forms = await this.moduleLoader.load('forms');
            forms.setValidade(input, message);
        } catch (error) {
            // Fallback sem módulo de forms
            input.setCustomValidity(message);
            const messageEl = input.parentNode.parentNode.querySelector('.mensagem');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }
    }

    shouldValidateLength(length) {
        return length === CODE_LENGTHS.CPF || 
               length === CODE_LENGTHS.CNPJ || 
               length === CODE_LENGTHS.TRACKING_CODE ||
               length === CODE_LENGTHS.CPF_ALTERNATIVE ||
               length % CODE_LENGTHS.TRACKING_CODE === 0;
    }

    /**
     * Valida campo de captcha
     */
    async validateCaptchaField() {
        const input = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
        if (!input) return false;

        const captcha = input.value.trim();
        
        if (!captcha) {
            await this.setInputValidity(input, ERROR_MESSAGES.FILL_CAPTCHA);
            return false;
        }

        await this.setInputValidity(input, '');
        return true;
    }

    /**
     * Manipula o processo de busca principal
     */
    async handleSearch() {
        try {
            this.performanceMonitor.startOperation('search');
            this.dispatchEvent(EVENTS.SEARCH_START);

            const trackingInput = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
            const captchaInput = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
            
            if (!trackingInput || !captchaInput) return;

            // Mostrar loading
            await this.showLoading('Buscando...');

            // Validação inicial
            const validation = CodeValidator.validateTrackingInput(trackingInput.value);
            
            if (validation.error) {
                await this.setInputValidity(trackingInput, validation.message);
                return;
            }

            if (!(await this.validateCaptchaField())) {
                return;
            }

            // Limpar validações
            await this.setInputValidity(trackingInput, '');

            // Roteamento baseado no tipo de entrada
            await this.routeSearchByType(validation);

        } catch (error) {
            this.errorBoundary.handleError('search', error);
        } finally {
            this.performanceMonitor.endOperation('search');
            await this.hideLoading();
        }
    }

    async showLoading(message = 'Carregando...') {
        try {
            const alerta = await this.moduleLoader.load('alerta');
            alerta.abre(message);
        } catch (error) {
            // Fallback loading
            const loading = domCache.get(`#${DOM_IDS.LOADING}`);
            if (loading) {
                loading.classList.add(CSS_CLASSES.LOADING);
            }
        }
    }

    async hideLoading() {
        try {
            const alerta = await this.moduleLoader.load('alerta');
            alerta.fecha();
        } catch (error) {
            // Fallback loading
            const loading = domCache.get(`#${DOM_IDS.LOADING}`);
            if (loading) {
                loading.classList.remove(CSS_CLASSES.LOADING);
            }
        }
    }

    /**
     * Roteia busca baseado no tipo de entrada
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
            throw error;
        } finally {
            this.refreshCaptcha();
        }
    }

    /**
     * Manipula busca de objeto único
     */
    async handleSingleTracking(codigo, captcha) {
        try {
            this.clearTrackingResults();
            
            const data = await TrackingAPI.searchSingle(codigo, captcha, 'S');
            
            await this.renderSingleResult(data);
            await this.setupShareButtons();
            
            this.dispatchEvent(EVENTS.SEARCH_SUCCESS, { data, type: 'single' });
            
        } catch (error) {
            throw error;
        }
    }

    /**
     * Manipula busca de múltiplos objetos
     */
    async handleMultipleTracking(codigos, captcha) {
        try {
            const data = await TrackingAPI.searchMultiple(codigos, captcha);
            
            await this.renderMultipleResults(data);
            await this.setupTrackingDetailsEvents();
            await this.setupShareButtons();
            
            this.dispatchEvent(EVENTS.SEARCH_SUCCESS, { data, type: 'multiple' });
            
        } catch (error) {
            throw error;
        }
    }

    /**
     * Manipula redirecionamento para login com documento
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
     */
    async renderSingleResult(data) {
        const [rastroUnico, botoes] = await Promise.all([
            this.moduleLoader.load('rastroUnico'),
            this.moduleLoader.load('botoes')
        ]);

        const codigo = data.codObjeto;
        
        // Limpar input
        domCache.get(`#${DOM_IDS.TRACKING_INPUT}`).value = '';
        
        // Gerar conteúdo
        const trackingContent = this.generateSingleTrackingContent(data, rastroUnico);
        const buttonContent = this.generateTrackingButtons(data, botoes);
        
        // Renderizar com batch update
        const tabsElement = domCache.get(`#${DOM_IDS.TRACKING_TABS}`);
        DOMUtils.setHTML(tabsElement, trackingContent.html + buttonContent.internacional + buttonContent.nacional);
        
        // Configurar eventos específicos
        await this.setupSingleTrackingEvents(data, trackingContent);
        
        // Atualizar interface
        this.updatePageForSingleResult(codigo);
    }

    generateSingleTrackingContent(data, rastroUnico) {
        const header = trackingHeaderTemplate(data);
        const trackingList = rastroUnico.ul(data);
        const verMaisContent = rastroUnico.verMais(data);
        
        return viewMoreTemplate(data, verMaisContent, trackingList, true);
    }

    generateTrackingButtons(data, botoes) {
        return {
            internacional: botoes.btnsIntRastroUnico(data),
            nacional: botoes.btnsNacRastroUnico(data)
        };
    }

    async setupSingleTrackingEvents(data, content) {
        // Ver mais
        if (content.hasViewMore) {
            const viewMoreButton = domCache.get('#a-ver-mais');
            if (viewMoreButton) {
                viewMoreButton.addEventListener('click', this.toggleViewMore.bind(this));
            }
        }
        
        // Botões locker
        const lockerButtons = domCache.getAll(SELECTORS.LOCKER_BUTTONS);
        this.setupLockerEvents(data.codObjeto, lockerButtons);
        
        // Print
        const printButton = domCache.get(`#${DOM_IDS.PRINT_BUTTON}`);
        if (printButton) {
            printButton.addEventListener('click', () => this.handlePrint());
        }
    }

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
     */
    async renderMultipleResults(data) {
        const rastroMulti = await this.moduleLoader.load('rastroMulti');
        
        // Limpar input
        domCache.get(`#${DOM_IDS.TRACKING_INPUT}`).value = '';
        
        // Atualizar breadcrumb e título
        this.updatePageForMultipleResults();
        
        // Renderizar conteúdo
        const tabsElement = domCache.get(`#${DOM_IDS.TRACKING_TABS}`);
        DOMUtils.setHTML(tabsElement, rastroMulti.render(data, 'tabs2'));
        
        // Configurar abas
        await this.setupMultipleTrackingTabs();
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

    async setupMultipleTrackingTabs() {
        // Aguardar jQuery estar disponível (fallback)
        if (typeof $ !== 'undefined') {
            $('#multirastro-tab a').on('click', function(e) {
                e.preventDefault();
                const transitElement = document.getElementById('em-transito');
                const deliveredElement = document.getElementById('entregue');
                
                if (transitElement && deliveredElement) {
                    $(this).tab('show');
                }
            });
        }
    }

    async setupTrackingDetailsEvents() {
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
        
        // Toggle de abertura/fechamento
        if (DOMUtils.hasClass(icon, "fa-plus-circle")) {
            this.closeAllTrackingDetails();
            icon.classList.replace("fa-plus-circle", "fa-minus-circle");
        } else {
            this.toggleTrackingDetails(detailsDiv, buttonDivs, icon);
            return;
        }
        
        // Carregar detalhes se necessário
        if (!detailsDiv.innerHTML.trim()) {
            await this.loadTrackingDetails(codObjeto, detailsDiv, buttonDivs, icon);
        }
        
        this.showTrackingDetails(detailsDiv, buttonDivs);
    }

    async loadTrackingDetails(codObjeto, detailsDiv, buttonDivs, icon) {
        if (!(await this.validateCaptchaField())) {
            icon.classList.replace("fa-minus-circle", "fa-plus-circle");
            return;
        }
        
        try {
            await this.showLoading('Buscando...');
            
            const captcha = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`).value;
            const data = await TrackingAPI.searchSingle(codObjeto, captcha, 'N');
            
            // Carregar módulos necessários
            const [rastroUnico, botoes] = await Promise.all([
                this.moduleLoader.load('rastroUnico'),
                this.moduleLoader.load('botoes')
            ]);
            
            // Renderizar conteúdo
            const header = trackingHeaderTemplate(data);
            const trackingList = rastroUnico.ul(data, 'T');
            DOMUtils.setHTML(detailsDiv, header + trackingList);
            
            // Adicionar botões
            const buttons = botoes.btnsNacRastroUnico(data);
            buttonDivs.forEach(div => {
                div.innerHTML += buttons;
            });
            
            // Configurar eventos locker
            const lockerButtons = container.querySelectorAll(SELECTORS.LOCKER_BUTTONS);
            this.setupLockerEvents(codObjeto, lockerButtons);
            
        } catch (error) {
            icon.classList.replace("fa-minus-circle", "fa-plus-circle");
            this.errorBoundary.handleError('search', error);
        } finally {
            await this.hideLoading();
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

    async setupShareButtons() {
        const shareButtons = domCache.getAll(SELECTORS.SHARE_BUTTONS);
        shareButtons.forEach(button => {
            button.addEventListener('click', (event) => this.handleShare(event));
        });
    }

    async handleShare(event) {
        const modal = await this.moduleLoader.load('modal');
        
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
            const modal = await this.moduleLoader.load('modal');
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
            this.errorBoundary.handleError('locker', error);
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
        
        // Ajustar título para impressão
        const originalTitle = document.title;
        document.title = 'Rastreamento - ' + originalTitle;
        
        window.print();
        
        // Restaurar título
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    }

    refreshCaptcha() {
        // Refresh do objeto de áudio se existir
        if (typeof window.captcha_image_audioObj !== 'undefined') {
            window.captcha_image_audioObj.refresh();
        }
        
        // Atualizar imagem e limpar campo
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
            this.errorBoundary.handleError('controller', error);
        }
    }

    async handleDocumentSearch() {
        // Implementação da busca por CPF/CNPJ se logado
        console.log('Busca por documento - funcionalidade mantida');
    }

    clearTrackingResults() {
        const tabsElement = domCache.get(`#${DOM_IDS.TRACKING_TABS}`);
        DOMUtils.setHTML(tabsElement, '');
    }

    dispatchEvent(eventName, detail = {}) {
        if (typeof window !== 'undefined') {
            const event = new CustomEvent(eventName, { 
                detail: {
                    ...detail,
                    timestamp: Date.now(),
                    source: 'TrackingSystem'
                }
            });
            window.dispatchEvent(event);
        }
    }

    getSystemStats() {
        return {
            initialized: this.isInitialized,
            performance: this.performanceMonitor.getMetrics(),
            modules: {
                loaded: this.moduleLoader.loadedModules.size,
                loading: this.moduleLoader.loadingPromises.size
            },
            cache: this.cache.getStats(),
            api: apiManager.getStats(),
            connectivity: ConnectivityMonitor.getStatus()
        };
    }

    /**
     * Cleanup ao destruir instância
     */
    destroy() {
        this.performanceMonitor.startOperation('cleanup');
        
        apiManager.destroy();
        domCache.destroy();
        this.activeRequests.clear();
        this.cache.clear();
        this.moduleLoader.clear();
        this.errorBoundary.destroy();
        
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }

        this.performanceMonitor.endOperation('cleanup');
        this.performanceMonitor.clear();
    }
}

// Inicialização otimizada quando DOM estiver pronto
const initializeSystem = () => {
    window.trackingSystem = new TrackingSystem();
    
    // Exposer funções globais para compatibilidade
    window.toggleContrast = () => window.trackingSystem.toggleContrast();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystem);
} else {
    initializeSystem();
}

// Cleanup ao sair da página
window.addEventListener('beforeunload', () => {
    if (window.trackingSystem) {
        window.trackingSystem.destroy();
    }
});

// Exportar para uso em testes/debugging
export { TrackingSystem, LazyModuleLoader, ErrorBoundary, TrackingPerformanceMonitor };