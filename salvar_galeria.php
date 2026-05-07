<?php
require 'conexao.php';
header('Content-Type: application/json');

set_time_limit(300); 

if (isset($_FILES['files'])) {
    $pastaDestino = 'uploads/';
    if (!is_dir($pastaDestino)) { mkdir($pastaDestino, 0755, true); }

    $arquivos = $_FILES['files'];
    $descricao = $_POST['descricao'] ?? ''; 
    
    // NOVO: Pega o ID da pasta que veio do formulário
    $pasta_id = !empty($_POST['pasta_id']) ? $_POST['pasta_id'] : null;
    
    $total = is_array($arquivos['name']) ? count($arquivos['name']) : 1;
    $sucessos = 0;

    for($i = 0; $i < $total; $i++) {
        $nome = is_array($arquivos['name']) ? $arquivos['name'][$i] : $arquivos['name'];
        $tmp  = is_array($arquivos['tmp_name']) ? $arquivos['tmp_name'][$i] : $arquivos['tmp_name'];
        
        if($nome) {
            $ext = strtolower(pathinfo($nome, PATHINFO_EXTENSION));
            $novoNome = "galeria_" . uniqid() . "." . $ext;
            $caminho = $pastaDestino . $novoNome;
            $tipo = in_array($ext, ['mp4', 'mov', 'webm']) ? 'video' : 'foto';

            if(move_uploaded_file($tmp, $caminho)) {
                // NOVO: Adicionado pasta_id no banco de dados
                $stmt = $pdo->prepare("INSERT INTO galeria (caminho, tipo, descricao, pasta_id) VALUES (?, ?, ?, ?)");
                $stmt->execute([$caminho, $tipo, $descricao, $pasta_id]);
                $sucessos++;
            }
        }
    }
    echo json_encode(["status" => "sucesso", "msg" => "$sucessos arquivos enviados."]);
} else {
    echo json_encode(["status" => "erro", "msg" => "Nenhum arquivo recebido."]);
}
?>