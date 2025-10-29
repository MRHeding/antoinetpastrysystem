<!-- a7d767c3-cfaa-47a8-bd16-c04df98eb40f 0a1b9a2e-596b-4c71-af95-a418280bfc05 -->
# PayMongo E-Wallet Payment Integration

## Implementation Steps

### 1. Database Updates

Add payment tracking fields to the `orders` table:

- `payment_status` (pending, paid, failed, refunded)
- `payment_method` (gcash, maya, grabpay)
- `payment_intent_id` (PayMongo payment intent ID)
- `paymongo_checkout_id` (PayMongo checkout session ID)
- `paid_at` (timestamp)

Create migration file: `database/add_payment_fields.sql`

### 2. Environment Configuration

Create `.env` file to store PayMongo API credentials:

- `PAYMONGO_SECRET_KEY` (from PayMongo dashboard)
- `PAYMONGO_PUBLIC_KEY` (from PayMongo dashboard)
- Success/cancel redirect URLs

Update `config/database.php` or create new `config/paymongo.php` to load environment variables.

### 3. Backend API - Payment Processing

Create `api/payment.php` with actions:

**create_checkout_session**: Creates PayMongo checkout session

- Accepts order data (items, total, user info)
- Calls PayMongo API to create checkout session
- Saves checkout session ID to order
- Returns checkout URL for redirect

**verify_payment**: Verifies payment status

- Called from success page
- Retrieves payment intent from PayMongo
- Updates order payment_status to 'paid'
- Returns order details

**webhook**: Handles PayMongo webhooks

- Listens for `payment.paid` events
- Validates webhook signature
- Updates order status automatically

### 4. Frontend Changes

**Modify `js/cart.js`**:

- Update `confirmCheckout()` function
- Instead of creating order directly, call new payment API
- Redirect user to PayMongo checkout URL
- Keep cart data in localStorage until payment confirmed

**Create `payment-success.html`**:

- Landing page after successful payment
- Verifies payment with backend
- Clears cart
- Shows success message with order number
- Auto-redirect to orders page

**Create `payment-cancel.html`**:

- Landing page if user cancels payment
- Notifies user payment was cancelled
- Option to return to cart and retry

### 5. PayMongo Integration Details

**Checkout Session Configuration**:

- Payment methods: `['gcash', 'paymaya', 'grab_pay']`
- Line items: Cart products with prices
- Success URL: `http://localhost/system/payment-success.html?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `http://localhost/system/payment-cancel.html`

**API Endpoints Used**:

- Create Checkout: `POST https://api.paymongo.com/v1/checkout_sessions`
- Retrieve Payment Intent: `GET https://api.paymongo.com/v1/payment_intents/{id}`

### 6. Setup Instructions Documentation

Create `PAYMONGO_SETUP.md` with:

- How to create PayMongo account
- How to get API keys (test mode for development)
- How to set up webhooks
- Testing with test e-wallet credentials
- Going live checklist

### 7. Order Flow Update

**New checkout flow**:

1. User clicks "Place Order"
2. System creates order with `payment_status = 'pending'`
3. System creates PayMongo checkout session
4. User redirects to PayMongo hosted page
5. User selects e-wallet (GCash/Maya/GrabPay)
6. User completes payment
7. PayMongo redirects to success page
8. Success page verifies payment
9. Order status updated to `payment_status = 'paid'`
10. Cart cleared, redirect to orders

### 8. Security Considerations

- Validate webhook signatures
- Store API keys in .env (never in code)
- Add .env to .gitignore
- Use HTTPS in production
- Validate payment amounts match order totals

### 9. Testing Plan

- Test with PayMongo test mode
- Test each e-wallet (GCash, Maya, GrabPay)
- Test payment cancellation
- Test webhook delivery
- Test edge cases (network failures, timeout)

## Key Files

**New Files**:

- `database/add_payment_fields.sql`
- `api/payment.php`
- `config/paymongo.php`
- `payment-success.html`
- `payment-cancel.html`
- `js/payment.js`
- `.env`
- `.env.example`
- `PAYMONGO_SETUP.md`

**Modified Files**:

- `js/cart.js` (payment redirect logic)
- `api/orders.php` (add payment_status handling)
- `.gitignore` (add .env)

### To-dos

- [ ] Create and run database migration to add payment tracking fields to orders table
- [ ] Create .env file structure and PayMongo configuration loader
- [ ] Build payment.php API with checkout session creation, verification, and webhook handling
- [ ] Update cart.js to integrate with payment API and redirect to PayMongo
- [ ] Create payment success and cancel pages with verification logic
- [ ] Write comprehensive PayMongo setup and testing documentation