-- MySQL Collation Fix Script
-- Run this in MySQL client / phpMyAdmin / DataGrip

-- 1. Database collation normalization
ALTER DATABASE `barber`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Convert all tables
ALTER TABLE barbers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE working_hours CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE appointment_requests CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE appointment_slots CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE ledger_entries CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Force problematic columns to match
ALTER TABLE appointment_requests
  MODIFY id VARCHAR(191) COLLATE utf8mb4_unicode_ci,
  MODIFY barberId VARCHAR(191) COLLATE utf8mb4_unicode_ci,
  MODIFY date VARCHAR(191) COLLATE utf8mb4_unicode_ci;

ALTER TABLE ledger_entries
  MODIFY appointmentRequestId VARCHAR(191) COLLATE utf8mb4_unicode_ci,
  MODIFY barberId VARCHAR(191) COLLATE utf8mb4_unicode_ci,
  MODIFY date VARCHAR(191) COLLATE utf8mb4_unicode_ci;

