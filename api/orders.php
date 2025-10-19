<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

// Start session
session_start();

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'get_user_orders':
                getUserOrders();
                break;
            case 'get_order_details':
                getOrderDetails();
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
                break;
        }
        break;
    case 'POST':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'cancel_order':
                cancelOrder();
                break;
            case 'create_order':
                createOrder();
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
                break;
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

function getUserOrders() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        
        if (!$session_token) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get user ID from session
        $stmt = $db->prepare("
            SELECT u.id FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            return;
        }
        
        // Get user's orders
        $stmt = $db->prepare("
            SELECT o.id, o.order_number, o.total_amount, o.status, o.order_date, 
                   o.pickup_date, o.notes, o.created_at
            FROM orders o
            WHERE o.user_id = ? OR o.customer_id = (
                SELECT c.id FROM customers c 
                WHERE c.email = (SELECT u.email FROM users u WHERE u.id = ?)
            )
            ORDER BY o.order_date DESC
        ");
        $stmt->execute([$user['id'], $user['id']]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert numeric fields to proper types
        foreach ($orders as &$order) {
            $order['total_amount'] = (float) $order['total_amount'];
        }
        
        echo json_encode([
            'success' => true,
            'orders' => $orders
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to get orders: ' . $e->getMessage()]);
    }
}

function getOrderDetails() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        $order_id = $_GET['order_id'] ?? '';
        
        if (!$session_token || !$order_id) {
            echo json_encode(['success' => false, 'message' => 'Authentication required and order ID needed']);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get user ID from session
        $stmt = $db->prepare("
            SELECT u.id FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            return;
        }
        
        // Get order details
        $stmt = $db->prepare("
            SELECT o.id, o.order_number, o.total_amount, o.status, o.order_date, 
                   o.pickup_date, o.notes, o.created_at
            FROM orders o
            WHERE (o.user_id = ? OR o.customer_id = (
                SELECT c.id FROM customers c 
                WHERE c.email = (SELECT u.email FROM users u WHERE u.id = ?)
            )) AND o.id = ?
        ");
        $stmt->execute([$user['id'], $user['id'], $order_id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            echo json_encode(['success' => false, 'message' => 'Order not found']);
            return;
        }
        
        // Get order items
        $stmt = $db->prepare("
            SELECT oi.id, oi.quantity, oi.unit_price, oi.total_price,
                   p.name as product_name, p.image_url as product_image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ");
        $stmt->execute([$order_id]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert numeric fields to proper types
        $order['total_amount'] = (float) $order['total_amount'];
        foreach ($items as &$item) {
            $item['quantity'] = (int) $item['quantity'];
            $item['unit_price'] = (float) $item['unit_price'];
            $item['total_price'] = (float) $item['total_price'];
        }
        
        $order['items'] = $items;
        
        echo json_encode([
            'success' => true,
            'order' => $order
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to get order details: ' . $e->getMessage()]);
    }
}

function cancelOrder() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true);
        $order_id = $input['order_id'] ?? '';
        
        if (!$session_token || !$order_id) {
            echo json_encode(['success' => false, 'message' => 'Authentication required and order ID needed']);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get user ID from session
        $stmt = $db->prepare("
            SELECT u.id FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            return;
        }
        
        // Check if order belongs to user and can be cancelled
        $stmt = $db->prepare("
            SELECT o.id, o.status FROM orders o
            WHERE (o.user_id = ? OR o.customer_id = (
                SELECT c.id FROM customers c 
                WHERE c.email = (SELECT u.email FROM users u WHERE u.id = ?)
            )) AND o.id = ?
        ");
        $stmt->execute([$user['id'], $user['id'], $order_id]);
        $order = $stmt->fetch();
        
        if (!$order) {
            echo json_encode(['success' => false, 'message' => 'Order not found']);
            return;
        }
        
        if ($order['status'] !== 'pending') {
            echo json_encode(['success' => false, 'message' => 'Only pending orders can be cancelled']);
            return;
        }
        
        // Update order status to cancelled
        $stmt = $db->prepare("
            UPDATE orders 
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$order_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Order cancelled successfully'
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to cancel order: ' . $e->getMessage()]);
    }
}

function createOrder() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$session_token) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            return;
        }
        
        // Validate input
        if (!isset($input['items']) || !is_array($input['items']) || empty($input['items'])) {
            echo json_encode(['success' => false, 'message' => 'Order items are required']);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get user ID from session
        $stmt = $db->prepare("
            SELECT u.id, u.first_name, u.last_name, u.email FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            return;
        }
        
        // Start transaction
        $db->beginTransaction();
        
        try {
            // Generate order number
            $order_number = 'ORD-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            
            // Calculate total amount
            $total_amount = 0;
            foreach ($input['items'] as $item) {
                $total_amount += $item['quantity'] * $item['unit_price'];
            }
            
            // Create order
            $stmt = $db->prepare("
                INSERT INTO orders (user_id, order_number, total_amount, status, notes, order_date)
                VALUES (?, ?, ?, 'pending', ?, NOW())
            ");
            $stmt->execute([
                $user['id'],
                $order_number,
                $total_amount,
                $input['notes'] ?? null
            ]);
            
            $order_id = $db->lastInsertId();
            
            // Create order items
            foreach ($input['items'] as $item) {
                $stmt = $db->prepare("
                    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $order_id,
                    $item['product_id'],
                    $item['quantity'],
                    $item['unit_price'],
                    $item['quantity'] * $item['unit_price']
                ]);
            }
            
            // Commit transaction
            $db->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Order created successfully',
                'order_id' => $order_id,
                'order_number' => $order_number
            ]);
            
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to create order: ' . $e->getMessage()]);
    }
}

?>
