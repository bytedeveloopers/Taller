/**
 * Inicializador del sistema de respaldos
 * Configura y ejecuta el scheduler automático de respaldos
 */

import { BackupScheduler } from "./BackupScheduler";

let schedulerInstance: BackupScheduler | null = null;

/**
 * Inicializa el sistema de respaldos
 * Debe llamarse al iniciar la aplicación
 */
export async function initBackupSystem() {
  try {
    if (schedulerInstance) {
      console.log("📦 Backup scheduler already initialized");
      return;
    }

    console.log("📦 Initializing backup system...");

    schedulerInstance = new BackupScheduler();
    await schedulerInstance.init();

    console.log("✅ Backup system initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize backup system:", error);
  }
}

/**
 * Obtiene la instancia del scheduler (para actualizaciones en tiempo real)
 */
export function getBackupScheduler(): BackupScheduler | null {
  return schedulerInstance;
}

/**
 * Detiene y limpia el sistema de respaldos
 */
export async function shutdownBackupSystem() {
  if (schedulerInstance) {
    await schedulerInstance.shutdown();
    schedulerInstance = null;
    console.log("📦 Backup system shutdown completed");
  }
}
