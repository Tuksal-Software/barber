CREATE TABLE `barbers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'barber') NOT NULL DEFAULT 'barber',
    `experience` INT NOT NULL DEFAULT 0,
    `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
    `specialties` TEXT NULL,
    `image` VARCHAR(500) NULL,
    `slotDuration` INT NOT NULL DEFAULT 30,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,

    UNIQUE INDEX `barbers_email_key`(`email`),
    INDEX `barbers_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `working_hours` (
    `id` VARCHAR(191) NOT NULL,
    `barberId` VARCHAR(191) NOT NULL,
    `dayOfWeek` INT NOT NULL,
    `startTime` VARCHAR(10) NOT NULL,
    `endTime` VARCHAR(10) NOT NULL,
    `isWorking` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,

    UNIQUE INDEX `working_hours_barberId_dayOfWeek_key`(`barberId`, `dayOfWeek`),
    INDEX `working_hours_barberId_idx`(`barberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `working_hour_overrides` (
    `id` VARCHAR(191) NOT NULL,
    `barberId` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(10) NOT NULL,
    `endTime` VARCHAR(10) NOT NULL,
    `reason` TEXT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `working_hour_overrides_barberId_date_idx`(`barberId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `appointment_requests` (
    `id` VARCHAR(191) NOT NULL,
    `barberId` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(255) NOT NULL,
    `customerPhone` VARCHAR(20) NOT NULL,
    `customerEmail` VARCHAR(255) NULL,
    `date` VARCHAR(191) NOT NULL,
    `requestedStartTime` VARCHAR(191) NOT NULL,
    `requestedEndTime` VARCHAR(191) NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    `cancelledBy` VARCHAR(20) NULL,
    `subscriptionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `appointment_requests_barberId_date_idx`(`barberId`, `date`),
    INDEX `appointment_requests_status_idx`(`status`),
    INDEX `appointment_requests_subscriptionId_idx`(`subscriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `appointment_slots` (
    `id` VARCHAR(191) NOT NULL,
    `barberId` VARCHAR(191) NOT NULL,
    `appointmentRequestId` VARCHAR(191) NULL,
    `date` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `status` ENUM('blocked', 'free') NOT NULL DEFAULT 'blocked',
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `appointment_slots_barberId_date_idx`(`barberId`, `date`),
    INDEX `appointment_slots_barberId_date_status_idx`(`barberId`, `date`, `status`),
    INDEX `appointment_slots_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ledger_entries` (
    `id` VARCHAR(191) NOT NULL,
    `barberId` VARCHAR(191) NOT NULL,
    `appointmentRequestId` VARCHAR(191) NULL,
    `date` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `ledger_entries_appointmentRequestId_key`(`appointmentRequestId`),
    INDEX `ledger_entries_barberId_date_idx`(`barberId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `expenses` (
    `id` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `category` ENUM('rent', 'electricity', 'water', 'product', 'staff', 'other') NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `expenses_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actorType` ENUM('customer', 'admin', 'system') NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` ENUM('UI_PHONE_ENTERED', 'UI_NAME_ENTERED', 'UI_CANCEL_ATTEMPT', 'UI_FORM_ABANDONED', 'UI_SETTINGS_SAVED', 'APPOINTMENT_CREATE_ATTEMPT', 'APPOINTMENT_CREATED', 'APPOINTMENT_APPROVED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_CANCEL_ATTEMPT', 'APPOINTMENT_CANCEL_BLOCKED_PAST', 'APPOINTMENT_CANCEL_DENIED', 'CUSTOMER_CANCEL_PHONE_ENTERED', 'CUSTOMER_CANCEL_OTP_SENT', 'CUSTOMER_CANCEL_CONFIRMED', 'CUSTOMER_CANCEL_FAILED', 'SETTINGS_CREATED', 'SETTINGS_UPDATED', 'LEDGER_CREATED', 'LEDGER_UPDATED', 'LEDGER_DELETED', 'EXPENSE_CREATED', 'EXPENSE_UPDATED', 'EXPENSE_DELETED', 'SMS_SENT', 'SMS_FAILED', 'WORKING_HOUR_UPDATED', 'WORKING_HOUR_OVERRIDE_CREATED', 'WORKING_HOUR_OVERRIDE_DELETED', 'WORKING_HOUR_OVERRIDE_APPLIED', 'APPOINTMENT_CANCELLED_BY_OVERRIDE', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_UPDATED', 'SUBSCRIPTION_CANCELLED', 'SUBSCRIPTION_APPOINTMENTS_GENERATED') NOT NULL,
    `entityType` ENUM('appointment', 'ledger', 'expense', 'sms', 'auth', 'ui', 'settings', 'other') NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `summary` TEXT NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `audit_logs_actorType_idx`(`actorType`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_entityType_idx`(`entityType`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

CREATE TABLE `app_settings` (
    `key` VARCHAR(64) NOT NULL,
    `value` JSON NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `barberId` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(255) NOT NULL,
    `customerPhone` VARCHAR(20) NOT NULL,
    `recurrenceType` ENUM('weekly', 'biweekly', 'monthly') NOT NULL,
    `dayOfWeek` INT NOT NULL,
    `weekOfMonth` INT NULL,
    `startTime` VARCHAR(10) NOT NULL,
    `durationMinutes` INT NOT NULL,
    `startDate` VARCHAR(191) NOT NULL,
    `endDate` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,

    INDEX `subscriptions_barberId_idx`(`barberId`),
    INDEX `subscriptions_customerPhone_idx`(`customerPhone`),
    INDEX `subscriptions_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `working_hours` ADD CONSTRAINT `working_hours_barberId_fkey` FOREIGN KEY (`barberId`) REFERENCES `barbers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `working_hour_overrides` ADD CONSTRAINT `working_hour_overrides_barberId_fkey` FOREIGN KEY (`barberId`) REFERENCES `barbers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `appointment_requests` ADD CONSTRAINT `appointment_requests_barberId_fkey` FOREIGN KEY (`barberId`) REFERENCES `barbers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `appointment_requests` ADD CONSTRAINT `appointment_requests_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `appointment_slots` ADD CONSTRAINT `appointment_slots_barberId_fkey` FOREIGN KEY (`barberId`) REFERENCES `barbers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `appointment_slots` ADD CONSTRAINT `appointment_slots_appointmentRequestId_fkey` FOREIGN KEY (`appointmentRequestId`) REFERENCES `appointment_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `ledger_entries` ADD CONSTRAINT `ledger_entries_barberId_fkey` FOREIGN KEY (`barberId`) REFERENCES `barbers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ledger_entries` ADD CONSTRAINT `ledger_entries_appointmentRequestId_fkey` FOREIGN KEY (`appointmentRequestId`) REFERENCES `appointment_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

