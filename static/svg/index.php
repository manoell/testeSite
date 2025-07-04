<?php
/**
 * Redirecionamento Seguro - Static SVG
 * Versão otimizada: headers de segurança aprimorados
 */

// === HEADERS DE SEGURANÇA ===
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// === REDIRECIONAMENTO OTIMIZADO ===
header('Location: ../../app/index.php', true, 301);
exit;