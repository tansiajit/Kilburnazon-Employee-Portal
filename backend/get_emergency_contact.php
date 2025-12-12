<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "db_connect.php";

$employee_id = $_GET['employee_id'] ?? '';

if (empty($employee_id)) {
    echo json_encode(["success" => false, "error" => "Employee ID required"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT Emergency_Name, Emergency_Relationship, Emergency_Phone_Number
        FROM EMPLOYEE_EMERGENCY_CONTACT
        WHERE Employee_ID = :id
    ");
    $stmt->execute([':id' => (int)$employee_id]);
    $contact = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($contact) {
        echo json_encode(["success" => true, "contact" => $contact]);
    } else {
        echo json_encode(["success" => false, "contact" => null]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>