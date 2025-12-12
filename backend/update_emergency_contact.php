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

if (!$data || empty($data['employee_id'])) {
    echo json_encode(["success" => false, "error" => "Invalid input"]);
    exit;
}

try {
    // Check if emergency contact exists
    $stmt = $pdo->prepare("SELECT Emergency_Name, Emergency_Relationship, Emergency_Phone_Number FROM EMPLOYEE_EMERGENCY_CONTACT WHERE Employee_ID = :id");
    $stmt->execute([':id' => (int)$data['employee_id']]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    $isUpdate = $existing ? true : false;
    $oldValue = "";
    $newValue = "";
    $action = "";

    if ($isUpdate) {
        // Build old and new value strings for audit
        $oldValue = "Name: " . ($existing['Emergency_Name'] ?? 'N/A') . 
                    ", Relationship: " . ($existing['Emergency_Relationship'] ?? 'N/A') . 
                    ", Phone: " . ($existing['Emergency_Phone_Number'] ?? 'N/A');
        
        $newValue = "Name: " . ($data['name'] ?? 'N/A') . 
                    ", Relationship: " . ($data['relationship'] ?? 'N/A') . 
                    ", Phone: " . ($data['phone'] ?? 'N/A');
        
        $action = "Emergency Contact Updated";
        
        // Update existing
        $stmt = $pdo->prepare("
            UPDATE EMPLOYEE_EMERGENCY_CONTACT
            SET Emergency_Name = :name,
                Emergency_Relationship = :relationship,
                Emergency_Phone_Number = :phone
            WHERE Employee_ID = :id
        ");
    } else {
        $newValue = "Name: " . ($data['name'] ?? 'N/A') . 
                    ", Relationship: " . ($data['relationship'] ?? 'N/A') . 
                    ", Phone: " . ($data['phone'] ?? 'N/A');
        
        $action = "Emergency Contact Added";
        
        // Insert new
        $stmt = $pdo->prepare("
            INSERT INTO EMPLOYEE_EMERGENCY_CONTACT 
            (Employee_ID, Emergency_Name, Emergency_Relationship, Emergency_Phone_Number)
            VALUES (:id, :name, :relationship, :phone)
        ");
    }

    $stmt->execute([
        ':id' => (int)$data['employee_id'],
        ':name' => $data['name'] ?? '',
        ':relationship' => $data['relationship'] ?? '',
        ':phone' => $data['phone'] ?? ''
    ]);

    // Log to audit trail
    $auditStmt = $pdo->prepare("
        INSERT INTO EMPLOYEE_AUDIT 
        (employee_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (:employee_id, :action, :old_value, :new_value, :changed_by, NOW())
    ");
    
    $auditStmt->execute([
        ':employee_id' => (int)$data['employee_id'],
        ':action' => $action,
        ':old_value' => $oldValue,
        ':new_value' => $newValue,
        ':changed_by' => 'SYSTEM'
    ]);

    echo json_encode(["success" => true, "message" => "Emergency contact updated and logged to audit"]);
    
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>