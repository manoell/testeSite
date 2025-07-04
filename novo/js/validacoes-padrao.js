/**
 * validacoes-padrao.js - Validações Padrão Otimizadas
 * Versão otimizada: algoritmos melhorados, regex consolidados
 */

// === PADRÕES DE VALIDAÇÃO ===
const PATTERNS = {
    CPF: /^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2}$/,
    CNPJ: /^\d{14}$/, // Apenas dígitos após limpeza
    CEP: /^\d{5}-?\d{3}$/,
    TELEFONE_10: /^\d{10}$/,
    TELEFONE_11: /^\d{11}$/,
    ALFANUM: /^[a-zA-Z0-9]+$/,
    ID_CORREIOS: /^[a-zA-Z0-9.]{8,15}$/,
    SENHA: /^.{8,15}$/,
    MOEDA_SEPARADORES: /[,.]/g
};

// === FUNÇÕES DE VALIDAÇÃO ===

/**
 * Valida dígito verificador do CPF
 * @param {string} cpf - CPF apenas com números
 * @returns {boolean}
 */
const validaDvCpf = cpf => {
    let numeros = cpf.substr(0, 9);
    let dv = cpf.substr(9, 2);
    let soma = 0;
    
    // Primeiro dígito
    for (let i = 0; i < 9; i++) {
        soma += (10 - i) * numeros[i];
    }
    
    let resto = soma % 11;
    let dv1 = (resto === 0 || resto === 1) ? '0' : (11 - resto).toString();
    
    numeros += dv1;
    soma = 0;
    
    // Segundo dígito
    for (let i = 0; i < 10; i++) {
        soma += (11 - i) * numeros[i];
    }
    
    resto = soma % 11;
    let dv2 = (resto === 0 || resto === 1) ? '0' : (11 - resto).toString();
    
    return (dv === dv1 + dv2);
};

/**
 * Valida dígito verificador do CNPJ
 * @param {string} cnpj - CNPJ apenas com números
 * @returns {boolean}
 */
const validaDvCnpj = cnpj => {
    const dv = cnpj.substr(12, 2);
    const multiplicadores = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    
    // Primeiro dígito
    for (let i = 0; i < 12; i++) {
        soma += parseInt(cnpj.charAt(i)) * multiplicadores[i];
    }
    
    const d1 = soma % 11 !== 10 ? soma % 11 : 0;
    cnpj += d1;
    multiplicadores.unshift(5);
    soma = 0;
    
    // Segundo dígito
    for (let i = 0; i < 13; i++) {
        soma += parseInt(cnpj.charAt(i)) * multiplicadores[i];
    }
    
    const d2 = soma % 11 !== 10 ? soma % 11 : 0;
    
    return dv === `${d1}${d2}`;
};

/**
 * Limpa string mantendo apenas dígitos
 * @param {string} str - String a ser limpa
 * @returns {string}
 */
const apenasDigitos = str => {
    return [...str].filter(c => '0123456789'.includes(c)).join('');
};

/**
 * Formata CPF
 * @param {string} cpf - CPF apenas com números
 * @returns {string}
 */
const formataCPF = cpf => {
    return `${cpf.substr(0, 3)}.${cpf.substr(3, 3)}.${cpf.substr(6, 3)}-${cpf.substr(9)}`;
};

/**
 * Formata CNPJ
 * @param {string} cnpj - CNPJ apenas com números
 * @returns {string}
 */
const formataCNPJ = cnpj => {
    return `${cnpj.substr(0, 2)}.${cnpj.substr(2, 3)}.${cnpj.substr(5, 3)}/${cnpj.substr(8, 4)}-${cnpj.substr(12, 2)}`;
};

/**
 * Formata CEP
 * @param {string} cep - CEP apenas com números
 * @returns {string}
 */
const formataCEP = cep => {
    return `${cep.substr(0, 5)}-${cep.substr(5, 3)}`;
};

/**
 * Formata telefone
 * @param {string} telefone - Telefone apenas com números
 * @returns {string}
 */
const formataTelefone = telefone => {
    if (telefone.length === 10) {
        return `(${telefone.substr(0, 2)})${telefone.substr(2, 4)}-${telefone.substr(6, 4)}`;
    }
    return `(${telefone.substr(0, 2)})${telefone.substr(2, 5)}-${telefone.substr(7, 4)}`;
};

// === VALIDAÇÕES PRINCIPAIS ===
const validacoesPadrao = [
    {
        sel: '.cpf',
        val: el => {
            if (!el.value) return;
            
            if (!PATTERNS.CPF.test(el.value)) {
                return 'Formato CPF: 000.000.000-00, pontuação opcional.';
            }
            
            const limpo = apenasDigitos(el.value);
            
            if (!validaDvCpf(limpo)) {
                return 'CPF com dígito verificador inválido';
            }
            
            el.value = formataCPF(limpo);
        },
    },
    {
        sel: '.cnpj',
        val: el => {
            if (!el.value) return;
            
            const limpo = apenasDigitos(el.value);
            
            if (limpo.length !== 14) {
                return 'CNPJ inválido';
            }
            
            if (!validaDvCnpj(limpo)) {
                return 'CNPJ com dígito verificador inválido';
            }
            
            el.value = formataCNPJ(limpo);
        },
    },
    {
        sel: '.cpf-cnpj',
        val: el => {
            if (!el.value) return;
            
            const limpo = apenasDigitos(el.value);
            
            if (limpo.length === 11) {
                if (!validaDvCpf(limpo)) {
                    return 'CPF com dígito verificador inválido';
                }
                el.value = formataCPF(limpo);
                return;
            }
            
            if (limpo.length === 14) {
                if (!validaDvCnpj(limpo)) {
                    return 'CNPJ com dígito verificador inválido';
                }
                el.value = formataCNPJ(limpo);
                return;
            }
            
            return 'CPF ou CNPJ inválido';
        },
    },
    {
        sel: '.cep',
        val: el => {
            if (!el.value) return;
            
            if (!PATTERNS.CEP.test(el.value)) {
                return 'Formato CEP: 00000-000, pontuação opcional.';
            }
            
            const limpo = apenasDigitos(el.value);
            el.value = formataCEP(limpo);
        },
    },
    {
        sel: '.moeda',
        val: el => {
            if (!el.value) return;
            
            let semPontos = el.value;
            
            if (el.value.includes('.') && el.value.includes(',')) {
                semPontos = el.value.replace(/\./g, '').replace(',', '.');
            } else if (el.value.includes(',')) {
                semPontos = el.value.replace(',', '.');
            }
            
            const numero = parseFloat(semPontos);
            
            if (isNaN(numero)) {
                return 'Formato de moeda inválido.';
            }
            
            el.value = numero.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        },
        ini: el => {
            el.type = 'text';
        },
    },
    {
        sel: 'input[type=tel]',
        val: el => {
            if (!el.value) return;
            
            const limpo = apenasDigitos(el.value);
            
            if (PATTERNS.TELEFONE_10.test(limpo)) {
                el.value = formataTelefone(limpo);
                return;
            }
            
            if (PATTERNS.TELEFONE_11.test(limpo)) {
                el.value = formataTelefone(limpo);
                return;
            }
            
            return 'Formato de telefone inválido';
        },
    },
    {
        sel: '.idcorreios',
        val: el => {
            if (!el.value) return;
            
            if (!PATTERNS.ID_CORREIOS.test(el.value)) {
                return 'Apenas letras, números e pontos, de 8 a 15 caracteres';
            }
        },
    },
    {
        sel: 'input[type=password]',
        val: el => {
            if (!el.value) return;
            
            if (!PATTERNS.SENHA.test(el.value)) {
                return 'Senha deve conter 8 a 15 caracteres';
            }
        },
    },
    {
        sel: '.alfanum',
        val: el => {
            if (!el.value) return;
            
            if (!PATTERNS.ALFANUM.test(el.value)) {
                return 'Apenas letras e números';
            }
        },
    },
];

export { validacoesPadrao };