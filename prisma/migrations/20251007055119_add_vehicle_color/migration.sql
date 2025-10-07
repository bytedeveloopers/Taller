/*
  Warnings:

  - You are about to drop the column `clientId` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `km_actual` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `proximo_mantenimiento` on the `vehicle` table. All the data in the column will be lost.
  - Added the required column `clienteId` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `vehicle` DROP FOREIGN KEY `Vehicle_clientId_fkey`;

-- DropIndex
DROP INDEX `Vehicle_activo_idx` ON `vehicle`;

-- DropIndex
DROP INDEX `Vehicle_clientId_fkey` ON `vehicle`;

-- DropIndex
DROP INDEX `Vehicle_estadoActual_idx` ON `vehicle`;

-- DropIndex
DROP INDEX `Vehicle_licensePlate_key` ON `vehicle`;

-- DropIndex
DROP INDEX `Vehicle_vin_key` ON `vehicle`;

-- AlterTable
ALTER TABLE `vehicle` DROP COLUMN `clientId`,
    DROP COLUMN `km_actual`,
    DROP COLUMN `proximo_mantenimiento`,
    ADD COLUMN `clienteId` VARCHAR(191) NOT NULL,
    ADD COLUMN `color` VARCHAR(191) NULL,
    ADD COLUMN `kmActual` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `proximoMantenimiento` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
