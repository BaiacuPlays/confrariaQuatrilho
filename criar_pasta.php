<?php
require 'conexao.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['nome']) && isset($data['tipo'])) {
    $parent_id = !empty($data['parent_id']) ? $data['parent_id'] : null;
    try {
        $stmt = $pdo->prepare("INSERT INTO pastas (nome, tipo, parent_id) VALUES (?, ?, ?)");
        $stmt->execute([$data['nome'], $data['tipo'], $parent_id]);
        echo json_encode(["status" => "sucesso"]);
    } catch (Exception $e) {
        echo json_encode(["status" => "erro", "msg" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "erro", "msg" => "Dados inválidos."]);
}
?>