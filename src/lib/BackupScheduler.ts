// src/lib/BackupScheduler.ts
import "server-only";

type JobFn = () => Promise<void> | void;

async function defaultBackupJob() {
  // Aquí va tu lógica real de backup (dump DB, subir a S3, etc.)
  console.log("[BackupScheduler] default job (noop)");
}

export class BackupScheduler {
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private readonly job: JobFn = defaultBackupJob,
    private readonly intervalMs: number = Number(process.env.BACKUP_INTERVAL_MS) || 24 * 60 * 60 * 1000 // 24h
  ) {}

  async init() {
    if (this.intervalId) return;

    // Ejecuta una vez al iniciar (opcional)
    try {
      await Promise.resolve(this.job());
    } catch (err) {
      console.error("[BackupScheduler] first run failed:", err);
    }

    this.intervalId = setInterval(() => {
      Promise.resolve(this.job()).catch((err) =>
        console.error("[BackupScheduler] scheduled run failed:", err)
      );
    }, this.intervalMs);

    console.log(`[BackupScheduler] started every ${this.intervalMs} ms`);
  }

  async runOnce() {
    try {
      await Promise.resolve(this.job());
      console.log("[BackupScheduler] runOnce completed");
    } catch (err) {
      console.error("[BackupScheduler] runOnce failed:", err);
      throw err;
    }
  }

  async shutdown() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[BackupScheduler] stopped");
    }
  }
}
