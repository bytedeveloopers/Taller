-- AlterTable
ALTER TABLE `customers` ADD COLUMN `altPhone` VARCHAR(191) NULL,
    ADD COLUMN `consents` JSON NULL,
    ADD COLUMN `contactPreference` VARCHAR(191) NOT NULL DEFAULT 'PHONE',
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `labels` VARCHAR(191) NULL,
    ADD COLUMN `lastVisit` DATETIME(3) NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `pickupPoints` TEXT NULL;

-- CreateTable
CREATE TABLE `client_merge_logs` (
    `id` VARCHAR(191) NOT NULL,
    `sourceClientId` VARCHAR(191) NOT NULL,
    `targetClientId` VARCHAR(191) NOT NULL,
    `mergedData` JSON NOT NULL,
    `mergedBy` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `client_merge_logs` ADD CONSTRAINT `client_merge_logs_sourceClientId_fkey` FOREIGN KEY (`sourceClientId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `client_merge_logs` ADD CONSTRAINT `client_merge_logs_targetClientId_fkey` FOREIGN KEY (`targetClientId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `client_merge_logs` ADD CONSTRAINT `client_merge_logs_mergedBy_fkey` FOREIGN KEY (`mergedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
