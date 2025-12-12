<?php
/**
 * GDPR Cleanup Tool
 * 
 * Manually run GDPR compliance cleanup
 * Deletes termination records older than 3 years
 * Should be run by HR at regular intervals
 * 
 * Security: Can add authentication/authorization here
 * 
 * @return JSON summary of cleanup operation
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

require_once "db_connect.php";

try {
    // Optional: Add authentication check here
    // if (!isAuthorizedHRUser()) { throw new Exception("Unauthorized"); }

    // Call the stored procedure
    $stmt = $pdo->query("CALL cleanup_old_terminations()");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // IMPORTANT: Close cursor to allow next query
    $stmt->closeCursor();

    // Get current stats after cleanup
    $statsStmt = $pdo->query("
        SELECT 
            COUNT(*) as remaining_records,
            MIN(Termination_Date) as oldest_record,
            MAX(Termination_Date) as newest_record
        FROM CONTRACT_TERMINATIONS
    ");
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    $statsStmt->closeCursor();

    echo json_encode([
        "success" => true,
        "cleanup_result" => $result,
        "remaining_records" => $stats,
        "message" => "GDPR cleanup completed successfully"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
