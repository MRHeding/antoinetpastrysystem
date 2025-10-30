<?php
/**
 * Database Cleanup Script
 * This script removes all users, chats, and orders except admin accounts
 * 
 * WARNING: This is a destructive operation and cannot be undone!
 * Make sure to backup your database before running this script.
 */

require_once 'config/database.php';

// Set response headers
header('Content-Type: application/json');

// Authentication check (optional - uncomment if you want to require admin login)
// require_once 'admin/auth-check.php';
// $currentAdmin = requireAdminAuth();

// Function to safely execute and log queries
function executeQuery($conn, $query, $description) {
    try {
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $affected = $stmt->rowCount();
        return [
            'success' => true,
            'description' => $description,
            'affected_rows' => $affected
        ];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'description' => $description,
            'error' => $e->getMessage()
        ];
    }
}

// Main cleanup function
function cleanDatabase() {
    $results = [];
    $totalDeleted = 0;
    
    try {
        // Get database connection
        $database = Database::getInstance();
        $conn = $database->getConnection();
        
        // Start transaction
        $conn->beginTransaction();
        
        // Step 1: Get all non-admin user IDs
        $stmt = $conn->prepare("SELECT id, username, email FROM users WHERE role != 'admin'");
        $stmt->execute();
        $nonAdminUsers = $stmt->fetchAll();
        $nonAdminCount = count($nonAdminUsers);
        
        $results[] = [
            'description' => 'Non-admin users identified',
            'count' => $nonAdminCount,
            'users' => array_map(function($user) {
                return $user['username'] . ' (' . $user['email'] . ')';
            }, $nonAdminUsers)
        ];
        
        if ($nonAdminCount === 0) {
            $conn->rollBack();
            return [
                'success' => true,
                'message' => 'No non-admin users found. Nothing to clean.',
                'results' => $results
            ];
        }
        
        // Step 2: Delete chat messages for non-admin users
        $result = executeQuery(
            $conn,
            "DELETE FROM chat_messages WHERE user_id IN (SELECT id FROM users WHERE role != 'admin')",
            "Delete chat messages for non-admin users"
        );
        $results[] = $result;
        $totalDeleted += $result['affected_rows'] ?? 0;
        
        // Step 3: Delete chat sessions for non-admin users
        $result = executeQuery(
            $conn,
            "DELETE FROM chat_sessions WHERE user_id IN (SELECT id FROM users WHERE role != 'admin')",
            "Delete chat sessions for non-admin users"
        );
        $results[] = $result;
        $totalDeleted += $result['affected_rows'] ?? 0;
        
        // Step 4: Delete order items for orders belonging to non-admin users
        $result = executeQuery(
            $conn,
            "DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE role != 'admin'))",
            "Delete order items for non-admin users"
        );
        $results[] = $result;
        $totalDeleted += $result['affected_rows'] ?? 0;
        
        // Step 5: Delete orders for non-admin users
        $result = executeQuery(
            $conn,
            "DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE role != 'admin')",
            "Delete orders for non-admin users"
        );
        $results[] = $result;
        $totalDeleted += $result['affected_rows'] ?? 0;
        
        // Step 6: Delete user sessions for non-admin users
        $result = executeQuery(
            $conn,
            "DELETE FROM user_sessions WHERE user_id IN (SELECT id FROM users WHERE role != 'admin')",
            "Delete user sessions for non-admin users"
        );
        $results[] = $result;
        $totalDeleted += $result['affected_rows'] ?? 0;
        
        // Step 7: Delete audit log entries for non-admin users (if table exists)
        $result = executeQuery(
            $conn,
            "DELETE FROM audit_log WHERE user_id IN (SELECT id FROM users WHERE role != 'admin')",
            "Delete audit log entries for non-admin users"
        );
        $results[] = $result;
        $totalDeleted += $result['affected_rows'] ?? 0;
        
        // Step 8: Delete non-admin users
        $result = executeQuery(
            $conn,
            "DELETE FROM users WHERE role != 'admin'",
            "Delete non-admin users"
        );
        $results[] = $result;
        $totalDeleted += $result['affected_rows'] ?? 0;
        
        // Commit transaction
        $conn->commit();
        
        // Get remaining user count
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users");
        $stmt->execute();
        $remainingUsers = $stmt->fetch()['count'];
        
        return [
            'success' => true,
            'message' => 'Database cleaned successfully!',
            'summary' => [
                'non_admin_users_removed' => $nonAdminCount,
                'total_records_deleted' => $totalDeleted,
                'remaining_users' => $remainingUsers
            ],
            'details' => $results
        ];
        
    } catch (Exception $e) {
        // Rollback on error
        if ($conn && $conn->inTransaction()) {
            $conn->rollBack();
        }
        
        return [
            'success' => false,
            'message' => 'Database cleanup failed: ' . $e->getMessage(),
            'results' => $results
        ];
    }
}

// Execute cleanup if confirmed
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Require confirmation
    if (!isset($input['confirm']) || $input['confirm'] !== true) {
        echo json_encode([
            'success' => false,
            'message' => 'Confirmation required. Send {"confirm": true} to proceed.'
        ]);
        exit;
    }
    
    // Execute cleanup
    $result = cleanDatabase();
    echo json_encode($result, JSON_PRETTY_PRINT);
    
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Show preview of what will be deleted
    try {
        $database = Database::getInstance();
        $conn = $database->getConnection();
        
        // Get counts
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users WHERE role != 'admin'");
        $stmt->execute();
        $userCount = $stmt->fetch()['count'];
        
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM chat_messages WHERE user_id IN (SELECT id FROM users WHERE role != 'admin')");
        $stmt->execute();
        $chatCount = $stmt->fetch()['count'];
        
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM orders WHERE user_id IN (SELECT id FROM users WHERE role != 'admin')");
        $stmt->execute();
        $orderCount = $stmt->fetch()['count'];
        
        $stmt = $conn->prepare("SELECT id, username, email, role FROM users WHERE role != 'admin'");
        $stmt->execute();
        $users = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'message' => 'Preview of records to be deleted',
            'preview' => [
                'users' => $userCount,
                'chat_messages' => $chatCount,
                'orders' => $orderCount
            ],
            'users_to_delete' => $users,
            'warning' => 'To proceed, send a POST request with {"confirm": true}'
        ], JSON_PRETTY_PRINT);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to generate preview: ' . $e->getMessage()
        ]);
    }
    
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method. Use GET for preview or POST to execute cleanup.'
    ]);
}
?>

