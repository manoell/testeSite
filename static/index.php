<?php
/**
 * Redirecionamento Seguro - Pasta Static
 * Versão otimizada: headers de segurança aprimorados, redirecionamento direto
 */

// === HEADERS DE SEGURANÇA REFORÇADOS ===
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Robots-Tag: noindex, nofollow');

// === PREVENIR CACHE DESTA PÁGINA ===
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// === REDIRECIONAMENTO OTIMIZADO ===
header('Location: ../app/index.php', true, 301);
exit;