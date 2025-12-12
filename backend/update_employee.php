<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Suppress display errors but log them
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once "db_connect.php";

try {
    // Read and decode JSON input
    $raw = file_get_contents('php://input');
    file_put_contents("php://stderr", "UPDATE RAW BODY: " . $raw . "\n");
    
    $input = json_decode($raw, true);
    
    if (!$input) {
        throw new Exception("Invalid JSON input.");
    }

    // Validate required fields
    $required = [
        'employee_id', 'full_name', 'company_position_id', 
        'department_name', 'office_id', 'hire_date', 
        'contract', 'status', 'email', 'dob', 'address', 'nin'
    ];
    
    foreach ($required as $field) {
        if (!isset($input[$field]) || $input[$field] === "") {
            throw new Exception("Missing required field: $field");
        }
    }

    // Check if employee exists
    $stmt = $pdo->prepare("SELECT Employee_ID FROM EMPLOYEES WHERE Employee_ID = :id");
    $stmt->execute([':id' => (int)$input['employee_id']]);
    
    if (!$stmt->fetch()) {
        http_response_code(404);
        throw new Exception("Employee not found");
    }

    // Log the IDs we're using
    file_put_contents("php://stderr", "Position ID: " . $input['company_position_id'] . "\n");
    file_put_contents("php://stderr", "Office ID: " . $input['office_id'] . "\n");

    // Update employee - the trigger will automatically handle audit logging
    $sql = "UPDATE EMPLOYEES SET
        Employee_Full_Name = :full_name,
        Company_Position_ID = :position_id,
        Employee_Salary = :salary,
        Office_ID = :office_id,
        Employee_Date_Of_Hire = :hire_date,
        Employee_Contract = :contract,
        Employee_Status = :status,
        Email_Address = :email,
        Date_Of_Birth = :dob,
        Home_Address = :address,
        Identification_Number_NiN = :nin
    WHERE Employee_ID = :employee_id";

    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':employee_id' => (int)$input['employee_id'],
        ':full_name'   => $input['full_name'],
        ':position_id' => (int)$input['company_position_id'],
        ':salary'      => $input['salary'] === "" ? null : (float)$input['salary'],
        ':office_id'   => (int)$input['office_id'],
        ':hire_date'   => $input['hire_date'],
        ':contract'    => $input['contract'],
        ':status'      => $input['status'],
        ':email'       => $input['email'],
        ':dob'         => $input['dob'],
        ':address'     => $input['address'],
        ':nin'         => $input['nin']
    ]);

    if ($result) {
        $rowCount = $stmt->rowCount();
        file_put_contents("php://stderr", "Update successful! Rows affected: $rowCount\n");
        
        echo json_encode([
            'success' => true,
            'message' => 'Employee updated successfully',
            'employee_id' => (int)$input['employee_id'],
            'rows_affected' => $rowCount
        ]);
    } else {
        throw new Exception("Update failed - no rows affected");
    }

} catch (PDOException $e) {
    $msg = $e->getMessage();
    file_put_contents("php://stderr", "PDO ERROR: $msg\n");
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => "Database error: " . $msg
    ]);
    
} catch (Exception $e) {
    file_put_contents("php://stderr", "ERROR: " . $e->getMessage() . "\n");
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
