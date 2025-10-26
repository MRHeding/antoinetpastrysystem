-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 26, 2025 at 05:33 PM
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
(9, 11, NULL, 'ORD-20251018-0006', 30.00, 'pending', '2025-10-18 16:51:43', NULL, 'Order total: ₱80.00 (Subtotal: ₱30.00, Delivery: ₱50.00)', '2025-10-18 16:51:43', '2025-10-18 16:51:43'),
(10, 11, NULL, 'ORD-20251019-8590', 5.00, 'pending', '2025-10-19 12:10:43', NULL, 'Order total: ₱55.00 (Subtotal: ₱5.00, Delivery: ₱50.00)', '2025-10-19 12:10:43', '2025-10-19 12:10:43'),
(11, 11, NULL, 'ORD-20251026-3972', 180.00, 'pending', '2025-10-26 15:39:35', NULL, 'Order total: ₱230.00 (Subtotal: ₱180.00, Delivery: ₱50.00)', '2025-10-26 15:39:35', '2025-10-26 15:39:35');

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
(15, 9, 19, 15, 2.00, 30.00, '2025-10-18 16:51:43'),
(16, 10, 19, 2, 2.50, 5.00, '2025-10-19 12:10:43'),
(17, 11, 23, 1, 15.00, 15.00, '2025-10-26 15:39:35'),
(18, 11, 22, 1, 150.00, 150.00, '2025-10-26 15:39:35'),
(19, 11, 21, 1, 10.00, 10.00, '2025-10-26 15:39:35'),
(20, 11, 20, 1, 5.00, 5.00, '2025-10-26 15:39:35');

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
(22, 'Banana Cake', 'Our very delicious banana cake', 150.00, 'Cakes', 'M', 'uploads/products/1760877245_Banan.jpg', 1, 'available', NULL, NULL, NULL, '2025-10-19 12:34:05', '2025-10-19 12:34:05'),
(23, 'Choco Cookie', 'Choco cookie delicious and yummy', 15.00, 'Cookies', 'M', 'uploads/products/1760877326_images.jpg', 1, 'unavailable', 'No stock', '2025-10-26 16:18:54', 1, '2025-10-19 12:35:26', '2025-10-26 16:18:54');

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
(1, 23, 'available', 'unavailable', 'No stock', 1, '2025-10-26 16:18:54');

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
(11, 'taylor', 'taylo@gmail.com', '$2y$10$grPoBXqNUwYywkrhfRGw7egC/5kgupEsLyckK6vMDWmN0onR546zK', 'Taylor', 'Swift', '09918195472', 'Tomas Claudio Street', 'Zamboanga City', 'PC', '7000', 'customer', 1, 1, '2025-10-18 16:30:05', '2025-10-18 16:50:56', NULL, NULL);

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
(25, 1, 'd4e8974c88911f51d70c8eacdca6fbd19245d9496188a46764a51dd4284059d0', '2025-10-25 02:59:48', '2025-10-18 08:59:48');

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
  ADD KEY `idx_products_active` (`is_active`),
  ADD KEY `idx_size` (`size`),
  ADD KEY `fk_products_status_updated_by` (`status_updated_by`),
  ADD KEY `idx_availability_status` (`availability_status`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `product_status_audit`
--
ALTER TABLE `product_status_audit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

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
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_status_updated_by` FOREIGN KEY (`status_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
