ALTER TABLE `expenses` 
  ADD COLUMN `sourceType` ENUM('manual', 'recurring') NOT NULL DEFAULT 'manual',
  ADD COLUMN `sourceId` VARCHAR(191) NULL;
