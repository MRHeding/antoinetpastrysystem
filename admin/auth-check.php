<?php
// Admin authentication check
require_once '../config/database.php';

// Start session
session_start();

// Check if user is authenticated and is admin
function checkAdminAuth() {
    $session_token = $_COOKIE['session_token'] ?? '';
    
    if (!$session_token) {
        return false;
    }
    
    try {
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Check session validity and admin role
        $stmt = $db->prepare("
            SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.is_active
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1 AND u.role = 'admin'
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        return $user ? $user : false;
        
    } catch (PDOException $e) {
        return false;
    }
}

// Redirect to login if not authenticated
function requireAdminAuth() {
    $user = checkAdminAuth();
    
    if (!$user) {
        header('Location: login.html');
        exit();
    }
    
    return $user;
}

// Get current admin user
function getCurrentAdmin() {
    return checkAdminAuth();
}
?>
