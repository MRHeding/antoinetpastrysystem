<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Include database configuration
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

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getProductSizes();
        break;
    case 'POST':
        createProductSize();
        break;
    case 'PUT':
        updateProductSize();
        break;
    case 'DELETE':
        deleteProductSize();
        break;
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
        break;
}

function getProductSizes() {
    global $pdo;
    
    try {
        // Check if a specific product ID is requested
        if (isset($_GET['product_id'])) {
            $productId = $_GET['product_id'];
            $stmt = $pdo->prepare("
                SELECT id, product_id, size_name, size_code, price, is_available, sort_order, created_at, updated_at 
                FROM product_sizes 
                WHERE product_id = ? 
                ORDER BY sort_order ASC
            ");
            $stmt->execute([$productId]);
            $sizes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $sizes
            ]);
        } elseif (isset($_GET['id'])) {
            // Get a specific size by ID
            $id = $_GET['id'];
            $stmt = $pdo->prepare("
                SELECT id, product_id, size_name, size_code, price, is_available, sort_order, created_at, updated_at 
                FROM product_sizes 
                WHERE id = ?
            ");
            $stmt->execute([$id]);
            $size = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($size) {
                echo json_encode([
                    'success' => true,
                    'data' => $size
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Size not found'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Product ID or Size ID is required'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching product sizes: ' . $e->getMessage()
        ]);
    }
}

function createProductSize() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['product_id']) || !isset($input['size_name']) || !isset($input['size_code']) || !isset($input['price'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields (product_id, size_name, size_code, price)'
        ]);
        return;
    }
    
    try {
        // Get the next sort order for this product
        $stmt = $pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM product_sizes WHERE product_id = ?");
        $stmt->execute([$input['product_id']]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $sortOrder = $result['next_order'];
        
        // Insert the new size
        $stmt = $pdo->prepare("
            INSERT INTO product_sizes (product_id, size_name, size_code, price, is_available, sort_order, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $input['product_id'],
            $input['size_name'],
            $input['size_code'],
            $input['price'],
            isset($input['is_available']) ? $input['is_available'] : 1,
            isset($input['sort_order']) ? $input['sort_order'] : $sortOrder
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Product size created successfully',
            'id' => $pdo->lastInsertId()
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error creating product size: ' . $e->getMessage()
        ]);
    }
}

function updateProductSize() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode([
            'success' => false,
            'message' => 'Size ID is required'
        ]);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        $fields = [];
        $values = [];
        
        if (isset($input['size_name'])) {
            $fields[] = 'size_name = ?';
            $values[] = $input['size_name'];
        }
        if (isset($input['size_code'])) {
            $fields[] = 'size_code = ?';
            $values[] = $input['size_code'];
        }
        if (isset($input['price'])) {
            $fields[] = 'price = ?';
            $values[] = $input['price'];
        }
        if (isset($input['is_available'])) {
            $fields[] = 'is_available = ?';
            $values[] = $input['is_available'];
        }
        if (isset($input['sort_order'])) {
            $fields[] = 'sort_order = ?';
            $values[] = $input['sort_order'];
        }
        
        if (empty($fields)) {
            echo json_encode([
                'success' => false,
                'message' => 'No fields to update'
            ]);
            return;
        }
        
        $values[] = $id;
        $sql = "UPDATE product_sizes SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        
        echo json_encode([
            'success' => true,
            'message' => 'Product size updated successfully'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error updating product size: ' . $e->getMessage()
        ]);
    }
}

function deleteProductSize() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode([
            'success' => false,
            'message' => 'Size ID required'
        ]);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM product_sizes WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Product size deleted successfully'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting product size: ' . $e->getMessage()
        ]);
    }
}
?>

