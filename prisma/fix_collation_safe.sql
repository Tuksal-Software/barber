-- MySQL Collation Fix Script - SAFE VERSION
-- Step-by-step approach to avoid foreign key errors
-- Run this in MySQL client / phpMyAdmin / DataGrip

-- STEP 1: Find actual foreign key constraint names (run this first)
SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
  AND TABLE_NAME IN ('appointment_requests', 'ledger_entries', 'barbers', 'appointment_slots', 'working_hours')
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- STEP 2: Check current collation status
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  COLLATION_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('appointment_requests','ledger_entries','barbers','appointment_slots','working_hours')
  AND COLLATION_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

-- STEP 3: Drop foreign keys (replace constraint names with actual names from STEP 1)
-- Example (adjust constraint names based on STEP 1 results):
-- ALTER TABLE `working_hours` DROP FOREIGN KEY `working_hours_barberId_fkey`;
-- ALTER TABLE `appointment_requests` DROP FOREIGN KEY `appointment_requests_barberId_fkey`;
-- ALTER TABLE `appointment_slots` DROP FOREIGN KEY `appointment_slots_barberId_fkey`;
-- ALTER TABLE `appointment_slots` DROP FOREIGN KEY `appointment_slots_appointmentRequestId_fkey`;
-- ALTER TABLE `ledger_entries` DROP FOREIGN KEY `ledger_entries_barberId_fkey`;
-- ALTER TABLE `ledger_entries` DROP FOREIGN KEY `ledger_entries_appointmentRequestId_fkey`;

-- STEP 4: Convert all tables
ALTER TABLE `barbers` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `working_hours` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `appointment_requests` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `appointment_slots` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `ledger_entries` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- STEP 5: Fix columns (referenced columns FIRST)
ALTER TABLE `barbers`
  MODIFY `id` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `appointment_requests`
  MODIFY `id` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `barberId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `date` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `requestedStartTime` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `requestedEndTime` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `working_hours`
  MODIFY `barberId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `appointment_slots`
  MODIFY `id` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `barberId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `appointmentRequestId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `date` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `startTime` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `endTime` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ledger_entries`
  MODIFY `id` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `barberId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `appointmentRequestId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `date` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `customerName` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `description` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- STEP 6: Recreate foreign keys (adjust constraint names based on STEP 1)
-- Example:
-- ALTER TABLE `working_hours`
--   ADD CONSTRAINT `working_hours_barberId_fkey` 
--   FOREIGN KEY (`barberId`) REFERENCES `barbers`(`id`) ON DELETE CASCADE;
-- (Repeat for all foreign keys from STEP 1)

-- STEP 7: Verify: No 0900 should remain
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  COLLATION_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('appointment_requests','ledger_entries','barbers','appointment_slots','working_hours')
  AND COLLATION_NAME LIKE '%0900%';



