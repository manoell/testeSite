/**
 * Templates.js - Módulo de Templates HTML (Versão Otimizada)
 * Centraliza todos os templates HTML com compilation e cache otimizado
 */

import { 
    CACHE_CONFIG, 
    PERFORMANCE_CONFIG,
    ACCESSIBILITY,
    BROWSER_FEATURES 
} from './constants.js';
import { globalCache } from './utils.js';

/**
 * Template Compiler para melhor performance
 */
class TemplateCompiler {
    constructor() {
        this.compiledTemplates = new Map();
        this.compilationStats = {
            compiled: 0,
            cacheHits: 0,
            totalRenderTime: 0
        };
    }

    compile(template, variables = []) {
        const cacheKey = this.generateCacheKey(template, variables);
        
        if (this.compiledTemplates.has(cacheKey)) {
            this.compilationStats.cacheHits++;
            return this.compiledTemplates.get(cacheKey);
        }

        const startTime = performance.now();
        
        // Template compilation otimizada
        const compiledFn = this.createCompiledFunction(template, variables);
        
        const endTime = performance.now();
        this.compilationStats.totalRenderTime += (endTime - startTime);
        this.compilationStats.compiled++;

        // Cache com limite
        if (this.compiledTemplates.size >= 50) {
            const firstKey = this.compiledTemplates.keys().next().value;
            this.compiledTemplates.delete(firstKey);
        }

        this.compiledTemplates.set(cacheKey, compiledFn);
        return compiledFn;
    }

    createCompiledFunction(template, variables) {
        // Criar função de template mais segura que eval
        return new Function(...variables, `return \`${template}\`;`);
    }

    generateCacheKey(template, variables) {
        return `${template.slice(0, 50)}_${variables.join('_')}`;
    }

    render(template, data = {}, variables = null) {
        const autoVars = variables || Object.keys(data);
        const compiledFn = this.compile(template, autoVars);
        
        try {
            return compiledFn(...autoVars.map(key => data[key]));
        } catch (error) {
            console.error('Erro na renderização do template:', error);
            return template; // Fallback para template original
        }
    }

    getStats() {
        return {
            ...this.compilationStats,
            cacheSize: this.compiledTemplates.size,
            averageRenderTime: this.compilationStats.compiled > 0 
                ? this.compilationStats.totalRenderTime / this.compilationStats.compiled 
                : 0
        };
    }

    clear() {
        this.compiledTemplates.clear();
        this.compilationStats = {
            compiled: 0,
            cacheHits: 0,
            totalRenderTime: 0
        };
    }
}

// Instância global do compiler
const templateCompiler = new TemplateCompiler();

/**
 * Fragment Builder para melhor performance DOM
 */
class FragmentBuilder {
    static create(html) {
        if (typeof html !== 'string') return html;
        
        // Para HTML pequeno, usar innerHTML direto
        if (html.length < 500) {
            const div = document.createElement('div');
            div.innerHTML = html;
            return div.firstElementChild || div;
        }

        // Para HTML grande, usar template element
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content.cloneNode(true);
    }

    static createMultiple(htmlArray) {
        const fragment = document.createDocumentFragment();
        htmlArray.forEach(html => {
            const element = this.create(html);
            fragment.appendChild(element);
        });
        return fragment;
    }
}

/**
 * Formata código de objeto para apresentação visual (memoizado)
 */
export const formatTrackingCode = (() => {
    const cache = new Map();
    
    return (codigo) => {
        if (!codigo || codigo.length !== 13) return codigo;
        
        if (cache.has(codigo)) {
            return cache.get(codigo);
        }
        
        const formatted = `${codigo.substring(0, 2)} ${codigo.substring(2, 5)} ${codigo.substring(5, 8)} ${codigo.substring(8, 11)} ${codigo.substring(11, 13)}`;
        
        // Limitar cache
        if (cache.size >= 100) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        
        cache.set(codigo, formatted);
        return formatted;
    };
})();

/**
 * Template do cabeçalho de rastreamento otimizado
 */
export const trackingHeaderTemplate = (objeto) => {
    const template = `
        <div id="cabecalho-rastro" class="d-flex justify-content-between">
            <ul class="cabecalho-rastro">                
                <div class="arrow-dashed justify-content-start">
                    <div class="circle">
                        <img class="circle-logo" src="../static/rastreamento-internet/imgs/correios-sf.png" width="35" height="35" alt="Logo Correios" loading="lazy">
                    </div>
                </div>
                <div class="cabecalho-content">
                    <p class="text text-content">\${categoria}</p>                    	
                    \${messageContent}     	
                </div>                                                
            </ul>        
            <div class="share-bar noPrint">
                <a title="Compartilhar" class="btn btn-light" data-objeto="\${codObjeto}" aria-label="\${shareLabel}">
                    <i class="fa fa-share-alt" aria-hidden="true"></i>
                </a>
            </div>
        </div>`;

    const data = {
        categoria: objeto.tipoPostal?.categoria || 'Objeto',
        codObjeto: objeto.codObjeto,
        shareLabel: ACCESSIBILITY.ARIA_LABELS.SHARE_BUTTON,
        messageContent: generateMessageContent(objeto)
    };

    return templateCompiler.render(template, data);
};

/**
 * Gera conteúdo da mensagem de forma otimizada
 */
function generateMessageContent(objeto) {
    if (objeto.situacao !== 'T') return '';
    
    if (objeto.atrasado) {
        return `<p class="text text-head noPrint">Para obter mais informações sobre o objeto, clique <a href="${objeto.urlFaleComOsCorreios}" target="_blank" rel="noopener">aqui</a> e registre uma manifestação</p>`;
    }
    
    if (objeto.dataPrevista && objeto.dataPrevista !== "") {
        return `<p class="text text-head">Previsão de Entrega: ${objeto.dtPrevista}</p>`;
    }
    
    return '';
}

/**
 * Template para breadcrumb otimizado
 */
export const breadcrumbTemplate = (...items) => {
    if (items.length === 0) return '';
    
    const template = items.map(() => `<a>\${}</a>`).join('');
    return templateCompiler.render(template, items);
};

/**
 * Template do título da página otimizado
 */
export const pageTitleTemplate = (titulo, showPrint = false) => {
    const template = `
        <h3 style='text-align: justify;'>\${titulo}</h3>
        \${printButton}`;

    const data = {
        titulo,
        printButton: showPrint 
            ? `<div class="print-bar noPrint">
                   <a id="print" href="#" aria-label="${ACCESSIBILITY.ARIA_LABELS.PRINT_BUTTON}">
                       <i class="fa fa-print fa-lg" aria-hidden="true"></i>
                   </a>
               </div>`
            : ''
    };
    
    return templateCompiler.render(template, data);
};

/**
 * Template para botões de compartilhamento social otimizado
 */
export const socialShareTemplate = (codigo) => {
    const template = `
        <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=\${trackingUrl}&title=\${shareTitle}" rel="noopener" aria-label="Compartilhar no Facebook">
            <i class="fa fa-facebook-official fa-lg" aria-hidden="true"></i>
        </a>
        <a target="_blank" href="https://wa.me/?text=\${trackingUrl}" rel="noopener" aria-label="Compartilhar no WhatsApp">
            <i class="fa fa-whatsapp fa-lg" aria-hidden="true"></i>
        </a>
        <a target="_blank" href="https://twitter.com/share?url=\${trackingUrl}&text=\${shareText}&hashtags=Correios" rel="noopener" aria-label="Compartilhar no Twitter">
            <img class="xtwiter" src="../static/svg/icons8-twitterx.svg" aria-hidden="true" alt="">
        </a>`;

    const baseUrl = 'https://rastreamento.correios.com.br/app/index.php?objetos=';
    const data = {
        trackingUrl: encodeURIComponent(`${baseUrl}${codigo}`),
        shareTitle: encodeURIComponent('Detalhes do Pacote nos Correios'),
        shareText: encodeURIComponent('Detalhes do meu pacote objetos nos Correios')
    };
    
    return templateCompiler.render(template, data);
};

/**
 * Template para estrutura completa de rastreamento único
 */
export const singleTrackingTemplate = (objeto, ulContent, showHeader = true) => {
    const template = `\${header}\${ulContent}`;
    
    const data = {
        header: showHeader ? trackingHeaderTemplate(objeto) : '',
        ulContent
    };
    
    return templateCompiler.render(template, data);
};

/**
 * Template para seção "Ver Mais" otimizado
 */
export const viewMoreTemplate = (objeto, shortContent, fullContent, showHeader = true) => {
    if (!shortContent) {
        return {
            html: singleTrackingTemplate(objeto, fullContent, showHeader),
            hasViewMore: false
        };
    }

    const template = `
        <div id="ver-mais" style="display: block;">
            \${header}
            \${shortContent}
        </div>
        <div id="ver-rastro-unico" style="display: none;">
            \${headerFull}
            \${fullContent}
        </div>`;

    const data = {
        header: showHeader ? trackingHeaderTemplate(objeto) : '',
        headerFull: showHeader ? trackingHeaderTemplate(objeto) : '',
        shortContent,
        fullContent
    };

    return {
        html: templateCompiler.render(template, data),
        hasViewMore: true
    };
};

/**
 * Templates para loading states otimizados
 */
export const LoadingTemplates = {
    simple: (message = 'Carregando...') => {
        const template = `
            <div class="text-center p-3" role="status" aria-live="polite">
                <div class="spinner" aria-hidden="true">
                    <i class="fa fa-spinner fa-spin fa-2x"></i>
                </div>
                <p class="mt-2 sr-only">\${message}</p>
                <p class="mt-2" aria-hidden="true">\${message}</p>
            </div>`;
        
        return templateCompiler.render(template, { message });
    },
    
    inline: () => `<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>`,
    
    overlay: (message = 'Processando...') => {
        const template = `
            <div class="loading-overlay" role="dialog" aria-modal="true" aria-labelledby="loading-message">
                <div class="loading-content">
                    <i class="fa fa-spinner fa-spin fa-3x" aria-hidden="true"></i>
                    <p id="loading-message">\${message}</p>
                </div>
            </div>`;
        
        return templateCompiler.render(template, { message });
    },

    skeleton: (type = 'default') => {
        const templates = {
            default: `
                <div class="skeleton-loader" aria-hidden="true">
                    <div class="skeleton-line skeleton-line-title"></div>
                    <div class="skeleton-line skeleton-line-text"></div>
                    <div class="skeleton-line skeleton-line-text"></div>
                </div>`,
            
            tracking: `
                <div class="skeleton-loader tracking-skeleton" aria-hidden="true">
                    <div class="skeleton-circle"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line skeleton-line-title"></div>
                        <div class="skeleton-line skeleton-line-text"></div>
                    </div>
                </div>`,
            
            list: `
                <div class="skeleton-loader list-skeleton" aria-hidden="true">
                    ${Array(3).fill().map(() => `
                        <div class="skeleton-item">
                            <div class="skeleton-circle"></div>
                            <div class="skeleton-line skeleton-line-text"></div>
                        </div>
                    `).join('')}
                </div>`
        };
        
        return templates[type] || templates.default;
    }
};

/**
 * Templates específicos para estados de erro
 */
export const ErrorTemplates = {
    invalidCaptcha: () => {
        const template = `
            <div class="alert alert-danger" role="alert">
                <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                <span class="sr-only">Erro:</span>
                \${message}
            </div>`;
        
        return templateCompiler.render(template, { 
            message: 'Captcha inválido. Por favor, tente novamente.' 
        });
    },
    
    networkError: () => {
        const template = `
            <div class="alert alert-warning" role="alert">
                <i class="fa fa-wifi" aria-hidden="true"></i>
                <span class="sr-only">Aviso:</span>
                \${message}
                <button type="button" class="btn btn-link btn-sm retry-btn" onclick="location.reload()">
                    Tentar novamente
                </button>
            </div>`;
        
        return templateCompiler.render(template, { 
            message: 'Erro de conexão. Verifique sua internet.' 
        });
    },
    
    genericError: (message = 'Ocorreu um erro inesperado') => {
        const template = `
            <div class="alert alert-danger" role="alert">
                <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
                <span class="sr-only">Erro:</span>
                \${message}
            </div>`;
        
        return templateCompiler.render(template, { message });
    },

    notFound: (resource = 'recurso') => {
        const template = `
            <div class="alert alert-info" role="alert">
                <i class="fa fa-search" aria-hidden="true"></i>
                <span class="sr-only">Informação:</span>
                \${resource} não encontrado. Verifique os dados informados.
            </div>`;
        
        return templateCompiler.render(template, { resource });
    },

    offline: () => {
        const template = `
            <div class="alert alert-warning offline-alert" role="alert">
                <i class="fa fa-wifi-slash" aria-hidden="true"></i>
                <span class="sr-only">Aviso:</span>
                Você está offline. Algumas funcionalidades podem não estar disponíveis.
                <div class="mt-2">
                    <small>Suas ações serão sincronizadas quando a conexão for restaurada.</small>
                </div>
            </div>`;
        
        return template;
    }
};

/**
 * Templates para componentes de acessibilidade
 */
export const AccessibilityTemplates = {
    skipLinks: () => {
        const template = `
            <div class="skip-links sr-only-focusable">
                <a href="#main-content" class="btn btn-primary">
                    Pular para o conteúdo principal
                </a>
                <a href="#navigation" class="btn btn-primary">
                    Pular para a navegação
                </a>
            </div>`;
        
        return template;
    },

    announcements: (message, priority = 'polite') => {
        const template = `
            <div class="sr-only" aria-live="\${priority}" aria-atomic="true">
                \${message}
            </div>`;
        
        return templateCompiler.render(template, { message, priority });
    },

    progressIndicator: (current, total, label = 'Progresso') => {
        const percentage = Math.round((current / total) * 100);
        const template = `
            <div class="progress" role="progressbar" aria-valuenow="\${current}" aria-valuemin="0" aria-valuemax="\${total}" aria-label="\${label}">
                <div class="progress-bar" style="width: \${percentage}%">
                    <span class="sr-only">\${current} de \${total} - \${percentage}% completo</span>
                </div>
            </div>`;
        
        return templateCompiler.render(template, { current, total, label, percentage });
    }
};

/**
 * Templates para modais otimizados
 */
export const ModalTemplates = {
    base: (content, title = '', size = 'md') => {
        const template = `
            <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modal-title" aria-hidden="true">
                <div class="modal-dialog modal-\${size}" role="document">
                    <div class="modal-content">
                        \${header}
                        <div class="modal-body">
                            \${content}
                        </div>
                        \${footer}
                    </div>
                </div>
            </div>`;

        const data = {
            size,
            content,
            header: title ? `
                <div class="modal-header">
                    <h4 class="modal-title" id="modal-title">${title}</h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>` : '',
            footer: `
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
                </div>`
        };
        
        return templateCompiler.render(template, data);
    },

    confirmation: (message, confirmText = 'Confirmar', cancelText = 'Cancelar') => {
        const template = `
            <div class="text-center">
                <i class="fa fa-question-circle fa-3x text-warning mb-3" aria-hidden="true"></i>
                <p class="mb-4">\${message}</p>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-danger modal-confirm">\${confirmText}</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">\${cancelText}</button>
                </div>
            </div>`;
        
        return templateCompiler.render(template, { message, confirmText, cancelText });
    }
};

/**
 * Cache de templates renderizados com TTL
 */
class TemplateCache {
    constructor() {
        this.cache = globalCache;
        this.prefix = 'template_';
    }

    get(key) {
        return this.cache.get(this.prefix + key);
    }

    set(key, value, ttl = null) {
        this.cache.set(this.prefix + key, value, ttl);
    }

    clear() {
        // Limpar apenas templates do cache
        const keys = Array.from(this.cache.keys());
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                this.cache.delete(key);
            }
        });
    }

    generateKey(...args) {
        return args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join('_');
    }
}

const templateCache = new TemplateCache();

/**
 * Função helper para cache de templates com TTL
 */
export const getCachedTemplate = (templateFn, ...args) => {
    if (!CACHE_CONFIG.TEMPLATE_CACHE) {
        return templateFn(...args);
    }

    const cacheKey = templateCache.generateKey(templateFn.name, ...args);
    
    let cached = templateCache.get(cacheKey);
    if (cached) {
        return cached;
    }
    
    const rendered = templateFn(...args);
    templateCache.set(cacheKey, rendered);
    return rendered;
};

/**
 * Template renderer otimizado com cache
 */
export const renderTemplate = (template, data = {}, options = {}) => {
    const { 
        cache = CACHE_CONFIG.TEMPLATE_CACHE,
        asFragment = false,
        sanitize = true 
    } = options;

    let result;
    
    if (cache) {
        const cacheKey = templateCache.generateKey(template, data);
        result = templateCache.get(cacheKey);
        
        if (!result) {
            result = templateCompiler.render(template, data);
            templateCache.set(cacheKey, result);
        }
    } else {
        result = templateCompiler.render(template, data);
    }

    // Sanitização básica se solicitada
    if (sanitize) {
        result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    // Retornar como fragment se solicitado
    if (asFragment) {
        return FragmentBuilder.create(result);
    }

    return result;
};

/**
 * Limpar todos os caches de template
 */
export const clearTemplateCache = () => {
    templateCache.clear();
    templateCompiler.clear();
};

/**
 * Obter estatísticas dos templates
 */
export const getTemplateStats = () => {
    return {
        compiler: templateCompiler.getStats(),
        cache: templateCache.cache.getStats()
    };
};

/**
 * Template validator para desenvolvimento
 */
export const validateTemplate = (template, data = {}) => {
    try {
        const result = templateCompiler.render(template, data);
        
        // Verificações básicas
        const issues = [];
        
        // Verificar tags não fechadas
        const openTags = (result.match(/<[^\/][^>]*>/g) || []).length;
        const closeTags = (result.match(/<\/[^>]*>/g) || []).length;
        if (openTags !== closeTags) {
            issues.push('Possíveis tags HTML não fechadas');
        }
        
        // Verificar acessibilidade básica
        if (result.includes('<img') && !result.includes('alt=')) {
            issues.push('Imagens sem atributo alt');
        }
        
        if (result.includes('<button') && !result.includes('aria-label') && !result.includes('title')) {
            issues.push('Botões sem labels de acessibilidade');
        }
        
        return {
            valid: issues.length === 0,
            issues,
            result
        };
    } catch (error) {
        return {
            valid: false,
            issues: [error.message],
            result: null
        };
    }
};

// Cleanup ao sair da página
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        clearTemplateCache();
    });
}

// Exportações por conveniência
export {
    templateCompiler,
    FragmentBuilder,
    TemplateCache,
    templateCache
};