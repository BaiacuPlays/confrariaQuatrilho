<?php
// listar_noticias.php
require 'conexao.php';

try {
    // Pega as notícias ordenadas da mais nova para a mais velha (DESC)
    $stmt = $pdo->query("SELECT * FROM noticias ORDER BY id DESC");
    $noticias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Devolve para o site em formato JSON
    echo json_encode($noticias);
} catch (Exception $e) {
    echo json_encode([]);
}
?>