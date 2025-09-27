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
    case 'POST':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'register':
                registerUser();
                break;
            case 'login':
                loginUser();
                break;
            case 'logout':
                logoutUser();
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
                break;
        }
        break;
    case 'GET':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'check':
                checkAuth();
                break;
            case 'profile':
                getProfile();
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

function registerUser() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    if (!isset($input['username']) || !isset($input['email']) || !isset($input['password']) || 
        !isset($input['first_name']) || !isset($input['last_name'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        return;
    }
    
    // Validate password strength
    if (strlen($input['password']) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
        return;
    }
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        // Check if username or email already exists
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$input['username'], $input['email']]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
            return;
        }
        
        // Hash password
        $password_hash = password_hash($input['password'], PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $db->prepare("
            INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address, city, state, zip_code) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['username'],
            $input['email'],
            $password_hash,
            $input['first_name'],
            $input['last_name'],
            $input['phone'] ?? null,
            $input['address'] ?? null,
            $input['city'] ?? null,
            $input['state'] ?? null,
            $input['zip_code'] ?? null
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'User registered successfully',
            'user_id' => $db->lastInsertId()
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
    }
}

function loginUser() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        echo json_encode(['success' => false, 'message' => 'Username and password required']);
        return;
    }
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        // Get user by username or email
        $stmt = $db->prepare("
            SELECT id, username, email, password_hash, first_name, last_name, role, is_active 
            FROM users 
            WHERE (username = ? OR email = ?) AND is_active = 1
        ");
        $stmt->execute([$input['username'], $input['username']]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
            return;
        }
        
        // Generate session token
        $session_token = bin2hex(random_bytes(32));
        $expires_at = date('Y-m-d H:i:s', strtotime('+7 days'));
        
        // Store session
        $stmt = $db->prepare("
            INSERT INTO user_sessions (user_id, session_token, expires_at) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$user['id'], $session_token, $expires_at]);
        
        // Set session cookie
        setcookie('session_token', $session_token, time() + (7 * 24 * 60 * 60), '/', '', false, true);
        
        // Remove password hash from response
        unset($user['password_hash']);
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user,
            'session_token' => $session_token
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Login failed: ' . $e->getMessage()]);
    }
}

function logoutUser() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        
        if ($session_token) {
            $database = new Database();
            $db = $database->getConnection();
            
            // Delete session
            $stmt = $db->prepare("DELETE FROM user_sessions WHERE session_token = ?");
            $stmt->execute([$session_token]);
        }
        
        // Clear cookie
        setcookie('session_token', '', time() - 3600, '/', '', false, true);
        
        echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Logout failed: ' . $e->getMessage()]);
    }
}

function checkAuth() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        
        if (!$session_token) {
            echo json_encode(['success' => false, 'message' => 'No session found']);
            return;
        }
        
        $database = new Database();
        $db = $database->getConnection();
        
        // Check session validity
        $stmt = $db->prepare("
            SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.is_active
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Invalid or expired session']);
            return;
        }
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Authentication check failed: ' . $e->getMessage()]);
    }
}

function getProfile() {
    try {
        $session_token = $_COOKIE['session_token'] ?? '';
        
        if (!$session_token) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            return;
        }
        
        $database = new Database();
        $db = $database->getConnection();
        
        // Get user profile
        $stmt = $db->prepare("
            SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone, 
                   u.address, u.city, u.state, u.zip_code, u.role, u.created_at
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            return;
        }
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to get profile: ' . $e->getMessage()]);
    }
}
?>
