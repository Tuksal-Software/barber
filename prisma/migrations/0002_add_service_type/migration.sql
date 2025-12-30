-- AlterTable
-- Migration: Add serviceType column to appointment_requests
-- This column is nullable to maintain compatibility with existing records
-- Existing records will have serviceType = NULL (old behavior preserved)

ALTER TABLE `appointment_requests` 
ADD COLUMN `serviceType` ENUM('SAC', 'SAKAL', 'SAC_SAKAL') NULL;

