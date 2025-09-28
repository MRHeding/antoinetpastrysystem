# Email Service Setup Guide for Antoinette's Pastries

This guide will help you configure email services for the email verification system.

## 📧 Email Provider Options

### Option 1: Gmail (Recommended for Development)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication if not already enabled

#### Step 2: Generate App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (Custom name)"
3. Enter "Antoinette's Pastries" as the name
4. Copy the generated 16-character password

#### Step 3: Update Configuration
```php
// In api/email-service.php
$this->smtp_host = 'smtp.gmail.com';
$this->smtp_port = 587;
$this->smtp_username = 'teronash23@gmail.com';
$this->smtp_password = 'gijv ybcp jmqw llws';
$this->from_email = 'teronash23@gmail.com';
$this->from_name = 'Antoinette\'s Pastries';
```

### Option 2: Outlook/Hotmail

```php
$this->smtp_host = 'smtp-mail.outlook.com';
$this->smtp_port = 587;
$this->smtp_username = 'your-email@outlook.com';
$this->smtp_password = 'your-password';
$this->from_email = 'your-email@outlook.com';
$this->from_name = 'Antoinette\'s Pastries';
```

### Option 3: Yahoo Mail

```php
$this->smtp_host = 'smtp.mail.yahoo.com';
$this->smtp_port = 587;
$this->smtp_username = 'your-email@yahoo.com';
$this->smtp_password = 'your-app-password';
$this->from_email = 'your-email@yahoo.com';
$this->from_name = 'Antoinette\'s Pastries';
```

### Option 4: Custom SMTP Server

```php
$this->smtp_host = 'your-smtp-server.com';
$this->smtp_port = 587; // or 465 for SSL
$this->smtp_username = 'your-username';
$this->smtp_password = 'your-password';
$this->from_email = 'noreply@yourdomain.com';
$this->from_name = 'Antoinette\'s Pastries';
```

## 🔧 Advanced Configuration

### Using PHPMailer (Recommended for Production)

For better email delivery and features, consider using PHPMailer:

#### Step 1: Install PHPMailer
```bash
composer require phpmailer/phpmailer
```

#### Step 2: Update Email Service
See the advanced email service configuration below.

### Environment Variables (Recommended)

Create a `.env` file in your project root:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Antoinette's Pastries
```

## 🧪 Testing Email Configuration

### Test Script
Create `test-email.php` to test your configuration:

```php
<?php
require_once 'api/email-service.php';

$emailService = new EmailService();

// Test email
$test_email = 'test@example.com';
$test_name = 'Test User';
$test_token = 'test-token-123';

$result = $emailService->sendVerificationEmail($test_email, $test_name, $test_token);

if ($result) {
    echo "✅ Email sent successfully!";
} else {
    echo "❌ Email failed to send. Check your configuration.";
}
?>
```

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check username and password
   - Ensure 2FA is enabled and app password is used
   - Verify SMTP settings

2. **Connection Timeout**
   - Check firewall settings
   - Verify SMTP host and port
   - Try different ports (587, 465, 25)

3. **Emails Not Received**
   - Check spam folder
   - Verify sender email address
   - Test with different email providers

### Debug Mode
Enable debug mode in the email service to see detailed error messages.

## 📋 Production Checklist

- [ ] Use a dedicated email service (SendGrid, Mailgun, etc.)
- [ ] Set up proper SPF, DKIM, and DMARC records
- [ ] Use environment variables for credentials
- [ ] Implement email queue for high volume
- [ ] Set up email monitoring and logging
- [ ] Test with multiple email providers
- [ ] Configure proper error handling

## 🔒 Security Best Practices

1. **Never commit credentials to version control**
2. **Use environment variables or secure config files**
3. **Enable SSL/TLS encryption**
4. **Regularly rotate passwords**
5. **Monitor email sending limits**
6. **Implement rate limiting**

## 📊 Email Service Providers for Production

### Free Tiers
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5,000 emails/month free
- **Amazon SES**: 62,000 emails/month free

### Paid Services
- **SendGrid**: $19.95/month for 50,000 emails
- **Mailgun**: $35/month for 50,000 emails
- **Amazon SES**: $0.10 per 1,000 emails

## 🎯 Next Steps

1. Choose your email provider
2. Update the configuration in `api/email-service.php`
3. Test the configuration
4. Run the migration script
5. Test the complete email verification flow
