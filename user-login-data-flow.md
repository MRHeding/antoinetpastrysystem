# User Login System - Level 0 Data Flow Diagram

## Level 0 DFD - User Authentication System

```
┌─────────────┐    Username and Password    ┌─────────────────┐
│             │ ──────────────────────────▶ │                 │
│    User     │                             │ 1.0 User Login  │
│             │                             │                 │
└─────────────┘                             └─────────┬───────┘
                                                      │
                                                      │ User Info
                                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ 2.0 Display Main Website                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                      ▲
                                                      │
                                                      │ Dashboard Details
                                                      │
┌─────────────┐    Admin Info    ┌─────────────────────────────┐
│             │ ◀─────────────── │                             │
│ D1 Users_tbl│                  │ 1.0 User Login              │
│             │ ───────────────▶ │                             │
└─────────────┘    Successfully  └─────────────────────────────┘
```

## Data Flow Details:

### External Entity:
- **User**: The person trying to log in or register

### Processes:
- **1.0 User Login**: Handles authentication (login/register)
- **2.0 Display Main Website**: Shows the main site after successful login

### Data Store:
- **D1 Users_tbl**: Database table storing user information

### Data Flows:
1. **Username and Password** → From User to User Login process
2. **User Info** → From User Login process to Users_tbl database
3. **Successfully** → From Users_tbl database back to User Login process
4. **Dashboard Details** → From User Login process to Display Main Website process

## Simple Explanation:

1. **User** enters their username and password
2. **User Login** process checks the credentials against the **Users_tbl** database
3. If successful, the database responds with "Successfully"
4. The login process then sends dashboard details to **Display Main Website**
5. User sees the main website and can start using the system

This is the high-level view of how user authentication works in your system!
