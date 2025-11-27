-- Add image_path column to chat_messages table
ALTER TABLE `chat_messages` 
ADD COLUMN `image_path` VARCHAR(255) NULL DEFAULT NULL AFTER `message`;



