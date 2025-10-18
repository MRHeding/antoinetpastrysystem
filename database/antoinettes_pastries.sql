-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 18, 2025 at 03:18 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `antoinettes_pastries`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `is_active`, `created_at`) VALUES
(1, 'Croissants', 'Buttery, flaky pastries perfect for breakfast', 1, '2025-09-21 16:01:40'),
(2, 'Cakes', 'Celebration cakes and everyday treats', 1, '2025-09-21 16:01:40'),
(3, 'Cookies', 'Sweet and savory cookies for any occasion', 1, '2025-09-21 16:01:40'),
(4, 'Tarts', 'Elegant fruit and custard tarts', 1, '2025-09-21 16:01:40'),
(5, 'Bread', 'Artisanal breads and rolls', 1, '2025-09-21 16:01:40'),
(6, 'Seasonal', 'Special seasonal and holiday treats', 1, '2025-09-21 16:01:40');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `order_number` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','preparing','ready','completed','cancelled') DEFAULT 'pending',
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `pickup_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `customer_id`, `order_number`, `total_amount`, `status`, `order_date`, `pickup_date`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, 'ORD-20250101-0001', 15.50, 'completed', '2025-01-01 02:30:00', '2025-01-01', 'Please make sure the croissants are fresh', '2025-01-01 02:30:00', '2025-01-01 02:30:00'),
(2, 2, NULL, 'ORD-20250102-0002', 28.00, 'preparing', '2025-01-02 06:15:00', '2025-01-03', 'Birthday cake for my daughter', '2025-01-02 06:15:00', '2025-01-02 06:15:00'),
(3, 7, NULL, 'ORD-20250103-0003', 8.75, 'ready', '2025-01-03 01:45:00', '2025-01-03', NULL, '2025-01-03 01:45:00', '2025-01-03 01:45:00'),
(4, 2, NULL, 'ORD-20250104-0004', 12.00, 'pending', '2025-01-04 08:20:00', '2025-01-05', 'Gluten-free options please', '2025-01-04 08:20:00', '2025-01-04 08:20:00'),
(5, 7, NULL, 'ORD-20250105-0005', 6.50, 'cancelled', '2025-01-05 03:10:00', '2025-01-05', 'Changed my mind', '2025-01-05 03:10:00', '2025-01-05 03:10:00'),
(6, 8, NULL, 'ORD-20251016-6224', 14.00, 'cancelled', '2025-10-16 16:31:09', NULL, 'Order total: ₱65.68 (Subtotal: ₱14.00, Tax: ₱1.68, Delivery: ₱50.00)', '2025-10-16 16:31:09', '2025-10-16 16:42:23');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `total_price`, `created_at`) VALUES
(1, 1, 1, 2, 3.50, 7.00, '2025-01-01 02:30:00'),
(2, 1, 5, 3, 2.50, 7.50, '2025-01-01 02:30:00'),
(3, 1, 8, 1, 4.50, 4.50, '2025-01-01 02:30:00'),
(4, 2, 4, 1, 28.00, 28.00, '2025-01-02 06:15:00'),
(5, 3, 2, 1, 4.25, 4.25, '2025-01-03 01:45:00'),
(6, 3, 3, 1, 4.50, 4.50, '2025-01-03 01:45:00'),
(7, 4, 5, 4, 2.50, 10.00, '2025-01-04 08:20:00'),
(8, 4, 9, 1, 3.75, 3.75, '2025-01-04 08:20:00'),
(9, 5, 6, 1, 6.50, 6.50, '2025-01-05 03:10:00'),
(10, 6, 12, 1, 14.00, 14.00, '2025-10-16 16:31:09');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(100) DEFAULT 'General',
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `category`, `image_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Classic Butter Croissant', 'Traditional French croissant made with premium butter, light and flaky with a golden exterior.', 3.50, 'Croissants', NULL, 0, '2025-09-21 16:01:40', '2025-09-24 15:56:20'),
(2, 'Chocolate Croissant', 'Buttery croissant filled with rich dark chocolate, perfect for a sweet breakfast treat.', 4.25, 'Croissants', NULL, 0, '2025-09-21 16:01:40', '2025-09-24 15:56:22'),
(3, 'Almond Croissant', 'Flaky croissant filled with almond cream and topped with sliced almonds.', 4.75, 'Croissants', NULL, 0, '2025-09-21 16:01:40', '2025-09-24 15:56:24'),
(4, 'Red Velvet Cake', 'Moist red velvet cake with cream cheese frosting, perfect for special occasions.', 28.00, 'Cakes', NULL, 0, '2025-09-21 16:01:40', '2025-09-24 15:56:25'),
(5, 'Chocolate Chip Cookies', 'Classic chocolate chip cookies made with premium chocolate chips.', 2.50, 'Cookies', NULL, 0, '2025-09-21 16:01:40', '2025-09-24 15:56:27'),
(6, 'Lemon Tart', 'Tangy lemon curd in a buttery pastry shell, topped with fresh berries.', 6.50, 'Tarts', NULL, 0, '2025-09-21 16:01:40', '2025-09-24 15:56:29'),
(7, 'Sourdough Bread', 'Traditional sourdough bread with a crispy crust and tangy flavor.', 5.00, 'Bread', NULL, 0, '2025-09-21 16:01:40', '2025-09-24 15:56:31'),
(8, 'Apple Cinnamon Roll', 'Soft cinnamon roll filled with spiced apples and topped with cream cheese glaze.', 4.50, 'Seasonal', NULL, 0, '2025-09-21 16:01:40', '2025-09-24 15:56:32'),
(9, 'Pumpkin Spice Muffin', 'Seasonal pumpkin muffin with warm spices and cream cheese filling.', 3.75, 'Seasonal', NULL, 0, '2025-09-21 16:01:40', '2025-09-24 15:56:36'),
(10, 'Strawberry Shortcake', 'Light sponge cake layered with fresh strawberries and whipped cream.', 22.00, 'Cakes', NULL, 0, '2025-09-21 16:01:40', '2025-10-11 16:11:49'),
(11, 'Testing Product', 'For Testing', 1.00, 'Cookies', NULL, 0, '2025-10-11 15:58:22', '2025-10-11 15:59:11'),
(12, 'Yummy Cookie', 'Delicioso', 50.00, 'Cookies', 'uploads/products/1760198544_2ChocolateChipCookies.jpg', 1, '2025-10-11 16:02:24', '2025-10-11 16:11:09');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `email_verification_token` varchar(255) DEFAULT NULL,
  `email_verification_expires` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `address`, `city`, `state`, `zip_code`, `role`, `is_active`, `email_verified`, `created_at`, `updated_at`, `email_verification_token`, `email_verification_expires`) VALUES
(1, 'admin', 'admin@antoinettes.com', '$2y$10$1DyuW6YdQqK.tAhHzfJy8.AaVdltnycowD4Gb2crbp6wJEAjuVqCG', 'Admin', 'User', NULL, NULL, NULL, NULL, NULL, 'admin', 1, 1, '2025-09-21 16:01:40', '2025-09-28 13:02:20', NULL, NULL),
(2, 'juan1999', 'juan1999@gmail.com', '$2y$10$wxnZ.ujO75DbbV4FbzfOGOfLKg4BXGZO2qjr4dvwxXfatH1.cI5FO', 'Juan', 'Cruz', '09918195487', NULL, NULL, NULL, NULL, 'customer', 1, 1, '2025-09-24 15:44:39', '2025-09-28 13:02:20', NULL, NULL),
(7, 'Juan', 'teronash23@gmail.com', '$2y$10$.wLheNcKs8jA1daj2dTmk.yqXO9rhiVJZ.x9IZx.dUkhh.Z8d62Lq', 'Juan', 'Cruz', '09918195487', NULL, NULL, NULL, NULL, 'customer', 1, 1, '2025-09-28 13:31:18', '2025-09-28 13:31:27', NULL, NULL),
(8, 'joe', 'joe@gmail.com', '$2y$10$.Oi91sWqa1vz3XqvwOo5Qec6WtCR/5VqpeqafqY7zv1ayKP7UGqSy', 'Joe', 'Joe', '09918195487', 'Brgy Putik', 'Zamboanga City', 'Zamboanga Del Sur', '7000', 'customer', 1, 0, '2025-10-16 16:05:41', '2025-10-16 16:16:47', '069bc0e463e32ce1c5f30cfc65ea2d2e1630407782ab5d85150cbf8347e43db8', '2025-10-17 10:05:41');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_orders_customer` (`customer_id`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_date` (`order_date`),
  ADD KEY `idx_orders_user` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order` (`order_id`),
  ADD KEY `idx_order_items_product` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_category` (`category`),
  ADD KEY `idx_products_active` (`is_active`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_verification_token` (`email_verification_token`),
  ADD KEY `idx_users_email_verified` (`email_verified`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
