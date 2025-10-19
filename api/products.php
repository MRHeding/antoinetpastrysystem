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
        // Check if a specific product ID is requested
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ? AND is_active = 1");
            $stmt->execute([$id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($product) {
                echo json_encode([
                    'success' => true,
                    'data' => $product
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Product not found'
                ]);
            }
        } else {
            // Get all products
            $stmt = $pdo->query("SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC");
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $products
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching products: ' . $e->getMessage()
        ]);
    }
}

function createProduct() {
    global $pdo;
    
    // Check if this is a multipart form data (with file upload)
    if (isset($_FILES['product_image']) && $_FILES['product_image']['error'] == 0) {
        // Handle file upload
        $uploadDir = '../uploads/products/';
        
        // Create directory if it doesn't exist
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // Debug upload information
        error_log("Processing file upload: " . print_r($_FILES, true));
        
        $fileName = time() . '_' . basename($_FILES['product_image']['name']);
        $targetFilePath = $uploadDir . $fileName;
        $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);
        
        // Allow certain file formats
        $allowTypes = array('jpg', 'png', 'jpeg', 'gif', 'webp');
        if (in_array(strtolower($fileType), $allowTypes)) {
            // Upload file to server
            if (move_uploaded_file($_FILES['product_image']['tmp_name'], $targetFilePath)) {
                // Get other form data
                $name = $_POST['name'] ?? '';
                $description = $_POST['description'] ?? '';
                $price = $_POST['price'] ?? 0;
                $category = $_POST['category'] ?? 'General';
                $imageUrl = 'uploads/products/' . $fileName; // Relative path for storage
                
                if (empty($name) || empty($description) || empty($price)) {
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
                        $name,
                        $description,
                        $price,
                        $category,
                        $imageUrl
                    ]);
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Product created successfully with image',
                        'id' => $pdo->lastInsertId(),
                        'image_url' => $imageUrl
                    ]);
                } catch (PDOException $e) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error creating product: ' . $e->getMessage()
                    ]);
                }
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to upload image'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Only JPG, JPEG, PNG, GIF, and WEBP files are allowed'
            ]);
        }
    } else {
        // Handle regular JSON request (backward compatibility)
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
}

function updateProduct() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode([
            'success' => false,
            'message' => 'Product ID is required'
        ]);
        return;
    }
    
    // Check if this is a multipart form data with _method=PUT (with file upload)
    if (isset($_POST['_method']) && $_POST['_method'] === 'PUT' && isset($_FILES['product_image'])) {
        // Handle file upload for update
        if ($_FILES['product_image']['error'] == 0) {
            $uploadDir = '../uploads/products/';
            
            // Create directory if it doesn't exist
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $fileName = time() . '_' . basename($_FILES['product_image']['name']);
            $targetFilePath = $uploadDir . $fileName;
            $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);
            
            // Allow certain file formats
            $allowTypes = array('jpg', 'png', 'jpeg', 'gif', 'webp');
            if (in_array(strtolower($fileType), $allowTypes)) {
                // Upload file to server
                if (move_uploaded_file($_FILES['product_image']['tmp_name'], $targetFilePath)) {
                    // Get other form data
                    $name = $_POST['name'] ?? '';
                    $description = $_POST['description'] ?? '';
                    $price = $_POST['price'] ?? 0;
                    $category = $_POST['category'] ?? 'General';
                    $imageUrl = 'uploads/products/' . $fileName; // Relative path for storage
                    
                    if (empty($name) || empty($description) || empty($price)) {
                        echo json_encode([
                            'success' => false,
                            'message' => 'Missing required fields'
                        ]);
                        return;
                    }
                    
                    try {
                        $stmt = $pdo->prepare("
                            UPDATE products 
                            SET name = ?, description = ?, price = ?, category = ?, image_url = ?, updated_at = NOW()
                            WHERE id = ?
                        ");
                        
                        $stmt->execute([
                            $name,
                            $description,
                            $price,
                            $category,
                            $imageUrl,
                            $id
                        ]);
                        
                        echo json_encode([
                            'success' => true,
                            'message' => 'Product updated successfully with new image',
                            'image_url' => $imageUrl
                        ]);
                    } catch (PDOException $e) {
                        echo json_encode([
                            'success' => false,
                            'message' => 'Error updating product: ' . $e->getMessage()
                        ]);
                    }
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Failed to upload image'
                    ]);
                }
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Only JPG, JPEG, PNG, GIF, and WEBP files are allowed'
                ]);
            }
        } else {
            // Handle form data without new image
            $name = $_POST['name'] ?? '';
            $description = $_POST['description'] ?? '';
            $price = $_POST['price'] ?? 0;
            $category = $_POST['category'] ?? 'General';
            
            if (empty($name) || empty($description) || empty($price)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                return;
            }
            
            try {
                $stmt = $pdo->prepare("
                    UPDATE products 
                    SET name = ?, description = ?, price = ?, category = ?, updated_at = NOW()
                    WHERE id = ?
                ");
                
                $stmt->execute([
                    $name,
                    $description,
                    $price,
                    $category,
                    $id
                ]);
                
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
    } else {
        // Handle regular JSON request
        $input = json_decode(file_get_contents('php://input'), true);
        
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


