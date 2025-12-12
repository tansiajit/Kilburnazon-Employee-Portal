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

$search = $_GET['search'] ?? '';

if (empty($search)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Search term is required"]);
    exit;
}

try {
    // Search by name or ID
    $sql = "SELECT 
        e.Employee_ID,
        e.Employee_Full_Name,
        cp.Company_Position_Title,
        cp.Department_Name,
        o.Office_Name,
        e.Employee_Status
    FROM EMPLOYEES e
    JOIN COMPANY_POSITIONS cp ON e.Company_Position_ID = cp.Company_Position_ID
    JOIN OFFICES o ON e.Office_ID = o.Office_ID
    WHERE e.Employee_Full_Name LIKE :search
       OR e.Employee_ID = :exact_id
    ORDER BY e.Employee_Full_Name
    LIMIT 20";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':search' => '%' . $search . '%',
        ':exact_id' => is_numeric($search) ? (int)$search : 0
    ]);
    
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "employees" => $employees,
        "count" => count($employees)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
