# Admin Login System - Simple Data Flow

## What Happens When Someone Logs In as Admin

Think of this like a security guard checking your ID at a building entrance.

### Step-by-Step Process:

```
👤 Admin User
    ↓ (enters username & password)
🖥️ Login Page
    ↓ (sends info to server)
🔍 Check Credentials
    ↓ (looks up in database)
📊 Database
    ↓ (verifies password & admin role)
✅ Login Success
    ↓ (creates session & redirects)
🏢 Admin Dashboard
```

## In Simple Terms:

**1. You Type Your Info**
- Admin goes to login page
- Types username and password
- Clicks "Sign In"

**2. System Checks Your Info**
- Website sends your info to the server
- Server looks up your account in the database
- Checks if password is correct
- Verifies you're actually an admin

**3. If Everything is Right**
- System creates a "session" (like a temporary pass)
- Saves this session in the database
- Redirects you to the admin panel
- You can now access admin features

**4. If Something is Wrong**
- Shows error message
- Keeps you on login page
- You try again

## What Gets Stored:

**User Database** - Like a phone book with:
- Your username
- Your password (encrypted)
- Your role (admin or regular user)

**Session Database** - Like a visitor log with:
- Your temporary pass
- When it expires
- Which user it belongs to

## What Could Go Wrong:

- Wrong username or password
- Not an admin account
- Session expired
- Network problems

That's it! It's basically like showing ID to get into a restricted area.
