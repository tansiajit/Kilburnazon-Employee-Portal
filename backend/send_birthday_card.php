<?php
/**
 * Send Birthday Card (Log/Track)
 * 
 * Records when a birthday card has been sent to an employee
 * This creates an audit trail for the CEO's birthday card initiative
 * 
 * @param int employee_id - ID of employee receiving card
 * @param string card_type - Type of card (email, physical, digital)
 * @param string message - Optional personal message
 * @return JSON success/error response
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db_connect.php";

try {
    // First, create the birthday cards tracking table if it doesn't exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS BIRTHDAY_CARDS (
            Card_ID INT AUTO_INCREMENT PRIMARY KEY,
            Employee_ID INT NOT NULL,
            Card_Type ENUM('email', 'physical', 'digital') DEFAULT 'email',
            Birthday_Year INT NOT NULL,
            Message TEXT,
            Sent_By VARCHAR(100),
            Sent_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (Employee_ID) REFERENCES EMPLOYEES(Employee_ID),
            INDEX idx_employee_year (Employee_ID, Birthday_Year)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);
    
    if (!$input) {
        throw new Exception("Invalid JSON input.");
    }

    if (empty($input['employee_id'])) {
        throw new Exception("Employee ID is required");
    }

    // Get employee details
    $stmt = $pdo->prepare("
        SELECT Employee_Full_Name, Email_Address, Date_Of_Birth
        FROM EMPLOYEES
        WHERE Employee_ID = :id
    ");
    $stmt->execute([':id' => (int)$input['employee_id']]);
    $employee = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$employee) {
        throw new Exception("Employee not found");
    }

    // Check if card already sent this year
    $currentYear = date('Y');
    $stmt = $pdo->prepare("
        SELECT Card_ID FROM BIRTHDAY_CARDS
        WHERE Employee_ID = :id AND Birthday_Year = :year
    ");
    $stmt->execute([
        ':id' => (int)$input['employee_id'],
        ':year' => $currentYear
    ]);
    
    if ($stmt->fetch()) {
        throw new Exception("Birthday card already sent this year");
    }

    // Record the card
    $stmt = $pdo->prepare("
        INSERT INTO BIRTHDAY_CARDS 
        (Employee_ID, Card_Type, Birthday_Year, Message, Sent_By)
        VALUES (:emp_id, :type, :year, :message, :sent_by)
    ");
    
    $stmt->execute([
        ':emp_id' => (int)$input['employee_id'],
        ':type' => $input['card_type'] ?? 'email',
        ':year' => $currentYear,
        ':message' => $input['message'] ?? '',
        ':sent_by' => 'CEO'
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Birthday card recorded successfully',
        'employee_name' => $employee['Employee_Full_Name'],
        'card_id' => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => "Database error: " . $e->getMessage()
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
