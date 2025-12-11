-- Insert sample orders for testing
-- This script adds sample orders to test the orders functionality

-- First, ensure we have some sample orders
INSERT INTO `orders` (`id`, `user_id`, `customer_id`, `order_number`, `total_amount`, `status`, `order_date`, `pickup_date`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, 'ORD-20250101-0001', 15.50, 'completed', '2025-01-01 10:30:00', '2025-01-01', 'Please make sure the croissants are fresh', '2025-01-01 10:30:00', '2025-01-01 10:30:00'),
(2, 2, NULL, 'ORD-20250102-0002', 28.00, 'preparing', '2025-01-02 14:15:00', '2025-01-03', 'Birthday cake for my daughter', '2025-01-02 14:15:00', '2025-01-02 14:15:00'),
(3, 7, NULL, 'ORD-20250103-0003', 8.75, 'ready', '2025-01-03 09:45:00', '2025-01-03', NULL, '2025-01-03 09:45:00', '2025-01-03 09:45:00'),
(4, 2, NULL, 'ORD-20250104-0004', 12.00, 'pending', '2025-01-04 16:20:00', '2025-01-05', 'Gluten-free options please', '2025-01-04 16:20:00', '2025-01-04 16:20:00'),
(5, 7, NULL, 'ORD-20250105-0005', 6.50, 'cancelled', '2025-01-05 11:10:00', '2025-01-05', 'Changed my mind', '2025-01-05 11:10:00', '2025-01-05 11:10:00');

-- Insert sample order items
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `total_price`, `created_at`) VALUES
-- Order 1 items
(1, 1, 1, 2, 3.50, 7.00, '2025-01-01 10:30:00'),
(2, 1, 5, 3, 2.50, 7.50, '2025-01-01 10:30:00'),
(3, 1, 8, 1, 4.50, 4.50, '2025-01-01 10:30:00'),

-- Order 2 items
(4, 2, 4, 1, 28.00, 28.00, '2025-01-02 14:15:00'),

-- Order 3 items
(5, 3, 2, 1, 4.25, 4.25, '2025-01-03 09:45:00'),
(6, 3, 3, 1, 4.50, 4.50, '2025-01-03 09:45:00'),

-- Order 4 items
(7, 4, 5, 4, 2.50, 10.00, '2025-01-04 16:20:00'),
(8, 4, 9, 1, 3.75, 3.75, '2025-01-04 16:20:00'),

-- Order 5 items
(9, 5, 6, 1, 6.50, 6.50, '2025-01-05 11:10:00');
