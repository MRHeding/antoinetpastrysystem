<?php
/**
 * Advanced Email Service for Antoinette's Pastries
 * Supports multiple email providers and PHPMailer
 */

// Check if PHPMailer is available
$phpmailer_available = false;
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
    $phpmailer_available = true;
}

class AdvancedEmailService {
    private $smtp_host;
    private $smtp_port;
    private $smtp_username;
    private $smtp_password;
    private $from_email;
    private $from_name;
    private $smtp_secure; // 'tls' or 'ssl'
    private $debug_mode;
    private $use_phpmailer;
    
    public function __construct() {
        // Load configuration from environment or config file
        $this->loadConfiguration();
    }
    
    /**
     * Load email configuration
     */
    private function loadConfiguration() {
        // Try to load from .env file first
        if (file_exists(__DIR__ . '/../.env')) {
            $this->loadFromEnv();
        } else {
            // Fallback to hardcoded configuration
            $this->loadDefaultConfiguration();
        }
        
        // Check if PHPMailer is available
        global $phpmailer_available;
        $this->use_phpmailer = $phpmailer_available && class_exists('PHPMailer\\PHPMailer\\PHPMailer');
    }
    
    /**
     * Load configuration from .env file
     */
    private function loadFromEnv() {
        $env_file = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($env_file as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                switch ($key) {
                    case 'SMTP_HOST':
                        $this->smtp_host = $value;
                        break;
                    case 'SMTP_PORT':
                        $this->smtp_port = (int)$value;
                        break;
                    case 'SMTP_USERNAME':
                        $this->smtp_username = $value;
                        break;
                    case 'SMTP_PASSWORD':
                        $this->smtp_password = $value;
                        break;
                    case 'FROM_EMAIL':
                        $this->from_email = $value;
                        break;
                    case 'FROM_NAME':
                        $this->from_name = $value;
                        break;
                    case 'SMTP_SECURE':
                        $this->smtp_secure = $value;
                        break;
                    case 'DEBUG_MODE':
                        $this->debug_mode = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                        break;
                }
            }
        }
    }
    
    /**
     * Load default configuration
     */
    private function loadDefaultConfiguration() {
        // Gmail Configuration (Update these with your credentials)
        $this->smtp_host = 'smtp.gmail.com';
        $this->smtp_port = 587;
        $this->smtp_username = 'marnette89@gmail.com'; // Your email
        $this->smtp_password = 'your_app_password_here'; // Your app password
        $this->from_email = 'marnette89@gmail.com';
        $this->from_name = 'Antoinette\'s Pastries';
        $this->smtp_secure = 'tls';
        $this->debug_mode = false;
    }
    
    /**
     * Send email verification link
     */
    public function sendVerificationEmail($email, $first_name, $verification_token) {
        $verification_url = $this->getBaseUrl() . "/verify-email.php?token=" . $verification_token;
        
        $subject = "Verify Your Email - Antoinette's Pastries";
        
        $html_body = $this->getVerificationEmailTemplate($first_name, $verification_url);
        $text_body = $this->getVerificationEmailTextTemplate($first_name, $verification_url);
        
        return $this->sendEmail($email, $subject, $html_body, $text_body);
    }
    
    /**
     * Send welcome email after verification
     */
    public function sendWelcomeEmail($email, $first_name) {
        $subject = "Welcome to Antoinette's Pastries!";
        
        $html_body = $this->getWelcomeEmailTemplate($first_name);
        $text_body = $this->getWelcomeEmailTextTemplate($first_name);
        
        return $this->sendEmail($email, $subject, $html_body, $text_body);
    }
    
    /**
     * Send email using PHPMailer or PHP mail function
     */
    private function sendEmail($to, $subject, $html_body, $text_body) {
        if ($this->use_phpmailer) {
            return $this->sendWithPHPMailer($to, $subject, $html_body, $text_body);
        } else {
            return $this->sendWithPHP($to, $subject, $html_body, $text_body);
        }
    }
    
    /**
     * Send email using PHPMailer (Recommended)
     */
    private function sendWithPHPMailer($to, $subject, $html_body, $text_body) {
        try {
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            
            // Server settings
            $mail->isSMTP();
            $mail->Host = $this->smtp_host;
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtp_username;
            $mail->Password = $this->smtp_password;
            $mail->SMTPSecure = $this->smtp_secure;
            $mail->Port = $this->smtp_port;
            
            // Debug mode
            if ($this->debug_mode) {
                $mail->SMTPDebug = 2;
            }
            
            // Recipients
            $mail->setFrom($this->from_email, $this->from_name);
            $mail->addAddress($to);
            $mail->addReplyTo($this->from_email, $this->from_name);
            
            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $html_body;
            $mail->AltBody = $text_body;
            
            // Send email
            $result = $mail->send();
            
            if ($this->debug_mode) {
                error_log("Email sent successfully to: $to");
            }
            
            return $result;
            
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send email using PHP mail function (Fallback)
     */
    private function sendWithPHP($to, $subject, $html_body, $text_body) {
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: ' . $this->from_name . ' <' . $this->from_email . '>',
            'Reply-To: ' . $this->from_email,
            'X-Mailer: PHP/' . phpversion()
        ];
        
        $message = $html_body;
        
        $result = mail($to, $subject, $message, implode("\r\n", $headers));
        
        if ($this->debug_mode) {
            error_log("PHP mail() result: " . ($result ? 'success' : 'failed'));
        }
        
        return $result;
    }
    
    /**
     * Test email configuration
     */
    public function testConfiguration() {
        $test_email = 'test@example.com';
        $test_name = 'Test User';
        $test_token = 'test-token-' . time();
        
        echo "<h3>Testing Email Configuration</h3>";
        echo "<p><strong>SMTP Host:</strong> " . $this->smtp_host . "</p>";
        echo "<p><strong>SMTP Port:</strong> " . $this->smtp_port . "</p>";
        echo "<p><strong>From Email:</strong> " . $this->from_email . "</p>";
        echo "<p><strong>Using PHPMailer:</strong> " . ($this->use_phpmailer ? 'Yes' : 'No') . "</p>";
        echo "<p><strong>Debug Mode:</strong> " . ($this->debug_mode ? 'Enabled' : 'Disabled') . "</p>";
        
        if ($this->use_phpmailer) {
            echo "<p style='color: green;'>✅ PHPMailer is available and will be used</p>";
        } else {
            echo "<p style='color: orange;'>⚠️ PHPMailer not available, using PHP mail() function</p>";
        }
        
        // Test sending (commented out to prevent actual email sending during testing)
        /*
        $result = $this->sendVerificationEmail($test_email, $test_name, $test_token);
        if ($result) {
            echo "<p style='color: green;'>✅ Test email sent successfully!</p>";
        } else {
            echo "<p style='color: red;'>❌ Test email failed to send</p>";
        }
        */
    }
    
    /**
     * Get base URL for the application
     */
    private function getBaseUrl() {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $path = dirname($_SERVER['SCRIPT_NAME']);
        return $protocol . '://' . $host . $path;
    }
    
    // Email templates (same as original service)
    private function getVerificationEmailTemplate($first_name, $verification_url) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Verify Your Email</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .button:hover { background: #d97706; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🍰 Antoinette's Pastries</h1>
                    <p>Verify Your Email Address</p>
                </div>
                <div class='content'>
                    <h2>Hello " . htmlspecialchars($first_name) . "!</h2>
                    <p>Thank you for registering with Antoinette's Pastries! To complete your registration and start enjoying our delicious pastries, please verify your email address by clicking the button below:</p>
                    
                    <div style='text-align: center;'>
                        <a href='" . $verification_url . "' class='button'>Verify My Email</a>
                    </div>
                    
                    <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                    <p style='word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px;'>" . $verification_url . "</p>
                    
                    <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
                    
                    <p>If you didn't create an account with us, please ignore this email.</p>
                </div>
                <div class='footer'>
                    <p>© 2025 Antoinette's Pastries. All rights reserved.</p>
                    <p>Socorro Street, BRGY. Mercedes, Zamboanga City</p>
                </div>
            </div>
        </body>
        </html>";
    }
    
    private function getVerificationEmailTextTemplate($first_name, $verification_url) {
        return "
        Hello " . $first_name . "!
        
        Thank you for registering with Antoinette's Pastries! To complete your registration and start enjoying our delicious pastries, please verify your email address by visiting this link:
        
        " . $verification_url . "
        
        Important: This verification link will expire in 24 hours for security reasons.
        
        If you didn't create an account with us, please ignore this email.
        
        © 2025 Antoinette's Pastries. All rights reserved.
        Socorro Street, BRGY. Mercedes, Zamboanga City
        ";
    }
    
    private function getWelcomeEmailTemplate($first_name) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Welcome to Antoinette's Pastries</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .button:hover { background: #d97706; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🍰 Antoinette's Pastries</h1>
                    <p>Welcome to Our Family!</p>
                </div>
                <div class='content'>
                    <h2>Welcome " . htmlspecialchars($first_name) . "!</h2>
                    <p>Your email has been successfully verified! You're now a member of the Antoinette's Pastries family.</p>
                    
                    <p>Here's what you can do now:</p>
                    <ul>
                        <li>Browse our delicious selection of pastries</li>
                        <li>Add items to your cart and place orders</li>
                        <li>Track your order history</li>
                        <li>Receive special offers and updates</li>
                    </ul>
                    
                    <div style='text-align: center;'>
                        <a href='" . $this->getBaseUrl() . "/products.html' class='button'>Explore Our Products</a>
                    </div>
                    
                    <p>Thank you for choosing Antoinette's Pastries. We look forward to serving you the finest handcrafted pastries!</p>
                </div>
                <div class='footer'>
                    <p>© 2025 Antoinette's Pastries. All rights reserved.</p>
                    <p>Socorro Street, BRGY. Mercedes, Zamboanga City</p>
                </div>
            </div>
        </body>
        </html>";
    }
    
    private function getWelcomeEmailTextTemplate($first_name) {
        return "
        Welcome " . $first_name . "!
        
        Your email has been successfully verified! You're now a member of the Antoinette's Pastries family.
        
        Here's what you can do now:
        - Browse our delicious selection of pastries
        - Add items to your cart and place orders
        - Track your order history
        - Receive special offers and updates
        
        Visit our website to explore our products: " . $this->getBaseUrl() . "/products.html
        
        Thank you for choosing Antoinette's Pastries. We look forward to serving you the finest handcrafted pastries!
        
        © 2025 Antoinette's Pastries. All rights reserved.
        Socorro Street, BRGY. Mercedes, Zamboanga City
        ";
    }
}
?>
