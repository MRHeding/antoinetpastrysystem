# Product Sizes Implementation Guide

This document explains the implementation of different product sizes with different prices for Antonette's Pastries e-commerce system.

## Overview

The system now supports multiple sizes for each product, where each size can have:
- A unique display name (e.g., "Small (6 pcs)", "Medium (12 pcs)")
- A size code (S, M, L, XL, etc.)
- Its own price
- Availability status
- Custom sort order

## Database Changes

### New Table: `product_sizes`

Created a new table to store product size variations:

```sql
CREATE TABLE `product_sizes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `size_name` varchar(50) NOT NULL,
  `size_code` varchar(10) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `fk_product_sizes_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Updated Table: `order_items`

Added a `size_code` field to track which size was ordered:

```sql
ALTER TABLE `order_items` 
ADD COLUMN `size_code` varchar(10) DEFAULT NULL AFTER `product_id`;
```

## Installation Steps

1. **Run the Database Migration**
   ```bash
   # Execute the SQL file in your MySQL database
   mysql -u your_username -p antoinettes_pastries < database/create_product_sizes_table.sql
   ```

2. **No Code Deployment Required**
   - All PHP API files are ready
   - All JavaScript files are updated
   - All HTML templates are updated

## Features

### Admin Panel Features

#### 1. Add Product Sizes
- When adding or editing a product, admins can now:
  - Add multiple sizes with different prices
  - Specify size names (e.g., "Small (6 pcs)", "Box of 12")
  - Set size codes (S, M, L, XL, etc.)
  - Set individual prices for each size
  - Control the display order of sizes

#### 2. Manage Product Sizes
- Edit existing sizes
- Delete sizes
- Update prices independently
- Control availability per size

### Customer-Facing Features

#### 1. Product Listing Page
- Shows price range if product has multiple sizes
  - Example: "₱15.00 - ₱45.00"
- Shows single price if all sizes have the same price
  - Example: "₱25.00"

#### 2. Product Details Modal
- Displays all available sizes as selectable options
- Shows individual price for each size
- Highlights selected size
- Updates cart with selected size and its price

#### 3. Shopping Cart
- Displays size name with each product
- Shows correct price based on selected size
- Treats same product with different sizes as separate items
- Properly calculates totals based on size prices

## API Endpoints

### Product Sizes Management

#### Get Product Sizes
```
GET /api/product-sizes.php?product_id=19
```

#### Create Product Size
```
POST /api/product-sizes.php
Content-Type: application/json

{
  "product_id": 19,
  "size_name": "Small (6 pcs)",
  "size_code": "S",
  "price": 15.00,
  "is_available": 1,
  "sort_order": 1
}
```

#### Update Product Size
```
PUT /api/product-sizes.php?id=1
Content-Type: application/json

{
  "size_name": "Small (6 pcs)",
  "price": 18.00
}
```

#### Delete Product Size
```
DELETE /api/product-sizes.php?id=1
```

### Products API Enhancement

The existing `/api/products.php` now automatically includes size information:

```json
{
  "success": true,
  "data": {
    "id": 19,
    "name": "Hot Pandesal",
    "price": 25.00,
    "sizes": [
      {
        "id": 1,
        "size_name": "Small (6 pcs)",
        "size_code": "S",
        "price": 15.00,
        "is_available": 1,
        "sort_order": 1
      },
      {
        "id": 2,
        "size_name": "Medium (12 pcs)",
        "size_code": "M",
        "price": 25.00,
        "is_available": 1,
        "sort_order": 2
      }
    ]
  }
}
```

## Usage Examples

### Adding Sizes to a Product in Admin Panel

1. Go to Admin Dashboard
2. Click "Add Product" or "Edit" on an existing product
3. Fill in product details
4. In the "Product Sizes & Prices" section:
   - Click "Add Size" button
   - Enter size name (e.g., "Small (6 pcs)")
   - Enter size code (e.g., "S")
   - Enter price (e.g., 15.00)
5. Repeat for additional sizes
6. Save the product

### Sample Size Configurations

#### Bread Products (by quantity)
- Small (6 pcs) - S - ₱15.00
- Medium (12 pcs) - M - ₱25.00
- Large (24 pcs) - L - ₱45.00

#### Cakes (by diameter)
- Small (6 inches) - S - ₱100.00
- Medium (8 inches) - M - ₱150.00
- Large (10 inches) - L - ₱200.00
- Extra Large (12 inches) - XL - ₱280.00

#### Cookies (by quantity)
- Small (6 pcs) - S - ₱50.00
- Medium (12 pcs) - M - ₱90.00
- Large (24 pcs) - L - ₱160.00

## File Changes Summary

### New Files Created
- `database/create_product_sizes_table.sql` - Database migration
- `api/product-sizes.php` - API for managing product sizes

### Modified Files
- `api/products.php` - Updated to include size information
- `admin/index.html` - Added size management UI in product forms
- `admin/js/admin.js` - Added size management functions
- `products.html` - Updated product modal to display sizes dynamically
- `js/products.js` - Updated to handle size selection and pricing
- `js/cart.js` - Updated to display size names properly

## Backward Compatibility

The implementation maintains backward compatibility:
- Products without sizes continue to work normally
- The old `size` field in the `products` table is preserved
- Cart items without size information still function
- Existing orders are not affected

## Testing Checklist

- [ ] Run database migration successfully
- [ ] Add a new product with multiple sizes in admin panel
- [ ] Edit an existing product and add sizes
- [ ] View product on customer-facing page - verify price range displays
- [ ] Open product details modal - verify all sizes are shown
- [ ] Select different sizes - verify prices update
- [ ] Add product to cart with different sizes
- [ ] Verify cart displays correct sizes and prices
- [ ] Complete checkout with sized products
- [ ] Verify order contains size information

## Troubleshooting

### Sizes not showing in product modal
- Check if product has sizes in database
- Verify API response includes `sizes` array
- Check browser console for JavaScript errors

### Prices not updating when size is selected
- Verify `data-price` attribute is set on size radio buttons
- Check `getSelectedSizePrice()` function
- Verify size selection event listeners are working

### Cart showing wrong prices
- Clear browser localStorage and try again
- Verify cart items include `size_name` and correct `price`
- Check if product sizes match cart items

## Future Enhancements

Possible improvements for future versions:
1. Bulk size management across multiple products
2. Size templates (preset size configurations)
3. Stock management per size
4. Size-based discounts
5. Size availability schedules
6. Analytics on popular sizes

## Support

For issues or questions about this implementation, refer to:
- Database schema: `database/create_product_sizes_table.sql`
- API documentation: `api/product-sizes.php`
- Admin implementation: `admin/js/admin.js`
- Frontend implementation: `js/products.js`

