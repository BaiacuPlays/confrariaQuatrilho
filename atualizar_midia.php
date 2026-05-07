<?php
require 'conexao.php';
header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id']) && isset($data['acao'])) {
    try {
        if ($data['acao'] === 'mover') {
            $pasta_id = !empty($data['pasta_id']) ? $data['pasta_id'] : null;
            $stmt = $pdo->prepare("UPDATE galeria SET pasta_id = ? WHERE id = ?");
            $stmt->execute([$pasta_id, $data['id']]);
        } 
        else if ($data['acao'] === 'editar_desc') {
            $stmt = $pdo->prepare("UPDATE galeria SET descricao = ? WHERE id = ?");
            $stmt->execute([$data['descricao'], $data['id']]);
        }
        echo json_encode(["status" => "sucesso"]);
    } catch (Exception $e) {
        echo json_encode(["status" => "erro", "msg" => $e->getMessage()]);
    }
}
?>