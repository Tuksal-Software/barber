-- MySQL Collation Fix Script - WITH FOREIGN KEY HANDLING
-- Use this if you get foreign key constraint errors
-- Run this in MySQL client / phpMyAdmin / DataGrip
-- Make sure you're connected to the correct database first

-- STEP 1: Check current collation status
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  CHARACTER_SET_NAME,
  COLLATION_NAME,
  COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('appointment_requests','ledger_entries','barbers','appointment_slots','working_hours')
  AND COLLATION_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

-- STEP 2: Drop foreign key constraints temporarily
ALTER TABLE `working_hours` DROP FOREIGN KEY IF EXISTS `working_hours_barberId_fkey`;
ALTER TABLE `appointment_requests` DROP FOREIGN KEY IF EXISTS `appointment_requests_barberId_fkey`;
ALTER TABLE `appointment_slots` DROP FOREIGN KEY IF EXISTS `appointment_slots_barberId_fkey`;
ALTER TABLE `appointment_slots` DROP FOREIGN KEY IF EXISTS `appointment_slots_appointmentRequestId_fkey`;
ALTER TABLE `ledger_entries` DROP FOREIGN KEY IF EXISTS `ledger_entries_barberId_fkey`;
ALTER TABLE `ledger_entries` DROP FOREIGN KEY IF EXISTS `ledger_entries_appointmentRequestId_fkey`;

-- STEP 3: Convert all tables
ALTER TABLE `barbers` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `working_hours` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `appointment_requests` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `appointment_slots` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `ledger_entries` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- STEP 4: Fix all columns (order matters: referenced columns first)
-- barbers.id (referenced by all)
ALTER TABLE `barbers`
  MODIFY `id` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- appointment_requests.id (referenced by appointment_slots and ledger_entries)
ALTER TABLE `appointment_requests`
  MODIFY `id` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `barberId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `date` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `requestedStartTime` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `requestedEndTime` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- working_hours
ALTER TABLE `working_hours`
  MODIFY `barberId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- appointment_slots
ALTER TABLE `appointment_slots`
  MODIFY `id` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `barberId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `appointmentRequestId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `date` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `startTime` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `endTime` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ledger_entries
ALTER TABLE `ledger_entries`
  MODIFY `id` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `barberId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `appointmentRequestId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `date` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `customerName` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `description` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- STEP 5: Recreate foreign key constraints
ALTER TABLE `working_hours`
  ADD CONSTRAINT `working_hours_barberId_fkey` 
  FOREIGN KEY (`barberId`) REFERENCES `barbers`(`id`) ON DELETE CASCADE;

ALTER TABLE `appointment_requests`
  ADD CONSTRAINT `appointment_requests_barberId_fkey` 
  FOREIGN KEY (`barberId`) REFERENCES `barbers`(`id`) ON DELETE CASCADE;

ALTER TABLE `appointment_slots`
  ADD CONSTRAINT `appointment_slots_barberId_fkey` 
  FOREIGN KEY (`barberId`) REFERENCES `barbers`(`id`) ON DELETE CASCADE;

ALTER TABLE `appointment_slots`
  ADD CONSTRAINT `appointment_slots_appointmentRequestId_fkey` 
  FOREIGN KEY (`appointmentRequestId`) REFERENCES `appointment_requests`(`id`) ON DELETE SET NULL;

ALTER TABLE `ledger_entries`
  ADD CONSTRAINT `ledger_entries_barberId_fkey` 
  FOREIGN KEY (`barberId`) REFERENCES `barbers`(`id`) ON DELETE CASCADE;

ALTER TABLE `ledger_entries`
  ADD CONSTRAINT `ledger_entries_appointmentRequestId_fkey` 
  FOREIGN KEY (`appointmentRequestId`) REFERENCES `appointment_requests`(`id`) ON DELETE SET NULL;

-- STEP 6: Verify: No 0900 should remain (should return 0 rows)
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  COLLATION_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('appointment_requests','ledger_entries','barbers','appointment_slots','working_hours')
  AND COLLATION_NAME LIKE '%0900%';


