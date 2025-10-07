// src/lib/backup-init.ts
import "server-only";
import { BackupScheduler } from "./BackupScheduler";

let schedulerInstance: BackupScheduler | null = null;

/** Inicializa el sistema de respaldos (solo una vez) */
export async function initBackupSystem(job?: () => Promise<void> | void, intervalMs?: number) {
  try {
    if (schedulerInstance) {
      console.log("📦 Backup scheduler already initialized");
      return schedulerInstance;
    }
    console.log("📦 Initializing backup system...");
    schedulerInstance = new BackupScheduler(job, intervalMs);
    await schedulerInstance.init();
    console.log("✅ Backup system initialized successfully");
    return schedulerInstance;
  } catch (error) {
    console.error("❌ Failed to initialize backup system:", error);
    throw error;
  }
}

/** Obtiene la instancia del scheduler */
export function getBackupScheduler(): BackupScheduler | null {
  return schedulerInstance;
}

/** Apaga el scheduler */
export async function shutdownBackupSystem() {
  if (schedulerInstance) {
    await schedulerInstance.shutdown();
    schedulerInstance = null;
    console.log("📦 Backup system shutdown completed");
  }
}
