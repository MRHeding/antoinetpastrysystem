# Product Display System - Level 0 Data Flow Diagram

## Level 0 DFD - Product Display System

```
┌─────────────┐    Product View Request    ┌─────────────────┐
│             │ ──────────────────────────▶ │                 │
│    User     │                             │ 1.0 Product     │
│             │                             │    Display      │
└─────────────┘                             └─────────┬───────┘
                                                      │
                                                      │ Product Data Request
                                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ 2.0 Display Product Grid                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                      ▲
                                                      │
                                                      │ Product Details
                                                      │
┌─────────────┐    Product Info    ┌─────────────────────────────┐
│             │ ◀─────────────── │                             │
│ D1 Products │                  │ 1.0 Product Display         │
│    _tbl     │ ───────────────▶ │                             │
└─────────────┘    Product Data   └─────────────────────────────┘
```

## Data Flow Details:

### External Entity:
- **User**: The person browsing and viewing products

### Processes:
- **1.0 Product Display**: Handles product data retrieval and filtering
- **2.0 Display Product Grid**: Shows the products in a grid layout

### Data Store:
- **D1 Products_tbl**: Database table storing product information

### Data Flows:
1. **Product View Request** → From User to Product Display process
2. **Product Data Request** → From Product Display to Products_tbl database
3. **Product Info** → From Products_tbl database back to Product Display process
4. **Product Details** → From Product Display to Display Product Grid process

## Simple Explanation:

1. **User** visits the products page or searches for products
2. **Product Display** process requests **Product Data** from the **Products_tbl** database
3. Database responds with **Product Info** (name, price, description, images, etc.)
4. **Product Display** processes the data and sends **Product Details** to display
5. **Display Product Grid** shows the products in a grid layout with filtering and search

## Additional Features:

The product display system also handles:
- **Search Functionality**: Filter products by name, description, or category
- **Category Filtering**: Show products by specific categories
- **Sorting Options**: Sort by name, price (low to high, high to low), category
- **Pagination**: Display products in pages for better performance
- **Product Details Modal**: Show detailed view of individual products
- **Add to Cart**: Allow users to add products to their shopping cart

This is the high-level view of how users browse and view products in your system!
