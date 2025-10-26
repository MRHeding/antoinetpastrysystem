-- Add size field to products table
-- This script adds a size column to store product size information

USE `antoinettes_pastries`;

-- Add size column to products table
ALTER TABLE `products` 
ADD COLUMN `size` ENUM('S', 'M', 'L', 'XL') DEFAULT 'M' AFTER `category`;

-- Update existing products to have a default size
UPDATE `products` SET `size` = 'M' WHERE `size` IS NULL;

-- Add index for better performance on size queries
ALTER TABLE `products` ADD INDEX `idx_size` (`size`);

-- Verify the changes
DESCRIBE `products`;