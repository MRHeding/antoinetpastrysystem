# Admin Login to Dashboard with Product Management - Data Flow Diagram (DFD)

## Level 0 DFD - Complete Admin System

```
┌─────────────┐    Username and Password    ┌─────────────────┐
│             │ ──────────────────────────▶ │                 │
│    Admin    │                             │ 1.0 Admin       │
│             │                             │    Login        │
│             │ ◀────────────────────────── │                 │
└─────────────┘    Login Success/Error      └─────────┬───────┘
                                                      │
                                                      │ User Info
                                                      ▼
┌─────────────┐    User Data    ┌─────────────────────────────┐
│             │ ◀───────────── │                             │
│ D1 User_tbl │                │ 1.0 Admin Login             │
│             │ ─────────────▶ │                             │
└─────────────┘   Confirm       └─────────────────────────────┘
                                                      │
                                                      │ Display Page
                                                      ▼
┌─────────────┐    Load Request    ┌─────────────────────────────┐
│             │ ◀─────────────── │                             │
│ 2.0 Display │                  │ 1.0 Admin Login             │
│ Admin       │ ───────────────▶ │                             │
│ Dashboard   │                  │                             │
└─────────────┘                  └─────────────────────────────┘
                                                      │
                                                      │ Product Operations
                                                      ▼
┌─────────────┐    Product Data    ┌─────────────────────────────┐
│             │ ◀─────────────── │                             │
│ D2 Product  │                  │ 3.0 Manage Products         │
│ Database    │ ───────────────▶ │                             │
└─────────────┘   CRUD Operations └─────────────────────────────┘
```

## Extended DFD - Product Management Operations

```
┌─────────────┐    Add Product Request    ┌─────────────────┐
│             │ ──────────────────────────▶ │                 │
│    Admin    │                             │ 3.1 Add         │
│             │                             │    Product      │
│             │ ◀────────────────────────── │                 │
└─────────────┘    Success/Error Message    └─────────┬───────┘
                                                      │
                                                      │ Product Info
                                                      ▼
┌─────────────┐    Product Data    ┌─────────────────────────────┐
│             │ ◀─────────────── │                             │
│ D2 Product  │                  │ 3.1 Add Product             │
│ Database    │ ───────────────▶ │                             │
└─────────────┘   Insert New      └─────────────────────────────┘

┌─────────────┐    Update Request    ┌─────────────────────────────┐
│             │ ────────────────────▶ │                             │
│    Admin    │                       │ 3.2 Update                 │
│             │                       │    Product                  │
│             │ ◀──────────────────── │                             │
└─────────────┘   Update Success      └─────────┬───────────────────┘
                                                 │
                                                 │ Product Changes
                                                 ▼
┌─────────────┐    Product Data    ┌─────────────────────────────┐
│             │ ◀─────────────── │                             │
│ D2 Product  │                  │ 3.2 Update Product          │
│ Database    │ ───────────────▶ │                             │
└─────────────┘   Modify Existing └─────────────────────────────┘

┌─────────────┐    Delete Request    ┌─────────────────────────────┐
│             │ ────────────────────▶ │                             │
│    Admin    │                       │ 3.3 Delete                 │
│             │                       │    Product                  │
│             │ ◀──────────────────── │                             │
└─────────────┘   Delete Confirmation └─────────┬───────────────────┘
                                                 │
                                                 │ Product ID
                                                 ▼
┌─────────────┐    Product Data    ┌─────────────────────────────┐
│             │ ◀─────────────── │                             │
│ D2 Product  │                  │ 3.3 Delete Product          │
│ Database    │ ───────────────▶ │                             │
└─────────────┘   Remove Record    └─────────────────────────────┘
```

## Data Flow Details:

### External Entity:
- **Admin**: The administrator logging into the system and managing products

### Processes:
- **1.0 Admin Login**: Handles authentication and login validation
- **2.0 Display Admin Dashboard**: Shows the admin dashboard with statistics and controls
- **3.0 Manage Products**: Main process for product management operations
- **3.1 Add Product**: Handles adding new products to the system
- **3.2 Update Product**: Handles modifying existing product information
- **3.3 Delete Product**: Handles removing products from the system

### Data Stores:
- **D1 User_tbl**: Database containing admin user information and authentication data
- **D2 Product Database**: Database containing product information and inventory

### Data Flows:
**Login & Dashboard Flows:**
1. **Username and Password** → From Admin to Admin Login process
2. **Login Success/Error** → From Admin Login process to Admin
3. **User Info** → From Admin Login process to User_tbl
4. **Confirm** → From User_tbl back to Admin Login process
5. **Display Page** → From Admin Login process to Display Admin Dashboard process
6. **Load Request** → From Admin to Display Admin Dashboard process

**Product Management Flows:**
7. **Add Product Request** → From Admin to Add Product process
8. **Success/Error Message** → From Add Product process to Admin
9. **Product Info** → From Add Product process to Product Database
10. **Insert New** → From Product Database to Add Product process
11. **Update Request** → From Admin to Update Product process
12. **Update Success** → From Update Product process to Admin
13. **Product Changes** → From Update Product process to Product Database
14. **Modify Existing** → From Product Database to Update Product process
15. **Delete Request** → From Admin to Delete Product process
16. **Delete Confirmation** → From Delete Product process to Admin
17. **Product ID** → From Delete Product process to Product Database
18. **Remove Record** → From Product Database to Delete Product process

## Simple Explanation:

### Login Process:
1. **Admin** enters username and password on the login page
2. **Admin Login** process receives the credentials
3. Process queries the **User_tbl** to verify the credentials
4. If credentials are valid and user has admin role:
   - Creates a session token
   - Stores session in database
   - Redirects to dashboard
5. **Display Admin Dashboard** process loads:
   - System statistics (products, orders, customers, revenue)
   - Recent orders
   - Product management interface
   - Admin controls

### Product Management Process:

**Adding Products:**
6. **Admin** fills out the add product form (name, description, price, category, image)
7. **Add Product** process validates the data and saves to **Product Database**
8. Admin receives success/error message and updated product list

**Updating Products:**
9. **Admin** selects a product to edit and modifies its information
10. **Update Product** process applies changes to **Product Database**
11. Admin receives confirmation and sees updated product information

**Deleting Products:**
12. **Admin** selects a product to delete and confirms the action
13. **Delete Product** process removes the record from **Product Database**
14. Admin receives confirmation and updated product list

## Data Structures:

**Admin Data:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@antonettes.com",
  "first_name": "Admin",
  "last_name": "User",
  "role": "admin",
  "is_active": 1
}
```

**Product Data:**
```json
{
  "id": 1,
  "name": "Chocolate Cake",
  "description": "Rich chocolate cake with frosting",
  "price": "25.00",
  "category": "Cakes",
  "image_url": "uploads/products/cake.jpg",
  "created_at": "2024-01-01 10:00:00"
}
```

## Dashboard Components:
- **Statistics Cards**: Total products, orders, customers, revenue
- **Recent Orders**: Latest order information with status
- **Product Management**: Add, edit, delete products with forms and buttons
- **Navigation**: Admin menu and logout functionality

This shows the complete admin workflow from login to product management!
