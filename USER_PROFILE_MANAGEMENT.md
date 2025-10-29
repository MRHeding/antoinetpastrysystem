# User Profile Management - Admin Feature

## Overview
This document describes the new User Profile Management feature that has been added to the admin panel. Admins can now view complete user profiles, including their personal information, order history, and statistics.

## Features Implemented

### 1. User List View
- **Location**: Admin Dashboard → Quick Actions → "View User Profiles"
- **Features**:
  - Display all registered users in a list format
  - Filter users by role (All Users, Customers, Admins)
  - Show key information at a glance:
    - Full name, username, and email
    - Role badge (Admin/Customer)
    - Active/Inactive status
    - Phone number and city
    - Total orders and total spent
    - Join date
  - Quick actions for each user:
    - View detailed profile
    - Activate/Deactivate account (for customers only)

### 2. Detailed User Profile View
When clicking "View Profile" on any user, admins can see:

#### Personal Information Section
- Full name and username
- Role badge
- Email address
- Phone number
- Full address (street, city, state, ZIP code)
- Member since date
- Last login timestamp
- Account status (Active/Inactive)

#### Order Statistics
- Total number of orders
- Total amount spent
- Breakdown by order status:
  - Pending orders (count and total)
  - Confirmed orders (count and total)
  - Preparing orders (count and total)
  - Ready orders (count and total)
  - Completed orders (count and total)
  - Cancelled orders (count and total)

#### Recent Orders List
- Display of the 10 most recent orders
- For each order:
  - Order number
  - Date and time
  - Number of items
  - Total amount
  - Order status
  - Order notes (if any)

### 3. User Management Actions
- **Activate/Deactivate Users**: Admins can toggle the active status of customer accounts
  - Admin accounts cannot be deactivated through this interface (safety measure)
  - Confirmation required before status change

## Files Created/Modified

### New Files
1. **`api/users.php`** - API endpoint for user management
   - Handles fetching all users with filters
   - Provides detailed user profile data
   - Manages user status updates
   - Includes security checks to prevent admin lockouts

### Modified Files
1. **`admin/index.html`**
   - Added "View User Profiles" quick action button
   - Added Users Modal with filtering options
   - Added User Profile Detail Modal

2. **`admin/js/admin.js`**
   - Added user management functions:
     - `showUsersSection()` - Opens the users list modal
     - `hideUsersModal()` - Closes the users list modal
     - `loadAllUsers(role)` - Fetches users from API with optional role filter
     - `displayUsers(users)` - Renders the users list
     - `filterUsersByRole()` - Applies role filter
     - `toggleUserStatus(userId, currentStatus)` - Activates/deactivates users
     - `viewUserProfile(userId)` - Opens user profile modal
     - `displayUserProfile(profileData)` - Renders detailed profile
     - `hideUserProfileModal()` - Closes profile modal

## API Endpoints

### GET `/api/users.php?action=list`
Fetches all users with order statistics.

**Query Parameters**:
- `role` (optional): Filter by role ('customer' or 'admin')

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "1234567890",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "role": "customer",
      "is_active": 1,
      "email_verified": 1,
      "created_at": "2025-01-01 00:00:00",
      "total_orders": 5,
      "total_spent": "250.00"
    }
  ]
}
```

### GET `/api/users.php?action=profile&user_id={id}`
Fetches detailed profile for a specific user.

**Query Parameters**:
- `user_id` (required): The ID of the user

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "1234567890",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "role": "customer",
      "is_active": 1,
      "email_verified": 1,
      "created_at": "2025-01-01 00:00:00",
      "updated_at": "2025-01-15 00:00:00",
      "total_orders": 5,
      "total_spent": "250.00"
    },
    "recent_orders": [
      {
        "id": 10,
        "order_number": "ORD-20250115-1234",
        "total_amount": "50.00",
        "status": "completed",
        "order_date": "2025-01-15 10:00:00",
        "pickup_date": null,
        "notes": "Special instructions here",
        "items_count": 3
      }
    ],
    "order_stats": [
      {
        "status": "completed",
        "count": 3,
        "total": "150.00"
      },
      {
        "status": "pending",
        "count": 2,
        "total": "100.00"
      }
    ],
    "last_login": "2025-01-20 09:30:00"
  }
}
```

### PUT `/api/users.php?user_id={id}`
Updates user account status (activate/deactivate).

**Query Parameters**:
- `user_id` (required): The ID of the user

**Request Body**:
```json
{
  "is_active": 0
}
```

**Response**:
```json
{
  "success": true,
  "message": "User status updated successfully"
}
```

**Security**: Admin accounts cannot be deactivated through this endpoint.

## Security Features

1. **Admin Authentication Required**: All endpoints require admin authentication via `requireAdminAuth()`
2. **Admin Protection**: Admin accounts cannot be deactivated to prevent lockouts
3. **Session Validation**: All requests validate the admin's session token
4. **SQL Injection Protection**: All database queries use prepared statements
5. **Role-based Access**: Only admins can access user management features

## UI/UX Features

1. **Responsive Design**: All modals and lists are fully responsive
2. **Color-coded Badges**: 
   - Green for active users
   - Red for inactive users
   - Purple for admin roles
   - Blue for customer roles
3. **Status Colors for Orders**:
   - Yellow for pending
   - Blue for confirmed
   - Orange for preparing
   - Green for ready/completed
   - Red for cancelled
4. **Loading States**: Proper loading indicators while fetching data
5. **Error Handling**: Clear error messages for failed operations
6. **Confirmation Dialogs**: Require confirmation before status changes
7. **Currency Icons**: Uses peso symbol (₱) for currency-related amounts instead of dollar sign

## Usage Guide

### Viewing All Users
1. Log in to the admin panel
2. Click "View User Profiles" in the Quick Actions section
3. Use the role filter dropdown to filter by Admin or Customer
4. View the total user count at the top right

### Viewing User Profile
1. From the users list, click "View Profile" on any user
2. Review:
   - Personal information
   - Order statistics by status
   - Recent order history
3. Click the X or click outside to close

### Activating/Deactivating Users
1. From the users list, locate a customer account
2. Click "Deactivate" or "Activate" button
3. Confirm the action in the dialog
4. The list will refresh automatically

## Technical Notes

- All dates are displayed using JavaScript's `toLocaleDateString()` and `toLocaleString()`
- Currency is displayed in Philippine Peso (₱) format
- The API returns order statistics grouped by status for efficient data display
- Recent orders are limited to 10 to maintain performance
- User profile modal has scrollable sections for long content

## Future Enhancements

Potential improvements for future versions:
1. Export user data to CSV/Excel
2. Send email notifications to users
3. View and manage user sessions
4. Search functionality for users
5. Pagination for large user lists
6. Edit user information directly from admin panel
7. Bulk user operations (e.g., bulk deactivate)
8. User activity logs and analytics

