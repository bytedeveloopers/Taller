/*
  Warnings:

  - You are about to drop the `appointments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `client_merge_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inspection_photos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quote_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quotes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recordatorios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report_snapshots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_notification_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow_status` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_technicianId_fkey`;

-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_vehicleId_fkey`;

-- DropForeignKey
ALTER TABLE `audit_logs` DROP FOREIGN KEY `audit_logs_actorId_fkey`;

-- DropForeignKey
ALTER TABLE `client_merge_logs` DROP FOREIGN KEY `client_merge_logs_mergedBy_fkey`;

-- DropForeignKey
ALTER TABLE `client_merge_logs` DROP FOREIGN KEY `client_merge_logs_sourceClientId_fkey`;

-- DropForeignKey
ALTER TABLE `client_merge_logs` DROP FOREIGN KEY `client_merge_logs_targetClientId_fkey`;

-- DropForeignKey
ALTER TABLE `inspection_photos` DROP FOREIGN KEY `inspection_photos_technicianId_fkey`;

-- DropForeignKey
ALTER TABLE `inspection_photos` DROP FOREIGN KEY `inspection_photos_vehicleId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_appointmentId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_quoteId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_userId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_vehicleId_fkey`;

-- DropForeignKey
ALTER TABLE `quote_items` DROP FOREIGN KEY `quote_items_quoteId_fkey`;

-- DropForeignKey
ALTER TABLE `quotes` DROP FOREIGN KEY `quotes_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `quotes` DROP FOREIGN KEY `quotes_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `quotes` DROP FOREIGN KEY `quotes_vehicleId_fkey`;

-- DropForeignKey
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_technicianId_fkey`;

-- DropForeignKey
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_vehicleId_fkey`;

-- DropForeignKey
ALTER TABLE `user_notification_settings` DROP FOREIGN KEY `user_notification_settings_userId_fkey`;

-- DropForeignKey
ALTER TABLE `vehicles` DROP FOREIGN KEY `vehicles_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_status` DROP FOREIGN KEY `workflow_status_technicianId_fkey`;

-- DropForeignKey
ALTER TABLE `workflow_status` DROP FOREIGN KEY `workflow_status_vehicleId_fkey`;

-- DropTable
DROP TABLE `appointments`;

-- DropTable
DROP TABLE `audit_logs`;

-- DropTable
DROP TABLE `client_merge_logs`;

-- DropTable
DROP TABLE `customers`;

-- DropTable
DROP TABLE `inspection_photos`;

-- DropTable
DROP TABLE `media`;

-- DropTable
DROP TABLE `notifications`;

-- DropTable
DROP TABLE `quote_items`;

-- DropTable
DROP TABLE `quotes`;

-- DropTable
DROP TABLE `recordatorios`;

-- DropTable
DROP TABLE `report_snapshots`;

-- DropTable
DROP TABLE `tasks`;

-- DropTable
DROP TABLE `user_notification_settings`;

-- DropTable
DROP TABLE `users`;

-- DropTable
DROP TABLE `vehicles`;

-- DropTable
DROP TABLE `workflow_status`;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `nombre` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'TECNICO', 'RECEPCIONISTA', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `must_change_password` BOOLEAN NOT NULL DEFAULT true,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tecnico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `especialidad` VARCHAR(191) NULL,
    `habilidades` VARCHAR(191) NULL,
    `skills` JSON NULL,
    `capacidad` INTEGER NOT NULL DEFAULT 8,
    `carga` INTEGER NOT NULL DEFAULT 0,
    `horario_inicio` VARCHAR(191) NULL,
    `horario_fin` VARCHAR(191) NULL,
    `notas` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tecnico_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TecnicoBloqueo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tecnicoId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `type` ENUM('VACATION', 'SICK_LEAVE', 'TRAINING', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TecnicoBloqueo_tecnicoId_startDate_endDate_idx`(`tecnicoId`, `startDate`, `endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tecnico` ADD CONSTRAINT `Tecnico_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TecnicoBloqueo` ADD CONSTRAINT `TecnicoBloqueo_tecnicoId_fkey` FOREIGN KEY (`tecnicoId`) REFERENCES `Tecnico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
