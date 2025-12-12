<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db_connect.php";

// Accept employee_id from GET or POST
$employee_id = $_GET['employee_id'] ?? $_POST['employee_id'] ?? '';

if (empty($employee_id)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "employee_id is required"
    ]);
    exit;
}

try {
    $sql = "
    SELECT 
        e.Employee_ID,
        e.Employee_Full_Name,
        e.Company_Position_ID,
        e.Office_ID,
        e.Employee_Salary,
        e.Employee_Date_Of_Hire,
        e.Employee_Contract,
        e.Employee_Status,
        e.Email_Address,
        e.Date_Of_Birth,
        e.Home_Address,
        e.Identification_Number_NiN,
        c.Company_Position_Title,
        c.Department_Name,
        o.Office_Name,
        o.Office_Region
    FROM EMPLOYEES e
    LEFT JOIN COMPANY_POSITIONS c ON e.Company_Position_ID = c.Company_Position_ID
    LEFT JOIN OFFICES o ON e.Office_ID = o.Office_ID
    WHERE e.Employee_ID = :employee_id
    LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([":employee_id" => $employee_id]);
    $employee = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($employee) {
        echo json_encode([
            "success" => true,
            "employee" => $employee
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Employee not found"
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>

