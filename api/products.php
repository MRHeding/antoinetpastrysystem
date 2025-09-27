<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$host = 'localhost';
$dbname = 'antoinettes_pastries';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getProducts();
        break;
    case 'POST':
        createProduct();
        break;
    case 'PUT':
        updateProduct();
        break;
    case 'DELETE':
        deleteProduct();
        break;
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
        break;
}

function getProducts() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $products
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching products: ' . $e->getMessage()
        ]);
    }
}

function createProduct() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['name']) || !isset($input['description']) || !isset($input['price'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields'
        ]);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO products (name, description, price, category, image_url, is_active, created_at) 
            VALUES (?, ?, ?, ?, ?, 1, NOW())
        ");
        
        $stmt->execute([
            $input['name'],
            $input['description'],
            $input['price'],
            $input['category'] ?? 'General',
            $input['image_url'] ?? null
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Product created successfully',
            'id' => $pdo->lastInsertId()
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error creating product: ' . $e->getMessage()
        ]);
    }
}

function updateProduct() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode([
            'success' => false,
            'message' => 'Product ID required'
        ]);
        return;
    }
    
    try {
        $fields = [];
        $values = [];
        
        if (isset($input['name'])) {
            $fields[] = 'name = ?';
            $values[] = $input['name'];
        }
        if (isset($input['description'])) {
            $fields[] = 'description = ?';
            $values[] = $input['description'];
        }
        if (isset($input['price'])) {
            $fields[] = 'price = ?';
            $values[] = $input['price'];
        }
        if (isset($input['category'])) {
            $fields[] = 'category = ?';
            $values[] = $input['category'];
        }
        if (isset($input['image_url'])) {
            $fields[] = 'image_url = ?';
            $values[] = $input['image_url'];
        }
        
        if (empty($fields)) {
            echo json_encode([
                'success' => false,
                'message' => 'No fields to update'
            ]);
            return;
        }
        
        $values[] = $id;
        $sql = "UPDATE products SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        
        echo json_encode([
            'success' => true,
            'message' => 'Product updated successfully'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error updating product: ' . $e->getMessage()
        ]);
    }
}

function deleteProduct() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode([
            'success' => false,
            'message' => 'Product ID required'
        ]);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE products SET is_active = 0, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting product: ' . $e->getMessage()
        ]);
    }
}
?>


