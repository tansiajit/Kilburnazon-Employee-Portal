<?php
/**
 * Get Employees with Birthdays in Current Month
 * 
 * Retrieves all employees whose birthday falls in the current calendar month
 * Supports filtering by specific month for testing/planning purposes
 * 
 * @param int month (optional) - Specific month to check (1-12), defaults to current month
 * @return JSON array of employees with birthdays, sorted by day
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

// Get month parameter or use current month
$month = $_GET['month'] ?? date('m');
$month = (int)$month;

// Validate month
if ($month < 1 || $month > 12) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Invalid month. Must be between 1 and 12."
    ]);
    exit;
}

try {
    // Get all employees with birthdays in the specified month
    $sql = "
    SELECT 
        e.Employee_ID,
        e.Employee_Full_Name,
        e.Date_Of_Birth,
        e.Email_Address,
        cp.Company_Position_Title,
        cp.Department_Name,
        o.Office_Name,
        DAY(e.Date_Of_Birth) as Birthday_Day,
        MONTH(e.Date_Of_Birth) as Birthday_Month,
        YEAR(e.Date_Of_Birth) as Birth_Year,
        TIMESTAMPDIFF(YEAR, e.Date_Of_Birth, CURDATE()) as Age,
        CASE 
            WHEN DAY(e.Date_Of_Birth) = DAY(CURDATE()) 
                AND MONTH(e.Date_Of_Birth) = MONTH(CURDATE())
            THEN 1 
            ELSE 0 
        END as Is_Today,
        CASE 
            WHEN MONTH(e.Date_Of_Birth) = MONTH(CURDATE())
                AND DAY(e.Date_Of_Birth) >= DAY(CURDATE())
            THEN DATEDIFF(
                DATE(CONCAT(YEAR(CURDATE()), '-', LPAD(MONTH(e.Date_Of_Birth), 2, '0'), '-', LPAD(DAY(e.Date_Of_Birth), 2, '0'))),
                CURDATE()
            )
            WHEN MONTH(e.Date_Of_Birth) = MONTH(CURDATE())
            THEN 0
            ELSE NULL
        END as Days_Until_Birthday
    FROM EMPLOYEES e
    JOIN COMPANY_POSITIONS cp ON e.Company_Position_ID = cp.Company_Position_ID
    JOIN OFFICES o ON e.Office_ID = o.Office_ID
    WHERE MONTH(e.Date_Of_Birth) = :month
        AND e.Employee_Status = 'Active'
    ORDER BY DAY(e.Date_Of_Birth) ASC, e.Employee_Full_Name ASC
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':month' => $month]);
    
    $birthdays = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get month name
    $monthName = date('F', mktime(0, 0, 0, $month, 1));
    
    // Separate today's birthdays from upcoming
    $today = [];
    $upcoming = [];
    
    foreach ($birthdays as $employee) {
        if ($employee['Is_Today'] == 1) {
            $today[] = $employee;
        } else {
            $upcoming[] = $employee;
        }
    }

    // Get statistics
    $stats = [
        'total_birthdays' => count($birthdays),
        'today' => count($today),
        'upcoming' => count($upcoming),
        'month' => $month,
        'month_name' => $monthName,
        'current_year' => date('Y')
    ];

    echo json_encode([
        "success" => true,
        "birthdays" => [
            "today" => $today,
            "upcoming" => $upcoming,
            "all" => $birthdays
        ],
        "stats" => $stats
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
