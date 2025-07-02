//const {alerta} = require("../templates/bunker/js/alerta.js");

const limparObjetos = (strObjetos) => {
    let objetos = '';
    let retorno = '';
    try {
        objetos = strObjetos.replace(new RegExp(';', 'g'), '');
        objetos = objetos.replace(/(\r\n|\n|\r)/gm, '');
        objetos = objetos.replace(new RegExp('[,]', 'g'), '');
        objetos = objetos.replace(new RegExp('[.]', 'g'), '');
        objetos = objetos.replace(new RegExp('[/]', 'g'), '');
        objetos = objetos.replace(new RegExp('[ ]', 'g'), '');
        objetos = objetos.replace(new RegExp('[:]', 'g'), '');
        objetos = objetos.replace(new RegExp('[|]', 'g'), '');
        objetos = objetos.replace(new RegExp('[-]', 'g'), '');
        objetos = objetos.replace(new RegExp('[-,;. ]', 'g'), '');
        //Retirar duplicados
        retorno = removeDuplos(objetos);
    } catch (e) {
        return retorno;
    }
    return retorno;
}

const testarTrack = (strTrack) => {
    let patt = new RegExp(/[a-zA-Z]{2}[0-9]{9}[a-zA-Z]{2}/);
    for (let i = 0; i < strTrack.length; i = i + 13) {
        if (!patt.test(strTrack.substr(i, 13))) {
            return false;
        }
    }
    return true;
}

const removeDuplos = (gut) => {
    let arrayFromList = [];

    for (let i = 0; i < gut.length; i = i + 13) {
        let piece = gut.substr(i, 13);

        if (arrayFromList.indexOf(piece) === -1) {
            arrayFromList.push(piece);
        }
    }

    return arrayFromList.join('');
};


const validarCodigoObjeto = (objetos, captcha) => {

    const msgInvalido = 'Código de objeto, CPF ou CNPJ  informado não está válido';
    const msgMax20 = 'Por favor, informe no máximo 20 objetos';
    const msgVazio = 'Favor informar de 1 a 20 códigos de objetos ou um CPF ou um CNPJ válido';
    const msgCPFinvalido = 'O CPF informado está inválido';
    const msgCNPJinvalido = 'O CNPJ informado está inválido';
    let ret = {
        'erro': false,
        'mensagem': '',
        'objetosLimpos': ''
    };



    const objetos_limpos = limparObjetos(objetos);
    ret = {
        'erro': false,
        'mensagem': '',
        'objetosLimpos': objetos_limpos
    };
    if (objetos_limpos.length === 0) {
        ret['mensagem'] = msgVazio;
        ret['erro'] = true;
        return ret;
    }
    if (objetos_limpos.length > 260) {
        ret['mensagem'] = msgMax20;
        ret['erro'] = true;
        return ret;
    }
    if (objetos_limpos.length === 13) {
        if (!testarTrack(objetos_limpos)) {
            ret['mensagem'] = msgInvalido;
            ret['erro'] = true;
            return ret;
        }
    }
    if (objetos_limpos.length === 11) {
        if (!testarCPF(objetos_limpos)) {
            ret['mensagem'] = msgCPFinvalido;
            ret['erro'] = true;
            return ret;
        }
    }
    if (objetos_limpos.length === 14) {
        if (!testarCNPJ(objetos_limpos)) {
            ret['mensagem'] = msgCNPJinvalido;
            ret['erro'] = true;
            return ret;
        }
    }
    if ((objetos_limpos.length !== 11) && (objetos_limpos.length !== 13) && (objetos_limpos.length !== 14)) {
        if (objetos_limpos.length % 13) {
            ret['mensagem'] = msgInvalido;
            ret['erro'] = true;
            return ret;
        } else {
            if (testarTrack(objetos_limpos) === false) {
                ret['mensagem'] = msgInvalido;
                ret['erro'] = true;
                return ret;
            }
        }
    }
    return ret;



    //limpar objetos
}

//Verifica se CPF é válido acrescido em 28/12/2017 por Taiguara Lobo.
const testarCPF = (strCPF) => {
    let Soma = 0;
    let Resto;

    //strCPF  = RetiraCaracteresInvalidos(strCPF,11);
    if (strCPF === "00000000000" ||
        strCPF === "11111111111" ||
        strCPF === "22222222222" ||
        strCPF === "33333333333" ||
        strCPF === "44444444444" ||
        strCPF === "55555555555" ||
        strCPF === "66666666666" ||
        strCPF === "77777777777" ||
        strCPF === "88888888888" ||
        strCPF === "99999999999")
        return false;
    for (let i = 1; i <= 9; i++)
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;
    if ((Resto === 10) || (Resto === 11))
        Resto = 0;
    if (Resto !== parseInt(strCPF.substring(9, 10)))
        return false;
    Soma = 0;
    for (let i = 1; i <= 10; i++)
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;
    if ((Resto === 10) || (Resto === 11))
        Resto = 0;
    if (Resto !== parseInt(strCPF.substring(10, 11))) {
        return false;
    }
    return true;
}

const testarCNPJ = (strCNPJ) => {

    let tamanho;
    let numeros;
    let digitos;
    let soma;
    let pos;
    let resultado;

    strCNPJ = strCNPJ.replace(/[^\d]+/g, '');

    if (strCNPJ === '') return false;

    if (strCNPJ.length !== 14)
        return false;

    // Elimina CNPJs invalidos conhecidos
    if (strCNPJ === "00000000000000" ||
        strCNPJ === "11111111111111" ||
        strCNPJ === "22222222222222" ||
        strCNPJ === "33333333333333" ||
        strCNPJ === "44444444444444" ||
        strCNPJ === "55555555555555" ||
        strCNPJ === "66666666666666" ||
        strCNPJ === "77777777777777" ||
        strCNPJ === "88888888888888" ||
        strCNPJ === "99999999999999")
        return false;

    // Valida DVs
    tamanho = strCNPJ.length - 2
    numeros = strCNPJ.substring(0, tamanho);
    digitos = strCNPJ.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) {
        return false;
    }
    tamanho = tamanho + 1;
    numeros = strCNPJ.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) {
        return false;
    }
    return true;
}

export {
    validarCodigoObjeto
};