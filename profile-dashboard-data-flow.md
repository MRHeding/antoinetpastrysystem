# User Profile Dashboard - Level 0 Data Flow Diagram

## Level 0 DFD - Profile Dashboard Access System

```
┌─────────────┐    Profile Access Request    ┌─────────────────┐
│             │ ──────────────────────────▶ │                 │
│    User     │                             │ 1.0 Profile     │
│             │                             │    Dashboard    │
└─────────────┘                             └─────────┬───────┘
                                                      │
                                                      │ Profile Data Request
                                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ 2.0 Display Profile Information                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                      ▲
                                                      │
                                                      │ Profile Details
                                                      │
┌─────────────┐    User Info    ┌─────────────────────────────┐
│             │ ◀─────────────── │                             │
│ D1 Users_tbl│                  │ 1.0 Profile Dashboard       │
│             │ ───────────────▶ │                             │
└─────────────┘    Profile Data  └─────────────────────────────┘
```

## Data Flow Details:

### External Entity:
- **User**: The logged-in user accessing their profile

### Processes:
- **1.0 Profile Dashboard**: Handles profile data retrieval and management
- **2.0 Display Profile Information**: Shows the profile data to the user

### Data Store:
- **D1 Users_tbl**: Database table storing user profile information

### Data Flows:
1. **Profile Access Request** → From User to Profile Dashboard process
2. **Profile Data Request** → From Profile Dashboard to Users_tbl database
3. **User Info** → From Users_tbl database back to Profile Dashboard process
4. **Profile Details** → From Profile Dashboard to Display Profile Information process

## Simple Explanation:

1. **User** clicks on profile or navigates to profile page
2. **Profile Dashboard** process checks if user is authenticated
3. If authenticated, it requests **Profile Data** from the **Users_tbl** database
4. Database responds with **User Info** (name, email, address, etc.)
5. **Profile Dashboard** processes the data and sends **Profile Details** to display
6. **Display Profile Information** shows the user their profile data

## Additional Features:

The profile dashboard also handles:
- **Profile Updates**: When user edits their information
- **Password Changes**: When user wants to change their password
- **Order History**: Access to user's past orders
- **Account Actions**: Various account management features

This is the high-level view of how users access and manage their profile information!
