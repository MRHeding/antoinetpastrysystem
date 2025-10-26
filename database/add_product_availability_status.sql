-- Migration script to add availability status field to products table
-- This adds a dedicated status field for product availability management

USE antoinettes_pastries;

-- Add availability_status field to products table
ALTER TABLE `products` 
ADD COLUMN `availability_status` ENUM('available', 'unavailable') NOT NULL DEFAULT 'available' AFTER `is_active`,
ADD COLUMN `unavailable_reason` VARCHAR(255) DEFAULT NULL AFTER `availability_status`,
ADD COLUMN `status_updated_at` TIMESTAMP NULL DEFAULT NULL AFTER `unavailable_reason`,
ADD COLUMN `status_updated_by` INT(11) DEFAULT NULL AFTER `status_updated_at`;

-- Add foreign key constraint for status_updated_by
ALTER TABLE `products` 
ADD CONSTRAINT `fk_products_status_updated_by` 
FOREIGN KEY (`status_updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- Create audit log table for status changes
CREATE TABLE `product_status_audit` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `product_id` INT(11) NOT NULL,
  `old_status` ENUM('available', 'unavailable') DEFAULT NULL,
  `new_status` ENUM('available', 'unavailable') NOT NULL,
  `reason` VARCHAR(255) DEFAULT NULL,
  `changed_by` INT(11) NOT NULL,
  `changed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_product_status_audit_product_id` (`product_id`),
  INDEX `idx_product_status_audit_changed_at` (`changed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Update existing products to have 'available' status by default
UPDATE `products` SET `availability_status` = 'available' WHERE `is_active` = 1;
UPDATE `products` SET `availability_status` = 'unavailable' WHERE `is_active` = 0;

-- Add index for better query performance
ALTER TABLE `products` ADD INDEX `idx_availability_status` (`availability_status`);

COMMIT;