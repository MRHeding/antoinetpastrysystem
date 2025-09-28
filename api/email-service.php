<?php
/**
 * Email Service for Antoinette's Pastries
 * Handles sending verification emails and other notifications
 */

class EmailService {
    private $smtp_host;
    private $smtp_port;
    private $smtp_username;
    private $smtp_password;
    private $from_email;
    private $from_name;
    
    public function __construct() {
        // Email configuration - you should set these in your environment or config file
        
        // Option 1: Gmail with App Password (2FA enabled)
        $this->smtp_host = 'smtp.gmail.com';
        $this->smtp_port = 587;
        $this->smtp_username = 'teronash23@gmail.com';
        $this->smtp_password = 'gijv ybcp jmqw llws'; // Replace with your 16-character app password
        $this->from_email = 'teronash23@gmail.com';
        
        // Option 2: Outlook/Hotmail (alternative)
        // $this->smtp_host = 'smtp-mail.outlook.com';
        // $this->smtp_port = 587;
        // $this->smtp_username = 'marnette89@outlook.com';
        // $this->smtp_password = 'your_outlook_password';
        // $this->from_email = 'marnette89@outlook.com';
        
        // Option 3: Yahoo Mail
        // $this->smtp_host = 'smtp.mail.yahoo.com';
        // $this->smtp_port = 587;
        // $this->smtp_username = 'marnette89@yahoo.com';
        // $this->smtp_password = 'your_yahoo_password';
        // $this->from_email = 'marnette89@yahoo.com';
        
        $this->from_name = 'Antoinette\'s Pastries';
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
     * Send email using PHP's mail function (simple implementation)
     * For production, consider using PHPMailer or similar library
     */
    private function sendEmail($to, $subject, $html_body, $text_body) {
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: ' . $this->from_name . ' <' . $this->from_email . '>',
            'Reply-To: ' . $this->from_email,
            'X-Mailer: PHP/' . phpversion()
        ];
        
        $message = $html_body;
        
        return mail($to, $subject, $message, implode("\r\n", $headers));
    }
    
    /**
     * Test email configuration
     */
    public function testConfiguration() {
        echo "<h3>Testing Email Configuration</h3>";
        echo "<p><strong>SMTP Host:</strong> " . $this->smtp_host . "</p>";
        echo "<p><strong>SMTP Port:</strong> " . $this->smtp_port . "</p>";
        echo "<p><strong>From Email:</strong> " . $this->from_email . "</p>";
        echo "<p><strong>From Name:</strong> " . $this->from_name . "</p>";
        echo "<p><strong>Username:</strong> " . $this->smtp_username . "</p>";
        echo "<p><strong>Password:</strong> " . (strlen($this->smtp_password) > 0 ? 'Set (' . strlen($this->smtp_password) . ' characters)' : 'Not set') . "</p>";
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
    
    /**
     * HTML template for verification email
     */
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
    
    /**
     * Text template for verification email
     */
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
    
    /**
     * HTML template for welcome email
     */
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
    
    /**
     * Text template for welcome email
     */
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
