<?php
/**
 * Process Employee Promotion
 * 
 * This endpoint handles employee promotions by:
 * 1. Validating employee and position data
 * 2. Calculating new salary based on percentage increase
 * 3. Recording promotion in EMPLOYEE_PROMOTIONS table
 * 4. Updating employee record in EMPLOYEES table
 * 5. Automatic audit logging via database trigger
 * 
 * @param int employee_id - ID of employee to promote
 * @param int new_position_id - ID of new position
 * @param decimal salary_increase_percentage - Percentage increase (0-100)
 * @param date promotion_date - Effective date of promotion
 * @param string promotion_reason - Optional justification
 * 
 * @return JSON success/error response with promotion details
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
    // Read and decode JSON input
    $raw = file_get_contents('php://input');
    file_put_contents("php://stderr", "PROMOTION RAW BODY: " . $raw . "\n");
    
    $input = json_decode($raw, true);
    
    if (!$input) {
        throw new Exception("Invalid JSON input.");
    }

    // Validate required fields
    $required = ['employee_id', 'new_position_id', 'salary_increase_percentage', 'promotion_date'];
    
    foreach ($required as $field) {
        if (!isset($input[$field]) || $input[$field] === "") {
            throw new Exception("Missing required field: $field");
        }
    }

    // Validate percentage range
    $increasePercentage = (float)$input['salary_increase_percentage'];
    if ($increasePercentage < 0 || $increasePercentage > 100) {
        throw new Exception("Salary increase percentage must be between 0 and 100");
    }

    // Start transaction for data consistency
    $pdo->beginTransaction();

    // Get current employee data
    $stmt = $pdo->prepare("
        SELECT 
            e.Employee_ID,
            e.Employee_Full_Name,
            e.Company_Position_ID,
            e.Employee_Salary,
            cp.Company_Position_Title,
            cp.Department_Name
        FROM EMPLOYEES e
        JOIN COMPANY_POSITIONS cp ON e.Company_Position_ID = cp.Company_Position_ID
        WHERE e.Employee_ID = :id
        FOR UPDATE
    ");
    $stmt->execute([':id' => (int)$input['employee_id']]);
    $employee = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$employee) {
        throw new Exception("Employee not found");
    }

    // Get new position details
    $stmt = $pdo->prepare("
        SELECT Company_Position_Title, Department_Name 
        FROM COMPANY_POSITIONS 
        WHERE Company_Position_ID = :id
    ");
    $stmt->execute([':id' => (int)$input['new_position_id']]);
    $newPosition = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$newPosition) {
        throw new Exception("New position not found");
    }

    // Calculate new salary
    $oldSalary = (float)$employee['Employee_Salary'];
    $newSalary = $oldSalary * (1 + ($increasePercentage / 100));
    $newSalary = round($newSalary, 2);

    file_put_contents("php://stderr", "Promotion: Old Salary: $oldSalary, Increase: $increasePercentage%, New Salary: $newSalary\n");

    // Insert promotion record (trigger will handle audit logging)
    $stmt = $pdo->prepare("
        INSERT INTO EMPLOYEE_PROMOTIONS 
        (Employee_ID, Old_Position_ID, New_Position_ID, Old_Salary, New_Salary, 
         Salary_Increase_Percentage, Promotion_Date, Promotion_Reason, Processed_By)
        VALUES (:emp_id, :old_pos, :new_pos, :old_sal, :new_sal, :increase, :promo_date, :reason, :processed_by)
    ");
    
    $stmt->execute([
        ':emp_id' => (int)$input['employee_id'],
        ':old_pos' => (int)$employee['Company_Position_ID'],
        ':new_pos' => (int)$input['new_position_id'],
        ':old_sal' => $oldSalary,
        ':new_sal' => $newSalary,
        ':increase' => $increasePercentage,
        ':promo_date' => $input['promotion_date'],
        ':reason' => $input['promotion_reason'] ?? '',
        ':processed_by' => 'system'
    ]);

    $promotionId = $pdo->lastInsertId();

    // Update employee record with new position and salary
    $stmt = $pdo->prepare("
        UPDATE EMPLOYEES 
        SET Company_Position_ID = :new_pos,
            Employee_Salary = :new_sal
        WHERE Employee_ID = :emp_id
    ");
    
    $stmt->execute([
        ':new_pos' => (int)$input['new_position_id'],
        ':new_sal' => $newSalary,
        ':emp_id' => (int)$input['employee_id']
    ]);

    // Commit transaction
    $pdo->commit();

    file_put_contents("php://stderr", "Promotion processed successfully! ID: $promotionId\n");

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Promotion processed successfully',
        'promotion_id' => $promotionId,
        'employee_name' => $employee['Employee_Full_Name'],
        'old_position' => $employee['Company_Position_Title'],
        'new_position' => $newPosition['Company_Position_Title'],
        'old_salary' => $oldSalary,
        'new_salary' => $newSalary,
        'increase_percentage' => $increasePercentage,
        'salary_increase' => round($newSalary - $oldSalary, 2)
    ]);

} catch (PDOException $e) {
    // Rollback on database error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    $msg = $e->getMessage();
    file_put_contents("php://stderr", "PDO ERROR: $msg\n");
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => "Database error: " . $msg
    ]);
    
} catch (Exception $e) {
    // Rollback on general error
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
