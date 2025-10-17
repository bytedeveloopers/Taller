-- DropForeignKey
ALTER TABLE `tecnicobloqueo` DROP FOREIGN KEY `TecnicoBloqueo_tecnicoId_fkey`;

-- DropIndex
DROP INDEX `TecnicoBloqueo_tecnicoId_startDate_endDate_idx` ON `tecnicobloqueo`;

-- AlterTable
ALTER TABLE `tecnicobloqueo` ALTER COLUMN `type` DROP DEFAULT;

-- CreateTable
CREATE TABLE `TecnicoNota` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tecnicoId` INTEGER NOT NULL,
    `authorId` INTEGER NULL,
    `titulo` VARCHAR(191) NULL,
    `body` VARCHAR(191) NOT NULL,
    `pinned` BOOLEAN NOT NULL DEFAULT false,
    `isPrivate` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TecnicoNota_tecnicoId_idx`(`tecnicoId`),
    INDEX `TecnicoNota_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `TecnicoBloqueo_tecnicoId_idx` ON `TecnicoBloqueo`(`tecnicoId`);

-- AddForeignKey
ALTER TABLE `TecnicoBloqueo` ADD CONSTRAINT `TecnicoBloqueo_tecnicoId_fkey` FOREIGN KEY (`tecnicoId`) REFERENCES `Tecnico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TecnicoNota` ADD CONSTRAINT `TecnicoNota_tecnicoId_fkey` FOREIGN KEY (`tecnicoId`) REFERENCES `Tecnico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TecnicoNota` ADD CONSTRAINT `TecnicoNota_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
