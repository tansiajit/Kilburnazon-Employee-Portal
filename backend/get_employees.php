<?php
include __DIR__ . '/db_connect.php'; // defines $pdo

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$search = $_GET['search'] ?? '';
$department = $_GET['department'] ?? '';
$position = $_GET['position'] ?? '';
$location = $_GET['location'] ?? '';
$startDate = $_GET['startDate'] ?? '';
$employee_id = $_GET['employee_id'] ?? ''; // optional single employee fetch

$sql = "
SELECT 
    e.Employee_ID,
    e.Employee_Full_Name,
    e.Employee_Date_Of_Hire,
    e.Employee_Status,
    e.Email_Address,
    e.Date_Of_Birth,
    e.Home_Address,
    e.Identification_Number_NiN,
    c.Company_Position_Title,
    c.Department_Name,
    o.Office_Name,
    o.Office_Region,
    ec.Emergency_Name,
    ec.Emergency_Relationship,
    ec.Emergency_Phone_Number
FROM EMPLOYEES e
LEFT JOIN COMPANY_POSITIONS c ON e.Company_Position_ID = c.Company_Position_ID
LEFT JOIN OFFICES o ON e.Office_ID = o.Office_ID
LEFT JOIN EMPLOYEE_EMERGENCY_CONTACT ec ON e.Employee_ID = ec.Employee_ID
WHERE 1=1
";

$params = [];

if ($employee_id !== '') {
    $sql .= " AND e.Employee_ID = :employee_id";
    $params[':employee_id'] = $employee_id;
}

if ($search !== '') {
    $sql .= " AND (
        e.Employee_Full_Name LIKE :search 
        OR e.Employee_ID LIKE :search
        OR e.Email_Address LIKE :search
    )";
    $params[':search'] = "%$search%";
}


if ($department !== '') {
    $sql .= " AND c.Department_Name = :department";
    $params[':department'] = $department;
}

if ($position !== '') {
    $sql .= " AND c.Company_Position_Title = :position";
    $params[':position'] = $position;
}

if ($location !== '') {
    $sql .= " AND o.Office_Region = :location";
    $params[':location'] = $location;
}

if ($startDate !== '') {
    $sql .= " AND e.Employee_Date_Of_Hire >= :startDate";
    $params[':startDate'] = $startDate;
}

$sql .= " ORDER BY c.Company_Position_ID ASC";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If fetching by employee_id, return single object + success
    if ($employee_id !== '') {
        if (!empty($employees)) {
            echo json_encode([
                "success" => true,
                "employee" => $employees[0]
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "error" => "Employee not found"
            ]);
        }
    } else {
        // Regular search: return array
        echo json_encode($employees);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
