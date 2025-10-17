-- AlterTable
ALTER TABLE `appointments` ADD COLUMN `doneAt` DATETIME(3) NULL,
    ADD COLUMN `rescheduledCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `slaDeadline` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `quotes` ADD COLUMN `rejectedAt` DATETIME(3) NULL,
    ADD COLUMN `rejectionReason` TEXT NULL,
    ADD COLUMN `responseTime` INTEGER NULL,
    ADD COLUMN `sentAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `vehicles` ADD COLUMN `deliveredAt` DATETIME(3) NULL,
    ADD COLUMN `receivedAt` DATETIME(3) NULL,
    ADD COLUMN `slaDeadline` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `report_snapshots` (
    `id` VARCHAR(191) NOT NULL,
    `reportType` VARCHAR(191) NOT NULL,
    `snapshotDate` DATETIME(3) NOT NULL,
    `metric` VARCHAR(191) NOT NULL,
    `value` DECIMAL(15, 4) NULL,
    `stringValue` VARCHAR(191) NULL,
    `dimensions` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `report_snapshots_reportType_snapshotDate_idx`(`reportType`, `snapshotDate`),
    INDEX `report_snapshots_reportType_metric_snapshotDate_idx`(`reportType`, `metric`, `snapshotDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
