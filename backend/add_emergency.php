<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db_connect.php";

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid JSON"]);
    exit;
}

try {
    // Validate required fields
    if (empty($data['employee_id'])) {
        throw new Exception("Employee ID is required");
    }

    if (empty($data['name']) || empty($data['relationship']) || empty($data['phone'])) {
        throw new Exception("Emergency contact name, relationship, and phone are required");
    }

    // Insert emergency contact
    $stmt = $pdo->prepare("
        INSERT INTO EMPLOYEE_EMERGENCY_CONTACT 
        (Employee_ID, Emergency_Name, Emergency_Relationship, Emergency_Phone_Number)
        VALUES (:employee_id, :name, :relationship, :phone)
    ");

    $stmt->execute([
        ':employee_id' => (int)$data['employee_id'],
        ':name' => $data['name'],
        ':relationship' => $data['relationship'],
        ':phone' => $data['phone']
    ]);

    // Log to audit trail
    $newValue = "Name: " . $data['name'] . 
                ", Relationship: " . $data['relationship'] . 
                ", Phone: " . $data['phone'];

    $auditStmt = $pdo->prepare("
        INSERT INTO EMPLOYEE_AUDIT 
        (employee_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (:employee_id, :action, NULL, :new_value, :changed_by, NOW())
    ");
    
    $auditStmt->execute([
        ':employee_id' => (int)$data['employee_id'],
        ':action' => 'Emergency Contact Added',
        ':new_value' => $newValue,
        ':changed_by' => 'SYSTEM'
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Emergency contact added successfully and logged to audit"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>