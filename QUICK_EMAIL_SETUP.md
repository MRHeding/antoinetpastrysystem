# Quick Email Setup Guide

Since Google App Passwords are not available for your account, here are the easiest alternatives:

## 🚀 Option 1: Outlook/Hotmail (Recommended - Easiest)

### Step 1: Create Outlook Account
1. Go to [outlook.com](https://outlook.com)
2. Create a new account: `marnette89@outlook.com`
3. Use a strong password

### Step 2: Update Configuration
In `api/email-service.php`, the Outlook configuration is already set up. Just update the password:

```php
$this->smtp_username = 'marnette89@outlook.com';
$this->smtp_password = 'your_actual_outlook_password'; // Replace this
```

### Step 3: Test
Run `test-email.php` to verify it works.

---

## 🚀 Option 2: Yahoo Mail

### Step 1: Create Yahoo Account
1. Go to [yahoo.com](https://yahoo.com)
2. Create account: `marnette89@yahoo.com`
3. Enable 2-Factor Authentication in Yahoo settings

### Step 2: Update Configuration
In `api/email-service.php`, uncomment Yahoo settings:

```php
// Comment out Outlook settings and uncomment these:
$this->smtp_host = 'smtp.mail.yahoo.com';
$this->smtp_port = 587;
$this->smtp_username = 'marnette89@yahoo.com';
$this->smtp_password = 'your_yahoo_password';
$this->from_email = 'marnette89@yahoo.com';
```

---

## 🚀 Option 3: Enable Gmail 2FA (If you want to use Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification"
3. Follow the setup process
4. You'll need a phone number

### Step 2: Generate App Password
After 2FA is enabled:
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other"
3. Enter "Antoinette's Pastries"
4. Copy the 16-character password

### Step 3: Update Configuration
```php
$this->smtp_host = 'smtp.gmail.com';
$this->smtp_port = 587;
$this->smtp_username = 'marnette89@gmail.com';
$this->smtp_password = 'your_16_character_app_password';
$this->from_email = 'marnette89@gmail.com';
```

---

## 🧪 Testing Your Setup

1. **Update the password** in `api/email-service.php`
2. **Run the test script:**
   ```
   http://localhost/caman/test-email.php
   ```
3. **Send a test email** to verify everything works

---

## 📋 Quick Checklist

- [ ] Choose an email provider (Outlook recommended)
- [ ] Create the email account
- [ ] Update password in `api/email-service.php`
- [ ] Test with `test-email.php`
- [ ] Run database migration
- [ ] Test registration flow

---

## 🆘 Still Having Issues?

If you're still having trouble, you can:

1. **Use a different email address** you already have
2. **Ask your hosting provider** for SMTP settings
3. **Use a free email service** like SendGrid (100 emails/day free)

The Outlook option is usually the easiest and most reliable for development!
