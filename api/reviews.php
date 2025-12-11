<?php
header('Content-Type: application/json');
require_once '../config/database.php';

session_start();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    $database = Database::getInstance();
    $db = $database->getConnection();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

// Helper to get current user ID
function getCurrentUserId($db) {
    $session_token = $_COOKIE['session_token'] ?? '';
    if (!$session_token) return null;

    $stmt = $db->prepare("
        SELECT u.id 
        FROM users u
        JOIN user_sessions s ON u.id = s.user_id
        WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
    ");
    $stmt->execute([$session_token]);
    $user = $stmt->fetch();
    return $user ? $user['id'] : null;
}

if ($method === 'GET') {
    if ($action === 'get_reviews') {
        $product_id = $_GET['product_id'] ?? 0;
        
        try {
            $stmt = $db->prepare("
                SELECT r.*, u.first_name, u.last_name 
                FROM product_reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.product_id = ?
                ORDER BY r.created_at DESC
            ");
            $stmt->execute([$product_id]);
            $reviews = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'reviews' => $reviews]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error fetching reviews: ' . $e->getMessage()]);
        }
    } 
    elseif ($action === 'check_eligibility') {
        $product_id = $_GET['product_id'] ?? 0;
        $user_id = getCurrentUserId($db);
        
        if (!$user_id) {
            echo json_encode(['success' => true, 'can_review' => false, 'message' => 'Not logged in']);
            exit;
        }
        
        // Check if already reviewed
        $stmt = $db->prepare("SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?");
        $stmt->execute([$product_id, $user_id]);
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'can_review' => false, 'message' => 'Already reviewed']);
            exit;
        }
        
        // Check for verified purchase
        // Note: We check for 'completed' status as per requirement "purchase history" usually implies completed order
        $stmt = $db->prepare("
            SELECT o.id 
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ? 
            AND oi.product_id = ? 
            AND o.status = 'completed'
            LIMIT 1
        ");
        $stmt->execute([$user_id, $product_id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'can_review' => true]);
        } else {
            echo json_encode(['success' => true, 'can_review' => false, 'message' => 'No verified purchase']);
        }
    }
} 
elseif ($method === 'POST') {
    if ($action === 'add_review') {
        $input = json_decode(file_get_contents('php://input'), true);
        $product_id = $input['product_id'] ?? 0;
        $rating = $input['rating'] ?? 0;
        $comment = $input['comment'] ?? '';
        
        $user_id = getCurrentUserId($db);
        
        if (!$user_id) {
            echo json_encode(['success' => false, 'message' => 'Please log in to review']);
            exit;
        }
        
        if ($rating < 1 || $rating > 5) {
            echo json_encode(['success' => false, 'message' => 'Invalid rating']);
            exit;
        }
        
        // Verify purchase again
        $stmt = $db->prepare("
            SELECT o.id 
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ? 
            AND oi.product_id = ? 
            AND o.status = 'completed'
            LIMIT 1
        ");
        $stmt->execute([$user_id, $product_id]);
        
        if ($stmt->rowCount() == 0) {
            echo json_encode(['success' => false, 'message' => 'You can only review products you have purchased and received.']);
            exit;
        }
        
        try {
            $stmt = $db->prepare("
                INSERT INTO product_reviews (product_id, user_id, rating, comment)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$product_id, $user_id, $rating, $comment]);
            
            echo json_encode(['success' => true, 'message' => 'Review submitted successfully']);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Duplicate entry
                echo json_encode(['success' => false, 'message' => 'You have already reviewed this product']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error submitting review: ' . $e->getMessage()]);
            }
        }
    }
}
?>
