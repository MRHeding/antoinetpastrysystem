# Chat Feature Documentation

## Overview
The chat feature enables real-time communication between customers and administrators. Users can reach out for support, ask questions, or provide feedback directly through the website, while admins can respond and manage multiple conversations from a centralized dashboard.

## Features

### User Features
- **Floating Chat Widget**: Always accessible chat button on all user-facing pages
- **Real-time Messaging**: Send and receive messages instantly
- **Unread Message Notifications**: Badge showing number of unread messages
- **Message History**: View complete conversation history
- **Login Required**: Chat only available to logged-in users for better tracking

### Admin Features
- **Conversation Management**: View all active customer conversations
- **Multi-user Support**: Handle multiple customer chats
- **Unread Indicators**: See which conversations have new messages
- **Real-time Updates**: Automatically refreshes for new messages
- **Customer Information**: View customer name and email in chat header

## Installation & Setup

### 1. Database Setup
Run the SQL migration to create the necessary tables:

```bash
# Navigate to your MySQL/phpMyAdmin
# Execute the following file:
database/create_chat_table.sql
```

Or run this SQL directly:

```sql
-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sender_type ENUM('user', 'admin') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    unread_admin_count INT DEFAULT 0,
    unread_user_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_last_message (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Files Created

#### API
- `api/chat.php` - Backend API handling all chat operations

#### Components
- `components/chat-widget.html` - User chat widget UI

#### Admin
- `admin/chat.html` - Admin chat management page
- `admin/js/admin-chat.js` - Admin chat functionality

#### JavaScript
- `js/chat.js` - User chat functionality

#### Database
- `database/create_chat_table.sql` - Database schema

### 3. Integration

The chat widget is automatically loaded on all user-facing pages:
- index.html
- products.html
- about.html
- contact.html
- cart.html
- profile.html
- orders.html

Admin chat access is available from:
- Admin Dashboard (Quick Actions section)
- Direct link: `admin/chat.html`

## Usage

### For Users
1. Look for the orange chat button in the bottom-right corner
2. Click to open the chat window
3. If not logged in, you'll be prompted to log in first
4. Type your message and press Enter or click Send
5. View unread message count on the chat badge
6. Messages are saved and available across sessions

### For Admins
1. Log in to the admin dashboard
2. Click "Customer Chat" in Quick Actions
3. View all active conversations on the left panel
4. Click a conversation to view and respond
5. Unread message count shows in the dashboard badge
6. Messages update automatically every 5 seconds

## API Endpoints

### GET Endpoints
- `GET api/chat.php?action=get_messages` - Get messages for a conversation
  - Optional parameter: `user_id` (admin only, to view specific user's messages)
  
- `GET api/chat.php?action=get_conversations` - Get all conversations (admin only)

- `GET api/chat.php?action=get_unread_count` - Get unread message count

### POST Endpoints
- `POST api/chat.php?action=send_message` - Send a new message
  - Body: `{ "message": "text", "target_user_id": number }` (target_user_id is admin only)

- `POST api/chat.php?action=mark_as_read` - Mark messages as read
  - Body: `{ "user_id": number }` (user_id is admin only)

## Technical Details

### Polling Mechanism
- User chat: Polls every 5 seconds for new messages when chat is open
- Admin chat: Polls every 5 seconds for new messages in active conversation
- Badge updates: Every 10 seconds for unread count

### Message Storage
- Messages are stored in `chat_messages` table
- Sessions tracked in `chat_sessions` table for unread counts
- All messages linked to user accounts

### Security
- Session-based authentication required
- Admin role verification for admin endpoints
- SQL injection protection via prepared statements
- XSS protection via HTML escaping

## Customization

### Styling
Chat widget colors can be customized in `components/chat-widget.html`:
- Primary color: `bg-amber-600` (orange)
- Hover color: `hover:bg-amber-700`
- User message bubble: `bg-amber-600`
- Admin message bubble: `bg-white`

### Polling Intervals
Adjust polling frequencies in:
- `js/chat.js` - Line with `setInterval(checkNewMessages, 5000)`
- `admin/js/admin-chat.js` - Line with `setInterval(checkAdminNewMessages, 5000)`

### Message Limits
No message length limit is currently enforced. To add one, modify the API validation in `api/chat.php`.

## Troubleshooting

### Chat widget not showing
- Check if `js/chat.js` is loaded
- Verify `components/chat-widget.html` exists
- Check browser console for errors

### Messages not sending
- Verify user is logged in (check session)
- Check database connection
- Review browser network tab for API errors
- Check `api/chat.php` for PHP errors

### Real-time updates not working
- Verify polling intervals are active
- Check browser console for JavaScript errors
- Ensure API endpoints are accessible

### Admin can't see conversations
- Verify admin is logged in with admin role
- Check `is_admin` session variable
- Ensure `chat_sessions` table exists

## Future Enhancements
- WebSocket support for true real-time messaging
- File/image sharing in chat
- Chat notifications (browser push notifications)
- Chat history export
- Customer satisfaction ratings
- Typing indicators
- Read receipts
- Message search functionality
- Chat analytics dashboard

## Support
For issues or questions about the chat feature, please contact the development team or refer to the main project README.

