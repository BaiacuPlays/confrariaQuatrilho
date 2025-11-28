<?php
require 'conexao.php';
header('Content-Type: application/json');

// Aumenta o tempo limite de execução para vídeos grandes
set_time_limit(300); 

if (isset($_FILES['files'])) {
    $pastaDestino = 'uploads/';
    // Cria a pasta se não existir
    if (!is_dir($pastaDestino)) { mkdir($pastaDestino, 0755, true); }

    $arquivos = $_FILES['files'];
    $descricao = $_POST['descricao'] ?? ''; // Pega a descrição enviada
    
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
                // Insere com a descrição
                $stmt = $pdo->prepare("INSERT INTO galeria (caminho, tipo, descricao) VALUES (?, ?, ?)");
                $stmt->execute([$caminho, $tipo, $descricao]);
                $sucessos++;
            }
        }
    }
    echo json_encode(["status" => "sucesso", "msg" => "$sucessos arquivos enviados."]);
} else {
    echo json_encode(["status" => "erro", "msg" => "Nenhum arquivo recebido."]);
}
?>