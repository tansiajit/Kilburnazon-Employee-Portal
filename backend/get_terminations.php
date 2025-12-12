<?php
/**
 * Get Contract Terminations
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db_connect.php";

$filter = $_GET['filter'] ?? 'all';
$search = $_GET['search'] ?? '';

try {
    $sql = "SELECT * FROM vw_active_terminations WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $sql .= " AND (
            Employee_Full_Name LIKE :search 
            OR Department_Name LIKE :search 
            OR Termination_Reason LIKE :search
        )";
        $params[':search'] = '%' . $search . '%';
    }

    switch ($filter) {
        case 'recent':
            $sql .= " AND Termination_Date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
            break;
        case 'expiring_soon':
            $sql .= " AND Days_Until_Deletion <= 30 AND Days_Until_Deletion > 0";
            break;
    }

    $sql .= " ORDER BY Termination_Date DESC LIMIT 100";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $terminations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $statsStmt = $pdo->query("
        SELECT 
            COUNT(*) as total_terminations,
            COUNT(CASE WHEN Termination_Date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as recent_30_days,
            COUNT(CASE WHEN Days_Until_Deletion <= 30 AND Days_Until_Deletion > 0 THEN 1 END) as expiring_soon,
            AVG(Days_Since_Termination) as avg_days_since_termination
        FROM vw_active_terminations
    ");
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    $reasonsStmt = $pdo->query("
        SELECT 
            Termination_Reason,
            COUNT(*) as count
        FROM CONTRACT_TERMINATIONS
        WHERE Termination_Date >= DATE_SUB(CURDATE(), INTERVAL 3 YEAR)
        GROUP BY Termination_Reason
        ORDER BY count DESC
        LIMIT 10
    ");
    $reasons = $reasonsStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "terminations" => $terminations,
        "stats" => $stats,
        "reasons_breakdown" => $reasons,
        "gdpr_notice" => "Records are automatically deleted after 3 years"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
