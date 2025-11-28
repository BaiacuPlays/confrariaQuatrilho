<?php
require 'conexao.php';
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id'])) {
    // Primeiro deletamos o arquivo físico da pasta
    $stmt = $pdo->prepare("SELECT caminho FROM galeria WHERE id = ?");
    $stmt->execute([$data['id']]);
    $item = $stmt->fetch();

    if($item && file_exists($item['caminho'])) {
        unlink($item['caminho']); // Apaga o arquivo da pasta uploads
    }

    // Depois deletamos do banco
    $stmt = $pdo->prepare("DELETE FROM galeria WHERE id = ?");
    $stmt->execute([$data['id']]);
    echo json_encode(["status" => "sucesso"]);
}
?>