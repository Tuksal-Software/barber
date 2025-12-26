-- CreateTable
CREATE TABLE `customer_cancel_otps` (
    `id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `appointmentId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(0) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `customer_cancel_otps_phone_idx`(`phone`),
    INDEX `customer_cancel_otps_appointmentId_idx`(`appointmentId`),
    INDEX `customer_cancel_otps_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

