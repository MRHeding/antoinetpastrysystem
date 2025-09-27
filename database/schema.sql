-- Antoinette's Pastries Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS antoinettes_pastries;
USE antoinettes_pastries;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Croissants', 'Buttery, flaky pastries perfect for breakfast'),
('Cakes', 'Celebration cakes and everyday treats'),
('Cookies', 'Sweet and savory cookies for any occasion'),
('Tarts', 'Elegant fruit and custard tarts'),
('Bread', 'Artisanal breads and rolls'),
('Seasonal', 'Special seasonal and holiday treats');

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    role ENUM('customer', 'admin') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@antoinettes.com', '$2y$10$UOea9laq7z8VIDRD4pIVJOycxPqk8a8i.sXEsCeG5s./CIgPkrJgS', 'Admin', 'User', 'admin');

-- Insert sample products (Prices in Philippine Peso)
INSERT INTO products (name, description, price, category, image_url) VALUES
('Classic Butter Croissant', 'Traditional French croissant made with premium butter, light and flaky with a golden exterior.', 175.00, 'Croissants', NULL),
('Chocolate Croissant', 'Buttery croissant filled with rich dark chocolate, perfect for a sweet breakfast treat.', 212.50, 'Croissants', NULL),
('Almond Croissant', 'Flaky croissant filled with almond cream and topped with sliced almonds.', 237.50, 'Croissants', NULL),
('Red Velvet Cake', 'Moist red velvet cake with cream cheese frosting, perfect for special occasions.', 1400.00, 'Cakes', NULL),
('Chocolate Chip Cookies', 'Classic chocolate chip cookies made with premium chocolate chips.', 125.00, 'Cookies', NULL),
('Lemon Tart', 'Tangy lemon curd in a buttery pastry shell, topped with fresh berries.', 325.00, 'Tarts', NULL),
('Sourdough Bread', 'Traditional sourdough bread with a crispy crust and tangy flavor.', 250.00, 'Bread', NULL),
('Apple Cinnamon Roll', 'Soft cinnamon roll filled with spiced apples and topped with cream cheese glaze.', 225.00, 'Seasonal', NULL),
('Pumpkin Spice Muffin', 'Seasonal pumpkin muffin with warm spices and cream cheese filling.', 187.50, 'Seasonal', NULL),
('Strawberry Shortcake', 'Light sponge cake layered with fresh strawberries and whipped cream.', 1100.00, 'Cakes', NULL);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);


