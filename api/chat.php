<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

// Get database connection
$database = Database::getInstance();
$conn = $database->getConnection();

// Helper function to authenticate user via session token
function authenticateUser($conn) {
    $session_token = $_COOKIE['session_token'] ?? '';
    
    if (!$session_token) {
        return null;
    }
    
    try {
        $stmt = $conn->prepare("
            SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.is_active
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
        
        return $user ? $user : null;
    } catch (PDOException $e) {
        error_log("Auth error: " . $e->getMessage());
        return null;
    }
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get action from query parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($method) {
        case 'GET':
            if ($action === 'get_messages') {
                getMessages($conn);
            } elseif ($action === 'get_conversations') {
                getConversations($conn);
            } elseif ($action === 'get_unread_count') {
                getUnreadCount($conn);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
            }
            break;
        
        case 'POST':
            if ($action === 'send_message') {
                sendMessage($conn);
            } elseif ($action === 'mark_as_read') {
                markAsRead($conn);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
            }
            break;
        
        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

// Function to send a message
function sendMessage($conn) {
    $currentUser = authenticateUser($conn);
    
    if (!$currentUser) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }

    // Handle both JSON and FormData
    $message = '';
    $targetUserId = null;
    $imagePath = null;

    if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
        // Handle FormData (for image uploads)
        $message = isset($_POST['message']) ? trim($_POST['message']) : '';
        $targetUserId = isset($_POST['target_user_id']) ? $_POST['target_user_id'] : null;
        
        // Handle image upload
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imagePath = handleImageUpload($_FILES['image']);
            if (!$imagePath) {
                echo json_encode(['success' => false, 'message' => 'Failed to upload image']);
                return;
            }
        }
    } else {
        // Handle JSON (for text-only messages)
        $data = json_decode(file_get_contents('php://input'), true);
        $message = isset($data['message']) ? trim($data['message']) : '';
        $targetUserId = isset($data['target_user_id']) ? $data['target_user_id'] : null;
    }

    // Must have either message or image
    if (empty($message) && empty($imagePath)) {
        echo json_encode(['success' => false, 'message' => 'Message or image is required']);
        return;
    }

    // Determine sender type
    $isAdmin = isset($currentUser['role']) && $currentUser['role'] === 'admin';
    $senderType = $isAdmin ? 'admin' : 'user';
    
    // For regular users, user_id is their own ID
    // For admins sending to a user, user_id is the target user's ID
    if ($isAdmin && $targetUserId) {
        $userId = $targetUserId;
    } else {
        $userId = $currentUser['id'];
    }

    try {
        $conn->beginTransaction();

        // Insert message
        $stmt = $conn->prepare("
            INSERT INTO chat_messages (user_id, sender_type, message, image_path, is_read)
            VALUES (?, ?, ?, ?, FALSE)
        ");
        $stmt->execute([$userId, $senderType, $message, $imagePath]);
        $messageId = $conn->lastInsertId();

        // Update or create chat session
        $stmt = $conn->prepare("
            INSERT INTO chat_sessions (user_id, last_message_at, unread_admin_count, unread_user_count)
            VALUES (?, NOW(), ?, ?)
            ON DUPLICATE KEY UPDATE 
                last_message_at = NOW(),
                unread_admin_count = unread_admin_count + ?,
                unread_user_count = unread_user_count + ?
        ");
        
        $unreadAdminIncrement = $senderType === 'user' ? 1 : 0;
        $unreadUserIncrement = $senderType === 'admin' ? 1 : 0;
        
        $stmt->execute([
            $userId,
            $unreadAdminIncrement,
            $unreadUserIncrement,
            $unreadAdminIncrement,
            $unreadUserIncrement
        ]);

        $conn->commit();

        // Fetch the inserted message with user details
        $stmt = $conn->prepare("
            SELECT 
                cm.id,
                cm.user_id,
                cm.sender_type,
                cm.message,
                cm.image_path,
                cm.is_read,
                cm.created_at,
                u.first_name,
                u.last_name,
                u.email
            FROM chat_messages cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.id = ?
        ");
        $stmt->execute([$messageId]);
        $messageData = $stmt->fetch();

        echo json_encode([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => $messageData
        ]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode([
            'success' => false,
            'message' => 'Failed to send message: ' . $e->getMessage()
        ]);
    }
}

// Function to handle image upload
function handleImageUpload($file) {
    // Validate file
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!in_array($file['type'], $allowedTypes)) {
        return false;
    }
    
    if ($file['size'] > $maxSize) {
        return false;
    }
    
    // Create uploads directory if it doesn't exist
    $uploadDir = '../uploads/chat/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('chat_', true) . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Return relative path from web root
        return 'uploads/chat/' . $filename;
    }
    
    return false;
}

// Function to get messages for a conversation
function getMessages($conn) {
    $currentUser = authenticateUser($conn);
    
    if (!$currentUser) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }

    $isAdmin = isset($currentUser['role']) && $currentUser['role'] === 'admin';
    $targetUserId = isset($_GET['user_id']) ? $_GET['user_id'] : null;

    // For regular users, get their own messages
    // For admins, get messages for a specific user
    if ($isAdmin && $targetUserId) {
        $userId = $targetUserId;
    } else {
        $userId = $currentUser['id'];
    }

    try {
        $stmt = $conn->prepare("
            SELECT 
                cm.id,
                cm.user_id,
                cm.sender_type,
                cm.message,
                cm.image_path,
                cm.is_read,
                cm.created_at,
                u.first_name,
                u.last_name,
                u.email
            FROM chat_messages cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.user_id = ?
            ORDER BY cm.created_at ASC
        ");
        $stmt->execute([$userId]);
        $messages = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'data' => $messages
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch messages: ' . $e->getMessage()
        ]);
    }
}

// Function to get all conversations (admin only)
function getConversations($conn) {
    $currentUser = authenticateUser($conn);
    
    if (!$currentUser || $currentUser['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }

    try {
        $stmt = $conn->prepare("
            SELECT 
                cs.user_id,
                cs.last_message_at,
                cs.unread_admin_count,
                u.first_name,
                u.last_name,
                u.email,
                (SELECT message FROM chat_messages WHERE user_id = cs.user_id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT sender_type FROM chat_messages WHERE user_id = cs.user_id ORDER BY created_at DESC LIMIT 1) as last_sender
            FROM chat_sessions cs
            JOIN users u ON cs.user_id = u.id
            WHERE cs.last_message_at IS NOT NULL
            ORDER BY cs.last_message_at DESC
        ");
        $stmt->execute();
        $conversations = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'data' => $conversations
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch conversations: ' . $e->getMessage()
        ]);
    }
}

// Function to mark messages as read
function markAsRead($conn) {
    $currentUser = authenticateUser($conn);
    
    if (!$currentUser) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $targetUserId = isset($data['user_id']) ? $data['user_id'] : null;

    $isAdmin = isset($currentUser['role']) && $currentUser['role'] === 'admin';

    // Determine which messages to mark as read
    if ($isAdmin && $targetUserId) {
        // Admin marking user messages as read
        $userId = $targetUserId;
        $senderType = 'user';
        $unreadCountField = 'unread_admin_count';
    } else {
        // User marking admin messages as read
        $userId = $currentUser['id'];
        $senderType = 'admin';
        $unreadCountField = 'unread_user_count';
    }

    try {
        $conn->beginTransaction();

        // Mark messages as read
        $stmt = $conn->prepare("
            UPDATE chat_messages 
            SET is_read = TRUE 
            WHERE user_id = ? AND sender_type = ? AND is_read = FALSE
        ");
        $stmt->execute([$userId, $senderType]);

        // Update session unread count
        $stmt = $conn->prepare("
            UPDATE chat_sessions 
            SET $unreadCountField = 0 
            WHERE user_id = ?
        ");
        $stmt->execute([$userId]);

        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Messages marked as read'
        ]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode([
            'success' => false,
            'message' => 'Failed to mark messages as read: ' . $e->getMessage()
        ]);
    }
}

// Function to get unread message count
function getUnreadCount($conn) {
    $currentUser = authenticateUser($conn);
    
    if (!$currentUser) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }

    $isAdmin = isset($currentUser['role']) && $currentUser['role'] === 'admin';

    try {
        if ($isAdmin) {
            // Get total unread messages from all users
            $stmt = $conn->prepare("
                SELECT COALESCE(SUM(unread_admin_count), 0) as unread_count
                FROM chat_sessions
            ");
            $stmt->execute();
        } else {
            // Get unread messages for this user
            $stmt = $conn->prepare("
                SELECT COALESCE(unread_user_count, 0) as unread_count
                FROM chat_sessions
                WHERE user_id = ?
            ");
            $stmt->execute([$currentUser['id']]);
        }

        $result = $stmt->fetch();
        $unreadCount = $result ? intval($result['unread_count']) : 0;

        echo json_encode([
            'success' => true,
            'unread_count' => $unreadCount
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch unread count: ' . $e->getMessage()
        ]);
    }
}
?>

