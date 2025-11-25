<?php
// conexao.php
$host = "localhost";
$db   = "u728810788_sitequatrilho"; // Ex: u123456_sitequatrilho
$user = "u728810788_admin";       // Ex: u123456_admin
$pass = "pokemonL123.@";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erro na conexão: " . $e->getMessage());
}
?>