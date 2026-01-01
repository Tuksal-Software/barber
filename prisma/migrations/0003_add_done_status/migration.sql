ALTER TABLE `appointment_requests` MODIFY COLUMN `status` ENUM('pending', 'approved', 'rejected', 'cancelled', 'done') NOT NULL DEFAULT 'pending';

