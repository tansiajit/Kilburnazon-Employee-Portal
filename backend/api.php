<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include __DIR__ . '/db_connect.php'; // make sure $pdo is defined here

$table = $_GET['table'] ?? '';
$department = $_GET['department'] ?? '';

try {
    switch ($table) {
        case 'departments':
            $stmt = $pdo->query("SELECT Department_Name FROM DEPARTMENTS");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;

        case 'offices':
            $stmt = $pdo->query("SELECT Office_ID, Office_Name FROM OFFICES");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;

        case 'positions':
            if ($department) {
                $stmt = $pdo->prepare("SELECT Company_Position_ID, Company_Position_Title FROM COMPANY_POSITIONS WHERE Department_Name = :dept");
                $stmt->execute(['dept' => $department]);
            } else {
                $stmt = $pdo->query("SELECT Company_Position_ID, Company_Position_Title FROM COMPANY_POSITIONS");
            }
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;

        default:
            $data = ["error" => "Invalid table parameter."];
            break;
    }

    echo json_encode($data);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
