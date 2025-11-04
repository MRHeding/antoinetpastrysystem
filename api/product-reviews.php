<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

// Initialize database connection
$database = Database::getInstance();
$pdo = $database->getConnection();

if (!$pdo) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed'
    ]);
    exit;
}

// Helper function to authenticate user
function authenticateUser($pdo) {
    $session_token = $_COOKIE['session_token'] ?? '';
    
    if (!$session_token) {
        return null;
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.is_active
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $user ? $user : null;
    } catch (PDOException $e) {
        error_log("Auth error: " . $e->getMessage());
        return null;
    }
}

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getReviews();
        break;
    case 'POST':
        createReview();
        break;
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
        break;
}

// Get reviews for a product
function getReviews() {
    global $pdo;
    
    try {
        if (!isset($_GET['product_id'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Product ID is required'
            ]);
            return;
        }
        
        $product_id = $_GET['product_id'];
        
        // Get reviews with user information
        $stmt = $pdo->prepare("
            SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, r.updated_at,
                   u.username, u.first_name, u.last_name
            FROM product_reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$product_id]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate average rating
        $avgStmt = $pdo->prepare("
            SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
            FROM product_reviews
            WHERE product_id = ?
        ");
        $avgStmt->execute([$product_id]);
        $avgData = $avgStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'reviews' => $reviews,
            'average_rating' => $avgData['avg_rating'] ? round($avgData['avg_rating'], 1) : 0,
            'review_count' => (int)$avgData['review_count']
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching reviews: ' . $e->getMessage()
        ]);
    }
}

// Create a new review
function createReview() {
    global $pdo;
    
    // Authenticate user
    $user = authenticateUser($pdo);
    
    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'Authentication required'
        ]);
        return;
    }
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        if (!isset($input['product_id']) || !isset($input['rating'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Product ID and rating are required'
            ]);
            return;
        }
        
        $product_id = $input['product_id'];
        $rating = (int)$input['rating'];
        $comment = $input['comment'] ?? '';
        
        // Validate rating
        if ($rating < 1 || $rating > 5) {
            echo json_encode([
                'success' => false,
                'message' => 'Rating must be between 1 and 5'
            ]);
            return;
        }
        
        // Check if product exists
        $stmt = $pdo->prepare("SELECT id FROM products WHERE id = ? AND is_active = 1");
        $stmt->execute([$product_id]);
        if (!$stmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'Product not found'
            ]);
            return;
        }
        
        // Check if user already reviewed this product
        $stmt = $pdo->prepare("SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?");
        $stmt->execute([$product_id, $user['id']]);
        $existingReview = $stmt->fetch();
        
        if ($existingReview) {
            // Update existing review
            $stmt = $pdo->prepare("
                UPDATE product_reviews 
                SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $stmt->execute([$rating, $comment, $existingReview['id']]);
        } else {
            // Insert new review
            $stmt = $pdo->prepare("
                INSERT INTO product_reviews (product_id, user_id, rating, comment)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$product_id, $user['id'], $rating, $comment]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => $existingReview ? 'Review updated successfully' : 'Review submitted successfully'
        ]);
        
    } catch (PDOException $e) {
        // Check if it's a duplicate key error
        if ($e->getCode() == 23000) {
            echo json_encode([
                'success' => false,
                'message' => 'You have already reviewed this product'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error creating review: ' . $e->getMessage()
            ]);
        }
    }
}
?>
