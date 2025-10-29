# Admin Manage Orders Feature

## Overview
A comprehensive order management system for administrators to view, track, and manage customer orders in real-time.

## Files Created/Modified

### New Files Created:
1. **admin/manage-orders.html** - Main order management page
2. **admin/js/manage-orders.js** - JavaScript functionality for order management

### Modified Files:
1. **admin/index.html** - Updated "Manage Orders" link to point to the new page
2. **api/orders.php** - Added admin endpoints for order management

## Features

### 1. Order Statistics Dashboard
- **Total Orders**: Display total number of all orders
- **Pending Orders**: Count of orders waiting to be confirmed
- **Preparing Orders**: Orders currently being prepared
- **Completed Orders**: Successfully fulfilled orders
- **Total Revenue**: Sum of all paid orders

### 2. Advanced Filtering System
- **Status Filter**: Filter by order status (pending, confirmed, preparing, ready, completed, cancelled)
- **Payment Filter**: Filter by payment status (paid, pending, failed)
- **Search**: Search by order number or customer name/email
- **Reset Filters**: Quick reset to view all orders

### 3. Order List Display
Each order card shows:
- Order number with status badges
- Customer information (name, email)
- Order date and pickup date
- Total items count
- Payment method and status
- Order notes (if any)
- Total amount

### 4. Order Status Management
Admins can update order status to:
- **Confirmed**: Order has been confirmed
- **Preparing**: Order is being prepared
- **Ready**: Order is ready for pickup
- **Completed**: Order has been completed
- **Cancelled**: Order has been cancelled

### 5. Payment Status Management
- Mark orders as paid manually
- View payment method and payment intent ID
- Track when payment was received

### 6. Detailed Order View
Clicking "View Details" opens a modal showing:
- Complete customer information
- Order timeline (order date, pickup date, paid date)
- Delivery address (if applicable)
- All order items with images and sizes
- Payment information
- Order notes

### 7. Audit Logging
All admin actions are logged:
- Order status changes
- Payment status updates
- Includes admin user ID, action description, IP address, and user agent

## API Endpoints

### GET Endpoints:
- `GET /api/orders.php?action=get_all_orders` - Get all orders (admin only)
- `GET /api/orders.php?action=get_order_details&order_id={id}` - Get detailed order info

### POST Endpoints:
- `POST /api/orders.php?action=update_status` - Update order status
  ```json
  {
    "order_id": 123,
    "status": "preparing"
  }
  ```

- `POST /api/orders.php?action=update_payment_status` - Update payment status
  ```json
  {
    "order_id": 123,
    "payment_status": "paid"
  }
  ```

## Security Features
- Admin authentication required for all endpoints
- Role-based access control (only admin users can access)
- Session validation
- Input validation and sanitization
- SQL injection protection via prepared statements

## User Interface Features
- **Responsive Design**: Works on all device sizes
- **Real-time Updates**: Orders reload after status changes
- **Color-coded Status**: Visual indication of order status
- **Icon System**: FontAwesome icons for better UX
- **Loading States**: Spinner indicators during data fetch
- **Error Handling**: User-friendly error messages
- **Notifications**: Toast notifications for actions

## Usage

### Accessing the Feature
1. Login as admin at `/admin/login.html`
2. From the dashboard, click "Manage Orders" in Quick Actions
3. Or navigate directly to `/admin/manage-orders.html`

### Managing Orders
1. **View all orders** - Orders are displayed in reverse chronological order
2. **Filter orders** - Use the filter dropdowns and search box
3. **View details** - Click "View Details" button on any order
4. **Update status** - Select new status from dropdown
5. **Mark as paid** - Click "Mark as Paid" button for pending payments

### Order Workflow
Typical order flow:
1. **Pending** → Customer places order
2. **Confirmed** → Admin confirms order
3. **Preparing** → Order is being prepared
4. **Ready** → Order ready for pickup/delivery
5. **Completed** → Order fulfilled

## Statistics Display
The dashboard shows real-time statistics:
- Updates automatically when orders are loaded
- Revenue only counts paid orders
- Status counts update based on current data

## Mobile Responsiveness
- Stacked layout on mobile devices
- Touch-friendly buttons
- Responsive grid system
- Mobile menu navigation

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- Cookies must be enabled for authentication

## Future Enhancements (Possible)
- Export orders to CSV/Excel
- Print order receipts
- Bulk order actions
- Order analytics and charts
- Email notifications to customers
- SMS notifications
- Order tracking for customers
- Delivery management
- Inventory integration

## Notes
- All times are displayed in local timezone
- Currency is in Philippine Peso (₱)
- Images fallback to placeholder if not available
- Order numbers are generated automatically
- Audit log tracks all admin actions for accountability

