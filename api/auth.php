<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';
require_once 'email-service-smtp.php';

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
            case 'verify-email':
                verifyEmail();
                break;
            case 'resend-verification':
                resendVerificationEmail();
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
        
        // Generate verification token
        $verification_token = bin2hex(random_bytes(32));
        $verification_expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        // Insert new user
        $stmt = $db->prepare("
            INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address, city, state, zip_code, email_verification_token, email_verification_expires) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            $input['zip_code'] ?? null,
            $verification_token,
            $verification_expires
        ]);
        
        $user_id = $db->lastInsertId();
        
        // Send verification email
                $emailService = new SMTPEmailService();
        $email_sent = $emailService->sendVerificationEmail($input['email'], $input['first_name'], $verification_token);
        
        if ($email_sent) {
            echo json_encode([
                'success' => true,
                'message' => 'Registration successful! Please check your email to verify your account.',
                'user_id' => $user_id,
                'email_sent' => true
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'message' => 'Registration successful! However, we could not send the verification email. Please contact support.',
                'user_id' => $user_id,
                'email_sent' => false
            ]);
        }
        
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
            SELECT id, username, email, password_hash, first_name, last_name, role, is_active, email_verified 
            FROM users 
            WHERE (username = ? OR email = ?) AND is_active = 1
        ");
        $stmt->execute([$input['username'], $input['username']]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
            return;
        }
        
        // Check if email is verified
        if (!$user['email_verified']) {
            echo json_encode([
                'success' => false, 
                'message' => 'Please verify your email address before logging in. Check your email for the verification link.',
                'email_verified' => false
            ]);
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

function verifyEmail() {
    $token = $_GET['token'] ?? '';
    
    if (empty($token)) {
        echo json_encode(['success' => false, 'message' => 'Verification token is required']);
        return;
    }
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        // Find user with valid token
        $stmt = $db->prepare("
            SELECT id, email, first_name, email_verification_expires 
            FROM users 
            WHERE email_verification_token = ? AND email_verified = 0
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Invalid or expired verification token']);
            return;
        }
        
        // Check if token is expired
        if (strtotime($user['email_verification_expires']) < time()) {
            echo json_encode(['success' => false, 'message' => 'Verification token has expired. Please request a new one.']);
            return;
        }
        
        // Update user as verified
        $stmt = $db->prepare("
            UPDATE users 
            SET email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL 
            WHERE id = ?
        ");
        $stmt->execute([$user['id']]);
        
        // Send welcome email
                $emailService = new SMTPEmailService();
        $emailService->sendWelcomeEmail($user['email'], $user['first_name']);
        
        echo json_encode([
            'success' => true,
            'message' => 'Email verified successfully! You can now log in to your account.',
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'first_name' => $user['first_name']
            ]
        ]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Verification failed: ' . $e->getMessage()]);
    }
}

function resendVerificationEmail() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['email'])) {
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        return;
    }
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        // Find user
        $stmt = $db->prepare("
            SELECT id, email, first_name, email_verified 
            FROM users 
            WHERE email = ? AND is_active = 1
        ");
        $stmt->execute([$input['email']]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'No account found with this email address']);
            return;
        }
        
        if ($user['email_verified']) {
            echo json_encode(['success' => false, 'message' => 'Email is already verified']);
            return;
        }
        
        // Generate new verification token
        $verification_token = bin2hex(random_bytes(32));
        $verification_expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        // Update user with new token
        $stmt = $db->prepare("
            UPDATE users 
            SET email_verification_token = ?, email_verification_expires = ? 
            WHERE id = ?
        ");
        $stmt->execute([$verification_token, $verification_expires, $user['id']]);
        
        // Send verification email
                $emailService = new SMTPEmailService();
        $email_sent = $emailService->sendVerificationEmail($user['email'], $user['first_name'], $verification_token);
        
        if ($email_sent) {
            echo json_encode([
                'success' => true,
                'message' => 'Verification email sent successfully! Please check your email.'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to send verification email. Please try again later.'
            ]);
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to resend verification email: ' . $e->getMessage()]);
    }
}
?>
