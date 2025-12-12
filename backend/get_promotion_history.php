<?php
/**
 * Get Promotion History
 * 
 * Retrieves promotion history for a specific employee or all employees
 * Joins with EMPLOYEES and COMPANY_POSITIONS tables for readable output
 * 
 * @param int employee_id (optional) - Filter by specific employee
 * @return JSON array of promotions with detailed information
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db_connect.php";

$employee_id = $_GET['employee_id'] ?? null;

try {
    if ($employee_id) {
        // Get promotion history for specific employee
        $sql = "
        SELECT 
            p.Promotion_ID,
            p.Employee_ID,
            e.Employee_Full_Name,
            old_pos.Company_Position_Title as Old_Position,
            old_pos.Department_Name as Old_Department,
            new_pos.Company_Position_Title as New_Position,
            new_pos.Department_Name as New_Department,
            p.Old_Salary,
            p.New_Salary,
            p.Salary_Increase_Percentage,
            (p.New_Salary - p.Old_Salary) as Salary_Increase_Amount,
            p.Promotion_Date,
            p.Promotion_Reason,
            p.Processed_By,
            p.Processed_At
        FROM EMPLOYEE_PROMOTIONS p
        JOIN EMPLOYEES e ON p.Employee_ID = e.Employee_ID
        JOIN COMPANY_POSITIONS old_pos ON p.Old_Position_ID = old_pos.Company_Position_ID
        JOIN COMPANY_POSITIONS new_pos ON p.New_Position_ID = new_pos.Company_Position_ID
        WHERE p.Employee_ID = :employee_id
        ORDER BY p.Promotion_Date DESC, p.Processed_At DESC
        ";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':employee_id' => (int)$employee_id]);
    } else {
        // Get all recent promotions
        $sql = "
        SELECT 
            p.Promotion_ID,
            p.Employee_ID,
            e.Employee_Full_Name,
            old_pos.Company_Position_Title as Old_Position,
            old_pos.Department_Name as Old_Department,
            new_pos.Company_Position_Title as New_Position,
            new_pos.Department_Name as New_Department,
            p.Old_Salary,
            p.New_Salary,
            p.Salary_Increase_Percentage,
            (p.New_Salary - p.Old_Salary) as Salary_Increase_Amount,
            p.Promotion_Date,
            p.Promotion_Reason,
            p.Processed_By,
            p.Processed_At
        FROM EMPLOYEE_PROMOTIONS p
        JOIN EMPLOYEES e ON p.Employee_ID = e.Employee_ID
        JOIN COMPANY_POSITIONS old_pos ON p.Old_Position_ID = old_pos.Company_Position_ID
        JOIN COMPANY_POSITIONS new_pos ON p.New_Position_ID = new_pos.Company_Position_ID
        ORDER BY p.Promotion_Date DESC, p.Processed_At DESC
        LIMIT 50
        ";
        
        $stmt = $pdo->query($sql);
    }
    
    $promotions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "promotions" => $promotions,
        "count" => count($promotions)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
