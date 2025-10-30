<?php
/**
 * PayMongo Configuration Test
 * This file helps you verify your PayMongo setup
 */

require_once 'config/paymongo.php';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PayMongo Configuration Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #f59e0b;
            padding-bottom: 10px;
        }
        .test-item {
            margin: 20px 0;
            padding: 15px;
            border-radius: 5px;
        }
        .success {
            background: #d1fae5;
            border-left: 4px solid #10b981;
        }
        .error {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
        }
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            font-family: monospace;
            background: #f9fafb;
            padding: 5px 10px;
            border-radius: 3px;
            margin-top: 5px;
            word-break: break-all;
        }
        .icon {
            font-size: 20px;
            margin-right: 10px;
        }
        pre {
            background: #1f2937;
            color: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .step {
            background: #eff6ff;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            border-left: 4px solid #3b82f6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 PayMongo Configuration Test</h1>
        
        <?php
        // Test 1: Check if .env file exists
        $envPath = __DIR__ . '/.env';
        $envExists = file_exists($envPath);
        ?>
        
        <div class="test-item <?php echo $envExists ? 'success' : 'error'; ?>">
            <div>
                <span class="icon"><?php echo $envExists ? '✅' : '❌'; ?></span>
                <span class="label">1. .env File Exists:</span>
                <div class="value"><?php echo $envExists ? 'YES - Found at: ' . $envPath : 'NO - File not found!'; ?></div>
            </div>
        </div>

        <?php
        // Test 2: Check if .env is readable
        $envReadable = $envExists && is_readable($envPath);
        ?>
        
        <div class="test-item <?php echo $envReadable ? 'success' : 'error'; ?>">
            <div>
                <span class="icon"><?php echo $envReadable ? '✅' : '❌'; ?></span>
                <span class="label">2. .env File Readable:</span>
                <div class="value"><?php echo $envReadable ? 'YES' : 'NO - Check file permissions'; ?></div>
            </div>
        </div>

        <?php
        // Test 3: Get configuration
        $config = PayMongoConfig::getConfig();
        $secretKey = $config['secret_key'] ?? '';
        $publicKey = $config['public_key'] ?? '';
        ?>
        
        <div class="test-item <?php echo !empty($secretKey) && $secretKey !== 'sk_test_your_secret_key_here' ? 'success' : 'error'; ?>">
            <div>
                <span class="icon"><?php echo !empty($secretKey) && $secretKey !== 'sk_test_your_secret_key_here' ? '✅' : '❌'; ?></span>
                <span class="label">3. Secret Key Loaded:</span>
                <div class="value">
                    <?php 
                    if (empty($secretKey)) {
                        echo 'NOT LOADED - Empty value';
                    } elseif ($secretKey === 'sk_test_your_secret_key_here') {
                        echo 'USING EXAMPLE VALUE - Please update .env file';
                    } else {
                        echo substr($secretKey, 0, 15) . '****** (Loaded successfully)';
                    }
                    ?>
                </div>
            </div>
        </div>

        <div class="test-item <?php echo !empty($publicKey) && $publicKey !== 'pk_test_your_public_key_here' ? 'success' : 'error'; ?>">
            <div>
                <span class="icon"><?php echo !empty($publicKey) && $publicKey !== 'pk_test_your_public_key_here' ? '✅' : '❌'; ?></span>
                <span class="label">4. Public Key Loaded:</span>
                <div class="value">
                    <?php 
                    if (empty($publicKey)) {
                        echo 'NOT LOADED - Empty value';
                    } elseif ($publicKey === 'pk_test_your_public_key_here') {
                        echo 'USING EXAMPLE VALUE - Please update .env file';
                    } else {
                        echo substr($publicKey, 0, 15) . '****** (Loaded successfully)';
                    }
                    ?>
                </div>
            </div>
        </div>

        <?php
        // Test 4: Check if PayMongo is configured
        $isConfigured = PayMongoConfig::isConfigured();
        ?>
        
        <div class="test-item <?php echo $isConfigured ? 'success' : 'error'; ?>">
            <div>
                <span class="icon"><?php echo $isConfigured ? '✅' : '❌'; ?></span>
                <span class="label">5. PayMongo Configured:</span>
                <div class="value"><?php echo $isConfigured ? 'YES - Ready to accept payments!' : 'NO - Configuration incomplete'; ?></div>
            </div>
        </div>

        <?php if (!$envExists): ?>
        <!-- Instructions if .env doesn't exist -->
        <div class="step">
            <h3>📝 How to Create .env File</h3>
            <p><strong>Method 1: Using Notepad</strong></p>
            <ol>
                <li>Open Notepad</li>
                <li>Copy and paste the content below</li>
                <li>Save as: <code>C:\xampp\htdocs\system\.env</code></li>
                <li>In "Save as type" select: <strong>All Files (*.*)</strong></li>
            </ol>
            
            <p><strong>Content to paste:</strong></p>
            <pre>PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
APP_URL=http://localhost/system
SUCCESS_URL=http://localhost/system/payment-success.html
CANCEL_URL=http://localhost/system/payment-cancel.html
PAYMONGO_WEBHOOK_SECRET=whsec_your_webhook_secret_here</pre>

            <p><strong>Method 2: Using Command Prompt</strong></p>
            <pre>cd C:\xampp\htdocs\system
copy env.example .env
notepad .env</pre>
            <p>Then update the keys and save.</p>
        </div>
        <?php endif; ?>

        <?php if ($envExists && !$isConfigured): ?>
        <!-- Instructions if .env exists but keys are wrong -->
        <div class="step">
            <h3>⚠️ Configuration Issue Detected</h3>
            <p>Your .env file exists but the API keys are not configured correctly.</p>
            
            <p><strong>Your API Keys:</strong></p>
            <ul>
                <li><strong>Secret Key:</strong> sk_test_your_secret_key_here</li>
                <li><strong>Public Key:</strong> pk_test_your_public_key_here</li>
            </ul>
            
            <p><strong>Steps to fix:</strong></p>
            <ol>
                <li>Open <code>C:\xampp\htdocs\system\.env</code> in Notepad</li>
                <li>Make sure these lines are present (no extra spaces):</li>
            </ol>
            <pre>PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here</pre>
            <ol start="3">
                <li>Save the file</li>
                <li>Refresh this page</li>
            </ol>
        </div>
        <?php endif; ?>

        <?php if ($isConfigured): ?>
        <!-- Success message -->
        <div class="step" style="border-left-color: #10b981; background: #d1fae5;">
            <h3>🎉 Configuration Complete!</h3>
            <p>Your PayMongo integration is properly configured and ready to use.</p>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Run database migration (if not done yet)</li>
                <li>Test payment at: <a href="http://localhost/system/products.html">Products Page</a></li>
                <li>Use GCash test credentials:
                    <ul>
                        <li>Mobile: 09123456789</li>
                        <li>OTP: 123456</li>
                    </ul>
                </li>
            </ol>

            <p><strong>Database Migration:</strong></p>
            <ol>
                <li>Go to <a href="http://localhost/phpmyadmin" target="_blank">phpMyAdmin</a></li>
                <li>Select <code>antonettes_pastries</code> database</li>
                <li>Click SQL tab</li>
                <li>Copy contents of <code>database/add_payment_fields.sql</code></li>
                <li>Paste and click Go</li>
            </ol>
        </div>
        <?php endif; ?>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
                <strong>Debugging Info:</strong><br>
                PHP Version: <?php echo PHP_VERSION; ?><br>
                Current Directory: <?php echo __DIR__; ?><br>
                .env Path: <?php echo $envPath; ?>
            </p>
        </div>
    </div>
</body>
</html>

