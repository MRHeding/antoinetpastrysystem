<?php
/**
 * Payment Debug Tool
 * Shows detailed information about payment and orders
 */

require_once 'config/database.php';
require_once 'config/paymongo.php';

session_start();

// Get session ID from URL
$checkoutSessionId = $_GET['session_id'] ?? '';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Debug</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        h1 { color: #333; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
        .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 5px; }
        .section h2 { color: #1f2937; margin-top: 0; }
        pre { background: #1f2937; color: #f3f4f6; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 10px; margin: 10px 0; }
        .error { background: #fee2e2; border-left: 4px solid #ef4444; padding: 10px; margin: 10px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f3f4f6; font-weight: 600; }
        .btn { display: inline-block; padding: 10px 20px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Payment Debug Tool</h1>

        <?php
        // Check 1: Database Structure
        echo '<div class="section">';
        echo '<h2>1. Database Structure Check</h2>';
        
        try {
            $database = Database::getInstance();
            $db = $database->getConnection();
            
            // Check if payment columns exist
            $stmt = $db->query("SHOW COLUMNS FROM orders LIKE 'payment_status'");
            $paymentStatusExists = $stmt->fetch();
            
            if ($paymentStatusExists) {
                echo '<div class="success">✅ payment_status column exists</div>';
            } else {
                echo '<div class="error">❌ payment_status column NOT found - You need to run the database migration!</div>';
                echo '<div class="warning">';
                echo '<strong>Action Required:</strong><br>';
                echo '1. Go to <a href="http://localhost/phpmyadmin" target="_blank">phpMyAdmin</a><br>';
                echo '2. Select database: antoinettes_pastries<br>';
                echo '3. Click SQL tab<br>';
                echo '4. Copy and paste contents of: database/add_payment_fields.sql<br>';
                echo '5. Click Go<br>';
                echo '</div>';
            }
            
            // Show all orders table columns
            $stmt = $db->query("SHOW COLUMNS FROM orders");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo '<strong>Current Orders Table Structure:</strong>';
            echo '<table>';
            echo '<tr><th>Field</th><th>Type</th><th>Null</th><th>Default</th></tr>';
            foreach ($columns as $column) {
                echo '<tr>';
                echo '<td>' . htmlspecialchars($column['Field']) . '</td>';
                echo '<td>' . htmlspecialchars($column['Type']) . '</td>';
                echo '<td>' . htmlspecialchars($column['Null']) . '</td>';
                echo '<td>' . htmlspecialchars($column['Default'] ?? 'NULL') . '</td>';
                echo '</tr>';
            }
            echo '</table>';
            
        } catch (Exception $e) {
            echo '<div class="error">Database error: ' . htmlspecialchars($e->getMessage()) . '</div>';
        }
        echo '</div>';

        // Check 2: Recent Orders
        echo '<div class="section">';
        echo '<h2>2. Recent Orders</h2>';
        
        try {
            $stmt = $db->query("SELECT * FROM orders ORDER BY id DESC LIMIT 5");
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (empty($orders)) {
                echo '<div class="warning">No orders found</div>';
            } else {
                echo '<table>';
                echo '<tr><th>ID</th><th>Order #</th><th>Total</th><th>Status</th><th>Payment Status</th><th>Action</th></tr>';
                foreach ($orders as $order) {
                    echo '<tr>';
                    echo '<td>' . $order['id'] . '</td>';
                    echo '<td>' . htmlspecialchars($order['order_number']) . '</td>';
                    echo '<td>₱' . number_format($order['total_amount'], 2) . '</td>';
                    echo '<td>' . htmlspecialchars($order['status']) . '</td>';
                    echo '<td><strong>' . htmlspecialchars($order['payment_status'] ?? 'N/A') . '</strong></td>';
                    echo '<td>';
                    if (!empty($order['paymongo_checkout_id'])) {
                        $checkoutId = $order['paymongo_checkout_id'];
                        echo '<a href="?session_id=' . urlencode($checkoutId) . '" class="btn" style="padding: 5px 10px; font-size: 12px;">Debug This</a><br>';
                        echo '<small style="color: #6b7280;">' . htmlspecialchars(substr($checkoutId, 0, 25)) . '...</small>';
                    } else {
                        echo 'No checkout ID';
                    }
                    echo '</td>';
                    echo '</tr>';
                }
                echo '</table>';
            }
        } catch (Exception $e) {
            echo '<div class="error">Error: ' . htmlspecialchars($e->getMessage()) . '</div>';
        }
        echo '</div>';

        // Check 3: PayMongo Session Details (if session_id provided)
        if ($checkoutSessionId) {
            echo '<div class="section">';
            echo '<h2>3. PayMongo Checkout Session Details</h2>';
            
            // Call PayMongo API
            $secretKey = PayMongoConfig::getSecretKey();
            $ch = curl_init("https://api.paymongo.com/v1/checkout_sessions/$checkoutSessionId");
            
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Basic ' . base64_encode($secretKey . ':')
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode >= 200 && $httpCode < 300) {
                $data = json_decode($response, true);
                echo '<div class="success">✅ Successfully retrieved from PayMongo</div>';
                
                if (isset($data['data'])) {
                    $session = $data['data'];
                    $attrs = $session['attributes'];
                    
                    echo '<strong>Payment Status:</strong> <span style="font-size: 18px; font-weight: bold; color: ';
                    echo ($attrs['payment_status'] === 'paid') ? '#10b981' : '#f59e0b';
                    echo ';">' . strtoupper($attrs['payment_status'] ?? 'unknown') . '</span><br><br>';
                    
                    echo '<strong>Key Information:</strong><br>';
                    echo 'Checkout ID: ' . $session['id'] . '<br>';
                    echo 'Payment Intent ID: ' . ($attrs['payment_intent_id'] ?? 'None') . '<br>';
                    echo 'Amount: ₱' . number_format(($attrs['line_items_total'] ?? 0) / 100, 2) . '<br>';
                    echo 'Description: ' . htmlspecialchars($attrs['description'] ?? 'N/A') . '<br><br>';
                    
                    echo '<strong>Full Response:</strong>';
                    echo '<pre>' . json_encode($data, JSON_PRETTY_PRINT) . '</pre>';
                }
            } else {
                echo '<div class="error">❌ Failed to retrieve from PayMongo (HTTP ' . $httpCode . ')</div>';
                echo '<pre>' . htmlspecialchars($response) . '</pre>';
            }
            
            echo '</div>';
            
            // Check 4: Database Order for this Checkout
            echo '<div class="section">';
            echo '<h2>4. Database Order for This Checkout</h2>';
            
            try {
                $stmt = $db->prepare("SELECT * FROM orders WHERE paymongo_checkout_id = ?");
                $stmt->execute([$checkoutSessionId]);
                $order = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($order) {
                    echo '<div class="success">✅ Order found in database</div>';
                    echo '<pre>' . json_encode($order, JSON_PRETTY_PRINT) . '</pre>';
                } else {
                    echo '<div class="error">❌ No order found with this checkout_id</div>';
                }
            } catch (Exception $e) {
                echo '<div class="error">Error: ' . htmlspecialchars($e->getMessage()) . '</div>';
            }
            
            echo '</div>';
        } else {
            echo '<div class="section">';
            echo '<h2>3. Test With Session ID</h2>';
            echo '<p>To test a specific payment, add <code>?session_id=YOUR_CHECKOUT_SESSION_ID</code> to the URL</p>';
            echo '<p>You can find the session ID in the URL when PayMongo redirects you back</p>';
            echo '</div>';
        }
        ?>

        <div class="section">
            <h2>Quick Links</h2>
            <a href="test-paymongo-config.php" class="btn">Config Test</a>
            <a href="test-paymongo-api.php" class="btn">API Test</a>
            <a href="http://localhost/phpmyadmin" class="btn" target="_blank">phpMyAdmin</a>
            <a href="products.html" class="btn">Test Checkout</a>
        </div>
    </div>
</body>
</html>

