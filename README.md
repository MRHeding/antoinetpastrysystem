# Antoinette's Pastries - Web-Based Marketing System

A beautiful, modern web application for showcasing and managing artisanal pastries in the Philippines. Built with a simple, effective tech stack for easy deployment and maintenance. All prices are displayed in Philippine Peso (₱).

## 🥐 Features

### Frontend
- **Beautiful Design**: Modern, responsive interface with Tailwind CSS
- **Product Showcase**: Elegant display of pastries with descriptions and pricing
- **Shopping Cart**: Basic cart functionality with local storage
- **Mobile Responsive**: Works perfectly on all devices
- **Smooth Animations**: Delightful user experience with smooth scrolling and transitions

### Backend
- **RESTful API**: Clean PHP API for product management
- **Database Integration**: MySQL database with proper schema
- **CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Admin Dashboard**: Simple admin interface for managing products

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Server**: Apache (XAMPP)

## 📁 Project Structure

```
caman/
├── index.html              # Main website homepage
├── js/
│   └── main.js            # Frontend JavaScript
├── api/
│   └── products.php       # Products API endpoint
├── admin/
│   ├── index.html         # Admin dashboard
│   └── js/
│       └── admin.js       # Admin JavaScript
├── database/
│   └── schema.sql         # Database schema and sample data
└── README.md              # This file
```

## 🚀 Installation & Setup

### Prerequisites
- XAMPP (Apache + MySQL + PHP)
- Web browser

### Setup Steps

1. **Clone/Download** the project to your XAMPP htdocs folder
   ```
   C:\xampp\htdocs\caman\
   ```

2. **Start XAMPP Services**
   - Start Apache
   - Start MySQL

3. **Create Database**
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Import the `database/schema.sql` file
   - This will create the database and sample data

4. **Access the Application**
   - Main site: http://localhost/caman/
   - Admin panel: http://localhost/caman/admin/

## 🎯 Usage

### Customer View
- Browse beautiful pastry catalog
- View product details and pricing
- Add items to cart (stored locally)
- Contact information and business hours

### Admin Panel
- View dashboard with statistics
- Add new products
- Edit existing products
- Delete products (soft delete)
- View recent orders

## 🗄️ Database Schema

### Products Table
- `id` - Primary key
- `name` - Product name
- `description` - Product description
- `price` - Product price
- `category` - Product category
- `image_url` - Product image URL
- `is_active` - Active status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Additional Tables
- `customers` - Customer information
- `orders` - Order management
- `order_items` - Order line items
- `categories` - Product categories

## 🔧 API Endpoints

### Products API (`/api/products.php`)

- **GET** - Retrieve all active products
- **POST** - Create new product
- **PUT** - Update existing product
- **DELETE** - Soft delete product

### Example API Usage

```javascript
// Get all products
fetch('api/products.php')
  .then(response => response.json())
  .then(data => console.log(data));

// Add new product
fetch('api/products.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Chocolate Croissant',
    description: 'Buttery croissant with rich chocolate',
    price: 212.50,
    category: 'Croissants'
  })
});
```

## 🎨 Customization

### Styling
- Modify Tailwind classes in HTML files
- Update color scheme by changing CSS classes
- Add custom CSS in `<style>` tags if needed

### Adding Features
- Extend the API in `api/products.php`
- Add new JavaScript functions in `js/main.js`
- Create additional HTML pages as needed

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔒 Security Notes

For production deployment, consider:
- Input validation and sanitization
- SQL injection prevention (PDO prepared statements are used)
- Authentication for admin panel
- HTTPS implementation
- File upload security

## 🚀 Future Enhancements

Potential features to add:
- User authentication system
- Order processing workflow
- Payment integration
- Image upload functionality
- Email notifications
- Inventory management
- Customer reviews
- Search and filtering
- Multi-language support

## 📞 Support

For questions or issues:
- Check the code comments for implementation details
- Review the database schema for data structure
- Test API endpoints using browser developer tools

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for Antoinette's Pastries** 🥐✨


