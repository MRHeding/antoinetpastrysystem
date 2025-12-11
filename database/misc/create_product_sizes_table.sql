-- Create product_sizes table to support different sizes with different prices
-- This allows each product to have multiple size options with unique pricing

-- Drop existing table if it exists
DROP TABLE IF EXISTS `product_sizes`;

-- Create product_sizes table
CREATE TABLE `product_sizes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `size_name` varchar(50) NOT NULL COMMENT 'Display name for the size (e.g., Small, Medium, Large)',
  `size_code` varchar(10) NOT NULL COMMENT 'Short code for the size (e.g., S, M, L, XL)',
  `price` decimal(10,2) NOT NULL COMMENT 'Price for this specific size',
  `is_available` tinyint(1) DEFAULT 1 COMMENT 'Whether this size is currently available',
  `sort_order` int(11) DEFAULT 0 COMMENT 'Order to display sizes (smaller number = first)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_size_code` (`size_code`),
  KEY `idx_availability` (`is_available`),
  CONSTRAINT `fk_product_sizes_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add size column to order_items to track which size was ordered
ALTER TABLE `order_items` 
ADD COLUMN `size_code` varchar(10) DEFAULT NULL COMMENT 'Size code that was ordered' AFTER `product_id`,
ADD KEY `idx_size_code` (`size_code`);

-- Insert sample sizes for existing products
-- Note: Adjust these based on your actual product IDs
INSERT INTO `product_sizes` (`product_id`, `size_name`, `size_code`, `price`, `is_available`, `sort_order`) VALUES
-- Hot Pandesal (product_id: 19)
(19, 'Small (6 pcs)', 'S', 15.00, 1, 1),
(19, 'Medium (12 pcs)', 'M', 25.00, 1, 2),
(19, 'Large (24 pcs)', 'L', 45.00, 1, 3),

-- Pandesal Choco (product_id: 20)
(20, 'Small (6 pcs)', 'S', 30.00, 1, 1),
(20, 'Medium (12 pcs)', 'M', 55.00, 1, 2),
(20, 'Large (24 pcs)', 'L', 100.00, 1, 3),

-- Hot Croissant (product_id: 21)
(21, 'Single', 'S', 10.00, 1, 1),
(21, 'Box of 6', 'M', 55.00, 1, 2),
(21, 'Box of 12', 'L', 100.00, 1, 3),

-- Banana Cake (product_id: 22)
(22, 'Small (6 inches)', 'S', 100.00, 1, 1),
(22, 'Medium (8 inches)', 'M', 150.00, 1, 2),
(22, 'Large (10 inches)', 'L', 200.00, 1, 3),
(22, 'Extra Large (12 inches)', 'XL', 280.00, 1, 4),

-- Choco Cookie (product_id: 23)
(23, 'Small (6 pcs)', 'S', 50.00, 1, 1),
(23, 'Medium (12 pcs)', 'M', 90.00, 1, 2),
(23, 'Large (24 pcs)', 'L', 160.00, 1, 3);

-- Note: The 'size' column in the products table can remain for backward compatibility
-- or as a default/suggested size indicator

