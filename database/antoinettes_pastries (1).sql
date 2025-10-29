-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 29, 2025 at 05:53 PM
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
(2, 1, 'update_order_status', 'Updated order status from \'ready\' to \'completed\' for order ID 32', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 16:29:19');

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
(1, 11, 'user', 'Hello Admin', 1, '2025-10-28 14:41:19'),
(2, 11, 'user', 'Pwede po pa order ngayon ng pandesal?', 1, '2025-10-28 14:42:27'),
(3, 11, 'admin', 'Okay po Maam Matic', 1, '2025-10-28 14:45:41'),
(4, 12, 'user', 'Hello po open po kayo for delivery bukas?', 1, '2025-10-28 14:51:18'),
(5, 12, 'user', 'Need cakes po birthday sa party ng BF ko ito po number ko 09918195483', 1, '2025-10-28 14:52:01'),
(6, 12, 'admin', 'Yes Yes noted', 1, '2025-10-28 14:54:53'),
(7, 12, 'user', 'Thank you po..', 1, '2025-10-28 14:55:25'),
(8, 12, 'admin', '.', 1, '2025-10-28 14:59:17'),
(9, 12, 'admin', '.', 1, '2025-10-28 14:59:18'),
(10, 12, 'admin', '.', 1, '2025-10-28 14:59:18'),
(11, 12, 'admin', 'sd', 1, '2025-10-28 15:02:01'),
(12, 12, 'admin', 'sd', 1, '2025-10-28 15:02:02'),
(13, 12, 'admin', 'sd', 1, '2025-10-28 15:02:02'),
(14, 12, 'admin', 'sd', 1, '2025-10-28 15:02:03'),
(15, 12, 'admin', 's', 1, '2025-10-28 15:08:25'),
(16, 12, 'admin', 'das', 1, '2025-10-28 15:08:27'),
(17, 12, 'admin', 'asd', 1, '2025-10-28 15:08:28'),
(18, 12, 'admin', 'asd', 1, '2025-10-28 15:08:28'),
(19, 12, 'admin', 'asd', 1, '2025-10-28 15:08:28'),
(20, 12, 'admin', 'a', 1, '2025-10-28 15:08:29'),
(21, 12, 'admin', 'd', 1, '2025-10-28 15:08:31'),
(22, 12, 'user', 'hey are you ok?', 1, '2025-10-28 15:25:02'),
(23, 13, 'user', 'hi?', 1, '2025-10-29 06:05:54'),
(24, 13, 'admin', 'Hi po!', 1, '2025-10-29 06:06:15'),
(25, 13, 'user', 'hm df bound to Uganda', 1, '2025-10-29 06:06:31'),
(26, 13, 'admin', 'Kupal Ka', 1, '2025-10-29 06:06:36'),
(27, 13, 'user', 'Hot Croisant 100pcs', 1, '2025-10-29 06:06:41'),
(28, 13, 'user', 'mas kupal ka', 1, '2025-10-29 06:06:45'),
(29, 13, 'user', 'block na kita', 1, '2025-10-29 06:06:48'),
(30, 13, 'user', 'wala lasa tinapay nyo', 1, '2025-10-29 06:06:54'),
(31, 13, 'admin', 'Edi wow pangit mo', 1, '2025-10-29 06:07:11'),
(32, 13, 'user', 'magsara na kayo!!!!!!!!!!!!!!!!!!!!!!!!!!', 1, '2025-10-29 06:07:12'),
(33, 13, 'admin', 'Okay po', 1, '2025-10-29 06:07:36'),
(34, 12, 'user', 'Hello good evening', 1, '2025-10-29 16:24:20'),
(35, 12, 'admin', 'Hey', 1, '2025-10-29 16:24:36'),
(36, 12, 'user', 'I want to order', 1, '2025-10-29 16:24:49'),
(37, 12, 'admin', 'Kindly check ORD-20251029-5129 is ready napo', 1, '2025-10-29 16:27:15');

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
(1, 11, '2025-10-28 14:46:22', 0, 0),
(4, 12, '2025-10-29 16:27:19', 0, 0),
(23, 13, '2025-10-29 06:09:21', 0, 0);

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
(9, 11, NULL, 'ORD-20251018-0006', 30.00, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-18 16:51:43', NULL, 'Order total: ₱80.00 (Subtotal: ₱30.00, Delivery: ₱50.00)', '2025-10-18 16:51:43', '2025-10-18 16:51:43'),
(10, 11, NULL, 'ORD-20251019-8590', 5.00, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-19 12:10:43', NULL, 'Order total: ₱55.00 (Subtotal: ₱5.00, Delivery: ₱50.00)', '2025-10-19 12:10:43', '2025-10-19 12:10:43'),
(11, 11, NULL, 'ORD-20251026-3972', 180.00, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-26 15:39:35', NULL, 'Order total: ₱230.00 (Subtotal: ₱180.00, Delivery: ₱50.00)', '2025-10-26 15:39:35', '2025-10-26 15:39:35'),
(12, 13, NULL, 'ORD-20251029-0253', 3550.00, 'pending', 'pending', NULL, NULL, NULL, NULL, '2025-10-29 06:08:19', NULL, 'Order total: ₱3600.00 (Subtotal: ₱3550.00, Delivery: ₱50.00)', '2025-10-29 06:08:19', '2025-10-29 06:08:19'),
(13, 12, NULL, 'ORD-20251029-7331', 60.00, 'cancelled', 'paid', 'gcash', 'pi_kE7JDoHCGiiirQu3GWNt8b9P', 'cs_niS6S9H2hu6BkjsUzCZY5VNd', '2025-10-29 23:49:41', '2025-10-29 15:08:59', NULL, 'Order total: ₱60.00 (Subtotal: ₱10.00, Delivery: ₱50.00)', '2025-10-29 15:08:59', '2025-10-29 15:49:41'),
(14, 12, NULL, 'ORD-20251029-2929', 60.00, 'cancelled', 'pending', NULL, NULL, 'cs_rSyfS45jyY9fwCXoUHKLuLJw', NULL, '2025-10-29 15:11:01', NULL, 'Order total: ₱60.00 (Subtotal: ₱10.00, Delivery: ₱50.00)', '2025-10-29 15:11:01', '2025-10-29 15:18:39'),
(15, 12, NULL, 'ORD-20251029-8584', 60.00, 'cancelled', 'paid', 'gcash', 'pi_Erwt4JusGLErdxzNxaeEgCpr', 'cs_rW7AYL935gpeJFJM1hRNvCpo', '2025-10-29 23:49:40', '2025-10-29 15:13:41', NULL, 'Order total: ₱60.00 (Subtotal: ₱10.00, Delivery: ₱50.00)', '2025-10-29 15:13:41', '2025-10-29 15:49:40'),
(20, 12, NULL, 'ORD-20251029-5931', 60.00, 'cancelled', 'paid', 'gcash', 'pi_dvKV1XVASMoqgaXhvisgdrfX', 'cs_NjNLQ3yzYw7v6uRLmQNRnx95', '2025-10-29 23:49:39', '2025-10-29 15:35:03', NULL, 'Order total: ₱60.00 (Subtotal: ₱10.00, Delivery: ₱50.00)', '2025-10-29 15:35:03', '2025-10-29 15:49:39'),
(21, 12, NULL, 'ORD-20251029-6147', 60.00, 'cancelled', 'paid', 'gcash', 'pi_K9dQWNqymKrhdTeaRFNsYYRv', 'cs_txnyW5WfUPCuQeXSjEAuNdYk', '2025-10-29 23:49:38', '2025-10-29 15:38:47', NULL, 'Order total: ₱60.00 (Subtotal: ₱10.00, Delivery: ₱50.00)', '2025-10-29 15:38:47', '2025-10-29 15:49:38'),
(22, 12, NULL, 'ORD-20251029-3189', 60.00, 'cancelled', 'paid', 'gcash', 'pi_mP7RKKHpiV3j47aKcqMejUaR', 'cs_oKVx5VxZpbE3bhsZFGNnmdYu', '2025-10-29 23:49:38', '2025-10-29 15:41:46', NULL, 'Order total: ₱60.00 (Subtotal: ₱10.00, Delivery: ₱50.00)', '2025-10-29 15:41:46', '2025-10-29 15:49:38'),
(23, 12, NULL, 'ORD-20251029-6028', 60.00, 'cancelled', 'paid', 'gcash', 'pi_fgJNmGgMpVX9rySh26Wpmcns', 'cs_2RiAimKPvBbLkk3QRBR4KpPu', '2025-10-29 23:49:37', '2025-10-29 15:44:53', NULL, 'Order total: ₱60.00 (Subtotal: ₱10.00, Delivery: ₱50.00)', '2025-10-29 15:44:53', '2025-10-29 15:49:37'),
(24, 12, NULL, 'ORD-20251029-1593', 60.00, 'cancelled', 'paid', 'gcash', 'pi_ijE5xVTeCZVPXPXeEkXuhpxS', 'cs_8rrfdXBrc7RFaxD5ZhuF76Bb', '2025-10-29 23:49:36', '2025-10-29 15:46:46', NULL, 'Order total: ₱60.00 (Subtotal: ₱10.00, Delivery: ₱50.00)', '2025-10-29 15:46:46', '2025-10-29 16:02:04'),
(25, 12, NULL, 'ORD-20251029-3231', 60.00, 'cancelled', 'paid', 'gcash', 'pi_catKm6htcLCworkThGc39LCZ', 'cs_ceaei5tjz8NB8NWyp5N2YQj8', '2025-10-29 23:49:35', '2025-10-29 15:49:02', NULL, 'Order total: ₱60.00 (Subtotal: ₱10.00, Delivery: ₱50.00)', '2025-10-29 15:49:02', '2025-10-29 16:01:58'),
(26, 12, NULL, 'ORD-20251029-4395', 80.00, 'cancelled', 'paid', 'gcash', 'pi_z1uKPAASzvMnhTuNGb9c4qCp', 'cs_pvVPLDWqxZJoHdqkJhZBwt88', '2025-10-29 23:58:16', '2025-10-29 15:50:05', NULL, 'Order total: ₱80.00 (Subtotal: ₱30.00, Delivery: ₱50.00)', '2025-10-29 15:50:05', '2025-10-29 16:02:02'),
(27, 12, NULL, 'ORD-20251029-6230', 110.00, 'cancelled', 'paid', 'gcash', 'pi_HYVK6qxkx1JTb5GVphhno5xk', 'cs_YintzbTHvtDjrQLufkGpm1tk', '2025-10-29 23:58:15', '2025-10-29 15:52:32', NULL, 'Order total: ₱110.00 (Subtotal: ₱60.00, Delivery: ₱50.00)', '2025-10-29 15:52:32', '2025-10-29 16:01:55'),
(28, 12, NULL, 'ORD-20251029-0411', 110.00, 'cancelled', 'paid', 'gcash', 'pi_M9rQitqkGwqZ8gxok9LMPvc7', 'cs_3UgTJ2pyfnrinoVTNTV2gGT9', '2025-10-29 23:54:12', '2025-10-29 15:53:53', NULL, 'Order total: ₱110.00 (Subtotal: ₱60.00, Delivery: ₱50.00)', '2025-10-29 15:53:53', '2025-10-29 16:01:54'),
(29, 12, NULL, 'ORD-20251029-9306', 90.00, 'cancelled', 'paid', 'gcash', 'pi_5wa84kWNDxuzinFThUYVgz34', 'cs_n9oWePuWHEedJB8HMo6ueqot', '2025-10-29 23:59:06', '2025-10-29 15:58:43', NULL, 'Order total: ₱90.00 (Subtotal: ₱40.00, Delivery: ₱50.00)', '2025-10-29 15:58:43', '2025-10-29 16:01:50'),
(30, 12, NULL, 'ORD-20251029-0576', 60.00, 'cancelled', 'paid', 'gcash', 'pi_mDdCKUfMuHnQkLDZPnmb12EF', 'cs_r1ucNisLZ3pA9ghYcvqYc8mn', '2025-10-30 00:03:12', '2025-10-29 16:02:20', NULL, 'Order total: ₱60.00 (Subtotal: ₱10.00, Delivery: ₱50.00)', '2025-10-29 16:02:20', '2025-10-29 16:05:39'),
(31, 12, NULL, 'ORD-20251029-5129', 80.00, 'completed', 'paid', 'gcash', 'pi_1F57fqF8EnxXzCmKmnUfZLLc', 'cs_q8kfQ3Se4hHp2N9612rsYGx4', '2025-10-30 00:06:25', '2025-10-29 16:05:50', NULL, 'Order total: ₱80.00 (Subtotal: ₱30.00, Delivery: ₱50.00)', '2025-10-29 16:05:50', '2025-10-29 16:29:03'),
(32, 12, NULL, 'ORD-20251029-6984', 60.00, 'completed', 'paid', 'gcash', 'pi_K5NctEShY2wCFUupgAUCHdWi', 'cs_Mr76KAgDkhDgqUuT1rhhh1JC', '2025-10-30 00:21:20', '2025-10-29 16:20:24', NULL, 'Order total: ₱60.00 (Subtotal: ₱10.00, Delivery: ₱50.00)', '2025-10-29 16:20:24', '2025-10-29 16:29:19');

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
(15, 9, 19, NULL, 15, 2.00, 30.00, '2025-10-18 16:51:43'),
(16, 10, 19, NULL, 2, 2.50, 5.00, '2025-10-19 12:10:43'),
(17, 11, 23, NULL, 1, 15.00, 15.00, '2025-10-26 15:39:35'),
(18, 11, 22, NULL, 1, 150.00, 150.00, '2025-10-26 15:39:35'),
(19, 11, 21, NULL, 1, 10.00, 10.00, '2025-10-26 15:39:35'),
(20, 11, 20, NULL, 1, 5.00, 5.00, '2025-10-26 15:39:35'),
(21, 12, 22, NULL, 22, 150.00, 3300.00, '2025-10-29 06:08:19'),
(22, 12, 21, NULL, 3, 10.00, 30.00, '2025-10-29 06:08:19'),
(23, 12, 21, NULL, 22, 10.00, 220.00, '2025-10-29 06:08:19'),
(24, 13, 21, NULL, 1, 10.00, 10.00, '2025-10-29 15:08:59'),
(25, 14, 21, NULL, 1, 10.00, 10.00, '2025-10-29 15:11:01'),
(26, 15, 21, NULL, 1, 10.00, 10.00, '2025-10-29 15:13:41'),
(31, 20, 21, NULL, 1, 10.00, 10.00, '2025-10-29 15:35:03'),
(32, 21, 21, NULL, 1, 10.00, 10.00, '2025-10-29 15:38:47'),
(33, 22, 21, NULL, 1, 10.00, 10.00, '2025-10-29 15:41:46'),
(34, 23, 21, NULL, 1, 10.00, 10.00, '2025-10-29 15:44:53'),
(35, 24, 21, NULL, 1, 10.00, 10.00, '2025-10-29 15:46:46'),
(36, 25, 21, NULL, 1, 10.00, 10.00, '2025-10-29 15:49:02'),
(37, 26, 20, NULL, 1, 30.00, 30.00, '2025-10-29 15:50:05'),
(38, 27, 20, NULL, 2, 30.00, 60.00, '2025-10-29 15:52:32'),
(39, 28, 20, NULL, 2, 30.00, 60.00, '2025-10-29 15:53:53'),
(40, 29, 21, NULL, 1, 10.00, 10.00, '2025-10-29 15:58:44'),
(41, 29, 20, NULL, 1, 30.00, 30.00, '2025-10-29 15:58:44'),
(42, 30, 21, NULL, 1, 10.00, 10.00, '2025-10-29 16:02:20'),
(43, 31, 20, NULL, 1, 30.00, 30.00, '2025-10-29 16:05:50'),
(44, 32, 21, NULL, 1, 10.00, 10.00, '2025-10-29 16:20:24');

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
(11, 'taylor', 'taylo@gmail.com', '$2y$10$grPoBXqNUwYywkrhfRGw7egC/5kgupEsLyckK6vMDWmN0onR546zK', 'Taylor', 'Swift', '09918195472', 'Tomas Claudio Street', 'Zamboanga City', 'PC', '7000', 'customer', 1, 1, '2025-10-18 16:30:05', '2025-10-18 16:50:56', NULL, NULL),
(12, 'katy', 'kat2016@gmail.com', '$2y$10$tR.DlgB5ZPtJThTrrA6vDeHS.NfTXFSrqqUcyGzqoWoLPHEHW1aXa', 'Katy', 'Perry', '09918195481', 'Golden Valley Drive', 'Zamboanga City', 'Sta. Maria', '7000', 'customer', 1, 1, '2025-10-28 14:50:41', '2025-10-28 14:50:41', NULL, NULL),
(13, 'ame', 'akosilid@gmail.com', '$2y$10$y1VJi.IHrIYj7EgQ4Hnvju5qX4LYHxAW3ld8bVXfqkRxUFm.TVBRa', 'Ame', 'Lia', '09304097583', 'San. roque green hills drive near church', 'zamboanga', 'calarian', '7000', 'customer', 1, 1, '2025-10-29 06:05:33', '2025-10-29 06:05:33', NULL, NULL);

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
(69, 13, 'ff8072a8cb5cb17323031848d9248b2252fbb7748e67da145391a23afaaa8171', '2025-11-04 23:05:42', '2025-10-29 06:05:42'),
(71, 1, '66644466c60ab7a39772d37ec4b7795ad24730c8a72c5ccde71386a2299ab1cd', '2025-11-04 23:35:52', '2025-10-29 06:35:52'),
(72, 1, '4687fe602896e03926b104676a6932682d549868b0c0ba2cbba208cb2a7ed294', '2025-11-05 01:16:51', '2025-10-29 08:16:51'),
(76, 1, '904d019dcd1b2db1840082aec69a5fe5878c136ec6ae60464cf59bd9c3c0ebe0', '2025-11-05 02:13:47', '2025-10-29 09:13:47'),
(84, 1, '4d21bab8f26113e0dd428c549419fbf1ca08a031caf10b1f2eecff4ad3bc2a7d', '2025-11-05 09:18:48', '2025-10-29 16:18:48'),
(85, 12, '144a258e9db9892312b4575225e8e7bc6824543d888da52c45b15ec010054e7e', '2025-11-05 09:19:52', '2025-10-29 16:19:52');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

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
