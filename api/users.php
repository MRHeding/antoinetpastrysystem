<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';
require_once '../admin/auth-check.php';

// Check admin authentication
$currentAdmin = requireAdminAuth();

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? 'list';
        switch ($action) {
            case 'list':
                getAllUsers();
                break;
            case 'profile':
                getUserProfile();
                break;
            case 'orders':
                getUserOrders();
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
                break;
        }
        break;
    case 'PUT':
        updateUserStatus();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

// Get all users
function getAllUsers() {
    try {
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get role filter if provided
        $role = $_GET['role'] ?? null;
        
        $query = "SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
                         u.phone, u.address, u.city, u.state, u.zip_code, 
                         u.role, u.is_active, u.email_verified, u.created_at,
                         COUNT(DISTINCT o.id) as total_orders,
                         COALESCE(SUM(o.total_amount), 0) as total_spent
                  FROM users u
                  LEFT JOIN orders o ON u.id = o.user_id
                  WHERE 1=1";
        
        if ($role) {
            $query .= " AND u.role = :role";
        }
        
        $query .= " GROUP BY u.id ORDER BY u.created_at DESC";
        
        $stmt = $db->prepare($query);
        
        if ($role) {
            $stmt->bindParam(':role', $role);
        }
        
        $stmt->execute();
        $users = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'data' => $users
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch users: ' . $e->getMessage()
        ]);
    }
}

// Get detailed user profile
function getUserProfile() {
    try {
        $userId = $_GET['user_id'] ?? null;
        
        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'User ID required']);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get user details
        $stmt = $db->prepare("
            SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
                   u.phone, u.address, u.city, u.state, u.zip_code, 
                   u.role, u.is_active, u.email_verified, u.created_at, u.updated_at,
                   COUNT(DISTINCT o.id) as total_orders,
                   COALESCE(SUM(o.total_amount), 0) as total_spent
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            WHERE u.id = ?
            GROUP BY u.id
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'User not found']);
            return;
        }
        
        // Get recent orders
        $stmt = $db->prepare("
            SELECT o.id, o.order_number, o.total_amount, o.status, 
                   o.order_date, o.pickup_date, o.notes,
                   COUNT(oi.id) as items_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.order_date DESC
            LIMIT 10
        ");
        $stmt->execute([$userId]);
        $recentOrders = $stmt->fetchAll();
        
        // Get order statistics
        $stmt = $db->prepare("
            SELECT 
                status,
                COUNT(*) as count,
                SUM(total_amount) as total
            FROM orders
            WHERE user_id = ?
            GROUP BY status
        ");
        $stmt->execute([$userId]);
        $orderStats = $stmt->fetchAll();
        
        // Get last login (from sessions)
        $stmt = $db->prepare("
            SELECT MAX(created_at) as last_login
            FROM user_sessions
            WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
        $loginData = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'data' => [
                'user' => $user,
                'recent_orders' => $recentOrders,
                'order_stats' => $orderStats,
                'last_login' => $loginData['last_login'] ?? null
            ]
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch user profile: ' . $e->getMessage()
        ]);
    }
}

// Get user orders
function getUserOrders() {
    try {
        $userId = $_GET['user_id'] ?? null;
        
        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'User ID required']);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get all orders with items
        $stmt = $db->prepare("
            SELECT o.id, o.order_number, o.total_amount, o.status, 
                   o.order_date, o.pickup_date, o.notes
            FROM orders o
            WHERE o.user_id = ?
            ORDER BY o.order_date DESC
        ");
        $stmt->execute([$userId]);
        $orders = $stmt->fetchAll();
        
        // Get items for each order
        foreach ($orders as &$order) {
            $stmt = $db->prepare("
                SELECT oi.*, p.name as product_name, p.image_url
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            ");
            $stmt->execute([$order['id']]);
            $order['items'] = $stmt->fetchAll();
        }
        
        echo json_encode([
            'success' => true,
            'data' => $orders
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch user orders: ' . $e->getMessage()
        ]);
    }
}

// Update user status (activate/deactivate)
function updateUserStatus() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $_GET['user_id'] ?? null;
        
        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'User ID required']);
            return;
        }
        
        if (!isset($input['is_active'])) {
            echo json_encode(['success' => false, 'message' => 'Status required']);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Don't allow deactivating admin accounts
        $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if ($user['role'] === 'admin' && $input['is_active'] == 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Cannot deactivate admin accounts'
            ]);
            return;
        }
        
        // Update status
        $stmt = $db->prepare("
            UPDATE users 
            SET is_active = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$input['is_active'], $userId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'User status updated successfully'
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update user status: ' . $e->getMessage()
        ]);
    }
}
?>

