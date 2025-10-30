# PayMongo Payment Integration - Quick Start Guide

Get your payment system up and running in 5 minutes!

## Quick Setup Steps

### 1. Get PayMongo Test Keys (2 minutes)

1. Go to https://dashboard.paymongo.com/signup
2. Sign up for a free account
3. Go to **Developers** → **API Keys**
4. Copy your test keys:
   - `pk_test_...` (Public Key)
   - `sk_test_...` (Secret Key)

### 2. Configure Environment (1 minute)

1. Create `.env` file in project root:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your keys:
   ```env
   PAYMONGO_SECRET_KEY=sk_test_YOUR_KEY_HERE
   PAYMONGO_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
   
   APP_URL=http://localhost/system
   SUCCESS_URL=http://localhost/system/payment-success.html
   CANCEL_URL=http://localhost/system/payment-cancel.html
   ```

### 3. Update Database (1 minute)

1. Open phpMyAdmin
2. Select `antonettes_pastries` database
3. Go to SQL tab
4. Copy and paste contents of `database/add_payment_fields.sql`
5. Click "Go"

### 4. Test Payment (1 minute)

1. Go to http://localhost/system/products.html
2. Add items to cart
3. Click "Proceed to Checkout"
4. Click "Proceed to Payment"
5. Select **GCash** on PayMongo page
6. Use test credentials:
   - Mobile: `09123456789`
   - OTP: `123456`
7. Complete payment
8. You'll be redirected to success page!

## That's It! 🎉

Your payment system is now working!

## Test Credentials

### GCash
- Mobile: `09123456789`
- OTP: `123456`

### Maya/PayMaya
- Mobile: `09123456789`
- OTP: `111111`

### GrabPay
- Mobile: `09123456789`
- OTP: `000000`

## What Happens Now?

When customers checkout:
1. They click "Proceed to Payment"
2. Redirected to PayMongo page
3. Select payment method (GCash/Maya/GrabPay)
4. Complete payment on their e-wallet app
5. Return to your site with confirmation
6. Order is marked as paid
7. Cart is cleared

## Troubleshooting

**"PayMongo is not configured" error?**
- Check if `.env` file exists
- Verify API keys are correct

**Payment works but order not updating?**
- Refresh orders page
- Check database for payment_status field

**Need More Help?**
- Read `PAYMONGO_SETUP.md` for detailed setup
- Read `PAYMENT_IMPLEMENTATION.md` for technical details
- Contact PayMongo support: support@paymongo.com

## Going Live

When ready for production:
1. Complete PayMongo business verification
2. Get live API keys (starts with `sk_live_` and `pk_live_`)
3. Update `.env` with live keys
4. Install SSL certificate (HTTPS required)
5. Update URLs to your domain
6. Test with small real payment

---

**Need help?** Check the detailed guides:
- `PAYMONGO_SETUP.md` - Complete setup instructions
- `PAYMENT_IMPLEMENTATION.md` - Technical documentation

