-- CreateTable
CREATE TABLE `sms_logs` (
    `id` VARCHAR(191) NOT NULL,
    `to` VARCHAR(50) NOT NULL,
    `message` TEXT NOT NULL,
    `event` VARCHAR(100) NOT NULL,
    `provider` VARCHAR(50) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `error` TEXT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `sms_logs_event_idx`(`event`),
    INDEX `sms_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



