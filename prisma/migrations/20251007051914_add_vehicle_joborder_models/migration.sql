-- CreateTable
CREATE TABLE `Vehicle` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `brand` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `vin` VARCHAR(191) NULL,
    `licensePlate` VARCHAR(191) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `estadoActual` ENUM('INGRESO', 'DIAGNOSTICO', 'DESARME', 'ESPERA', 'ARMADO', 'PRUEBA', 'FINALIZADO', 'RECEPCION') NOT NULL DEFAULT 'INGRESO',
    `km_actual` INTEGER NULL,
    `proximo_mantenimiento` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Vehicle_vin_key`(`vin`),
    UNIQUE INDEX `Vehicle_licensePlate_key`(`licensePlate`),
    INDEX `Vehicle_estadoActual_idx`(`estadoActual`),
    INDEX `Vehicle_activo_idx`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobOrder` (
    `id` VARCHAR(191) NOT NULL,
    `vehicleId` VARCHAR(191) NOT NULL,
    `tecnicoId` INTEGER NULL,
    `estado` ENUM('INGRESO', 'DIAGNOSTICO', 'DESARME', 'ESPERA', 'ARMADO', 'PRUEBA', 'FINALIZADO', 'RECEPCION') NOT NULL DEFAULT 'INGRESO',
    `prioridad` INTEGER NOT NULL DEFAULT 3,
    `descripcion` VARCHAR(191) NULL,
    `fechaIngreso` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaSalida` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JobOrder_estado_idx`(`estado`),
    INDEX `JobOrder_tecnicoId_idx`(`tecnicoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evidencia` (
    `id` VARCHAR(191) NOT NULL,
    `vehicleId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NULL,
    `url` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NULL,
    `nota` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Evidencia_vehicleId_idx`(`vehicleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_tecnicoId_fkey` FOREIGN KEY (`tecnicoId`) REFERENCES `Tecnico`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evidencia` ADD CONSTRAINT `Evidencia_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
