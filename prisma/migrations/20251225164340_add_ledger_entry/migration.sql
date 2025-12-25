CREATE TABLE `ledger_entries` (
  `id` VARCHAR(191) NOT NULL,
  `barberId` VARCHAR(191) NOT NULL,
  `appointmentRequestId` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `note` TEXT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `ledger_entries_appointmentRequestId_key` (`appointmentRequestId`),
  KEY `ledger_entries_barberId_idx` (`barberId`),
  KEY `ledger_entries_createdAt_idx` (`createdAt`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `ledger_entries` ADD CONSTRAINT `ledger_entries_barberId_fkey` FOREIGN KEY (`barberId`) REFERENCES `barbers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ledger_entries` ADD CONSTRAINT `ledger_entries_appointmentRequestId_fkey` FOREIGN KEY (`appointmentRequestId`) REFERENCES `appointment_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


