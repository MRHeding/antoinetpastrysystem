<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

// Start session
session_start();

// Check if user is admin using the same method as auth-check.php
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
        SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.is_active
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
    
    // Get total products (active only)
    $stmt = $db->query("SELECT COUNT(*) as total FROM products WHERE is_active = 1");
    $totalProducts = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get total orders (exclude unpaid pending and cancelled orders)
    $stmt = $db->query("
        SELECT COUNT(*) as total 
        FROM orders 
        WHERE status != 'cancelled' 
        AND NOT (status = 'pending' AND payment_status = 'pending')
    ");
    $totalOrders = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get total customers (users with role 'customer')
    $stmt = $db->query("SELECT COUNT(*) as total FROM users WHERE role = 'customer' AND is_active = 1");
    $totalCustomers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get total revenue (sum of completed orders)
    $stmt = $db->query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'completed'");
    $totalRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get recent orders for the dashboard (exclude unpaid pending and cancelled orders)
    $stmt = $db->query("
        SELECT o.id, o.order_number, o.total_amount, o.status, o.order_date,
               CONCAT(u.first_name, ' ', u.last_name) as customer_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.status != 'cancelled'
        AND NOT (o.status = 'pending' AND o.payment_status = 'pending')
        ORDER BY o.order_date DESC
        LIMIT 5
    ");
    $recentOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    echo json_encode([
        'success' => true,
        'data' => [
            'total_products' => (int) $totalProducts,
            'total_orders' => (int) $totalOrders,
            'total_customers' => (int) $totalCustomers,
            'total_revenue' => (float) $totalRevenue,
            'recent_orders' => $recentOrders
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
