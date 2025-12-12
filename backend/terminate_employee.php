<?php
/**
 * Terminate Employee Contract
 * 
 * Processes contract termination by:
 * 1. Setting session variables for trigger to capture
 * 2. Deleting related records (promotions, emergency contacts)
 * 3. Deleting employee record (trigger logs everything)
 * 4. Trigger automatically creates termination record
 * 5. Returns confirmation with termination details
 * 
 * GDPR Compliant: Records retained for 3 years, then deleted
 * 
 * @param int employee_id - ID of employee to terminate
 * @param string termination_reason - Reason for termination
 * @param string terminated_by - Name/ID of person processing termination
 * @return JSON success/error response
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once "db_connect.php";

try {
    $raw = file_get_contents('php://input');
    file_put_contents("php://stderr", "TERMINATION RAW BODY: " . $raw . "\n");
    
    $input = json_decode($raw, true);
    
    if (!$input) {
        throw new Exception("Invalid JSON input.");
    }

    // Validate required fields
    if (empty($input['employee_id'])) {
        throw new Exception("Employee ID is required");
    }
    
    if (empty($input['termination_reason'])) {
        throw new Exception("Termination reason is required");
    }

    // Start transaction for data consistency
    $pdo->beginTransaction();

    // Get employee details before deletion
    $stmt = $pdo->prepare("
        SELECT 
            e.Employee_ID,
            e.Employee_Full_Name,
            e.Employee_Salary,
            e.Email_Address,
            cp.Company_Position_Title,
            cp.Department_Name,
            o.Office_Name
        FROM EMPLOYEES e
        JOIN COMPANY_POSITIONS cp ON e.Company_Position_ID = cp.Company_Position_ID
        JOIN OFFICES o ON e.Office_ID = o.Office_ID
        WHERE e.Employee_ID = :id
    ");
    $stmt->execute([':id' => (int)$input['employee_id']]);
    $employee = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$employee) {
        throw new Exception("Employee not found");
    }

    file_put_contents("php://stderr", "Terminating: " . $employee['Employee_Full_Name'] . "\n");

    // Set session variables for trigger to capture
    // The before_employee_delete trigger will read these variables
    $pdo->exec("SET @termination_reason = " . $pdo->quote($input['termination_reason']));
    $pdo->exec("SET @terminated_by = " . $pdo->quote($input['terminated_by'] ?? 'HR System'));

    // DELETE RELATED RECORDS FIRST (before deleting employee)
    // This prevents foreign key constraint errors
    
    // 1. Delete from EMPLOYEE_PROMOTIONS
    $stmt = $pdo->prepare("DELETE FROM EMPLOYEE_PROMOTIONS WHERE Employee_ID = :id");
    $stmt->execute([':id' => (int)$input['employee_id']]);
    file_put_contents("php://stderr", "Deleted promotions for employee\n");
    
    // 2. Delete from EMPLOYEE_EMERGENCY_CONTACT (CORRECT TABLE NAME)
    $stmt = $pdo->prepare("DELETE FROM EMPLOYEE_EMERGENCY_CONTACT WHERE Employee_ID = :id");
    $stmt->execute([':id' => (int)$input['employee_id']]);
    file_put_contents("php://stderr", "Deleted emergency contact for employee\n");
    
    // Note: Don't delete from EMPLOYEE_AUDIT - we want to keep complete audit trail
    
    // 3. Now delete employee - trigger will automatically log to CONTRACT_TERMINATIONS
    $stmt = $pdo->prepare("DELETE FROM EMPLOYEES WHERE Employee_ID = :id");
    $stmt->execute([':id' => (int)$input['employee_id']]);
    file_put_contents("php://stderr", "Deleted employee record\n");

    // Verify termination was logged by trigger
    $stmt = $pdo->prepare("
        SELECT Termination_ID 
        FROM CONTRACT_TERMINATIONS 
        WHERE Original_Employee_ID = :id 
        ORDER BY Created_At DESC 
        LIMIT 1
    ");
    $stmt->execute([':id' => (int)$input['employee_id']]);
    $termination = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$termination) {
        throw new Exception("Termination logging failed - trigger did not execute properly");
    }

    // Commit transaction - all changes are permanent
    $pdo->commit();

    file_put_contents("php://stderr", "Termination successful! ID: " . $termination['Termination_ID'] . "\n");

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Employee contract terminated successfully',
        'termination_id' => $termination['Termination_ID'],
        'employee_name' => $employee['Employee_Full_Name'],
        'employee_id' => $employee['Employee_ID'],
        'position' => $employee['Company_Position_Title'],
        'department' => $employee['Department_Name'],
        'termination_date' => date('Y-m-d'),
        'termination_time' => date('H:i:s'),
        'gdpr_notice' => 'Record will be retained for 3 years for compliance purposes'
    ]);

} catch (PDOException $e) {
    // Rollback transaction on database error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    $msg = $e->getMessage();
    file_put_contents("php://stderr", "PDO ERROR: $msg\n");
    
    // Check for specific error types
    if (strpos($msg, 'foreign key constraint') !== false) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Cannot terminate employee due to related records. Please contact IT support.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => "Database error: " . $msg
        ]);
    }
    
} catch (Exception $e) {
    // Rollback transaction on general error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    file_put_contents("php://stderr", "ERROR: " . $e->getMessage() . "\n");
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
