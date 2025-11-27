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
            case 'get_all_orders':
                getAllOrders();
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
            case 'update_status':
                updateOrderStatus();
                break;
            case 'update_payment_status':
                updatePaymentStatus();
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
        
        // Get user's orders (exclude unpaid pending orders and cancelled orders)
        $stmt = $db->prepare("
            SELECT o.id, o.order_number, o.total_amount, o.status, o.payment_status, 
                   o.payment_method, o.order_date, o.pickup_date, o.notes, o.created_at
            FROM orders o
            WHERE (o.user_id = ? OR o.customer_id = (
                SELECT c.id FROM customers c 
                WHERE c.email = (SELECT u.email FROM users u WHERE u.id = ?)
            ))
            AND o.status != 'cancelled'
            AND NOT (o.status = 'pending' AND o.payment_status = 'pending')
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
        
        // Get user ID and role from session
        $stmt = $db->prepare("
            SELECT u.id, u.role FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            return;
        }
        
        // Get order details - admins can view any order, users can only view their own
        if ($user['role'] === 'admin') {
            $stmt = $db->prepare("
                SELECT 
                    o.id, o.order_number, o.total_amount, o.status, o.payment_status,
                    o.payment_method, o.paid_at, o.order_date, o.pickup_date, 
                    o.notes, o.created_at, o.payment_intent_id,
                    CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                    u.email as customer_email,
                    u.phone as customer_phone,
                    u.address as delivery_address
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.id = ?
            ");
            $stmt->execute([$order_id]);
        } else {
            $stmt = $db->prepare("
                SELECT 
                    o.id, o.order_number, o.total_amount, o.status, o.payment_status,
                    o.payment_method, o.paid_at, o.order_date, o.pickup_date, 
                    o.notes, o.created_at, o.payment_intent_id
                FROM orders o
                WHERE (o.user_id = ? OR o.customer_id = (
                    SELECT c.id FROM customers c 
                    WHERE c.email = (SELECT u.email FROM users u WHERE u.id = ?)
                )) AND o.id = ?
            ");
            $stmt->execute([$user['id'], $user['id'], $order_id]);
        }
        
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            echo json_encode(['success' => false, 'message' => 'Order not found']);
            return;
        }
        
        // Get order items with size information
        $stmt = $db->prepare("
            SELECT 
                oi.id, oi.quantity, oi.unit_price, oi.total_price,
                p.name as product_name, p.image_url as product_image,
                ps.size_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_sizes ps ON oi.product_id = ps.product_id AND oi.size_code = ps.size_code
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
            
            // Calculate total amount (subtotal)
            $subtotal = 0;
            foreach ($input['items'] as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }
            
            // Add delivery fee if provided, otherwise default to 50.00
            $delivery_fee = isset($input['delivery_fee']) ? floatval($input['delivery_fee']) : 50.00;
            $total_amount = isset($input['total_amount']) ? floatval($input['total_amount']) : ($subtotal + $delivery_fee);
            
            // Get payment method and status
            $payment_method = $input['payment_method'] ?? null;
            $payment_status = ($payment_method === 'COD') ? 'pending' : 'pending';
            
            // Create order
            $stmt = $db->prepare("
                INSERT INTO orders (user_id, order_number, total_amount, status, payment_status, payment_method, notes, order_date)
                VALUES (?, ?, ?, 'pending', ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $user['id'],
                $order_number,
                $total_amount,
                $payment_status,
                $payment_method,
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

// Admin function: Get all orders
function getAllOrders() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        
        if (!$session_token) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get user from session and check if admin
        $stmt = $db->prepare("
            SELECT u.id, u.role FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        if (!$user || $user['role'] !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Admin access required']);
            return;
        }
        
        // Get all orders with customer information (exclude unpaid pending orders and cancelled orders)
        $stmt = $db->prepare("
            SELECT 
                o.id,
                o.order_number,
                o.total_amount,
                o.status,
                o.payment_status,
                o.payment_method,
                o.order_date,
                o.pickup_date,
                o.notes,
                o.created_at,
                o.payment_intent_id,
                o.paid_at,
                CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                u.email as customer_email,
                u.phone as customer_phone,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.status != 'cancelled'
            AND NOT (o.status = 'pending' AND o.payment_status = 'pending')
            ORDER BY o.order_date DESC
        ");
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert numeric fields to proper types
        foreach ($orders as &$order) {
            $order['total_amount'] = (float) $order['total_amount'];
            $order['total_items'] = (int) $order['total_items'];
        }
        
        echo json_encode([
            'success' => true,
            'orders' => $orders
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to get orders: ' . $e->getMessage()]);
    }
}

// Admin function: Update order status
function updateOrderStatus() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true);
        $order_id = $input['order_id'] ?? '';
        $new_status = $input['status'] ?? '';
        
        if (!$session_token || !$order_id || !$new_status) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            return;
        }
        
        // Validate status
        $valid_statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
        if (!in_array($new_status, $valid_statuses)) {
            echo json_encode(['success' => false, 'message' => 'Invalid status']);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get user from session and check if admin
        $stmt = $db->prepare("
            SELECT u.id, u.role, u.first_name, u.last_name FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        if (!$user || $user['role'] !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Admin access required']);
            return;
        }
        
        // Check if order exists
        $stmt = $db->prepare("SELECT id, status FROM orders WHERE id = ?");
        $stmt->execute([$order_id]);
        $order = $stmt->fetch();
        
        if (!$order) {
            echo json_encode(['success' => false, 'message' => 'Order not found']);
            return;
        }
        
        // Update order status
        $stmt = $db->prepare("
            UPDATE orders 
            SET status = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$new_status, $order_id]);
        
        // Log the action in audit log
        $action_description = "Updated order status from '{$order['status']}' to '{$new_status}' for order ID {$order_id}";
        $stmt = $db->prepare("
            INSERT INTO audit_log (user_id, action, action_description, ip_address, user_agent)
            VALUES (?, 'update_order_status', ?, ?, ?)
        ");
        $stmt->execute([
            $user['id'],
            $action_description,
            $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Order status updated successfully'
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to update order status: ' . $e->getMessage()]);
    }
}

// Admin function: Update payment status
function updatePaymentStatus() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        $input = json_decode(file_get_contents('php://input'), true);
        $order_id = $input['order_id'] ?? '';
        $payment_status = $input['payment_status'] ?? '';
        
        if (!$session_token || !$order_id || !$payment_status) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            return;
        }
        
        // Validate payment status
        $valid_statuses = ['paid', 'pending', 'failed'];
        if (!in_array($payment_status, $valid_statuses)) {
            echo json_encode(['success' => false, 'message' => 'Invalid payment status']);
            return;
        }
        
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get user from session and check if admin
        $stmt = $db->prepare("
            SELECT u.id, u.role, u.first_name, u.last_name FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        if (!$user || $user['role'] !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Admin access required']);
            return;
        }
        
        // Check if order exists
        $stmt = $db->prepare("SELECT id, payment_status FROM orders WHERE id = ?");
        $stmt->execute([$order_id]);
        $order = $stmt->fetch();
        
        if (!$order) {
            echo json_encode(['success' => false, 'message' => 'Order not found']);
            return;
        }
        
        // Update payment status
        if ($payment_status === 'paid') {
            $stmt = $db->prepare("
                UPDATE orders 
                SET payment_status = ?, paid_at = NOW(), updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$payment_status, $order_id]);
        } else {
            $stmt = $db->prepare("
                UPDATE orders 
                SET payment_status = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$payment_status, $order_id]);
        }
        
        // Log the action in audit log
        $action_description = "Updated payment status from '{$order['payment_status']}' to '{$payment_status}' for order ID {$order_id}";
        $stmt = $db->prepare("
            INSERT INTO audit_log (user_id, action, action_description, ip_address, user_agent)
            VALUES (?, 'update_payment_status', ?, ?, ?)
        ");
        $stmt->execute([
            $user['id'],
            $action_description,
            $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Payment status updated successfully'
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to update payment status: ' . $e->getMessage()]);
    }
}

?>
