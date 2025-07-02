<?php
session_start();
echo "Session ID: " . session_id() . "<br>";
echo "Session Status: " . session_status() . "<br>";
echo "Temp Directory: " . sys_get_temp_dir() . "<br>";

// Testar escrita de sessão
$_SESSION['teste'] = 'funcionando';
echo "Teste de sessão: " . $_SESSION['teste'] . "<br>";

// Verificar permissões do diretório temp
$temp_dir = sys_get_temp_dir();
echo "Temp dir exists: " . (is_dir($temp_dir) ? 'SIM' : 'NÃO') . "<br>";
echo "Temp dir writable: " . (is_writable($temp_dir) ? 'SIM' : 'NÃO') . "<br>";
?>