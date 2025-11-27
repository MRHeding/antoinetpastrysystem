<?php
/**
 * Database Migration: Add image_path column to chat_messages table
 * 
 * This script adds the image_path column to the chat_messages table
 * to support image uploads in chat messages.
 */

require_once '../config/database.php';

header('Content-Type: application/json');

try {
    $database = Database::getInstance();
    $conn = $database->getConnection();
    
    // Check if column already exists
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'antonettes_pastries' 
        AND TABLE_NAME = 'chat_messages' 
        AND COLUMN_NAME = 'image_path'
    ");
    $stmt->execute();
    $result = $stmt->fetch();
    
    if ($result['count'] > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Column image_path already exists in chat_messages table. Migration not needed.',
            'skipped' => true
        ]);
        exit;
    }
    
    // Run migration
    $conn->beginTransaction();
    
    $sql = "ALTER TABLE `chat_messages` 
            ADD COLUMN `image_path` VARCHAR(255) NULL DEFAULT NULL AFTER `message`";
    
    $conn->exec($sql);
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Migration completed successfully! Column image_path added to chat_messages table.'
    ]);
    
} catch (PDOException $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    
    echo json_encode([
        'success' => false,
        'message' => 'Migration failed: ' . $e->getMessage(),
        'error' => $e->getCode()
    ]);
} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>

