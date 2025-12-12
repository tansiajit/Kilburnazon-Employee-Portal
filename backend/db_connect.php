<?php

$database_host = "dbhost.cs.man.ac.uk";
$database_user = "a94932ta";
$database_pass = "+3CxZJekdZdd57bgrQT2ah0XS36zt66Xru07aVW4abg";
$database_name = "a94932ta";

try {
    $pdo = new PDO("mysql:host=$database_host;dbname=$database_name;charset=utf8", $database_user, $database_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Remove or comment out this line:
    // echo "Database connected!";
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>