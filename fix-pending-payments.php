<?php
/**
 * Fix Pending Payments Tool
 * Updates orders that were paid but stuck in pending status
 */

require_once 'config/database.php';
require_once 'config/paymongo.php';

session_start();

$fixed = [];
$errors = [];

if (isset($_GET['fix']) && $_GET['fix'] === '1') {
    try {
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        // Get all pending orders with checkout IDs
        $stmt = $db->query("
            SELECT id, order_number, paymongo_checkout_id 
            FROM orders 
            WHERE payment_status = 'pending' 
            AND paymongo_checkout_id IS NOT NULL
            ORDER BY id DESC
        ");
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($orders as $order) {
            $checkoutId = $order['paymongo_checkout_id'];
            $orderId = $order['id'];
            $orderNumber = $order['order_number'];
            
            // Call PayMongo API
            $secretKey = PayMongoConfig::getSecretKey();
            $ch = curl_init("https://api.paymongo.com/v1/checkout_sessions/$checkoutId");
            
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
                
                if (isset($data['data'])) {
                    $attrs = $data['data']['attributes'];
                    
                    // Check if paid
                    $isPaid = false;
                    if (!empty($attrs['paid_at'])) {
                        $isPaid = true;
                    } elseif (isset($attrs['payment_intent']['attributes']['status']) && 
                              $attrs['payment_intent']['attributes']['status'] === 'succeeded') {
                        $isPaid = true;
                    }
                    
                    if ($isPaid) {
                        // Get payment details
                        $paymentIntentId = $attrs['payment_intent']['id'] ?? null;
                        $paymentMethod = $attrs['payment_method_used'] ?? null;
                        
                        // Update order
                        $updateStmt = $db->prepare("
                            UPDATE orders 
                            SET payment_status = 'paid',
                                payment_intent_id = ?,
                                payment_method = ?,
                                paid_at = NOW()
                            WHERE id = ?
                        ");
                        $updateStmt->execute([$paymentIntentId, $paymentMethod, $orderId]);
                        
                        $fixed[] = [
                            'order_id' => $orderId,
                            'order_number' => $orderNumber,
                            'payment_method' => $paymentMethod
                        ];
                    }
                }
            } else {
                $errors[] = "Order #$orderNumber: Failed to retrieve from PayMongo";
            }
        }
    } catch (Exception $e) {
        $errors[] = "Error: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fix Pending Payments</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        h1 { color: #333; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
        .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .error { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .btn { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: 600; }
        .btn:hover { background: #d97706; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f3f4f6; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Fix Pending Payments</h1>
        
        <div class="warning">
            <strong>⚠️ What This Tool Does:</strong><br>
            This tool checks all orders with "pending" payment status and verifies them against PayMongo.
            If PayMongo shows the payment was successful, it will update your database accordingly.
        </div>

        <?php if (!empty($fixed)): ?>
            <div class="success">
                <strong>✅ Successfully Fixed <?php echo count($fixed); ?> Order(s)!</strong>
                <table>
                    <tr>
                        <th>Order ID</th>
                        <th>Order Number</th>
                        <th>Payment Method</th>
                    </tr>
                    <?php foreach ($fixed as $item): ?>
                    <tr>
                        <td><?php echo $item['order_id']; ?></td>
                        <td><?php echo htmlspecialchars($item['order_number']); ?></td>
                        <td><strong><?php echo strtoupper($item['payment_method']); ?></strong></td>
                    </tr>
                    <?php endforeach; ?>
                </table>
            </div>
        <?php endif; ?>

        <?php if (!empty($errors)): ?>
            <div class="error">
                <strong>❌ Errors Encountered:</strong>
                <ul>
                    <?php foreach ($errors as $error): ?>
                    <li><?php echo htmlspecialchars($error); ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <?php if (empty($fixed) && empty($errors) && !isset($_GET['fix'])): ?>
            <p>Click the button below to check and fix all pending payments:</p>
            <a href="?fix=1" class="btn">🔄 Fix Pending Payments</a>
        <?php elseif (isset($_GET['fix'])): ?>
            <div style="margin-top: 20px;">
                <a href="debug-payment.php" class="btn">View Orders</a>
                <a href="orders.html" class="btn">My Orders Page</a>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>

