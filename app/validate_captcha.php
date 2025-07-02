<?php
/**
 * Arquivo para validação do CAPTCHA
 */

session_start();

// Incluir a biblioteca Securimage
require_once '../core/securimage/securimage.php';

header('Content-Type: application/json');

function validateCaptcha($captcha_code) {
    $securimage = new Securimage();
    return $securimage->check($captcha_code);
}

function sendResponse($success, $message = '') {
    echo json_encode([
        'success' => $success,
        'message' => $message
    ]);
    exit;
}

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Método não permitido');
}

// Verificar se o código do captcha foi enviado
if (!isset($_POST['captcha']) || empty(trim($_POST['captcha']))) {
    sendResponse(false, 'Código do captcha não fornecido');
}

$captcha_code = trim($_POST['captcha']);

// Validar o captcha
if (validateCaptcha($captcha_code)) {
    sendResponse(true, 'Captcha válido');
} else {
    sendResponse(false, 'Captcha inválido');
}
?>