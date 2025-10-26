<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

// Start session
session_start();

// Check admin authentication
$session_token = $_COOKIE['session_token'] ?? '';

if (!$session_token) {
    echo json_encode([
        'success' => false,
        'message' => 'Admin authentication required'
    ]);
    exit;
}

try {
    $database = Database::getInstance();
    $db = $database->getConnection();
    
    // Check session validity and admin role
    $stmt = $db->prepare("
        SELECT u.id, u.username, u.role
        FROM users u
        JOIN user_sessions s ON u.id = s.user_id
        WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1 AND u.role = 'admin'
    ");
    $stmt->execute([$session_token]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'Admin authentication required'
        ]);
        exit;
    }
    
    // Get pagination parameters
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(50, max(10, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    
    // Build WHERE clause for filters
    $whereConditions = [];
    $params = [];
    
    if (!empty($_GET['product_id'])) {
        $whereConditions[] = "psa.product_id = ?";
        $params[] = intval($_GET['product_id']);
    }
    
    if (!empty($_GET['new_status']) && in_array($_GET['new_status'], ['available', 'unavailable'])) {
        $whereConditions[] = "psa.new_status = ?";
        $params[] = $_GET['new_status'];
    }
    
    if (!empty($_GET['admin'])) {
        $whereConditions[] = "u.username LIKE ?";
        $params[] = '%' . $_GET['admin'] . '%';
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Get total count for pagination
    $countQuery = "
        SELECT COUNT(*) as total
        FROM product_status_audit psa
        LEFT JOIN users u ON psa.changed_by = u.id
        $whereClause
    ";
    
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute($params);
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get audit log entries
    $query = "
        SELECT 
            psa.id,
            psa.product_id,
            psa.old_status,
            psa.new_status,
            psa.reason,
            psa.changed_by,
            psa.changed_at,
            u.username as admin_username,
            p.name as product_name
        FROM product_status_audit psa
        LEFT JOIN users u ON psa.changed_by = u.id
        LEFT JOIN products p ON psa.product_id = p.id
        $whereClause
        ORDER BY psa.changed_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate pagination info
    $totalPages = ceil($totalCount / $limit);
    $from = $totalCount > 0 ? $offset + 1 : 0;
    $to = min($offset + $limit, $totalCount);
    
    echo json_encode([
        'success' => true,
        'entries' => $entries,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total' => intval($totalCount),
            'from' => $from,
            'to' => $to,
            'limit' => $limit
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>