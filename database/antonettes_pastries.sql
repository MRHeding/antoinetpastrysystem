-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 30, 2025 at 01:42 PM
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
-- Database: `antonettes_pastries`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `action_description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`id`, `user_id`, `action`, `action_description`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'update_order_status', 'Updated order status from \'ready\' to \'completed\' for order ID 31', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 16:29:03'),
(2, 1, 'update_order_status', 'Updated order status from \'ready\' to \'completed\' for order ID 32', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 16:29:19'),
(3, 1, 'update_order_status', 'Updated order status from \'pending\' to \'preparing\' for order ID 34', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-10-30 12:34:34');

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
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `sender_type` enum('user','admin') NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `user_id`, `sender_type`, `message`, `is_read`, `created_at`) VALUES
(38, 14, 'user', 'Hello po good evening ma\'am/sir need ko po yung delivery mamaya around 9pm if pwede po', 1, '2025-10-30 12:35:40'),
(39, 14, 'admin', 'Yes po noted', 1, '2025-10-30 12:36:05');

-- --------------------------------------------------------

--
-- Table structure for table `chat_sessions`
--

CREATE TABLE `chat_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `last_message_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `unread_admin_count` int(11) DEFAULT 0,
  `unread_user_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_sessions`
--

INSERT INTO `chat_sessions` (`id`, `user_id`, `last_message_at`, `unread_admin_count`, `unread_user_count`) VALUES
(38, 14, '2025-10-30 12:36:08', 0, 0);

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
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_intent_id` varchar(255) DEFAULT NULL,
  `paymongo_checkout_id` varchar(255) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `pickup_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `customer_id`, `order_number`, `total_amount`, `status`, `payment_status`, `payment_method`, `payment_intent_id`, `paymongo_checkout_id`, `paid_at`, `order_date`, `pickup_date`, `notes`, `created_at`, `updated_at`) VALUES
(33, 14, NULL, 'ORD-20251030-8589', 370.00, 'cancelled', 'pending', NULL, NULL, 'cs_QaF5XyRSr95MUPUsjYNCoVrf', NULL, '2025-10-30 12:31:28', NULL, 'Order total: ₱370.00 (Subtotal: ₱320.00, Delivery: ₱50.00)', '2025-10-30 12:31:28', '2025-10-30 12:31:53'),
(34, 14, NULL, 'ORD-20251030-7737', 370.00, 'preparing', 'paid', 'gcash', 'pi_EeeKTbGw6cbHK8qBeLQGiFT7', 'cs_SjAc37wwGz3dG6DqzytPZBex', '2025-10-30 20:33:28', '2025-10-30 12:32:25', NULL, 'Order total: ₱370.00 (Subtotal: ₱320.00, Delivery: ₱50.00)', '2025-10-30 12:32:25', '2025-10-30 12:34:34');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size_code` varchar(10) DEFAULT NULL COMMENT 'Size code that was ordered',
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `size_code`, `quantity`, `unit_price`, `total_price`, `created_at`) VALUES
(45, 33, 23, NULL, 2, 160.00, 320.00, '2025-10-30 12:31:28'),
(46, 34, 23, NULL, 2, 160.00, 320.00, '2025-10-30 12:32:25');

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
  `size` enum('S','M','L','XL') DEFAULT 'M',
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `availability_status` enum('available','unavailable') NOT NULL DEFAULT 'available',
  `unavailable_reason` varchar(255) DEFAULT NULL,
  `status_updated_at` timestamp NULL DEFAULT NULL,
  `status_updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `category`, `size`, `image_url`, `is_active`, `availability_status`, `unavailable_reason`, `status_updated_at`, `status_updated_by`, `created_at`, `updated_at`) VALUES
(19, 'Hot Pandesal', 'Our best hot pandesal best combine with hot coffee the best in town', 2.50, 'Bread', 'M', 'uploads/products/1760778180_images (6).jpg', 0, 'unavailable', NULL, NULL, NULL, '2025-10-18 09:03:00', '2025-10-26 16:09:32'),
(20, 'Pandesal Choco', 'Our Best Selling Pandesal', 5.00, 'Bread', 'M', 'uploads/products/1760876922_PandeSalcopy.jpg', 1, 'available', NULL, NULL, NULL, '2025-10-19 12:28:42', '2025-10-19 12:29:54'),
(21, 'Hot Croissant', 'Buttery, flaky, crescent-shaped French pastry made from a laminated yeast', 10.00, 'Croissants', 'M', 'uploads/products/1760877121_Vegan-Croissants-1.jpg', 1, 'available', NULL, NULL, NULL, '2025-10-19 12:32:01', '2025-10-19 12:32:01'),
(22, 'Banana Cake', 'Our very delicious banana cake', 150.00, 'Cakes', 'M', 'uploads/products/1760877245_Banan.jpg', 1, 'unavailable', 'no stock', '2025-10-29 06:09:01', 1, '2025-10-19 12:34:05', '2025-10-29 06:09:01'),
(23, 'Choco Cookie', 'Choco cookie delicious and yummy', 15.00, 'Cookies', 'M', 'uploads/products/1760877326_images.jpg', 1, 'available', NULL, '2025-10-29 16:29:40', 1, '2025-10-19 12:35:26', '2025-10-29 16:29:40');

-- --------------------------------------------------------

--
-- Table structure for table `product_sizes`
--

CREATE TABLE `product_sizes` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size_name` varchar(50) NOT NULL COMMENT 'Display name for the size (e.g., Small, Medium, Large)',
  `size_code` varchar(10) NOT NULL COMMENT 'Short code for the size (e.g., S, M, L, XL)',
  `price` decimal(10,2) NOT NULL COMMENT 'Price for this specific size',
  `is_available` tinyint(1) DEFAULT 1 COMMENT 'Whether this size is currently available',
  `sort_order` int(11) DEFAULT 0 COMMENT 'Order to display sizes (smaller number = first)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_sizes`
--

INSERT INTO `product_sizes` (`id`, `product_id`, `size_name`, `size_code`, `price`, `is_available`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 19, 'Small (6 pcs)', 'S', 15.00, 1, 1, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(2, 19, 'Medium (12 pcs)', 'M', 25.00, 1, 2, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(3, 19, 'Large (24 pcs)', 'L', 45.00, 1, 3, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(4, 20, 'Small (6 pcs)', 'S', 30.00, 1, 1, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(5, 20, 'Medium (12 pcs)', 'M', 55.00, 1, 2, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(6, 20, 'Large (24 pcs)', 'L', 100.00, 1, 3, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(7, 21, 'Single', 'S', 10.00, 1, 1, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(8, 21, 'Box of 6', 'M', 55.00, 1, 2, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(9, 21, 'Box of 12', 'L', 100.00, 1, 3, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(10, 22, 'Small (6 inches)', 'S', 100.00, 1, 1, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(11, 22, 'Medium (8 inches)', 'M', 150.00, 1, 2, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(12, 22, 'Large (10 inches)', 'L', 200.00, 1, 3, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(13, 22, 'Extra Large (12 inches)', 'XL', 280.00, 1, 4, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(14, 23, 'Small (6 pcs)', 'S', 50.00, 1, 1, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(15, 23, 'Medium (12 pcs)', 'M', 90.00, 1, 2, '2025-10-29 08:25:33', '2025-10-29 08:25:33'),
(16, 23, 'Large (24 pcs)', 'L', 160.00, 1, 3, '2025-10-29 08:25:33', '2025-10-29 08:25:33');

-- --------------------------------------------------------

--
-- Table structure for table `product_status_audit`
--

CREATE TABLE `product_status_audit` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `old_status` enum('available','unavailable') DEFAULT NULL,
  `new_status` enum('available','unavailable') NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `changed_by` int(11) NOT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_status_audit`
--

INSERT INTO `product_status_audit` (`id`, `product_id`, `old_status`, `new_status`, `reason`, `changed_by`, `changed_at`) VALUES
(1, 23, 'available', 'unavailable', 'No stock', 1, '2025-10-26 16:18:54'),
(2, 22, 'available', 'unavailable', 'no stock', 1, '2025-10-29 06:09:01'),
(3, 23, 'unavailable', 'available', NULL, 1, '2025-10-29 16:29:40');

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
(1, 'admin', 'admin@antoinettes.com', '$2y$10$1DyuW6YdQqK.tAhHzfJy8.AaVdltnycowD4Gb2crbp6wJEAjuVqCG', 'TestFirstName', 'TestLastName', '1234567890', 'Test Address', 'Test City', 'Test State', '12345', 'admin', 1, 1, '2025-09-21 16:01:40', '2025-10-18 16:40:07', NULL, NULL),
(14, 'test', 'testcustomer@gmail.com', '$2y$10$oO2sI/bt6FWi598gSnmKG.0Yp0vCJWmeFyE3QmNAjVlLzm1bqLCPi', 'test', 'customer', '09918195472', 'Peace Compound', 'Zamboanga City', 'Sinunuc', '7000', 'customer', 1, 1, '2025-10-30 12:26:08', '2025-10-30 12:26:08', NULL, NULL);

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
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `expires_at`, `created_at`) VALUES
(25, 1, 'd4e8974c88911f51d70c8eacdca6fbd19245d9496188a46764a51dd4284059d0', '2025-10-25 02:59:48', '2025-10-18 08:59:48'),
(71, 1, '66644466c60ab7a39772d37ec4b7795ad24730c8a72c5ccde71386a2299ab1cd', '2025-11-04 23:35:52', '2025-10-29 06:35:52'),
(72, 1, '4687fe602896e03926b104676a6932682d549868b0c0ba2cbba208cb2a7ed294', '2025-11-05 01:16:51', '2025-10-29 08:16:51'),
(76, 1, '904d019dcd1b2db1840082aec69a5fe5878c136ec6ae60464cf59bd9c3c0ebe0', '2025-11-05 02:13:47', '2025-10-29 09:13:47'),
(87, 1, 'e48e8f7bc556b598bfeb8f5476dab8b1ffa23bc64904da3ddb33f143eb6de175', '2025-11-06 05:26:47', '2025-10-30 12:26:47'),
(88, 14, '5ed12b38cd47a2f71da092b3cc727b187420a0e69b8f9ddb55ca6a319c8ebb8d', '2025-11-06 05:27:49', '2025-10-30 12:27:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_is_read` (`is_read`);

--
-- Indexes for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_last_message` (`last_message_at`);

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
  ADD KEY `idx_orders_user` (`user_id`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_paymongo_checkout_id` (`paymongo_checkout_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order` (`order_id`),
  ADD KEY `idx_order_items_product` (`product_id`),
  ADD KEY `idx_size_code` (`size_code`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_category` (`category`),
  ADD KEY `idx_products_active` (`is_active`),
  ADD KEY `idx_size` (`size`),
  ADD KEY `fk_products_status_updated_by` (`status_updated_by`),
  ADD KEY `idx_availability_status` (`availability_status`);

--
-- Indexes for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_size_code` (`size_code`),
  ADD KEY `idx_availability` (`is_available`);

--
-- Indexes for table `product_status_audit`
--
ALTER TABLE `product_status_audit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `changed_by` (`changed_by`),
  ADD KEY `idx_product_status_audit_product_id` (`product_id`),
  ADD KEY `idx_product_status_audit_changed_at` (`changed_at`);

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
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `product_sizes`
--
ALTER TABLE `product_sizes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `product_status_audit`
--
ALTER TABLE `product_status_audit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `fk_audit_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  ADD CONSTRAINT `chat_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_status_updated_by` FOREIGN KEY (`status_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD CONSTRAINT `fk_product_sizes_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_status_audit`
--
ALTER TABLE `product_status_audit`
  ADD CONSTRAINT `product_status_audit_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_status_audit_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
