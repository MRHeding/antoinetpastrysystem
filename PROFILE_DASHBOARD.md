# User Profile Dashboard

## Overview
The User Profile Dashboard provides a comprehensive interface for users to manage their account information, view their profile details, and perform account-related actions.

## Features

### Profile Management
- **View Profile Information**: Display user's personal details including name, email, username, and contact information
- **Edit Profile**: Toggle edit mode to update personal information
- **Address Management**: Manage shipping and billing address information
- **Real-time Updates**: Changes are saved immediately to the database

### Account Security
- **Change Password**: Secure password change functionality with current password verification
- **Session Management**: Automatic session validation and timeout handling
- **Input Validation**: Client and server-side validation for all form inputs

### User Experience
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Loading States**: Visual feedback during data loading and form submission
- **Error Handling**: Comprehensive error messages and fallback states
- **Notifications**: Toast notifications for user feedback

## File Structure

```
profile.html          # Main profile dashboard page
js/profile.js         # Frontend JavaScript functionality
api/auth.php          # Backend API endpoints (updated)
components/navigation.html  # Navigation component (updated)
```

## API Endpoints

### GET `/api/auth.php?action=profile`
Retrieves the current user's profile information.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip_code": "12345",
    "role": "customer",
    "created_at": "2025-01-01 00:00:00"
  }
}
```

### POST `/api/auth.php?action=update_profile`
Updates the user's profile information.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "Anytown",
  "state": "CA",
  "zip_code": "12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### POST `/api/auth.php?action=change_password`
Changes the user's password.

**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Usage

1. **Access the Dashboard**: Navigate to `/profile.html` while logged in
2. **View Profile**: All profile information is displayed in read-only mode by default
3. **Edit Profile**: Click "Edit Profile" to enable editing mode
4. **Save Changes**: Click "Save Changes" to update the profile
5. **Change Password**: Click "Change Password" to open the password change modal
6. **Cancel Changes**: Click "Cancel" to discard unsaved changes

## Security Features

- **Session Validation**: All requests require valid session tokens
- **Password Verification**: Current password must be provided to change password
- **Input Sanitization**: All inputs are validated and sanitized
- **SQL Injection Prevention**: Prepared statements are used for all database queries
- **XSS Protection**: Output is properly escaped

## Styling

The dashboard uses Tailwind CSS for styling with:
- **Color Scheme**: Amber/gold primary colors matching the site theme
- **Responsive Grid**: Mobile-first responsive design
- **Interactive Elements**: Hover states and transitions
- **Form Styling**: Consistent input and button styling
- **Loading States**: Spinner animations and disabled states

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- JavaScript ES6+ features
- CSS Grid and Flexbox support

## Future Enhancements

- Order history integration
- Data export functionality
- Profile picture upload
- Two-factor authentication
- Email verification status
- Account deletion option
