<?php
/**
 * PayMongo API Test Tool
 * Tests actual API connection and provides detailed error messages
 */

require_once 'config/paymongo.php';
require_once 'config/database.php';

// Start session for authentication
session_start();

// Check if user is logged in
$session_token = $_COOKIE['session_token'] ?? '';
$user = null;

if ($session_token) {
    try {
        $database = Database::getInstance();
        $db = $database->getConnection();
        
        $stmt = $db->prepare("
            SELECT u.id, u.first_name, u.last_name, u.email FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$session_token]);
        $user = $stmt->fetch();
    } catch (Exception $e) {
        // Ignore
    }
}

// Test API connection if requested
$testResult = null;
if (isset($_GET['test']) && $_GET['test'] === '1') {
    $config = PayMongoConfig::getConfig();
    $secretKey = $config['secret_key'];
    
    // Try to create a minimal test checkout session
    $testData = [
        'data' => [
            'attributes' => [
                'line_items' => [
                    [
                        'name' => 'Test Product',
                        'quantity' => 1,
                        'amount' => 10000, // ₱100.00
                        'currency' => 'PHP'
                    ]
                ],
                'payment_method_types' => ['gcash', 'paymaya', 'grab_pay'],
                'success_url' => $config['success_url'],
                'cancel_url' => $config['cancel_url'],
                'description' => 'Test Checkout Session'
            ]
        ]
    ];
    
    $ch = curl_init('https://api.paymongo.com/v1/checkout_sessions');
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($secretKey . ':')
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    
    curl_close($ch);
    
    $testResult = [
        'http_code' => $httpCode,
        'curl_error' => $curlError,
        'response' => json_decode($response, true),
        'raw_response' => $response
    ];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PayMongo API Test</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: #f3f4f6;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .section h2 {
            color: #1f2937;
            margin-bottom: 15px;
            font-size: 20px;
            border-bottom: 2px solid #f59e0b;
            padding-bottom: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 12px;
            align-items: start;
        }
        .label {
            font-weight: 600;
            color: #6b7280;
        }
        .value {
            font-family: 'Courier New', monospace;
            background: #f9fafb;
            padding: 8px 12px;
            border-radius: 4px;
            word-break: break-all;
        }
        .success {
            background: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 15px;
            border-radius: 4px;
            color: #065f46;
        }
        .error {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            border-radius: 4px;
            color: #991b1b;
        }
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 4px;
            color: #92400e;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #f59e0b;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: background 0.2s;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
        .btn:hover {
            background: #d97706;
        }
        .btn-secondary {
            background: #6b7280;
        }
        .btn-secondary:hover {
            background: #4b5563;
        }
        pre {
            background: #1f2937;
            color: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 13px;
            line-height: 1.5;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-success {
            background: #d1fae5;
            color: #065f46;
        }
        .badge-error {
            background: #fee2e2;
            color: #991b1b;
        }
        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }
        .steps {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .steps h3 {
            color: #1e40af;
            margin-bottom: 15px;
        }
        .steps ol {
            margin-left: 20px;
        }
        .steps li {
            margin-bottom: 10px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 PayMongo API Connection Test</h1>
            <p>Diagnostic tool for PayMongo integration</p>
        </div>
        
        <div class="content">
            <!-- Configuration Check -->
            <div class="section">
                <h2>1. Configuration Status</h2>
                <?php
                $config = PayMongoConfig::getConfig();
                $isConfigured = PayMongoConfig::isConfigured();
                $secretKey = $config['secret_key'];
                $publicKey = $config['public_key'];
                
                // Determine key type (test or live)
                $keyType = 'Unknown';
                if (strpos($secretKey, 'sk_test_') === 0) {
                    $keyType = 'Test Mode';
                } elseif (strpos($secretKey, 'sk_live_') === 0) {
                    $keyType = 'Live Mode';
                }
                ?>
                
                <div class="info-grid">
                    <div class="label">Configuration:</div>
                    <div>
                        <?php if ($isConfigured): ?>
                            <span class="badge badge-success">✅ Configured</span>
                        <?php else: ?>
                            <span class="badge badge-error">❌ Not Configured</span>
                        <?php endif; ?>
                    </div>
                    
                    <div class="label">API Mode:</div>
                    <div>
                        <span class="badge <?php echo $keyType === 'Test Mode' ? 'badge-warning' : 'badge-success'; ?>">
                            <?php echo $keyType; ?>
                        </span>
                    </div>
                    
                    <div class="label">Secret Key:</div>
                    <div class="value">
                        <?php echo substr($secretKey, 0, 20) . str_repeat('*', 20); ?>
                    </div>
                    
                    <div class="label">Public Key:</div>
                    <div class="value">
                        <?php echo substr($publicKey, 0, 20) . str_repeat('*', 20); ?>
                    </div>
                    
                    <div class="label">Success URL:</div>
                    <div class="value"><?php echo $config['success_url']; ?></div>
                    
                    <div class="label">Cancel URL:</div>
                    <div class="value"><?php echo $config['cancel_url']; ?></div>
                </div>
                
                <?php if ($keyType === 'Live Mode'): ?>
                <div class="warning" style="margin-top: 15px;">
                    <strong>⚠️ Live Mode Detected</strong><br>
                    You are using LIVE API keys. These will process real payments and charge actual money.
                    For testing, please use TEST keys (sk_test_... and pk_test_...).
                </div>
                <?php endif; ?>
            </div>
            
            <!-- User Authentication -->
            <div class="section">
                <h2>2. User Authentication</h2>
                <?php if ($user): ?>
                    <div class="success">
                        ✅ Logged in as: <?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?>
                        (<?php echo htmlspecialchars($user['email']); ?>)
                    </div>
                <?php else: ?>
                    <div class="error">
                        ❌ Not logged in. You need to be logged in to test checkout.
                        <br><br>
                        <a href="auth.html" class="btn">Login Now</a>
                    </div>
                <?php endif; ?>
            </div>
            
            <!-- API Connection Test -->
            <div class="section">
                <h2>3. PayMongo API Test</h2>
                
                <?php if ($testResult): ?>
                    <?php if ($testResult['http_code'] >= 200 && $testResult['http_code'] < 300): ?>
                        <div class="success">
                            <strong>✅ API Connection Successful!</strong><br>
                            HTTP Status: <?php echo $testResult['http_code']; ?><br>
                            Your PayMongo API keys are working correctly.
                        </div>
                        
                        <?php if (isset($testResult['response']['data'])): ?>
                        <div style="margin-top: 15px;">
                            <strong>Checkout Session Created:</strong>
                            <pre><?php echo json_encode($testResult['response']['data'], JSON_PRETTY_PRINT); ?></pre>
                        </div>
                        <?php endif; ?>
                    <?php else: ?>
                        <div class="error">
                            <strong>❌ API Connection Failed</strong><br>
                            HTTP Status: <?php echo $testResult['http_code']; ?>
                            
                            <?php if ($testResult['curl_error']): ?>
                                <br>cURL Error: <?php echo htmlspecialchars($testResult['curl_error']); ?>
                            <?php endif; ?>
                            
                            <?php if (isset($testResult['response']['errors'])): ?>
                                <br><br><strong>PayMongo Error Details:</strong>
                                <?php foreach ($testResult['response']['errors'] as $error): ?>
                                    <br>• <?php echo htmlspecialchars($error['detail'] ?? $error['code'] ?? 'Unknown error'); ?>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                        
                        <div style="margin-top: 15px;">
                            <strong>Full Response:</strong>
                            <pre><?php echo htmlspecialchars($testResult['raw_response']); ?></pre>
                        </div>
                        
                        <!-- Common Error Solutions -->
                        <div class="steps">
                            <h3>Common Solutions:</h3>
                            <ol>
                                <li><strong>Invalid API Key:</strong> Verify your keys in .env file are correct</li>
                                <li><strong>Account Not Verified:</strong> For live mode, ensure your PayMongo account is fully verified</li>
                                <li><strong>Network Error:</strong> Check firewall/proxy settings</li>
                                <li><strong>Minimum Amount:</strong> PayMongo requires minimum ₱100.00</li>
                                <li><strong>SSL/TLS Error:</strong> Ensure PHP has proper SSL certificates</li>
                            </ol>
                        </div>
                    <?php endif; ?>
                <?php else: ?>
                    <p>Click the button below to test your PayMongo API connection:</p>
                    <br>
                    <a href="?test=1" class="btn">🧪 Run API Test</a>
                <?php endif; ?>
            </div>
            
            <!-- Quick Actions -->
            <div class="section">
                <h2>4. Quick Actions</h2>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <a href="test-paymongo-config.php" class="btn btn-secondary">Check Configuration</a>
                    <a href="products.html" class="btn btn-secondary">Test Real Checkout</a>
                    <a href="http://localhost/phpmyadmin" class="btn btn-secondary" target="_blank">phpMyAdmin</a>
                    <a href="PAYMONGO_SETUP.md" class="btn btn-secondary" target="_blank">Setup Guide</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>

