/**
 *
 * @type {{val: Function, sel: string, ini: Function}[]}
 */
const validacoesPadrao = [{
        sel: '.cpf',
        val: el => {
            if (!el.value) return;
            if (!el.value.match(/^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2}$/)) {
                return 'Formato CPF: 000.000.000-00, pontuação opcional.';
            }
            const raw = el.value.replace(/\./g, '').replace('-', '');
            if (!validaDvCpf(raw)) {
                return 'CPF com dígito verificador inválido';
            }
            el.value = `${raw.substr(0, 3)}.${raw.substr(3, 3)}.${raw.substr(6, 3)}-${raw.substr(9)}`;
        },
    },
    {
        sel: '.cnpj',
        val: el => {
            if (!el.value) return;
            let digitos = '0123456789';
            const s = [...el.value].filter(c => digitos.includes(c)).join('');
            if (s.length != 14) {
                return 'CNPJ inválido';
            }
            if (!validaDvCnpj(s)) {
                return 'CNPJ com dígito verificador inválido';
            }
            el.value = `${s.substr(0, 2)}.${s.substr(2, 3)}.${s.substr(5, 3)}/${s.substr(8, 4)}-${s.substr(12, 2)}`;
            return;
        },
    },
    {
        sel: '.cpf-cnpj',
        val: el => {
            if (!el.value) return;
            let digitos = '0123456789';
            const s = [...el.value].filter(c => digitos.includes(c)).join('');
            if (s.length == 11) {
                if (!validaDvCpf(s)) {
                    return 'CPF com dígito verificador inválido';
                }
                el.value = `${s.substr(0, 3)}.${s.substr(3, 3)}.${s.substr(6, 3)}-${s.substr(9, 2)}`;
                return;
            }
            if (s.length == 14) {
                if (!validaDvCnpj(s)) {
                    return 'CNPJ com dígito verificador inválido';
                }
                el.value = `${s.substr(0, 2)}.${s.substr(2, 3)}.${s.substr(5, 3)}/${s.substr(8, 4)}-${s.substr(12, 2)}`;
                return;
            }
            return 'CPF ou CNPJ inválido';
        },
    },
    {
        sel: '.cep',
        val: el => {
            if (!el.value) return;
            if (!el.value.match(/^\d{5}-?\d{3}$/)) {
                return 'Formato CEP: 00000-000, pontuação opcional.';
            }
            const raw = el.value.replace('-', '');
            el.value = `${raw.substr(0, 5)}-${raw.substr(5, 3)}`;
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
            const num = parseFloat(semPontos);
            if (isNaN(num)) {
                return 'Formato de moeda inválido.';
            }
            el.value = num.toLocaleString('pt-BR', {
                minimumFractionDigits: 2
            });
        },
        ini: el => {
            el.type = 'text';
        },
    },
    {
        sel: 'input[type=tel]',
        val: el => {
            if (!el.value) return;
            let digitos = '0123456789';
            const s = [...el.value].filter(c => digitos.includes(c)).join('');
            if (s.length == 10) {
                el.value = `(${s.substr(0, 2)})${s.substr(2, 4)}-${s.substr(6, 4)}`;
                return;
            }
            if (s.length == 11) {
                el.value = `(${s.substr(0, 2)})${s.substr(2, 5)}-${s.substr(7, 4)}`;
                return;
            }
            return 'Formato de telefone inválido';
        },
    },
    {
        sel: '.idcorreios',
        val: el => {
            if (!el.value) return;
            if (!el.value.match(/^[a-zA-Z0-9.]{8,15}$/)) {
                return 'Apenas letras, números e pontos, de 8 a 15 caracteres';
            }
        },
    },
    {
        sel: 'input[type=password]',
        val: el => {
            if (!el.value) return;
            if (!el.value.match(/^.{8,15}$/)) {
                return 'Senha deve conter 8 a 15 caracteres';
            }
        },
    },
    {
        sel: '.alfanum',
        val: el => {
            if (!el.value) return;
            if (!el.value.match(/^[a-zA-Z0-9]+$/)) {
                return 'Apenas letras e números';
            }
        },
    },
];

/**
 * Valida dígito verificador
 * @param cpf
 * @returns {boolean} Retorna true se os dígitos verificadores são válidos
 */
const validaDvCpf = cpf => {
    let numeros = cpf.substr(0, 9);
    let dv = cpf.substr(9, 2);
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += (10 - i) * numeros[i];
    }
    let resto = soma % 11;
    let dv1;
    if (resto == 0 || resto == 1) {
        dv1 = '0';
    } else {
        dv1 = (11 - resto).toString();
    }
    numeros += dv1;
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += (11 - i) * numeros[i];
    }
    resto = soma % 11;
    let dv2;
    if (resto == 0 || resto == 1) {
        dv2 = '0';
    } else {
        dv2 = (11 - resto).toString();
    }
    return (dv == dv1 + dv2);
};
const validaDvCnpj = cnpj => {
    const dv = cnpj.substr(12, 2);
    const multiplicadores = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    for (let i = 0; i < 12; i++) {
        soma += parseInt(cnpj.charAt(i)) * multiplicadores[i];
    }
    const d1 = soma % 11 != 10 ? soma % 11 : 0;
    cnpj += d1;
    multiplicadores.unshift(5);
    soma = 0;
    for (let i = 0; i < 13; i++) {
        soma += parseInt(cnpj.charAt(i)) * multiplicadores[i];
    }
    const d2 = soma % 11 != 10 ? soma % 11 : 0;
    return dv == `${d1}${d2}`;
};

export {
    validacoesPadrao
};