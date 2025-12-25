-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actorType` ENUM('customer', 'admin', 'system') NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` ENUM('APPOINTMENT_FORM_PHONE_ENTERED', 'APPOINTMENT_FORM_NAME_ENTERED', 'APPOINTMENT_FORM_ABANDONED', 'APPOINTMENT_CREATED', 'APPOINTMENT_APPROVED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_REJECTED', 'LEDGER_CREATED', 'LEDGER_UPDATED', 'EXPENSE_CREATED', 'EXPENSE_UPDATED', 'EXPENSE_DELETED', 'SMS_SENT', 'SMS_FAILED', 'AUTH_LOGIN', 'AUTH_LOGOUT', 'UI_ACTION') NOT NULL,
    `entityType` ENUM('appointment', 'ledger', 'expense', 'sms', 'auth', 'ui', 'other') NOT NULL,
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

