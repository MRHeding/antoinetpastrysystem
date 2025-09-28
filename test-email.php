<?php
/**
 * Email Configuration Test Script
 * Use this to test your email setup
 */

require_once 'api/email-service-smtp.php';

echo "<h1>Email Service Test</h1>";
echo "<style>
body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
.success { color: green; }
.error { color: red; }
.warning { color: orange; }
.info { color: blue; }
</style>";

try {
    $emailService = new SMTPEmailService();
    
    // Show configuration
    $emailService->testConfiguration();
    
    echo "<hr>";
    echo "<h3>Test Email Sending</h3>";
    
    // Get test email from form or use default
    $test_email = $_POST['test_email'] ?? 'test@example.com';
    $test_name = $_POST['test_name'] ?? 'Test User';
    
    if ($_POST['send_test']) {
        echo "<p class='info'>Sending test email to: $test_email</p>";
        
        $test_token = 'test-token-' . time();
        $result = $emailService->sendVerificationEmail($test_email, $test_name, $test_token);
        
        if ($result) {
            echo "<p class='success'>✅ Test email sent successfully!</p>";
            echo "<p>Check your email inbox (and spam folder) for the verification email.</p>";
        } else {
            echo "<p class='error'>❌ Test email failed to send.</p>";
            echo "<p>Please check your email configuration and try again.</p>";
        }
    }
    
    // Test form
    echo "<form method='POST' style='background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;'>";
    echo "<h4>Send Test Email</h4>";
    echo "<p><label>Test Email Address: <input type='email' name='test_email' value='$test_email' required></label></p>";
    echo "<p><label>Test Name: <input type='text' name='test_name' value='$test_name' required></label></p>";
    echo "<p><button type='submit' name='send_test' value='1' style='background: #f59e0b; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;'>Send Test Email</button></p>";
    echo "</form>";
    
} catch (Exception $e) {
    echo "<p class='error'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr>";
echo "<h3>Configuration Help</h3>";
echo "<p>If the test fails, please check:</p>";
echo "<ul>";
echo "<li>Your email credentials in the configuration</li>";
echo "<li>SMTP server settings</li>";
echo "<li>Firewall and network connectivity</li>";
echo "<li>Email provider's security settings</li>";
echo "</ul>";

echo "<p><strong>For Gmail:</strong></p>";
echo "<ul>";
echo "<li>Enable 2-Factor Authentication</li>";
echo "<li>Generate an App Password</li>";
echo "<li>Use the App Password (not your regular password)</li>";
echo "</ul>";

echo "<p><strong>Next Steps:</strong></p>";
echo "<ol>";
echo "<li>Update your email configuration</li>";
echo "<li>Test the email sending</li>";
echo "<li>Run the database migration</li>";
echo "<li>Test the complete registration flow</li>";
echo "</ol>";
?>
