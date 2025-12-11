-- Update orders table to reference users instead of customers
-- This fixes the database structure mismatch

-- First, add user_id column to orders table
ALTER TABLE `orders` ADD COLUMN `user_id` int(11) DEFAULT NULL AFTER `id`;

-- Add foreign key constraint for user_id
ALTER TABLE `orders` ADD CONSTRAINT `orders_ibfk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- Add index for user_id
ALTER TABLE `orders` ADD KEY `idx_orders_user` (`user_id`);

-- Note: The existing customer_id column and constraint will remain for backward compatibility
-- but new orders should use user_id instead
