<?php
/**
 * resultado.php - Processamento de Consultas de Rastreamento
 * Versão otimizada: apenas funcionalidade essencial
 */

session_start();
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

require_once 'securimage/securimage.php';

try {
    // Verificar método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }

    // Obter dados
    $objeto = $_POST['objeto'] ?? '';
    $captcha = $_POST['captcha'] ?? '';

    // Validações básicas
    if (empty($objeto)) {
        throw new Exception('Campo objeto é obrigatório');
    }

    if (empty($captcha)) {
        throw new Exception('Campo captcha é obrigatório');
    }

    // Validar CAPTCHA
    $securimage = new Securimage();
    if (!$securimage->check($captcha)) {
        throw new Exception('Captcha inválido');
    }

    // Limpar entrada
    $objetoLimpo = preg_replace('/[-,;. ]/', '', strtoupper($objeto));

    // Detectar tipo de consulta
    $tipoConsulta = detectarTipoConsulta($objetoLimpo);
    
    if (!$tipoConsulta['valido']) {
        throw new Exception($tipoConsulta['erro']);
    }

    // Processar consulta baseado no tipo
    $resultado = processarConsulta($tipoConsulta['tipo'], $objetoLimpo);

    // Retornar resultado
    echo json_encode([
        'sucesso' => true,
        'tipo' => $tipoConsulta['tipo'],
        'objeto' => $objetoLimpo,
        'dados' => $resultado
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'erro' => true,
        'mensagem' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

/**
 * Detecta o tipo de consulta baseado no input
 */
function detectarTipoConsulta($input) {
    $length = strlen($input);
    
    switch ($length) {
        case 11:
            // CPF
            if (validarCPF($input)) {
                return ['valido' => true, 'tipo' => 'CPF'];
            }
            return ['valido' => false, 'erro' => 'CPF inválido'];
            
        case 14:
            // CNPJ
            if (validarCNPJ($input)) {
                return ['valido' => true, 'tipo' => 'CNPJ'];
            }
            return ['valido' => false, 'erro' => 'CNPJ inválido'];
            
        case 13:
            // Código de rastreamento
            if (validarCodigoRastreamento($input)) {
                return ['valido' => true, 'tipo' => 'RASTREAMENTO'];
            }
            return ['valido' => false, 'erro' => 'Código de rastreamento inválido'];
            
        default:
            return ['valido' => false, 'erro' => 'Formato inválido. Use CPF, CNPJ ou código de rastreamento.'];
    }
}

/**
 * Valida CPF
 */
function validarCPF($cpf) {
    // Verificar se todos os dígitos são iguais
    $cpfsInvalidos = [
        '00000000000', '11111111111', '22222222222', '33333333333',
        '44444444444', '55555555555', '66666666666', '77777777777',
        '88888888888', '99999999999'
    ];
    
    if (in_array($cpf, $cpfsInvalidos)) {
        return false;
    }

    // Validar primeiro dígito
    $soma = 0;
    for ($i = 0; $i < 9; $i++) {
        $soma += intval($cpf[$i]) * (10 - $i);
    }
    
    $resto = ($soma * 10) % 11;
    if ($resto == 10 || $resto == 11) $resto = 0;
    if ($resto != intval($cpf[9])) return false;

    // Validar segundo dígito
    $soma = 0;
    for ($i = 0; $i < 10; $i++) {
        $soma += intval($cpf[$i]) * (11 - $i);
    }
    
    $resto = ($soma * 10) % 11;
    if ($resto == 10 || $resto == 11) $resto = 0;
    
    return $resto == intval($cpf[10]);
}

/**
 * Valida CNPJ
 */
function validarCNPJ($cnpj) {
    // Verificar se todos os dígitos são iguais
    $cnpjsInvalidos = [
        '00000000000000', '11111111111111', '22222222222222', '33333333333333',
        '44444444444444', '55555555555555', '66666666666666', '77777777777777',
        '88888888888888', '99999999999999'
    ];
    
    if (in_array($cnpj, $cnpjsInvalidos)) {
        return false;
    }

    // Validar primeiro dígito
    $tamanho = strlen($cnpj) - 2;
    $numeros = substr($cnpj, 0, $tamanho);
    $digitos = substr($cnpj, $tamanho);
    $soma = 0;
    $pos = $tamanho - 7;
    
    for ($i = $tamanho; $i >= 1; $i--) {
        $soma += intval($numeros[$tamanho - $i]) * $pos--;
        if ($pos < 2) $pos = 9;
    }
    
    $resultado = $soma % 11 < 2 ? 0 : 11 - $soma % 11;
    if ($resultado != intval($digitos[0])) return false;

    // Validar segundo dígito
    $tamanho = $tamanho + 1;
    $numeros = substr($cnpj, 0, $tamanho);
    $soma = 0;
    $pos = $tamanho - 7;
    
    for ($i = $tamanho; $i >= 1; $i--) {
        $soma += intval($numeros[$tamanho - $i]) * $pos--;
        if ($pos < 2) $pos = 9;
    }
    
    $resultado = $soma % 11 < 2 ? 0 : 11 - $soma % 11;
    
    return $resultado == intval($digitos[1]);
}

/**
 * Valida código de rastreamento
 */
function validarCodigoRastreamento($codigo) {
    return preg_match('/^[A-Z]{2}[0-9]{9}[A-Z]{2}$/', $codigo);
}

/**
 * Processa a consulta baseado no tipo
 */
function processarConsulta($tipo, $objeto) {
    switch ($tipo) {
        case 'CPF':
            return consultarPorCPF($objeto);
            
        case 'CNPJ':
            return consultarPorCNPJ($objeto);
            
        case 'RASTREAMENTO':
            return consultarRastreamento($objeto);
            
        default:
            throw new Exception('Tipo de consulta não suportado');
    }
}

/**
 * Consulta por CPF
 */
function consultarPorCPF($cpf) {
    // Simular consulta por CPF
    // AQUI VOCÊ IMPLEMENTARIA A INTEGRAÇÃO COM A API DOS CORREIOS
    return [
        'tipo' => 'CPF',
        'documento' => formatarCPF($cpf),
        'objetos' => [
            [
                'codigo' => 'AA123456785BR',
                'status' => 'Entregue',
                'data' => '2024-12-15',
                'local' => 'São Paulo - SP'
            ]
        ],
        'total' => 1
    ];
}

/**
 * Consulta por CNPJ
 */
function consultarPorCNPJ($cnpj) {
    // Simular consulta por CNPJ
    // AQUI VOCÊ IMPLEMENTARIA A INTEGRAÇÃO COM A API DOS CORREIOS
    return [
        'tipo' => 'CNPJ',
        'documento' => formatarCNPJ($cnpj),
        'objetos' => [
            [
                'codigo' => 'BB987654321BR',
                'status' => 'Em trânsito',
                'data' => '2024-12-18',
                'local' => 'Rio de Janeiro - RJ'
            ]
        ],
        'total' => 1
    ];
}

/**
 * Consulta rastreamento
 */
function consultarRastreamento($codigo) {
    // Simular consulta de rastreamento
    // AQUI VOCÊ IMPLEMENTARIA A INTEGRAÇÃO COM A API DOS CORREIOS
    return [
        'tipo' => 'RASTREAMENTO',
        'codigo' => $codigo,
        'tipoPostal' => ['categoria' => 'SEDEX'],
        'eventos' => [
            [
                'descricao' => 'Objeto entregue ao destinatário',
                'dtHrCriado' => ['date' => '2024-12-20T14:30:00'],
                'unidade' => [
                    'nome' => 'CDD São Paulo',
                    'endereco' => ['cidade' => 'São Paulo', 'uf' => 'SP']
                ],
                'icone' => 'entregue.png'
            ],
            [
                'descricao' => 'Objeto saiu para entrega',
                'dtHrCriado' => ['date' => '2024-12-20T08:00:00'],
                'unidade' => [
                    'nome' => 'CDD São Paulo',
                    'endereco' => ['cidade' => 'São Paulo', 'uf' => 'SP']
                ],
                'icone' => 'caminhao-cor.png'
            ],
            [
                'descricao' => 'Objeto postado',
                'dtHrCriado' => ['date' => '2024-12-18T16:45:00'],
                'unidade' => [
                    'nome' => 'Agência Central',
                    'endereco' => ['cidade' => 'São Paulo', 'uf' => 'SP']
                ],
                'icone' => 'postagem.png'
            ]
        ]
    ];
}

/**
 * Formatar CPF
 */
function formatarCPF($cpf) {
    return substr($cpf, 0, 3) . '.' . substr($cpf, 3, 3) . '.' . substr($cpf, 6, 3) . '-' . substr($cpf, 9);
}

/**
 * Formatar CNPJ
 */
function formatarCNPJ($cnpj) {
    return substr($cnpj, 0, 2) . '.' . substr($cnpj, 2, 3) . '.' . substr($cnpj, 5, 3) . '/' . substr($cnpj, 8, 4) . '-' . substr($cnpj, 12);
}
?>