<?php
require 'conexao.php';
header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id'])) {
    try {
        // Joga o conteúdo da pasta para a raiz
        $pdo->prepare("UPDATE galeria SET pasta_id = NULL WHERE pasta_id = ?")->execute([$data['id']]);
        $pdo->prepare("UPDATE pastas SET parent_id = NULL WHERE parent_id = ?")->execute([$data['id']]);
        // Apaga a pasta
        $pdo->prepare("DELETE FROM pastas WHERE id = ?")->execute([$data['id']]);
        echo json_encode(["status" => "sucesso"]);
    } catch (Exception $e) {
        echo json_encode(["status" => "erro", "msg" => $e->getMessage()]);
    }
}
?>