CREATE TABLE `recurring_expenses` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `category` ENUM('rent', 'electricity', 'water', 'product', 'staff', 'other') NOT NULL,
  `repeatType` ENUM('daily', 'weekly', 'monthly') NOT NULL,
  `repeatInterval` INT NOT NULL DEFAULT 1,
  `startDate` VARCHAR(191) NOT NULL,
  `nextRunAt` DATETIME(0) NOT NULL,
  `endDate` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  INDEX `recurring_expenses_isActive_nextRunAt_idx` (`isActive`, `nextRunAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
