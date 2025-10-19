# Add to Cart System - Data Flow Diagram (DFD)

## Simple DFD - Add to Cart Process

```
┌─────────────┐    Product ID & Quantity    ┌─────────────────┐
│             │ ──────────────────────────▶ │                 │
│    User     │                             │ 1.0 Add to      │
│             │                             │    Cart         │
│             │ ◀────────────────────────── │                 │
└─────────────┘    Success Message         └─────────┬───────┘
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
- **User**: The person adding products to their shopping cart

### Processes:
- **1.0 Add to Cart**: Handles adding products to the shopping cart
- **2.0 Update Cart Display**: Updates the cart display and navigation counter

### Data Store:
- **D1 Local Storage**: Browser's localStorage storing cart data

### Data Flows:
1. **Product ID & Quantity** → From User to Add to Cart process
2. **Success Message** → From Add to Cart process to User
3. **Cart Data** → From Add to Cart process to Local Storage
4. **Cart Storage** → From Local Storage back to Add to Cart process
5. **Cart Items** → From Add to Cart process to Update Cart Display process

## Simple Explanation:

1. **User** clicks "Add to Cart" button with product ID and quantity
2. **Add to Cart** process gets the product details and validates the request
3. Process checks if product already exists in cart:
   - If exists: increases quantity
   - If new: adds new item to cart
4. **Cart Data** is saved to **Local Storage** (browser storage)
5. **Update Cart Display** process updates:
   - Cart counter in navigation
   - Cart page display
   - Success notification

## Cart Data Structure:
```json
[
  {
    "id": 1,
    "name": "Chocolate Cake",
    "price": "25.00",
    "image": "cake.jpg",
    "quantity": 2
  }
]
```

This is the simple view of how users add products to their shopping cart!
