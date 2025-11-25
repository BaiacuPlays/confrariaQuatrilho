<?php
// excluir_noticia.php
require 'conexao.php';

// Recebe o ID da notícia que deve ser apagada
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id'])) {
    try {
        // Comando SQL para deletar
        $stmt = $pdo->prepare("DELETE FROM noticias WHERE id = ?");
        $stmt->execute([$data['id']]);
        
        echo json_encode(["status" => "sucesso"]);
    } catch (Exception $e) {
        echo json_encode(["status" => "erro", "mensagem" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "erro", "mensagem" => "ID não fornecido"]);
}
?>