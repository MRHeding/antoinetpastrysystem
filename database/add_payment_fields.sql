-- Add payment tracking fields to orders table
-- This migration adds support for PayMongo payment integration

ALTER TABLE `orders` 
ADD COLUMN `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending' AFTER `status`,
ADD COLUMN `payment_method` VARCHAR(50) NULL AFTER `payment_status`,
ADD COLUMN `payment_intent_id` VARCHAR(255) NULL AFTER `payment_method`,
ADD COLUMN `paymongo_checkout_id` VARCHAR(255) NULL AFTER `payment_intent_id`,
ADD COLUMN `paid_at` DATETIME NULL AFTER `paymongo_checkout_id`;

-- Add indexes for better query performance
ALTER TABLE `orders` 
ADD INDEX `idx_payment_status` (`payment_status`),
ADD INDEX `idx_paymongo_checkout_id` (`paymongo_checkout_id`);

