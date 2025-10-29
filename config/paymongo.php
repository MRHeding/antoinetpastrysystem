<?php
/**
 * PayMongo Configuration
 * Loads environment variables and provides PayMongo settings
 */

class PayMongoConfig {
    private static $config = null;
    
    /**
     * Load environment variables from .env file
     */
    private static function loadEnv() {
        $envFile = __DIR__ . '/../.env';
        
        if (!file_exists($envFile)) {
            error_log("Warning: .env file not found. Using default configuration.");
            return;
        }
        
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }
            
            // Parse KEY=VALUE
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Remove quotes if present
                if (preg_match('/^(["\'])(.*)\1$/', $value, $matches)) {
                    $value = $matches[2];
                }
                
                // Set environment variable
                if (!array_key_exists($key, $_ENV)) {
                    $_ENV[$key] = $value;
                }
            }
        }
    }
    
    /**
     * Get PayMongo configuration
     */
    public static function getConfig() {
        if (self::$config === null) {
            self::loadEnv();
            
            self::$config = [
                'secret_key' => $_ENV['PAYMONGO_SECRET_KEY'] ?? '',
                'public_key' => $_ENV['PAYMONGO_PUBLIC_KEY'] ?? '',
                'webhook_secret' => $_ENV['PAYMONGO_WEBHOOK_SECRET'] ?? '',
                'app_url' => $_ENV['APP_URL'] ?? 'http://localhost/system',
                'success_url' => $_ENV['SUCCESS_URL'] ?? 'http://localhost/system/payment-success.html',
                'cancel_url' => $_ENV['CANCEL_URL'] ?? 'http://localhost/system/payment-cancel.html',
                'api_base_url' => 'https://api.paymongo.com/v1',
                'enabled_payment_methods' => ['gcash', 'paymaya', 'grab_pay'],
                'currency' => 'PHP'
            ];
        }
        
        return self::$config;
    }
    
    /**
     * Get secret key
     */
    public static function getSecretKey() {
        $config = self::getConfig();
        return $config['secret_key'];
    }
    
    /**
     * Get public key
     */
    public static function getPublicKey() {
        $config = self::getConfig();
        return $config['public_key'];
    }
    
    /**
     * Get webhook secret
     */
    public static function getWebhookSecret() {
        $config = self::getConfig();
        return $config['webhook_secret'];
    }
    
    /**
     * Get API base URL
     */
    public static function getApiBaseUrl() {
        $config = self::getConfig();
        return $config['api_base_url'];
    }
    
    /**
     * Get success URL
     */
    public static function getSuccessUrl() {
        $config = self::getConfig();
        return $config['success_url'];
    }
    
    /**
     * Get cancel URL
     */
    public static function getCancelUrl() {
        $config = self::getConfig();
        return $config['cancel_url'];
    }
    
    /**
     * Validate configuration
     */
    public static function isConfigured() {
        $config = self::getConfig();
        
        // Check if secret key is set and not the example value
        if (empty($config['secret_key']) || 
            $config['secret_key'] === 'sk_test_your_secret_key_here') {
            return false;
        }
        
        return true;
    }
}
?>

