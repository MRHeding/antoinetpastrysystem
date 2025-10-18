# Add to Cart System - Level 0 Data Flow Diagram

## Level 0 DFD - Add to Cart System

```
┌─────────────┐    Add to Cart Request    ┌─────────────────┐
│             │ ──────────────────────────▶ │                 │
│    User     │                             │ 1.0 Add to     │
│             │                             │    Cart        │
└─────────────┘                             └─────────┬───────┘
                                                      │
                                                      │ Cart Data
                                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ 2.0 Update Cart Display                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                      ▲
                                                      │
                                                      │ Cart Items
                                                      │
┌─────────────┐    Cart Storage    ┌─────────────────────────────┐
│             │ ◀─────────────── │                             │
│ D1 Local    │                  │ 1.0 Add to Cart             │
│ Storage     │ ───────────────▶ │                             │
└─────────────┘    Cart Data      └─────────────────────────────┘
```

## Data Flow Details:

### External Entity:
- **User**: The person adding products to their cart

### Processes:
- **1.0 Add to Cart**: Handles adding products to the shopping cart
- **2.0 Update Cart Display**: Updates the cart display and navigation counter

### Data Store:
- **D1 Local Storage**: Browser's localStorage storing cart data

### Data Flows:
1. **Add to Cart Request** → From User to Add to Cart process
2. **Cart Data** → From Add to Cart process to Local Storage
3. **Cart Storage** → From Local Storage back to Add to Cart process
4. **Cart Items** → From Add to Cart process to Update Cart Display process

## Simple Explanation:

1. **User** clicks "Add to Cart" button on a product
2. **Add to Cart** process gets the product details (ID, name, price, quantity)
3. Process checks if product already exists in cart:
   - If exists: increases quantity
   - If new: adds new item to cart
4. **Cart Data** is saved to **Local Storage** (browser storage)
5. **Update Cart Display** process updates:
   - Cart counter in navigation
   - Cart page display
   - Success notification

## Additional Features:

The add to cart system also handles:
- **Quantity Management**: Increase/decrease item quantities
- **Cart Persistence**: Cart data saved in browser storage
- **Duplicate Handling**: Merges quantities for same products
- **Cart Validation**: Ensures valid product data
- **Real-time Updates**: Immediate UI updates
- **Error Handling**: Handles invalid products or storage issues

## Cart Data Structure:
```json
[
  {
    "id": 1,
    "name": "Chocolate Cake",
    "price": 25.00,
    "image": "cake.jpg",
    "quantity": 2
  }
]
```

This is the high-level view of how users add products to their shopping cart!
