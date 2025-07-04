/**
 * main.js - Sistema de Rastreamento Otimizado
 * Versão consolidada: JavaScript essencial para funcionalidade completa
 */

// === CONFIGURAÇÕES GLOBAIS ===
const CONFIG = {
    TIMEOUT: 30000,
    PATTERNS: {
        TRACKING_CODE: /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/,
        CPF: /^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2}$/,
        CNPJ: /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/,
        CLEAN_INPUT: /[-,;. ]/g
    },
    INVALID_DOCS: {
        CPF: ['00000000000', '11111111111', '22222222222', '33333333333', '44444444444', '55555555555', '66666666666', '77777777777', '88888888888', '99999999999'],
        CNPJ: ['00000000000000', '11111111111111', '22222222222222', '33333333333333', '44444444444444', '55555555555555', '66666666666666', '77777777777777', '88888888888888', '99999999999999']
    }
};

// === CACHE DE ELEMENTOS DOM ===
const DOM = {
    form: document.getElementById('form-rastreamento'),
    objetoInput: document.getElementById('objeto'),
    captchaInput: document.getElementById('captcha'),
    captchaImage: document.getElementById('captcha_image'),
    searchButton: document.getElementById('b-pesquisar'),
    refreshButton: document.getElementById('captcha_refresh_btn'),
    resultsArea: document.getElementById('tabs-rastreamento'),
    loading: document.getElementById('loading'),
    alerta: document.getElementById('alerta'),
    alertaMsg: document.querySelector('#alerta .msg'),
    alertaAct: document.querySelector('#alerta .act')
};

// === SISTEMA DE ACESSIBILIDADE ===
class AccessibilitySystem {
    constructor() {
        this.menuButton = document.querySelector('#acessibilidade a');
        this.dropdown = document.querySelector('#acess-drop-down');
        this.closeButton = document.querySelector('#acess-drop-down .close');
        this.hamburger = document.querySelector('#menu .hamburger');
        this.menuContainer = document.querySelector('#menu > .menu');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeContrast();
        this.initializeNavigation();
    }

    setupEventListeners() {
        // Menu de acessibilidade
        this.menuButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleAccessibilityMenu();
        });

        this.closeButton?.addEventListener('click', () => this.closeAccessibilityMenu());
        this.dropdown?.addEventListener('click', (e) => e.stopPropagation());
        document.body.addEventListener('click', () => this.closeAccessibilityMenu());

        // Menu hambúrguer
        this.hamburger?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMainMenu();
        });

        // Teclas de atalho
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    toggleAccessibilityMenu() {
        this.menuButton.classList.toggle('aberto');
        this.dropdown.classList.toggle('aberto');
    }

    closeAccessibilityMenu() {
        this.menuButton?.classList.remove('aberto');
        this.dropdown?.classList.remove('aberto');
    }

    toggleMainMenu() {
        const isOpen = this.hamburger.classList.contains('aberto');
        
        if (isOpen) {
            this.hamburger.classList.remove('aberto');
            this.menuContainer.classList.add('oculto');
            document.body.classList.remove('menu-aberto');
        } else {
            this.hamburger.classList.add('aberto');
            this.menuContainer.classList.remove('oculto');
            document.body.classList.add('menu-aberto');
        }
    }

    handleKeyboardShortcuts(e) {
        // Alt + 1: Ir para conteúdo
        if (e.altKey && e.key === '1') {
            e.preventDefault();
            this.jumpTo('tabs-rastreamento');
        }
        // Alt + 2: Ir para menu
        if (e.altKey && e.key === '2') {
            e.preventDefault();
            this.jumpTo('menu');
        }
        // Alt + 3: Ir para busca
        if (e.altKey && e.key === '3') {
            e.preventDefault();
            this.jumpTo('titulo-pagina');
        }
        // Alt + 4: Ir para rodapé
        if (e.altKey && e.key === '4') {
            e.preventDefault();
            this.jumpTo('rodape');
        }
        // Escape: Fechar menus
        if (e.key === 'Escape') {
            this.closeAccessibilityMenu();
        }
    }

    jumpTo(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        this.closeAccessibilityMenu();
    }

    initializeContrast() {
        // Função global para toggle do contraste
        window.toggleContrast = () => {
            const isContrast = document.body.classList.contains('contrast');
            
            if (isContrast) {
                document.body.classList.remove('contrast');
                localStorage.setItem('contrastState', 'false');
            } else {
                document.body.classList.add('contrast');
                localStorage.setItem('contrastState', 'true');
            }
        };

        // Aplicar contraste salvo
        const savedContrast = localStorage.getItem('contrastState');
        if (savedContrast === 'true') {
            document.body.classList.add('contrast');
        }
    }

    initializeNavigation() {
        // Função global para navegação
        window.irPara = {
            jumpTo: (anchor) => this.jumpTo(anchor),
            fechaMenuAcessibilidade: () => this.closeAccessibilityMenu()
        };
    }
}

// === SISTEMA DE VALIDAÇÃO ===
class ValidationSystem {
    static cleanInput(input) {
        return input ? input.replace(CONFIG.PATTERNS.CLEAN_INPUT, '').toUpperCase() : '';
    }

    static validateCPF(cpf) {
        const cleanCPF = cpf.replace(/\D/g, '');
        
        if (cleanCPF.length !== 11 || CONFIG.INVALID_DOCS.CPF.includes(cleanCPF)) {
            return false;
        }

        // Validação do dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
        }
        
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        
        return remainder === parseInt(cleanCPF.charAt(10));
    }

    static validateCNPJ(cnpj) {
        const cleanCNPJ = cnpj.replace(/\D/g, '');
        
        if (cleanCNPJ.length !== 14 || CONFIG.INVALID_DOCS.CNPJ.includes(cleanCNPJ)) {
            return false;
        }

        // Validação dos dígitos verificadores
        let size = cleanCNPJ.length - 2;
        let numbers = cleanCNPJ.substring(0, size);
        let digits = cleanCNPJ.substring(size);
        let sum = 0;
        let pos = size - 7;
        
        for (let i = size; i >= 1; i--) {
            sum += numbers.charAt(size - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) return false;

        size = size + 1;
        numbers = cleanCNPJ.substring(0, size);
        sum = 0;
        pos = size - 7;
        
        for (let i = size; i >= 1; i--) {
            sum += numbers.charAt(size - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        return result === parseInt(digits.charAt(1));
    }

    static validateTrackingCode(code) {
        return CONFIG.PATTERNS.TRACKING_CODE.test(code);
    }

    static validateInput(input) {
        const cleaned = this.cleanInput(input);
        
        if (!cleaned) {
            return { valid: false, message: 'Campo obrigatório' };
        }

        // Detectar tipo baseado no comprimento
        const length = cleaned.length;
        
        if (length === 11) {
            // CPF
            const cleanedCPF = input.replace(/\D/g, '');
            if (this.validateCPF(cleanedCPF)) {
                return { valid: true, type: 'CPF', cleaned: cleanedCPF };
            } else {
                return { valid: false, message: 'CPF inválido' };
            }
        } else if (length === 14) {
            // CNPJ  
            const cleanedCNPJ = input.replace(/\D/g, '');
            if (this.validateCNPJ(cleanedCNPJ)) {
                return { valid: true, type: 'CNPJ', cleaned: cleanedCNPJ };
            } else {
                return { valid: false, message: 'CNPJ inválido' };
            }
        } else if (length === 13) {
            // Código de rastreamento
            if (this.validateTrackingCode(cleaned)) {
                return { valid: true, type: 'TRACKING', cleaned: cleaned };
            } else {
                return { valid: false, message: 'Código de rastreamento inválido' };
            }
        } else {
            return { valid: false, message: 'Formato inválido. Use CPF, CNPJ ou código de rastreamento.' };
        }
    }
}

// === SISTEMA DE ALERTAS ===
class AlertSystem {
    static show(message, duration = 5000, actions = []) {
        DOM.alertaMsg.textContent = message;
        DOM.alertaAct.innerHTML = '';
        
        // Adicionar ações
        actions.forEach(action => {
            const link = document.createElement('a');
            link.textContent = action.text || 'OK';
            link.href = '#';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.hide();
                if (action.callback) action.callback();
            });
            DOM.alertaAct.appendChild(link);
        });

        // Se não há ações, adicionar OK padrão
        if (actions.length === 0) {
            const okLink = document.createElement('a');
            okLink.textContent = 'OK';
            okLink.href = '#';
            okLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.hide();
            });
            DOM.alertaAct.appendChild(okLink);
        }

        DOM.alerta.classList.add('aberto');
        
        if (duration > 0) {
            setTimeout(() => this.hide(), duration);
        }
    }

    static hide() {
        DOM.alerta.classList.remove('aberto');
    }
}

// === SISTEMA DE LOADING ===
class LoadingSystem {
    static show() {
        DOM.loading.classList.add('visivel');
    }

    static hide() {
        DOM.loading.classList.remove('visivel');
    }
}

// === SISTEMA DE CAPTCHA ===
class CaptchaSystem {
    static refresh() {
        DOM.captchaInput.value = '';
        DOM.captchaImage.src = `api/securimage/securimage_show.php?${Math.random()}`;
        DOM.captchaImage.blur();
    }

    static validate(value) {
        return value && value.trim().length > 0;
    }
}

// === SISTEMA PRINCIPAL ===
class TrackingSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Botão de pesquisa
        DOM.searchButton?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        // Enter no formulário
        DOM.form?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSearch();
            }
        });

        // Refresh do captcha
        DOM.refreshButton?.addEventListener('click', (e) => {
            e.preventDefault();
            CaptchaSystem.refresh();
            LoadingSystem.show();
            setTimeout(() => LoadingSystem.hide(), 1000);
        });

        // Validação em tempo real
        DOM.objetoInput?.addEventListener('blur', () => this.validateObjectField());
        DOM.captchaInput?.addEventListener('blur', () => this.validateCaptchaField());
    }

    setupFormValidation() {
        // Máscara para transformar em maiúscula
        DOM.objetoInput?.addEventListener('input', (e) => {
            const cursorPos = e.target.selectionStart;
            e.target.value = e.target.value.toUpperCase();
            e.target.setSelectionRange(cursorPos, cursorPos);
        });
    }

    validateObjectField() {
        const value = DOM.objetoInput.value.trim();
        const messageEl = DOM.objetoInput.parentNode.parentNode.querySelector('.mensagem');
        
        if (!value) {
            this.setFieldMessage(messageEl, '');
            this.setFieldValidity(DOM.objetoInput, true);
            return true;
        }

        const validation = ValidationSystem.validateInput(value);
        
        if (validation.valid) {
            this.setFieldMessage(messageEl, '');
            this.setFieldValidity(DOM.objetoInput, true);
            return true;
        } else {
            this.setFieldMessage(messageEl, validation.message);
            this.setFieldValidity(DOM.objetoInput, false);
            return false;
        }
    }

    validateCaptchaField() {
        const value = DOM.captchaInput.value.trim();
        const messageEl = DOM.captchaInput.parentNode.parentNode.querySelector('.mensagem');
        
        if (!value) {
            this.setFieldMessage(messageEl, 'Digite o texto da imagem');
            this.setFieldValidity(DOM.captchaInput, false);
            return false;
        }

        this.setFieldMessage(messageEl, '');
        this.setFieldValidity(DOM.captchaInput, true);
        return true;
    }

    setFieldMessage(messageEl, message) {
        if (messageEl) {
            messageEl.textContent = message;
        }
    }

    setFieldValidity(field, isValid) {
        if (isValid) {
            field.classList.remove('invalid');
        } else {
            field.classList.add('invalid');
        }
    }

    async handleSearch() {
        // Validar campos
        const isObjectValid = this.validateObjectField();
        const isCaptchaValid = this.validateCaptchaField();

        if (!isObjectValid || !isCaptchaValid) {
            return;
        }

        const objeto = DOM.objetoInput.value.trim();
        const captcha = DOM.captchaInput.value.trim();

        try {
            LoadingSystem.show();
            AlertSystem.show('Buscando...', 0);

            const result = await this.performSearch(objeto, captcha);
            
            LoadingSystem.hide();
            AlertSystem.hide();
            
            this.displayResults(result);
            
        } catch (error) {
            LoadingSystem.hide();
            
            if (error.message.includes('Captcha')) {
                const messageEl = DOM.captchaInput.parentNode.parentNode.querySelector('.mensagem');
                this.setFieldMessage(messageEl, 'Captcha inválido');
                this.setFieldValidity(DOM.captchaInput, false);
                CaptchaSystem.refresh();
            } else {
                AlertSystem.show(error.message || 'Erro na consulta. Tente novamente.');
            }
        }
    }

    async performSearch(objeto, captcha) {
        const formData = new FormData();
        formData.append('objeto', objeto);
        formData.append('captcha', captcha);

        const response = await fetch('api/resultado.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erro na conexão');
        }

        const data = await response.json();
        
        if (data.erro) {
            throw new Error(data.mensagem || 'Erro na consulta');
        }

        return data;
    }

    displayResults(data) {
        // Limpar campos
        DOM.objetoInput.value = '';
        DOM.captchaInput.value = '';
        CaptchaSystem.refresh();

        // Simular exibição de resultados (será implementado conforme necessário)
        DOM.resultsArea.innerHTML = `
            <div class="resultado-sucesso">
                <h4>Resultado da consulta:</h4>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            </div>
        `;

        // Scroll para resultados
        DOM.resultsArea.scrollIntoView({ behavior: 'smooth' });
    }
}

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistemas
    new AccessibilitySystem();
    new TrackingSystem();

    // Detectar dispositivos touch
    if ('ontouchstart' in window) {
        document.body.classList.add('touch');
    }

    // Mostrar body (remover loading inicial se houver)
    document.body.classList.remove('oculto');
    
    console.log('Sistema de rastreamento inicializado');
});

// === EXPORTS GLOBAIS (para compatibilidade) ===
window.AlertSystem = AlertSystem;
window.LoadingSystem = LoadingSystem;
window.CaptchaSystem = CaptchaSystem;
window.ValidationSystem = ValidationSystem;