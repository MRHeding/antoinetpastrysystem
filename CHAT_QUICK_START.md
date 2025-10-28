# Chat Feature - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Setup Database (Required)
Open your MySQL/phpMyAdmin and run this SQL:

```sql
-- Copy and run the contents of: database/create_chat_table.sql
```

Or navigate to phpMyAdmin → SQL tab → Copy the SQL from `database/create_chat_table.sql` → Execute

### Step 2: Access Chat as User
1. Open your website: `http://localhost/system/index.html`
2. Log in as a regular user
3. Look for the **orange chat button** in the bottom-right corner
4. Click to open chat and send a message!

### Step 3: Respond as Admin
1. Log in to admin: `http://localhost/system/admin/login.html`
2. Go to Dashboard: `http://localhost/system/admin/index.php`
3. Click **"Customer Chat"** in Quick Actions
4. Select a conversation and reply!

---

## 📍 Where to Find Everything

### For Users (Customer Side)
**Chat Button Location:**
- Bottom-right corner of every page (floating orange button)
- Visible on: Home, Products, About, Contact, Cart, Profile, Orders

**What You See:**
```
┌─────────────────────────────────────┐
│  Customer Support          [×]       │
├─────────────────────────────────────┤
│                                     │
│  [Admin] Hello! How can we help?   │
│                                     │
│         [You] I have a question    │
│                                     │
├─────────────────────────────────────┤
│  [Type message...] [Send]          │
└─────────────────────────────────────┘
```

### For Admins
**Access Point:**
- Admin Dashboard → Quick Actions → **"Customer Chat"**
- Direct link: `admin/chat.html`

**What You See:**
```
┌───────────────┬─────────────────────────────┐
│ Conversations │  Chat with John Doe         │
├───────────────┼─────────────────────────────┤
│ 🔵 John Doe   │  [User] I have a question   │
│    2 unread   │                             │
│               │  [You] How can I help?      │
│ Jane Smith    │                             │
│    Last: 5m   │                             │
│               ├─────────────────────────────┤
│ Mike Johnson  │  [Type reply...] [Send]     │
│    Last: 1h   │                             │
└───────────────┴─────────────────────────────┘
```

---

## 🎯 Key Features

### User Chat Widget
✨ **Always Accessible** - Floating button on all pages
🔔 **Unread Badge** - Red badge shows new messages
💬 **Message History** - All messages saved
📱 **Mobile Friendly** - Responsive design
🔐 **Login Protected** - Secure conversations

### Admin Chat Dashboard
👥 **All Conversations** - See all customer chats
🔍 **Quick Overview** - User name, email, last message
⚡ **Real-time Updates** - Auto-refresh every 5 seconds
🔔 **Unread Indicators** - Know what needs attention
📊 **Easy Navigation** - Click to switch conversations

---

## 🧪 Test It Out!

### Test Scenario 1: User Sends Message
1. Log in as user: `user@example.com`
2. Click orange chat button (bottom-right)
3. Type: "Hello, I need help with my order"
4. Click Send
5. ✅ Message appears in chat window

### Test Scenario 2: Admin Responds
1. Log in as admin: `admin@example.com`
2. Go to Dashboard → Customer Chat
3. You should see the user's conversation with unread badge
4. Click on it to open
5. Type reply: "Hello! I'd be happy to help you."
6. Click Send
7. ✅ Message sent to user

### Test Scenario 3: User Receives Reply
1. Go back to user browser
2. Wait up to 5 seconds
3. ✅ Admin's reply appears automatically!

---

## 🎨 Visual Elements

### Chat Widget States

**Closed (Default)**
```
    [🗨 (2)]  ← Orange circle with unread count
```

**Open (Active)**
```
┌─────────────────────┐
│ Customer Support [×]│
├─────────────────────┤
│  Messages here...   │
│                     │
├─────────────────────┤
│ [Type...] [Send]    │
└─────────────────────┘
```

### Admin Dashboard Badge
```
┌─────────────────────────┐
│  Quick Actions          │
├─────────────────────────┤
│ [+] Add Product         │
│ [💬] Customer Chat  (5) │← Red badge with count
│ [📋] Audit Log          │
└─────────────────────────┘
```

---

## ⚙️ Configuration

### Default Settings
- **User polling**: Every 5 seconds
- **Admin polling**: Every 5 seconds  
- **Badge updates**: Every 10 seconds
- **Message retention**: Permanent
- **Auth required**: Yes (login required)

### Customize Colors
Edit these files to change colors:
- `components/chat-widget.html` - User widget colors
- `admin/chat.html` - Admin chat colors

Current theme: **Amber/Orange** (`#D97706`)

---

## 🔧 Troubleshooting

### ❌ Chat button not showing
**Fix**: Check browser console for errors. Ensure `js/chat.js` is loaded.

### ❌ Can't send messages
**Fix**: Make sure you're logged in. Check session in browser dev tools.

### ❌ Messages not updating
**Fix**: Wait 5 seconds (polling interval). Check network tab for API calls.

### ❌ Admin can't see conversations
**Fix**: Verify admin login and `is_admin` session variable is set.

### ❌ Database error
**Fix**: Run `database/create_chat_table.sql` to create required tables.

---

## 📚 More Information

- **Full Documentation**: See `CHAT_FEATURE.md`
- **Implementation Details**: See `CHAT_IMPLEMENTATION_SUMMARY.md`
- **API Reference**: See `CHAT_FEATURE.md` (API Endpoints section)

---

## ✅ Quick Checklist

Before going live, verify:
- [ ] Database tables created
- [ ] Chat button visible on user pages
- [ ] Users can send messages
- [ ] Admins can view conversations
- [ ] Admins can send replies
- [ ] Unread counts work
- [ ] Messages persist after refresh
- [ ] Mobile responsive works

---

## 🎉 You're All Set!

The chat feature is now ready to use. Users can reach out for support, and admins can respond from a centralized dashboard.

**Have fun chatting!** 💬

---

**Need Help?** Check the full documentation in `CHAT_FEATURE.md`

