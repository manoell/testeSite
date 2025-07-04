<?php
/**
 * Arquivo de proteção otimizado - core/js
 * Redireciona para aplicação principal com headers de segurança
 */

// Headers de segurança
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Redirecionamento
header('Location: ../../app/index.php');
exit;
?>