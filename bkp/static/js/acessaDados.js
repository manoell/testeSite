/**
 * Dispara uma promessa para acessar dados do banco.
 * @param [ação, lista de campos, endPoint]
 * 
 * Ex.:
 * 	var parametros = {
 *		acao: 'abreChat',
 *		id_chat: id_chat,
 *		id_origem: $("#carteiro").val(),
 *		endpoint: 'chat.php'
 *	}
 **/

// Acessa os dados do banco
const acessaDados = (async (parametros) => {
    return new Promise((resolve, reject) => {

        let p = parametros

        fetch(
                parametros.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        parametros: p
                    })
                })
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(erro => resolve(erro))
    })
})

export {
    acessaDados
};