/**
 * rastroGeral.js - Validações Gerais Otimizadas
 * Versão otimizada: consolidadas validações, regex otimizados, código duplicado removido
 */

// === CONSTANTES OTIMIZADAS ===
const VALIDATION_CONFIG = {
    MAX_OBJECTS: 20,
    OBJECT_LENGTH: 13,
    CPF_LENGTH: 11,
    CNPJ_LENGTH: 14,
    
    PATTERNS: {
        CLEAN_INPUT: /[-,;. ]/g,
        TRACKING_CODE: /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/,
        ONLY_NUMBERS: /^\d+$/
    },
    
    MESSAGES: {
        INVALID: 'Código de objeto, CPF ou CNPJ informado não está válido',
        MAX_20: 'Por favor, informe no máximo 20 objetos',
        EMPTY: 'Favor informar 1 código de objeto ou um CPF ou um CNPJ válido',
        CPF_INVALID: 'O CPF informado está inválido',
        CNPJ_INVALID: 'O CNPJ informado está inválido'
    },
    
    INVALID_DOCS: {
        CPF: [
            '00000000000', '11111111111', '22222222222', '33333333333',
            '44444444444', '55555555555', '66666666666', '77777777777',
            '88888888888', '99999999999'
        ],
        CNPJ: [
            '00000000000000', '11111111111111', '22222222222222', '33333333333333',
            '44444444444444', '55555555555555', '66666666666666', '77777777777777',
            '88888888888888', '99999999999999'
        ]
    }
};

/**
 * Limpa string de entrada removendo caracteres especiais
 */
const limparObjetos = (strObjetos) => {
    if (!strObjetos) return '';
    
    try {
        let objetos = strObjetos
            .replace(/(\r\n|\n|\r)/gm, '')
            .replace(VALIDATION_CONFIG.PATTERNS.CLEAN_INPUT, '');
            
        return removeDuplos(objetos);
    } catch (e) {
        return '';
    }
};

/**
 * Remove códigos duplicados
 */
const removeDuplos = (gut) => {
    const arrayFromList = [];
    const { OBJECT_LENGTH } = VALIDATION_CONFIG;

    for (let i = 0; i < gut.length; i += OBJECT_LENGTH) {
        const piece = gut.substr(i, OBJECT_LENGTH);
        
        if (arrayFromList.indexOf(piece) === -1) {
            arrayFromList.push(piece);
        }
    }

    return arrayFromList.join('');
};

/**
 * Testa se todos os códigos de rastreamento são válidos
 */
const testarTrack = (strTrack) => {
    const { PATTERNS, OBJECT_LENGTH } = VALIDATION_CONFIG;
    
    for (let i = 0; i < strTrack.length; i += OBJECT_LENGTH) {
        const codigo = strTrack.substr(i, OBJECT_LENGTH);
        if (!PATTERNS.TRACKING_CODE.test(codigo)) {
            return false;
        }
    }
    return true;
};

/**
 * Valida dígito verificador do CPF
 */
const testarCPF = (strCPF) => {
    const { INVALID_DOCS, CPF_LENGTH } = VALIDATION_CONFIG;
    
    if (strCPF.length !== CPF_LENGTH || INVALID_DOCS.CPF.includes(strCPF)) {
        return false;
    }

    // Valida primeiro dígito
    let soma = 0;
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }
    
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(strCPF.substring(9, 10))) return false;

    // Valida segundo dígito
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    
    return resto === parseInt(strCPF.substring(10, 11));
};

/**
 * Valida dígito verificador do CNPJ
 */
const testarCNPJ = (strCNPJ) => {
    const { INVALID_DOCS, CNPJ_LENGTH } = VALIDATION_CONFIG;
    
    // Remove caracteres não numéricos
    const cnpj = strCNPJ.replace(/[^\d]+/g, '');
    
    if (cnpj.length !== CNPJ_LENGTH || INVALID_DOCS.CNPJ.includes(cnpj)) {
        return false;
    }

    // Valida primeiro dígito verificador
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    // Valida segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    return resultado === parseInt(digitos.charAt(1));
};

/**
 * Função principal de validação otimizada
 */
const validarCodigoObjeto = (objetos, captcha) => {
    const { MESSAGES, OBJECT_LENGTH, CPF_LENGTH, CNPJ_LENGTH, MAX_OBJECTS } = VALIDATION_CONFIG;
    
    const objetosLimpos = limparObjetos(objetos);
    const ret = {
        erro: false,
        mensagem: '',
        objetosLimpos: objetosLimpos
    };

    // Validações básicas
    if (objetosLimpos.length === 0) {
        ret.mensagem = MESSAGES.EMPTY;
        ret.erro = true;
        return ret;
    }
    
    if (objetosLimpos.length > MAX_OBJECTS * OBJECT_LENGTH) {
        ret.mensagem = MESSAGES.MAX_20;
        ret.erro = true;
        return ret;
    }

    // Validação por tipo baseado no comprimento
    switch (objetosLimpos.length) {
        case OBJECT_LENGTH:
            if (!testarTrack(objetosLimpos)) {
                ret.mensagem = MESSAGES.INVALID;
                ret.erro = true;
            }
            break;
            
        case CPF_LENGTH:
            if (!testarCPF(objetosLimpos)) {
                ret.mensagem = MESSAGES.CPF_INVALID;
                ret.erro = true;
            }
            break;
            
        case CNPJ_LENGTH:
            if (!testarCNPJ(objetosLimpos)) {
                ret.mensagem = MESSAGES.CNPJ_INVALID;
                ret.erro = true;
            }
            break;
            
        default:
            // Múltiplos códigos de rastreamento
            if (objetosLimpos.length % OBJECT_LENGTH !== 0) {
                ret.mensagem = MESSAGES.INVALID;
                ret.erro = true;
            } else if (!testarTrack(objetosLimpos)) {
                ret.mensagem = MESSAGES.INVALID;
                ret.erro = true;
            }
    }

    return ret;
};

export {
    validarCodigoObjeto,
    limparObjetos,
    testarTrack,
    testarCPF,
    testarCNPJ
};