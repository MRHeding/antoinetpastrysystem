# Database Cleanup Tool - Instructions

## Overview
This tool safely removes all users, chats, and orders from the database except admin accounts.

## Files Created
1. **clean_database.php** - Backend script that performs the cleanup
2. **clean_database.html** - User-friendly web interface
3. **CLEANUP_INSTRUCTIONS.md** - This file

## ⚠️ Important Warnings

**BEFORE RUNNING THIS TOOL:**
1. **BACKUP YOUR DATABASE** - This operation is irreversible!
2. **Test in a development environment first**
3. **Make sure you're logged in as an admin**
4. **Close all active user sessions**

## What Gets Deleted

The script will delete:
- ✗ All users where `role != 'admin'`
- ✗ All chat messages for non-admin users
- ✗ All chat sessions for non-admin users
- ✗ All orders for non-admin users
- ✗ All order items for non-admin orders
- ✗ All user sessions for non-admin users
- ✗ All audit log entries for non-admin users

## What Gets Preserved

The script will keep:
- ✓ All admin users (`role = 'admin'`)
- ✓ All admin chat messages and sessions
- ✓ All admin orders and order items
- ✓ All products, categories, and other system data

## How to Use

### Method 1: Web Interface (Recommended)

1. Open your browser and navigate to:
   ```
   http://localhost/system/clean_database.html
   ```

2. Click **"Load Preview"** to see what will be deleted

3. Review the preview carefully:
   - Number of users to delete
   - Number of chat messages to delete
   - Number of orders to delete
   - List of specific users to be deleted

4. If everything looks correct, click **"Execute Cleanup"**

5. Confirm the operation (you'll be asked twice for safety)

6. Wait for completion and review the results

### Method 2: Direct API Call

#### Preview Mode (GET request):
```bash
curl http://localhost/system/clean_database.php
```

#### Execute Cleanup (POST request):
```bash
curl -X POST http://localhost/system/clean_database.php \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'
```

## Response Format

### Preview Response (GET):
```json
{
  "success": true,
  "message": "Preview of records to be deleted",
  "preview": {
    "users": 5,
    "chat_messages": 150,
    "orders": 25
  },
  "users_to_delete": [
    {
      "id": 11,
      "username": "taylor",
      "email": "taylo@gmail.com",
      "role": "customer"
    }
  ],
  "warning": "To proceed, send a POST request with {\"confirm\": true}"
}
```

### Execution Response (POST):
```json
{
  "success": true,
  "message": "Database cleaned successfully!",
  "summary": {
    "non_admin_users_removed": 5,
    "total_records_deleted": 200,
    "remaining_users": 1
  },
  "details": [
    {
      "description": "Delete chat messages for non-admin users",
      "affected_rows": 150
    },
    {
      "description": "Delete orders for non-admin users",
      "affected_rows": 25
    }
  ]
}
```

## Database Backup Instructions

### Using phpMyAdmin:
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Select the `antonettes_pastries` database
3. Click on the "Export" tab
4. Choose "Quick" export method
5. Click "Go" to download the backup

### Using Command Line:
```bash
mysqldump -u root -p antonettes_pastries > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Troubleshooting

### "Database connection failed"
- Check if XAMPP MySQL is running
- Verify database credentials in `config/database.php`

### "Cannot deactivate admin accounts"
- This is a safety feature - admin accounts are protected

### Foreign Key Constraints Error
- The script handles foreign keys automatically
- If you see this error, there might be custom tables not covered by the script

### Permission Denied
- Uncomment the authentication check in `clean_database.php` lines 13-14
- Make sure you're logged in as an admin

## Security Recommendations

### For Production Use:
1. **Enable Authentication**: Uncomment lines 13-14 in `clean_database.php`:
   ```php
   require_once 'admin/auth-check.php';
   $currentAdmin = requireAdminAuth();
   ```

2. **Restrict Access**: Add `.htaccess` protection:
   ```apache
   <Files "clean_database.php">
       Require ip 127.0.0.1
   </Files>
   ```

3. **Delete After Use**: Remove these files after cleanup:
   ```bash
   rm clean_database.php
   rm clean_database.html
   rm CLEANUP_INSTRUCTIONS.md
   ```

4. **Log the Action**: The script should log cleanup operations in `audit_log` table

## Testing

### Test in Safe Mode:
Before running the actual cleanup, you can test with a database copy:

1. Create a test database:
   ```sql
   CREATE DATABASE antonettes_pastries_test;
   ```

2. Copy your database:
   ```bash
   mysqldump -u root -p antonettes_pastries | mysql -u root -p antonettes_pastries_test
   ```

3. Update `config/database.php` to point to test database

4. Run cleanup on test database

5. Verify results

6. Restore original database connection

## Post-Cleanup Tasks

After successful cleanup:

1. ✓ Verify admin login still works
2. ✓ Check that admin can access all features
3. ✓ Verify no orphaned records remain
4. ✓ Reset auto-increment values if needed:
   ```sql
   ALTER TABLE users AUTO_INCREMENT = 2;
   ALTER TABLE orders AUTO_INCREMENT = 1;
   ALTER TABLE chat_sessions AUTO_INCREMENT = 1;
   ```
5. ✓ Optimize tables:
   ```sql
   OPTIMIZE TABLE users, orders, chat_messages, chat_sessions;
   ```

## Support

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Check PHP error logs: `C:\xampp\apache\logs\error.log`
3. Check MySQL error logs: `C:\xampp\mysql\data\mysql_error.log`
4. Review the database structure in phpMyAdmin

## Rollback

If something goes wrong:
1. Stop the cleanup immediately (if still in progress)
2. Restore from backup:
   ```bash
   mysql -u root -p antonettes_pastries < backup_file.sql
   ```
3. Verify data integrity
4. Report the issue

## License

This tool is part of the Antonette's Pastries management system.
Use at your own risk. Always backup before using.

