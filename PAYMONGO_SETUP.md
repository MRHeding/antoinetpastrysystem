# PayMongo E-Wallet Payment Integration Setup Guide

This guide will help you set up PayMongo payment integration for Antonette's Pastries website, enabling customers to pay using GCash, Maya (PayMaya), and GrabPay.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Create PayMongo Account](#create-paymongo-account)
3. [Get API Keys](#get-api-keys)
4. [Configure Environment Variables](#configure-environment-variables)
5. [Database Setup](#database-setup)
6. [Testing the Integration](#testing-the-integration)
7. [Set Up Webhooks](#set-up-webhooks)
8. [Going Live](#going-live)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, make sure you have:
- A Philippine-based business or valid ID
- Business registration documents (DTI, SEC, or Mayor's Permit)
- Bank account for settlements
- Active website with HTTPS (required for production)

## Create PayMongo Account

1. **Sign Up**
   - Go to [https://dashboard.paymongo.com/signup](https://dashboard.paymongo.com/signup)
   - Fill in your business details
   - Verify your email address

2. **Complete Business Verification**
   - Upload required documents (DTI/SEC registration, valid ID)
   - Provide bank account details for settlements
   - Wait for approval (usually 1-3 business days)

3. **Access Dashboard**
   - Once approved, log in to [https://dashboard.paymongo.com](https://dashboard.paymongo.com)

## Get API Keys

### Test Mode Keys (For Development)

1. In the PayMongo Dashboard, go to **Developers** → **API Keys**
2. You'll see two types of keys:
   - **Public Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)
3. Copy both keys - you'll need them for configuration

> **Important:** Test mode keys allow you to simulate payments without real money. Use these for development and testing.

### Live Mode Keys (For Production)

1. After your account is verified, switch to **Live Mode** in the dashboard
2. Generate your live API keys:
   - **Public Key** (starts with `pk_live_`)
   - **Secret Key** (starts with `sk_live_`)
3. Keep these keys secure - they process real payments

## Configure Environment Variables

1. **Create .env File**
   ```bash
   # In your project root directory
   cp env.example .env
   ```

2. **Edit .env File**
   ```env
   # PayMongo Test Keys (for development)
   PAYMONGO_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   PAYMONGO_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE
   
   # Application URLs
   APP_URL=http://localhost/system
   SUCCESS_URL=http://localhost/system/payment-success.html
   CANCEL_URL=http://localhost/system/payment-cancel.html
   
   # Webhook Secret (get this after setting up webhooks)
   PAYMONGO_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   ```

3. **Replace Placeholder Values**
   - Replace `YOUR_SECRET_KEY_HERE` with your actual secret key
   - Replace `YOUR_PUBLIC_KEY_HERE` with your actual public key
   - Update URLs if your local setup is different

4. **Security Check**
   - Never commit `.env` to version control
   - The `.gitignore` file already excludes `.env`
   - Only share keys with authorized team members

## Database Setup

1. **Run Database Migration**
   
   Execute the SQL migration to add payment tracking fields:
   
   ```sql
   -- In phpMyAdmin or MySQL command line
   USE antoinettes_pastries;
   SOURCE database/add_payment_fields.sql;
   ```
   
   Or copy and paste the contents of `database/add_payment_fields.sql` into phpMyAdmin SQL tab.

2. **Verify Tables**
   
   Check that the `orders` table now has these new columns:
   - `payment_status` (pending, paid, failed, refunded)
   - `payment_method` (gcash, maya, grabpay)
   - `payment_intent_id`
   - `paymongo_checkout_id`
   - `paid_at`

## Testing the Integration

### Test Mode Payment Flow

1. **Start Your Local Server**
   ```bash
   # Make sure XAMPP is running
   # MySQL and Apache should be active
   ```

2. **Test the Checkout Process**
   - Go to `http://localhost/system/products.html`
   - Add items to cart
   - Click "Proceed to Checkout"
   - Click "Place Order"
   - You'll be redirected to PayMongo checkout page

3. **Use Test E-Wallet Credentials**

   PayMongo provides test credentials for each payment method:

   **GCash Test:**
   - Select GCash as payment method
   - Use test mobile number: `09123456789`
   - OTP: `123456`

   **Maya (PayMaya) Test:**
   - Select Maya/PayMaya
   - Use test mobile number: `09123456789`
   - OTP: `111111`

   **GrabPay Test:**
   - Select GrabPay
   - Use test credentials provided by PayMongo
   - OTP: `000000`

4. **Test Success Scenario**
   - Complete the payment flow
   - You should be redirected to `payment-success.html`
   - Order status should update to "paid"
   - Cart should be cleared

5. **Test Cancel Scenario**
   - Start checkout process
   - Click "Cancel" on PayMongo page
   - You should be redirected to `payment-cancel.html`
   - Cart items should remain

### Common Test Cases

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Successful Payment | Complete payment with test credentials | Order created with `payment_status = 'paid'` |
| Cancelled Payment | Click cancel on PayMongo page | Redirected to cancel page, cart preserved |
| Payment Timeout | Let payment page timeout | Order remains `payment_status = 'pending'` |
| Invalid Card | Use invalid test credentials | Payment fails, order remains pending |

## Set Up Webhooks

Webhooks allow PayMongo to notify your server when payments are completed, even if the user closes the browser.

### Create Webhook

1. **Go to Webhooks Section**
   - Dashboard → **Developers** → **Webhooks**
   - Click **Create Webhook**

2. **Configure Webhook**
   - **URL:** `https://yourdomain.com/system/api/payment.php?action=webhook`
   - **Events:** Select `payment.paid`
   - Click **Create**

3. **Get Webhook Secret**
   - After creation, copy the webhook secret (starts with `whsec_`)
   - Add it to your `.env` file:
     ```env
     PAYMONGO_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
     ```

### Test Webhook

1. **Use a Tunneling Service** (for local testing)
   
   Since PayMongo needs a public URL, use ngrok for local testing:
   
   ```bash
   # Install ngrok: https://ngrok.com
   ngrok http 80
   ```
   
   This gives you a public URL like `https://abc123.ngrok.io`

2. **Update Webhook URL**
   - Use `https://abc123.ngrok.io/system/api/payment.php?action=webhook`
   - Test a payment
   - Check if webhook is received (check logs)

## Going Live

### Pre-Launch Checklist

- [ ] Business account verified by PayMongo
- [ ] Live API keys obtained
- [ ] SSL certificate installed (HTTPS required)
- [ ] Environment variables updated with live keys
- [ ] Database backed up
- [ ] Test all payment flows on staging
- [ ] Webhook configured with production URL
- [ ] Error logging and monitoring set up
- [ ] Customer support process defined

### Switch to Live Mode

1. **Update .env with Live Keys**
   ```env
   PAYMONGO_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
   PAYMONGO_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY
   ```

2. **Update URLs**
   ```env
   APP_URL=https://yourdomain.com
   SUCCESS_URL=https://yourdomain.com/payment-success.html
   CANCEL_URL=https://yourdomain.com/payment-cancel.html
   ```

3. **Update Webhook**
   - Create new webhook with production URL
   - Update webhook secret in `.env`

4. **Test with Real Payment**
   - Use a small amount (₱1) for first test
   - Verify funds are received in your bank account
   - Check settlement timeline (usually T+2 days)

### Security Recommendations

1. **SSL Certificate**
   - Required for live payments
   - Use Let's Encrypt (free) or paid SSL
   - Ensure entire site is HTTPS

2. **API Key Security**
   - Never expose secret keys in frontend code
   - Keep `.env` file secure
   - Rotate keys if compromised

3. **Webhook Validation**
   - Verify webhook signatures (implement in production)
   - Log all webhook events
   - Handle duplicate events gracefully

## Troubleshooting

### Common Issues

**Issue: "PayMongo is not configured" error**
- **Solution:** Check if `.env` file exists and contains valid API keys
- Verify keys don't have extra spaces or quotes
- Make sure you're using the correct test/live keys

**Issue: Checkout session creation fails**
- **Solution:** Check PHP error logs
- Verify cURL is enabled in PHP
- Test API keys manually with PayMongo API docs
- Check if total amount is greater than ₱100 (minimum)

**Issue: Payment successful but order not updated**
- **Solution:** Check webhook configuration
- Verify webhook URL is accessible
- Check database for order with `paymongo_checkout_id`
- Look for errors in PHP error log

**Issue: Redirected to wrong URL after payment**
- **Solution:** Verify `SUCCESS_URL` and `CANCEL_URL` in `.env`
- Check if URLs are accessible
- Ensure no trailing slashes

**Issue: "Invalid API key" error**
- **Solution:** Verify you're using the correct keys (test vs live)
- Check for typos in `.env` file
- Regenerate keys if necessary

### Debug Mode

Enable error logging in `api/payment.php`:

```php
// Add at the top of payment.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

Check logs in:
- PHP error log (`xampp/apache/logs/error.log`)
- Database query logs
- Browser console (Network tab)

### Support Contacts

- **PayMongo Support:** support@paymongo.com
- **Developer Docs:** https://developers.paymongo.com
- **API Reference:** https://developers.paymongo.com/reference
- **Community:** https://community.paymongo.com

## Additional Resources

### PayMongo Resources
- [Official Documentation](https://developers.paymongo.com)
- [API Reference](https://developers.paymongo.com/reference)
- [Checkout Sessions Guide](https://developers.paymongo.com/docs/checkout-sessions)
- [Webhooks Guide](https://developers.paymongo.com/docs/webhooks)

### Testing Resources
- [Test Payment Methods](https://developers.paymongo.com/docs/testing)
- [Test Card Numbers](https://developers.paymongo.com/docs/testing-cards)
- [Test E-Wallet Accounts](https://developers.paymongo.com/docs/testing-e-wallets)

### PHP Resources
- [cURL Documentation](https://www.php.net/manual/en/book.curl.php)
- [Environment Variables in PHP](https://www.php.net/manual/en/reserved.variables.environment.php)

## Need Help?

If you encounter issues not covered in this guide:

1. Check PayMongo's [status page](https://status.paymongo.com)
2. Review recent transactions in PayMongo dashboard
3. Check database for order records
4. Enable debug mode and check logs
5. Contact PayMongo support with transaction details

---

**Last Updated:** October 2025  
**Version:** 1.0  
**Maintained by:** Antonette's Pastries Development Team

