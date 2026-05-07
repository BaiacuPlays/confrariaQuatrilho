<?php
require 'conexao.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT * FROM pastas ORDER BY nome ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode([]);
}
?>