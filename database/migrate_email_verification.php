<?php
/**
 * Database Migration Script for Email Verification
 * Run this script to add email verification fields to existing database
 */

require_once '../config/database.php';

echo "<h2>Email Verification Migration Script</h2>\n";
echo "<p>Starting migration...</p>\n";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if columns already exist
    $stmt = $db->query("SHOW COLUMNS FROM users LIKE 'email_verification_token'");
    $tokenExists = $stmt->rowCount() > 0;
    
    $stmt = $db->query("SHOW COLUMNS FROM users LIKE 'email_verification_expires'");
    $expiresExists = $stmt->rowCount() > 0;
    
    if ($tokenExists && $expiresExists) {
        echo "<p style='color: orange;'>⚠️ Email verification columns already exist. Migration not needed.</p>\n";
        exit;
    }
    
    echo "<p>Adding email verification columns...</p>\n";
    
    // Add email verification columns
    if (!$tokenExists) {
        $db->exec("ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255) NULL");
        echo "<p style='color: green;'>✅ Added email_verification_token column</p>\n";
    }
    
    if (!$expiresExists) {
        $db->exec("ALTER TABLE users ADD COLUMN email_verification_expires TIMESTAMP NULL");
        echo "<p style='color: green;'>✅ Added email_verification_expires column</p>\n";
    }
    
    // Check if email_verified column exists
    $stmt = $db->query("SHOW COLUMNS FROM users LIKE 'email_verified'");
    $verifiedExists = $stmt->rowCount() > 0;
    
    if (!$verifiedExists) {
        $db->exec("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE");
        echo "<p style='color: green;'>✅ Added email_verified column</p>\n";
    }
    
    // Update existing users to have email_verified = true (for existing users)
    $stmt = $db->prepare("UPDATE users SET email_verified = 1 WHERE email_verified IS NULL OR email_verified = 0");
    $result = $stmt->execute();
    $affectedRows = $stmt->rowCount();
    
    if ($affectedRows > 0) {
        echo "<p style='color: green;'>✅ Updated {$affectedRows} existing users as email verified</p>\n";
    }
    
    // Create indexes for better performance
    echo "<p>Creating indexes...</p>\n";
    
    try {
        $db->exec("CREATE INDEX idx_users_verification_token ON users(email_verification_token)");
        echo "<p style='color: green;'>✅ Created index on email_verification_token</p>\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "<p style='color: orange;'>⚠️ Index on email_verification_token already exists</p>\n";
        } else {
            echo "<p style='color: red;'>❌ Error creating index on email_verification_token: " . $e->getMessage() . "</p>\n";
        }
    }
    
    try {
        $db->exec("CREATE INDEX idx_users_email_verified ON users(email_verified)");
        echo "<p style='color: green;'>✅ Created index on email_verified</p>\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "<p style='color: orange;'>⚠️ Index on email_verified already exists</p>\n";
        } else {
            echo "<p style='color: red;'>❌ Error creating index on email_verified: " . $e->getMessage() . "</p>\n";
        }
    }
    
    // Verify the migration
    echo "<p>Verifying migration...</p>\n";
    
    $stmt = $db->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $requiredColumns = ['email_verified', 'email_verification_token', 'email_verification_expires'];
    $missingColumns = array_diff($requiredColumns, $columns);
    
    if (empty($missingColumns)) {
        echo "<p style='color: green; font-weight: bold;'>🎉 Migration completed successfully!</p>\n";
        echo "<p>All required columns have been added to the users table.</p>\n";
        
        // Show current table structure
        echo "<h3>Current Users Table Structure:</h3>\n";
        echo "<table border='1' cellpadding='5' cellspacing='0'>\n";
        echo "<tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>\n";
        
        $stmt = $db->query("DESCRIBE users");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($row['Field']) . "</td>";
            echo "<td>" . htmlspecialchars($row['Type']) . "</td>";
            echo "<td>" . htmlspecialchars($row['Null']) . "</td>";
            echo "<td>" . htmlspecialchars($row['Key']) . "</td>";
            echo "<td>" . htmlspecialchars($row['Default'] ?? 'NULL') . "</td>";
            echo "</tr>\n";
        }
        echo "</table>\n";
        
        // Show user statistics
        $stmt = $db->query("SELECT COUNT(*) as total_users, SUM(email_verified) as verified_users FROM users");
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "<h3>User Statistics:</h3>\n";
        echo "<p>Total Users: " . $stats['total_users'] . "</p>\n";
        echo "<p>Verified Users: " . $stats['verified_users'] . "</p>\n";
        echo "<p>Unverified Users: " . ($stats['total_users'] - $stats['verified_users']) . "</p>\n";
        
    } else {
        echo "<p style='color: red;'>❌ Migration failed. Missing columns: " . implode(', ', $missingColumns) . "</p>\n";
    }
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Database error: " . htmlspecialchars($e->getMessage()) . "</p>\n";
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>\n";
}

echo "<hr>\n";
echo "<p><strong>Next Steps:</strong></p>\n";
echo "<ul>\n";
echo "<li>Configure email settings in <code>api/email-service.php</code></li>\n";
echo "<li>Test the registration and email verification process</li>\n";
echo "<li>Delete this migration file after successful migration</li>\n";
echo "</ul>\n";
?>

<style>
body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f5f5f5;
}
h2, h3 {
    color: #333;
}
p {
    margin: 10px 0;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    background-color: white;
}
th, td {
    text-align: left;
    padding: 8px;
}
th {
    background-color: #f0f0f0;
}
code {
    background-color: #e8e8e8;
    padding: 2px 4px;
    border-radius: 3px;
}
</style>
