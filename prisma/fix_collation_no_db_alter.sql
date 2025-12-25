-- MySQL Collation Fix Script - WITHOUT DATABASE ALTER
-- Use this if you don't have ALTER DATABASE permission
-- Run this in MySQL client / phpMyAdmin / DataGrip
-- Make sure you're connected to the correct database first

-- 1. Check current collation status (run first to see what needs fixing)
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

-- 2. All Tables (FORCE) - Skip ALTER DATABASE if no permission
ALTER TABLE `barbers` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `working_hours` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `appointment_requests` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `appointment_slots` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `ledger_entries` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Foreign key columns FIRST (must match before constraints)
-- barbers.id (referenced by all other tables)
ALTER TABLE `barbers`
  MODIFY `id` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- working_hours.barberId (references barbers.id)
ALTER TABLE `working_hours`
  MODIFY `barberId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- appointment_requests columns
ALTER TABLE `appointment_requests`
  MODIFY `id` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `barberId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `date` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `requestedStartTime` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `requestedEndTime` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- appointment_slots columns (references barbers.id and appointment_requests.id)
ALTER TABLE `appointment_slots`
  MODIFY `id` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `barberId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `appointmentRequestId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `date` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `startTime` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `endTime` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ledger_entries columns (references barbers.id and appointment_requests.id)
ALTER TABLE `ledger_entries`
  MODIFY `id` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `barberId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `appointmentRequestId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `date` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `customerName` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY `description` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Verify: No 0900 should remain (should return 0 rows)
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  COLLATION_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('appointment_requests','ledger_entries','barbers','appointment_slots','working_hours')
  AND COLLATION_NAME LIKE '%0900%';

-- 5. Verify foreign key compatibility
SELECT
  k.CONSTRAINT_NAME,
  k.TABLE_NAME,
  k.COLUMN_NAME,
  k.REFERENCED_TABLE_NAME,
  k.REFERENCED_COLUMN_NAME,
  c1.COLLATION_NAME AS COLUMN_COLLATION,
  c2.COLLATION_NAME AS REFERENCED_COLLATION
FROM information_schema.KEY_COLUMN_USAGE k
JOIN information_schema.COLUMNS c1 ON c1.TABLE_SCHEMA = k.TABLE_SCHEMA 
  AND c1.TABLE_NAME = k.TABLE_NAME 
  AND c1.COLUMN_NAME = k.COLUMN_NAME
JOIN information_schema.COLUMNS c2 ON c2.TABLE_SCHEMA = k.TABLE_SCHEMA 
  AND c2.TABLE_NAME = k.REFERENCED_TTABLE_NAME 
  AND c2.COLUMN_NAME = k.REFERENCED_COLUMN_NAME
WHERE k.TABLE_SCHEMA = DATABASE()
  AND k.REFERENCED_TABLE_NAME IS NOT NULL
  AND c1.COLLATION_NAME != c2.COLLATION_NAME;
