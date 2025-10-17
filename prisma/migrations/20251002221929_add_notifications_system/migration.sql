-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('OT_STATUS_CHANGED', 'OT_ASSIGNED', 'OT_REASSIGNED', 'OT_SLA_WARNING', 'OT_SLA_OVERDUE', 'OT_WAITING_EXIT', 'QUOTE_CREATED', 'QUOTE_SENT', 'QUOTE_APPROVED', 'QUOTE_REJECTED', 'QUOTE_ADJUSTMENT_REQUESTED', 'QUOTE_EXPIRING', 'APPOINTMENT_REMINDER_24H', 'APPOINTMENT_REMINDER_1H', 'APPOINTMENT_REMINDER_15M', 'APPOINTMENT_RESCHEDULED', 'APPOINTMENT_CANCELLED', 'INTAKE_MISSING_PHOTOS', 'NEW_PHOTOS_UPLOADED', 'SYSTEM_ERROR', 'STORAGE_LIMIT_WARNING') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `taskId` VARCHAR(191) NULL,
    `quoteId` VARCHAR(191) NULL,
    `appointmentId` VARCHAR(191) NULL,
    `customerId` VARCHAR(191) NULL,
    `vehicleId` VARCHAR(191) NULL,
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
    `channel` ENUM('IN_APP', 'WHATSAPP', 'PUSH') NOT NULL DEFAULT 'IN_APP',
    `payload` JSON NULL,
    `groupKey` VARCHAR(191) NULL,
    `readAt` DATETIME(3) NULL,
    `dismissedAt` DATETIME(3) NULL,
    `snoozeUntil` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `notifications_userId_readAt_idx`(`userId`, `readAt`),
    INDEX `notifications_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `notifications_type_createdAt_idx`(`type`, `createdAt`),
    INDEX `notifications_groupKey_idx`(`groupKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_notification_settings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `typesEnabled` JSON NOT NULL,
    `intensity` ENUM('NORMAL', 'CRITICAL_ONLY') NOT NULL DEFAULT 'NORMAL',
    `snoozeUntil` DATETIME(3) NULL,
    `channels` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_notification_settings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_quoteId_fkey` FOREIGN KEY (`quoteId`) REFERENCES `quotes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_notification_settings` ADD CONSTRAINT `user_notification_settings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
