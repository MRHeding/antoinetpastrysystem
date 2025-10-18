# View Orders System - Level 0 Data Flow Diagram

## Level 0 DFD - View Orders System

```
┌─────────────┐    View Orders Request    ┌─────────────────┐
│             │ ──────────────────────────▶ │                 │
│    User     │                             │ 1.0 View       │
│             │                             │    Orders      │
└─────────────┘                             └─────────┬───────┘
                                                      │
                                                      │ Orders Data Request
                                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ 2.0 Display Orders List                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                      ▲
                                                      │
                                                      │ Order Details
                                                      │
┌─────────────┐    Orders Info    ┌─────────────────────────────┐
│             │ ◀─────────────── │                             │
│ D1 Orders   │                  │ 1.0 View Orders             │
│    _tbl     │ ───────────────▶ │                             │
└─────────────┘    Order Data     └─────────────────────────────┘
```

## Data Flow Details:

### External Entity:
- **User**: The logged-in user viewing their orders

### Processes:
- **1.0 View Orders**: Handles order data retrieval and filtering
- **2.0 Display Orders List**: Shows the orders in a list format

### Data Store:
- **D1 Orders_tbl**: Database table storing order information

### Data Flows:
1. **View Orders Request** → From User to View Orders process
2. **Orders Data Request** → From View Orders to Orders_tbl database
3. **Orders Info** → From Orders_tbl database back to View Orders process
4. **Order Details** → From View Orders to Display Orders List process

## Simple Explanation:

1. **User** clicks on "My Orders" or navigates to orders page
2. **View Orders** process checks if user is authenticated
3. If authenticated, it requests **Order Data** from the **Orders_tbl** database
4. Database responds with **Orders Info** (order number, status, date, total, etc.)
5. **View Orders** processes the data and sends **Order Details** to display
6. **Display Orders List** shows the orders with filtering and search options

## Additional Features:

The view orders system also handles:
- **Order Filtering**: Filter by status (pending, confirmed, preparing, ready, completed, cancelled)
- **Search Functionality**: Search orders by order number, status, or amount
- **Pagination**: Display orders in pages for better performance
- **Order Details Modal**: Show detailed view of individual orders
- **Order Cancellation**: Cancel pending orders
- **Status Tracking**: Track order progress through different stages

## Order Status Flow:
```
Pending → Confirmed → Preparing → Ready → Completed
    ↓
Cancelled (if cancelled by user or admin)
```

This is the high-level view of how users view and manage their orders!
