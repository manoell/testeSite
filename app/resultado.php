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

// Simular dados de resposta (substitua pela sua lógica)
$dados = [
    'codObjeto' => $objeto,
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
?>