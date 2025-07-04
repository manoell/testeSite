<?php
session_start();
header('Content-Type: application/json');

require_once '../core/securimage/securimage.php';

$objeto = $_GET['objeto'] ?? '';
$captcha = $_GET['captcha'] ?? '';

// Validar CAPTCHA
$securimage = new Securimage();
if (!$securimage->check($captcha)) {
    echo json_encode(['erro' => true, 'mensagem' => 'Captcha inválido']);
    exit;
}

// Verificar se objeto foi enviado
if (empty($objeto)) {
    echo json_encode(['erro' => true, 'mensagem' => 'Objeto é obrigatório']);
    exit;
}

// Limpar objeto (remover espaços e converter para maiúsculo)
$objeto = strtoupper(preg_replace('/\s+/', '', $objeto));

// Determinar tipo do objeto e processar
$tipo = determinarTipoObjeto($objeto);

switch ($tipo) {
    case 'CPF':
        consultarCPF($objeto);
        break;
    case 'CNPJ':
        consultarCNPJ($objeto);
        break;
    case 'CODIGO_RASTREIO':
        consultarCodigoRastreio($objeto);
        break;
    default:
        echo json_encode(['erro' => true, 'mensagem' => 'Formato inválido. Digite um código de rastreio (13 caracteres), CPF (11 dígitos) ou CNPJ (14 dígitos)']);
        exit;
}

/**
 * Determinar tipo do objeto baseado no formato
 */
function determinarTipoObjeto($objeto) {
    if (preg_match('/^[0-9]{11}$/', $objeto)) {
        return 'CPF';
    }
    if (preg_match('/^[0-9]{14}$/', $objeto)) {
        return 'CNPJ';
    }
    if (preg_match('/^[A-Z]{2}[0-9]{9}[A-Z]{2}$/', $objeto)) {
        return 'CODIGO_RASTREIO';
    }
    return null;
}

/**
 * Consultar CPF na API Apela
 */
function consultarCPF($cpf) {
    $url = "https://apela-api.tech/?user=c2af4c30-ed08-4672-9b8a-f172ca2880cd&cpf=" . $cpf;
    
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => [
            "Accept: application/json",
            "User-Agent: Mozilla/5.0 (compatible; SistemaRastreamento/1.0)"
        ],
    ]);

    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $err = curl_error($curl);
    curl_close($curl);

    if ($err) {
        echo json_encode(['erro' => true, 'mensagem' => 'Erro de conexão: ' . $err]);
        return;
    }

    if ($httpCode !== 200) {
        echo json_encode(['erro' => true, 'mensagem' => 'Erro na API: HTTP ' . $httpCode]);
        return;
    }

    $data = json_decode($response, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['erro' => true, 'mensagem' => 'Erro ao processar resposta da API']);
        return;
    }

    if (isset($data['status']) && $data['status'] !== 200) {
        echo json_encode(['erro' => true, 'mensagem' => 'CPF não encontrado']);
        return;
    }

    echo json_encode([
        'erro' => false,
        'tipo' => 'cpf',
        'nome' => $data['nome'] ?? '',
        'mae' => $data['mae'] ?? '',
        'nascimento' => $data['nascimento'] ?? '',
        'cpf' => $data['cpf'] ?? $cpf,
        'sexo' => $data['sexo'] ?? ''
    ]);
}

/**
 * Consultar CNPJ na API ReceitaWS
 */
function consultarCNPJ($cnpj) {
    $url = "https://receitaws.com.br/v1/cnpj/" . $cnpj;
    
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_HTTPHEADER => [
            "Accept: application/json",
            "User-Agent: Mozilla/5.0 (compatible; SistemaRastreamento/1.0)"
        ],
    ]);

    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $err = curl_error($curl);
    curl_close($curl);

    if ($err) {
        echo json_encode(['erro' => true, 'mensagem' => 'Erro de conexão: ' . $err]);
        return;
    }

    if ($httpCode !== 200) {
        echo json_encode(['erro' => true, 'mensagem' => 'Erro na API: HTTP ' . $httpCode]);
        return;
    }

    $data = json_decode($response, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['erro' => true, 'mensagem' => 'Erro ao processar resposta da API']);
        return;
    }

    if (isset($data['status']) && $data['status'] === 'ERROR') {
        echo json_encode(['erro' => true, 'mensagem' => $data['message'] ?? 'CNPJ não encontrado']);
        return;
    }

    echo json_encode([
        'erro' => false,
        'tipo' => 'cnpj',
        'nome' => $data['nome'] ?? '',
        'fantasia' => $data['fantasia'] ?? '',
        'cnpj' => $data['cnpj'] ?? $cnpj,
        'situacao' => $data['situacao'] ?? '',
        'atividade_principal' => $data['atividade_principal'][0]['text'] ?? '',
        'logradouro' => $data['logradouro'] ?? '',
        'numero' => $data['numero'] ?? '',
        'municipio' => $data['municipio'] ?? '',
        'uf' => $data['uf'] ?? '',
        'cep' => $data['cep'] ?? '',
        'telefone' => $data['telefone'] ?? '',
        'email' => $data['email'] ?? ''
    ]);
}

/**
 * Consultar Código de Rastreio (simulado - implementar API dos Correios)
 */
function consultarCodigoRastreio($codigo) {
    // TODO: Implementar consulta real da API dos Correios
    // Por enquanto, retornar dados simulados compatíveis com o sistema existente
    
    $dados = [
        'erro' => false,
        'tipo' => 'rastreio',
        'codObjeto' => $codigo,
        'tipoPostal' => ['categoria' => 'SEDEX'],
        'eventos' => [
            [
                'descricao' => 'Objeto postado',
                'dtHrCriado' => ['date' => date('Y-m-d\TH:i:s')],
                'unidade' => [
                    'nome' => 'Agência Central',
                    'endereco' => ['cidade' => 'São Paulo', 'uf' => 'SP']
                ],
                'icone' => 'caminhao-cor.png'
            ]
        ]
    ];

    echo json_encode($dados);
}
?>