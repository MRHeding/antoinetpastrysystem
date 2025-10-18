# Orders Functionality

## Overview
The Orders functionality provides users with a comprehensive interface to view, track, and manage their pastry orders. This includes order history, detailed order views, status tracking, and order cancellation.

## Features

### Order Management
- **View All Orders**: Display complete order history with pagination
- **Order Details**: Detailed view of individual orders with items and pricing
- **Status Tracking**: Real-time order status updates (pending, confirmed, preparing, ready, completed, cancelled)
- **Order Cancellation**: Cancel pending orders
- **Search & Filter**: Filter orders by status and search by order number

### Order Information Display
- **Order Number**: Unique identifier for each order
- **Order Date**: When the order was placed
- **Pickup Date**: Scheduled pickup time (if applicable)
- **Total Amount**: Complete order cost
- **Order Notes**: Special instructions or requests
- **Order Items**: Detailed list of products with quantities and prices
- **Product Images**: Visual representation of ordered items

### User Experience
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Loading States**: Visual feedback during data loading
- **Empty States**: Helpful messages when no orders exist
- **Error Handling**: Comprehensive error messages and fallback states
- **Notifications**: Toast notifications for user feedback
- **Pagination**: Efficient browsing of large order lists

## File Structure

```
orders.html              # Main orders page
js/orders.js            # Frontend JavaScript functionality
api/orders.php          # Backend API endpoints
database/update_orders_structure.sql  # Database structure updates
database/insert_sample_orders.sql     # Sample data for testing
```

## API Endpoints

### GET `/api/orders.php?action=get_user_orders`
Retrieves all orders for the authenticated user.

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "order_number": "ORD-20250101-0001",
      "total_amount": 15.50,
      "status": "completed",
      "order_date": "2025-01-01 10:30:00",
      "pickup_date": "2025-01-01",
      "notes": "Please make sure the croissants are fresh",
      "created_at": "2025-01-01 10:30:00"
    }
  ]
}
```

### GET `/api/orders.php?action=get_order_details&order_id={id}`
Retrieves detailed information for a specific order including items.

**Response:**
```json
{
  "success": true,
  "order": {
    "id": 1,
    "order_number": "ORD-20250101-0001",
    "total_amount": 15.50,
    "status": "completed",
    "order_date": "2025-01-01 10:30:00",
    "pickup_date": "2025-01-01",
    "notes": "Please make sure the croissants are fresh",
    "created_at": "2025-01-01 10:30:00",
    "items": [
      {
        "id": 1,
        "quantity": 2,
        "unit_price": 3.50,
        "total_price": 7.00,
        "product_name": "Classic Butter Croissant",
        "product_image": "uploads/products/croissant.jpg"
      }
    ]
  }
}
```

### POST `/api/orders.php?action=cancel_order`
Cancels a pending order.

**Request Body:**
```json
{
  "order_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

### POST `/api/orders.php?action=create_order`
Creates a new order (for future cart integration).

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 3.50
    }
  ],
  "notes": "Special instructions"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order_id": 1,
  "order_number": "ORD-20250101-0001"
}
```

## Database Structure

### Orders Table
```sql
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `order_number` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','preparing','ready','completed','cancelled') DEFAULT 'pending',
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `pickup_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_customer` (`customer_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_date` (`order_date`)
);
```

### Order Items Table
```sql
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`)
);
```

## Order Status Flow

1. **Pending**: Order placed, awaiting confirmation
2. **Confirmed**: Order confirmed by bakery
3. **Preparing**: Order being prepared
4. **Ready**: Order ready for pickup
5. **Completed**: Order picked up and completed
6. **Cancelled**: Order cancelled (only from pending status)

## Usage

1. **Access Orders**: Navigate to `/orders.html` while logged in
2. **View Orders**: See all orders in chronological order
3. **Filter Orders**: Use status filter to view specific order types
4. **Search Orders**: Search by order number or other criteria
5. **View Details**: Click "View Details" to see complete order information
6. **Cancel Orders**: Cancel pending orders if needed
7. **Navigate Pages**: Use pagination for large order lists

## Security Features

- **Session Validation**: All requests require valid session tokens
- **User Authorization**: Users can only view their own orders
- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Prevention**: Prepared statements used for all queries
- **XSS Protection**: Output is properly escaped

## Styling

The orders page uses Tailwind CSS with:
- **Color Scheme**: Amber/gold primary colors matching site theme
- **Status Colors**: Color-coded order status indicators
- **Responsive Grid**: Mobile-first responsive design
- **Interactive Elements**: Hover states and transitions
- **Card Layout**: Clean card-based order display
- **Modal Design**: Overlay modals for detailed views

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- JavaScript ES6+ features
- CSS Grid and Flexbox support

## Future Enhancements

- Order tracking with real-time updates
- Email notifications for status changes
- Order reordering functionality
- Order history export
- Advanced filtering options
- Order rating and review system
- Integration with payment processing
- Order modification (for pending orders)

## Testing

To test the orders functionality:

1. **Run Database Updates**: Execute the database structure updates
2. **Insert Sample Data**: Run the sample orders script
3. **Access Orders Page**: Navigate to `/orders.html`
4. **Test Features**: Try filtering, searching, and viewing details
5. **Test Cancellation**: Cancel a pending order

## Integration Notes

- Orders are linked to users via `user_id` field
- Backward compatibility maintained with `customer_id` field
- Orders integrate with existing product catalog
- Session management uses existing authentication system
- Navigation integrates with existing site structure
