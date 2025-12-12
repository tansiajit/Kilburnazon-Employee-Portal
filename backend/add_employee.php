<?php
// Handle CORS preflight
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db_connect.php";

$raw = file_get_contents("php://input");
file_put_contents("php://stderr", "RAW BODY: " . $raw . "\n");
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid JSON"]);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // --------------------- VALIDATE REQUIRED FIELDS ---------------------
    $required_fields = [
        "full_name",
        "company_position_id",
        "department_name",
        "office_id",
        "hire_date",
        "contract",
        "status",
        "email",
        "dob",
        "address",
        "nin"
    ];

    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            file_put_contents("php://stderr", "Missing field: $field\n");
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "$field is required"]);
            exit;
        }
    }

    // Salary validation
    if ($data["department_name"] !== "Executives" && empty($data["salary"])) {
        file_put_contents("php://stderr", "Missing salary for non-executive\n");
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Salary is required for non-executive employees"]);
        exit;
    }

    // --------------------- GENERATE UNIQUE 8-DIGIT EMPLOYEE ID ---------------------
    $max_attempts = 100;
    $employee_id = null;
    
    for ($i = 0; $i < $max_attempts; $i++) {
        // Generate random 8-digit number (10000000 to 99999999)
        $candidate_id = random_int(10000000, 99999999);
        
        // Check if this ID already exists
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM EMPLOYEES WHERE Employee_ID = :id");
        $checkStmt->execute([':id' => $candidate_id]);
        $exists = $checkStmt->fetchColumn();
        
        if (!$exists) {
            $employee_id = $candidate_id;
            file_put_contents("php://stderr", "Generated unique Employee ID: $employee_id\n");
            break;
        }
    }
    
    if ($employee_id === null) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to generate unique employee ID after $max_attempts attempts"]);
        exit;
    }

    // --------------------- RESOLVE POSITION NAME TO ID ---------------------
    $positionStmt = $pdo->prepare(
        "SELECT Company_Position_ID 
         FROM COMPANY_POSITIONS 
         WHERE Company_Position_Title = :title AND Department_Name = :dept"
    );
    $positionStmt->execute([
        ':title' => $data['company_position_id'],
        ':dept'  => $data['department_name']
    ]);
    $position_id = $positionStmt->fetchColumn();
    file_put_contents("php://stderr", "Resolved Position ID: $position_id\n");

    if (!$position_id) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid position for this department"]);
        exit;
    }

    // --------------------- RESOLVE OFFICE NAME TO ID ---------------------
    $officeStmt = $pdo->prepare(
        "SELECT Office_ID 
         FROM OFFICES 
         WHERE Office_Name = :name"
    );
    $officeStmt->execute([
        ':name' => $data['office_id']
    ]);
    $office_id = $officeStmt->fetchColumn();
    file_put_contents("php://stderr", "Resolved Office ID: $office_id\n");

    if (!$office_id) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid office name"]);
        exit;
    }

    // --------------------- INSERT INTO EMPLOYEES ---------------------
    $sql = "INSERT INTO EMPLOYEES
    (Employee_ID, Employee_Full_Name, Company_Position_ID, Employee_Salary, Office_ID, 
     Employee_Date_Of_Hire, Employee_Contract, Employee_Status, 
     Email_Address, Date_Of_Birth, Home_Address, Identification_Number_NiN)
    VALUES (:employee_id, :full_name, :position_id, :salary, :office_id, :hire_date, :contract, 
            :status, :email, :dob, :address, :nin)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':employee_id' => $employee_id,
        ':full_name'   => $data['full_name'],
        ':position_id' => (int)$position_id,
        ':salary'      => isset($data['salary']) && $data['salary'] !== "" ? (float)$data['salary'] : null,
        ':office_id'   => (int)$office_id,
        ':hire_date'   => $data['hire_date'],
        ':contract'    => $data['contract'],
        ':status'      => $data['status'],
        ':email'       => $data['email'],
        ':dob'         => $data['dob'],
        ':address'     => $data['address'],
        ':nin'         => $data['nin']
    ]);

    // Commit transaction
    $pdo->commit();

    echo json_encode([
        "success" => true,
        "employee_id" => $employee_id
    ]);

} catch (PDOException $e) {
    // Rollback on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    $msg = $e->getMessage();
    file_put_contents("php://stderr", "PDO ERROR: $msg\n");

    if (strpos($msg, 'Duplicate') !== false) {
        $error = "Employee with this NIN or email already exists.";
    } elseif (strpos($msg, 'foreign key') !== false) {
        $error = "Invalid reference: check position, office, or department.";
    } else {
        $error = $msg;
    }

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $error
    ]);
}
?>