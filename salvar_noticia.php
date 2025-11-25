<?php
// salvar_noticia.php
require 'conexao.php';

// Mostra erros para debug (pode remover depois que funcionar)
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// 1. Diagnóstico: Se $_FILES e $_POST estiverem vazios, é bloqueio do servidor ou erro de Header JS
if (empty($_FILES) && empty($_POST)) {
    $tamanhoPost = (int)(ini_get('post_max_size'));
    $tamanhoUpload = (int)(ini_get('upload_max_filesize'));
    
    echo json_encode([
        "status" => "erro", 
        "mensagem" => "O PHP não recebeu dados. Verifique: 1. Se removeu o 'header' no JS. 2. Se o memory_limit na Hostinger é maior que $tamanhoUpload M."
    ]);
    exit;
}

if (isset($_FILES['files'])) {
    $titulo    = $_POST['title'] ?? 'Sem Título';
    $resumo    = $_POST['summary'] ?? '';
    $texto     = $_POST['fullText'] ?? '';
    $data      = $_POST['date'] ?? '';
    
    $caminhosSalvos = [];
    $pastaDestino = 'uploads/';

    // Cria a pasta se não existir
    if (!is_dir($pastaDestino)) {
        mkdir($pastaDestino, 0755, true);
    }

    // Normaliza o array de arquivos
    $file_ary = array();
    $file_count = count($_FILES['files']['name']);
    $file_keys = array_keys($_FILES['files']);

    for ($i=0; $i<$file_count; $i++) {
        foreach ($file_keys as $key) {
            $file_ary[$i][$key] = $_FILES['files'][$key][$i];
        }
    }

    // Processa cada arquivo
    foreach ($file_ary as $file) {
        if ($file['error'] === UPLOAD_ERR_OK) {
            $extensao = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $novoNome = date("YmdHis") . "_" . uniqid() . "." . $extensao;
            $caminhoCompleto = $pastaDestino . $novoNome;

            if(move_uploaded_file($file['tmp_name'], $caminhoCompleto)) {
                $caminhosSalvos[] = $caminhoCompleto;
            }
        } else {
             // Debug de erro específico do arquivo
             error_log("Erro no arquivo: " . $file['error']);
        }
    }

    if (count($caminhosSalvos) > 0) {
        $imagensJSON = json_encode($caminhosSalvos);
        try {
            $stmt = $pdo->prepare("INSERT INTO noticias (title, image, summary, full_text, date) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$titulo, $imagensJSON, $resumo, $texto, $data]);
            echo json_encode(["status" => "sucesso"]);
        } catch (Exception $e) {
            echo json_encode(["status" => "erro", "mensagem" => "Erro SQL: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Falha ao salvar arquivos na pasta. Verifique permissões."]);
    }

} else {
    echo json_encode(["status" => "erro", "mensagem" => "Campo 'files[]' não encontrado."]);
}
?>