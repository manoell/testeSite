export {
    ul,
    verificaInversao,
    ehTipoPostalInternacional,
    detalheEvento,
    formataData,
    verMais,
};

const ul = (objeto) => {
    let li = percorreEventos(objeto);

    return `
        <ul class="ship-steps">
            ${li}
        </ul>
    `;
};

const formataDataHora = (dataHora) => {
    let dh = dataHora === "" ? "0000-00-00T00:00:00" : dataHora;
    const dataFormatada = dh.substring(0, 10).split("-").reverse().join("/");
    const horaFormatada = dh.substring(0, 16).slice(-5);

    return dataFormatada + " " + horaFormatada;
};

const formataData = (dataHora) => {
    let dh = dataHora ? ? "0000-00-00T00:00:00";

    const dataFormatada = dh
        .substring(0, 10)
        .split("-")
        .reverse()
        .join("/")
        .substring(0, 10);
    return dataFormatada;
};

const defaultIcone = () => {
    return "caminhao-cor.png";
};

const divTextRota = (descricao, ...texto) => {
const locais = texto[0].local;
const detalhes = texto[0].detalhe;
const dataHora = texto[0].dataHora;

return `
        <div class="step-content">
            <p class="text text-head">${descricao}</p>
            ${locais
              .map((local) => `<p class="text text-content">${local}</p>`)
              .join("")}
              ${detalhes
                .map((detalhe) => {
                  const regex = /(https?:\/\/[^\s]+)/;
                  const resultado = detalhe.match(regex);
                  const url = resultado
                    ? resultado[0].replace(/\.$/, "")
                    : null; // Usa null se não houver
                  let textoSemUrl = detalhe
                    .replace(/<a[^>]*>(.*?)<\/a>/, "$1")
                    .trim();
                  // let textoSemUrl = detalhe.replace(regex, "").trim();
                  textoSemUrl = textoSemUrl.replace(/:\s*$/, ".");
                  if (url) {
                    return `<p class="text text-head"><a href="${url}" target="_blank"><u>${textoSemUrl}</u></a></p>`;
                  } else {
                    return ` < p class = "text text-head" > $ {
    detalhe
} < /p>`; / / Retorna o detalhe original se não houver URL
}
})
.join("")
} <
p class = "text text-content" > $ {
        dataHora
    } < /p> <
    /div>
`;
};

const getCidadeUf = (endereco) => {
  try {
    const cidade = endereco.cidade ?? "";
    const uf = endereco.uf ?? "";
    let separador = "";
    let retorno = "";
    if (endereco.logradouro !== null) {
      retorno = `
$ {
    endereco.logradouro
}, $ {
    endereco.numero ? ? ""
} < br / >
    $ {
        endereco.bairro ? ? ""
    } < br / > `;
    }
    if (cidade.length && uf.length) {
      separador = " - ";
    }
    retorno += `
$ {
    cidade
}
$ {
    separador
}
$ {
    uf
}
`;
    return retorno;
  } catch (error) {
    return "";
  }
};

const divArrow = (arrow, icone) => {
  return ` <
div class = "${arrow}" >
    <
    div class = "circle" >
    <
    img class = "circle-img"
src = "../static/rastreamento-internet/imgs/${icone}" >
    <
    /div> <
    /div>
`;
};

const tipoUnidade = {
  pais: function ({
    descricaoWeb = "",
    evento = "",
    codObjeto = "",
    ehFinalizador,
    autoDeclaracao,
  }) {
    return caminhoInternacional[
      descricaoWeb === "TRANSITO" ? descricaoWeb.toLowerCase() : "normal"
    ](evento, codObjeto, ehFinalizador, autoDeclaracao);
  },
  outras: function ({
    rota = "",
    descricaoWeb = "",
    evento = "",
    percorridaCarteiro,
  }) {
    return caminhoNacional[
      rota === "CONTEXTO" ? descricaoWeb.toLowerCase() : "normal"
    ](evento, percorridaCarteiro);
  },
};

const caminhoInternacional = {
  normal: function ({ unidade: { nome = "" }, detalhe }) {
    const l = { local: [], detalhe: [], dataHora: "" };
    l.local.push(nome);
    if (detalhe !== "") {
      l.detalhe.push(detalhe);
    }
    return l;
  },
  transito: function (
    { unidade, unidadeDestino = "", codigo, tipo, detalhe },
    codObjeto,
    ehFinalizador,
    autoDeclaracao
  ) {
    const local = unidade.nome;
    let para = "";
    para +=
      typeof unidadeDestino.nome === "undefined"
        ? ""
        : `
para $ {
    unidadeDestino.nome
}
`;
    para +=
      typeof unidadeDestino.endereco.uf === "undefined"
        ? ""
        : ` - $ {
    unidadeDestino.endereco.uf
}
`;
    const l = { local: [], detalhe: [], dataHora: "" };
    l.local.push(para);
    if (autoDeclaracao && ehFinalizador === "N") {
      const lk = `
Acesse < a href = "https://portalimportador.correios.com.br"
style = "text-decoration: underline; cursor: pointer;" > Minhas Importações < /a> para informar o nº do documento e dar prosseguimento ao processo de fiscalização.`;
l.local.push(lk);
}
l.local.push(local);
if (detalhe !== "") {
    l.detalhe.push(detalhe);
}
return l;
},
};

const caminhoNacional = {
    normal: function({
            unidade = "",
            unidade: {
                tipo = ""
            },
            detalhe = "",
            comentario = ""
        },
        percorridaCarteiro
    ) {
        const cidadeUf = getCidadeUf(unidade.endereco);
        const l = {
            local: [],
            detalhe: [],
            dataHora: ""
        };
        l.local.push(cidadeUf);
        if (detalhe !== "") {
            l.detalhe.push(detalhe);
        }
        return l;
    },
    transito: function({
            unidade = "",
            unidade: {
                tipo = ""
            },
            unidadeDestino = "",
            detalhe = ""
        },
        pc
    ) {
        const cidadeUf = getCidadeUf(unidade.endereco);
        const de = `de ${tipo}, ${cidadeUf}`;
        const tipoDestino =
            typeof unidadeDestino.tipo === "undefined" ? "" : unidadeDestino.tipo;
        const cidadeUfDestino = getCidadeUf(unidadeDestino.endereco);
        const para = `para ${tipoDestino}, ${cidadeUfDestino}`;
        const l = {
            local: [],
            detalhe: [],
            dataHora: ""
        };
        l.local.push(de);
        l.local.push(para);
        if (detalhe !== "") {
            l.detalhe.push(detalhe);
        }
        return l;
    },
    entregue: function({
        unidade = "",
        detalhe = ""
    }, pc) {
        const local = `Pela ${unidade.tipo}, ${getCidadeUf(unidade.endereco)}`;
        const l = {
            local: [],
            detalhe: [],
            dataHora: ""
        };
        l.local.push(local);
        if (detalhe !== "") {
            l.detalhe.push(detalhe);
        }
        return l;
    },
    retirada: function({
        unidade = "",
        detalhe = ""
    }, pc) {
        const cidadeUf = getCidadeUf(unidade.endereco);
        const local = `${unidade.nome},${cidadeUf}`;
        const l = {
            local: [],
            detalhe: [],
            dataHora: ""
        };
        l.local.push(local);
        if (detalhe !== "") {
            l.detalhe.push(detalhe);
        }
        return l;
    },
    extraviado: function({
        unidade = "",
        detalhe = ""
    }, pc) {
        const cidadeUf = getCidadeUf(unidade.endereco);
        const local = unidade.nome.length ?
            `${unidade.nome},${cidadeUf}` :
            `${cidadeUf}`;
        const l = {
            local: [],
            detalhe: [],
            dataHora: ""
        };
        l.local.push(local);
        if (detalhe !== "") {
            l.detalhe.push(detalhe);
        }
        return l;
    },
    recebidocorreiosbrasil: function(evento, pc) {
        return caminhoNacional["extraviado"](evento);
    },
};

const removerAcentos = (stringg) => {
    return stringg.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const createLiRota = ({
    codObjeto,
    evento,
    arrow,
    ehFinalizador,
    percorridaCarteiro,
    autoDeclaracao,
    locker,
}) => {
    const icone = evento.icone;
    const tipo = evento.unidade.tipo;
    let descricao = evento.descricao;
    if (locker && evento.icone === "locker.png") {
        descricao +=
            '<button type="button" class="btnLckIcon"><img src="../static/png/qr-code-cor.png" class="icone-locker"  alt="imagem do locker"></img></button>';
    }

    const objectEvento = {
        descricaoWeb: evento.descricaoWeb,
        evento: evento,
        rota: evento.rota,
        codObjeto: codObjeto,
        ehFinalizador: ehFinalizador,
        percorridaCarteiro: percorridaCarteiro,
        autoDeclaracao: autoDeclaracao,
    };
    //metodos
    let linhasTexto =
        tipoUnidade[
            tipo.toUpperCase() === "PAÍS" ?
            removerAcentos(tipo).toLowerCase() :
            "outras"
        ](objectEvento);
    linhasTexto.dataHora = formataDataHora(evento.dtHrCriado.date);

    const dvTexto = divTextRota(descricao, linhasTexto);
    const dvArrow = divArrow(arrow, icone);
    return createLi(dvArrow, dvTexto);
};

const createLi = (divArrow, divTexto) => {
    let div = `
        ${divArrow}
        ${divTexto}
    `;
    return `<li class="step">${div}</li>`;
};

const ehTipoPostalInternacional = (tipo) => {
    let descricao = tipo.descricao;
    descricao = descricao.toUpperCase();

    return descricao.includes("INTERNACIONAL");
};

const verificaInversao = (eventos) => {
    const {
        descricaoWeb
    } = detalheEvento(eventos[0]);
    if (descricaoWeb === "POSTAGEM") {
        return eventos.reverse();
    } else {
        return eventos;
    }
};

const formataCodigoTipo = (codigo, tipo) => {
    return codigo + "-" + formataTipo(tipo);
};

const formataTipo = (tipo) => {
    tipo = (100 + parseInt(tipo)).toString();
    return tipo.substr(1, 3);
};

const percorreEventos = ({
    eventos,
    codObjeto,
    percorridaCarteiro,
    autoDeclaracao,
    locker,
}) => {
    const qtEventos = eventos.length;
    const keys = Object.keys(eventos);
    let cont = 0;
    let li = "";
    const eventoTopo = eventos[0];
    const ehFinalizador = eventoTopo.finalizador;

    for (const key of keys) {
        let ev = eventos[key];
        cont += 1;

        let arrow = "arrow-current";

        if (qtEventos === cont) {
            arrow = "arrow-none";
        }

        let eventoIndividual = {
            codObjeto: codObjeto,
            evento: ev,
            arrow: arrow,
            ehFinalizador: ehFinalizador,
            percorridaCarteiro: percorridaCarteiro,
            autoDeclaracao: autoDeclaracao,
            locker: locker,
        };

        //li += createLiRota(ev, arrow, codObjeto);
        li += createLiRota(eventoIndividual);
    }

    return li;
};

const detalheEvento = ({
    codigo,
    tipo
}) => {
    try {
        tipo = formataTipo(tipo);
        const retorno = detalhesEvento.eventos
            .find((ev) => ev.evento === codigo)
            .detalhes.find((st) => st.status === tipo);
        return typeof retorno === "undefined" ? "" : retorno;
    } catch (err) {
        return "";
    }
};

const verMais = (objeto) => {
    let eventos = objeto["eventos"];
    const qtEventos = eventos.length;
    const codObjeto = objeto.codObjeto;

    if (qtEventos > 3) {
        let li = "";
        let ev = eventos[0];
        let arrow = "arrow-current";
        let eventoIndividual = {
            codObjeto: codObjeto,
            evento: ev,
            arrow: arrow,
            locker: objeto.locker,
        };
        //createLiRota(codObjeto, ev, arrow);
        li += createLiRota(eventoIndividual);
        //ev = eventos[1];
        eventoIndividual["evento"] = eventos[1];
        li += createLiRota(eventoIndividual);
        //
        li += createLiVerMais();
        //
        arrow = "arrow-none";
        //ev = eventos[qtEventos-1];
        eventoIndividual["evento"] = eventos[qtEventos - 1];
        eventoIndividual["arrow"] = arrow;
        li += createLiRota(eventoIndividual);
        return `
            <ul class="ship-steps">
                ${li}
            </ul>
        `;
    }

    return "";
};

const createLiVerMais = () => {
    const body = document.body;
    const className = body.className;
    let classe = "title";
    if (className === "contrast") {
        classe = "title-c";
    }

    return `
        <li style="padding-top: 20px;">
            <div class="arrow-dashed" style="height: 20px;">
            </div>
        </li>

        <div class="btn-ver-mais">
            <a id="a-ver-mais" style="cursor:pointer;">
            <i class="fa fa-plus-circle fa-2x icon-has-btn"></i>
            <span id="tooltip-vermais" class="${classe}">Mais informações</span>
            </a>
        </div>

        <li style="padding-bottom: 20px;">
            <div class="arrow-dashed" style="height: 20px;">
            </div>
        </li>
    `;
};