<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db_connect.php";

$employee_id = $_GET['employee_id'] ?? null;

try {
    if ($employee_id) {
        // Get audit log for specific employee
        $sql = "SELECT 
            audit_id,
            employee_id,
            action,
            old_value,
            new_value,
            changed_by,
            changed_at
        FROM EMPLOYEE_AUDIT
        WHERE employee_id = :employee_id
        ORDER BY changed_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':employee_id' => (int)$employee_id]);
    } else {
        // Get all audit logs
        $sql = "SELECT 
            ea.audit_id,
            ea.employee_id,
            e.Employee_Full_Name,
            ea.action,
            ea.old_value,
            ea.new_value,
            ea.changed_by,
            ea.changed_at
        FROM EMPLOYEE_AUDIT ea
        LEFT JOIN EMPLOYEES e ON ea.employee_id = e.Employee_ID
        ORDER BY ea.changed_at DESC
        LIMIT 100";
        
        $stmt = $pdo->query($sql);
    }
    
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "audit_logs" => $logs,
        "count" => count($logs)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
