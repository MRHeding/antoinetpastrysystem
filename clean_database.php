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
function executeQuery($conn, $query, $description, $params = []) {
    try {
        $stmt = $conn->prepare($query);
        $stmt->execute($params);
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
            'error' => $e->getMessage(),
            'affected_rows' => 0
        ];
    }
}

// Main cleanup function
function cleanDatabase() {
    $results = [];
    $totalDeleted = 0;
    $conn = null;
    
    try {
        // Get database connection
        $database = Database::getInstance();
        $conn = $database->getConnection();
        
        // Start transaction
        $conn->beginTransaction();
        
        // Step 1: Get all non-admin user IDs
        $stmt = $conn->prepare("SELECT id, username, email FROM users WHERE role != 'admin'");
        $stmt->execute();
        $nonAdminUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $nonAdminCount = count($nonAdminUsers);
        
        // Extract user IDs for use in subsequent queries
        $userIds = array_column($nonAdminUsers, 'id');
        
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
        
        // Create placeholders for IN clause
        $placeholders = implode(',', array_fill(0, count($userIds), '?'));
        
        // Step 2: Delete chat messages for non-admin users
        $result = executeQuery(
            $conn,
            "DELETE FROM chat_messages WHERE user_id IN ($placeholders)",
            "Delete chat messages for non-admin users",
            $userIds
        );
        $results[] = $result;
        if (!$result['success']) {
            throw new Exception($result['error']);
        }
        $totalDeleted += $result['affected_rows'] ?? 0;
        
        // Step 3: Delete chat sessions for non-admin users
        $result = executeQuery(
            $conn,
            "DELETE FROM chat_sessions WHERE user_id IN ($placeholders)",
            "Delete chat sessions for non-admin users",
            $userIds
        );
        $results[] = $result;
        if (!$result['success']) {
            throw new Exception($result['error']);
        }
        $totalDeleted += $result['affected_rows'] ?? 0;
        
        // Step 4: Get order IDs for non-admin users
        $stmt = $conn->prepare("SELECT id FROM orders WHERE user_id IN ($placeholders)");
        $stmt->execute($userIds);
        $orderIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (!empty($orderIds)) {
            $orderPlaceholders = implode(',', array_fill(0, count($orderIds), '?'));
            
            // Delete order items for orders belonging to non-admin users
            $result = executeQuery(
                $conn,
                "DELETE FROM order_items WHERE order_id IN ($orderPlaceholders)",
                "Delete order items for non-admin users",
                $orderIds
            );
            $results[] = $result;
            if (!$result['success']) {
                throw new Exception($result['error']);
            }
            $totalDeleted += $result['affected_rows'] ?? 0;
        } else {
            $results[] = [
                'success' => true,
                'description' => 'Delete order items for non-admin users',
                'affected_rows' => 0
            ];
        }
        
        // Step 5: Delete orders for non-admin users
        $result = executeQuery(
            $conn,
            "DELETE FROM orders WHERE user_id IN ($placeholders)",
            "Delete orders for non-admin users",
            $userIds
        );
        $results[] = $result;
        if (!$result['success']) {
            throw new Exception($result['error']);
        }
        $totalDeleted += $result['affected_rows'] ?? 0;
        
        // Step 6: Delete user sessions for non-admin users
        $result = executeQuery(
            $conn,
            "DELETE FROM user_sessions WHERE user_id IN ($placeholders)",
            "Delete user sessions for non-admin users",
            $userIds
        );
        $results[] = $result;
        if (!$result['success']) {
            throw new Exception($result['error']);
        }
        $totalDeleted += $result['affected_rows'] ?? 0;
        
        // Step 7: Delete audit log entries for non-admin users (if table exists)
        // Check if table exists first
        $stmt = $conn->prepare("SHOW TABLES LIKE 'audit_log'");
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            $result = executeQuery(
                $conn,
                "DELETE FROM audit_log WHERE user_id IN ($placeholders)",
                "Delete audit log entries for non-admin users",
                $userIds
            );
            $results[] = $result;
            if (!$result['success']) {
                // Log but don't fail if audit_log table has issues
                error_log("Failed to delete audit log entries: " . ($result['error'] ?? 'Unknown error'));
            }
            $totalDeleted += $result['affected_rows'] ?? 0;
        } else {
            $results[] = [
                'success' => true,
                'description' => 'Delete audit log entries for non-admin users',
                'affected_rows' => 0,
                'note' => 'audit_log table does not exist'
            ];
        }
        
        // Step 8: Delete non-admin users
        $result = executeQuery(
            $conn,
            "DELETE FROM users WHERE id IN ($placeholders)",
            "Delete non-admin users",
            $userIds
        );
        $results[] = $result;
        if (!$result['success']) {
            throw new Exception($result['error']);
        }
        $totalDeleted += $result['affected_rows'] ?? 0;
        
        // Commit transaction
        $conn->commit();
        
        // Get remaining user count
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users");
        $stmt->execute();
        $remainingUsers = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        return [
            'success' => true,
            'message' => 'Database cleaned successfully!',
            'summary' => [
                'non_admin_users_removed' => $nonAdminCount,
                'total_records_deleted' => $totalDeleted,
                'remaining_users' => (int)$remainingUsers
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
            'results' => $results,
            'total_deleted' => $totalDeleted
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
        
        // Get non-admin user IDs first
        $stmt = $conn->prepare("SELECT id FROM users WHERE role != 'admin'");
        $stmt->execute();
        $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $userCount = count($userIds);
        
        // Get counts using user IDs if any exist
        $chatCount = 0;
        $orderCount = 0;
        
        if (!empty($userIds)) {
            $placeholders = implode(',', array_fill(0, count($userIds), '?'));
            
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM chat_messages WHERE user_id IN ($placeholders)");
            $stmt->execute($userIds);
            $chatCount = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM orders WHERE user_id IN ($placeholders)");
            $stmt->execute($userIds);
            $orderCount = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $stmt = $conn->prepare("SELECT id, username, email, role FROM users WHERE role != 'admin'");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $users = [];
        }
        
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

