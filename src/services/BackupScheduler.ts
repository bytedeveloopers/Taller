import cron from "node-cron";
import { BackupService } from "./BackupService";

class BackupScheduler {
  private currentJob: cron.ScheduledTask | null = null;
  private isRunning = false;

  /**
   * Inicia el scheduler con la configuración actual
   */
  async start(): Promise<void> {
    await this.stop();
    await this.scheduleFromConfig();
  }

  /**
   * Detiene el scheduler actual
   */
  async stop(): Promise<void> {
    if (this.currentJob) {
      this.currentJob.stop();
      this.currentJob.destroy();
      this.currentJob = null;
    }
  }

  /**
   * Programa backups basado en la configuración
   */
  private async scheduleFromConfig(): Promise<void> {
    try {
      const config = await BackupService.getBackupConfig();
      const { frecuencia, horaLocal } = config.programacion;

      // Parsear hora (formato HH:mm)
      const [hours, minutes] = horaLocal.split(":").map(Number);

      let cronExpression: string;

      if (frecuencia === "diario") {
        // Todos los días a la hora especificada
        cronExpression = `${minutes} ${hours} * * *`;
      } else {
        // Semanal: todos los domingos a la hora especificada
        cronExpression = `${minutes} ${hours} * * 0`;
      }

      console.log(`📅 Programando backup ${frecuencia} a las ${horaLocal} (${cronExpression})`);

      this.currentJob = cron.schedule(
        cronExpression,
        async () => {
          await this.executeScheduledBackup();
        },
        {
          scheduled: true,
          timezone: "America/Guatemala",
        }
      );
    } catch (error) {
      console.error("Error programando backup automático:", error);
    }
  }

  /**
   * Ejecuta un backup programado
   */
  private async executeScheduledBackup(): Promise<void> {
    if (this.isRunning) {
      console.log("⏳ Backup ya en ejecución, omitiendo...");
      return;
    }

    // Verificar si hay algún backup en estado RUNNING
    const latestLog = await BackupService.getLatest();
    if (latestLog && latestLog.estado === "RUNNING") {
      console.log("⏳ Hay un backup manual en ejecución, omitiendo backup programado...");
      return;
    }

    this.isRunning = true;

    try {
      console.log("🚀 Iniciando backup programado...");
      const result = await BackupService.runBackup("system", undefined);
      console.log(`✅ Backup programado iniciado con ID: ${result.logId}`);
    } catch (error) {
      console.error("❌ Error en backup programado:", error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Actualiza la programación cuando cambia la configuración
   */
  async updateSchedule(): Promise<void> {
    console.log("🔄 Actualizando programación de backup...");
    await this.start();
  }

  /**
   * Obtiene el estado actual del scheduler
   */
  getStatus(): { isScheduled: boolean; isRunning: boolean } {
    return {
      isScheduled: this.currentJob !== null,
      isRunning: this.isRunning,
    };
  }

  /**
   * Simula la ejecución a una hora específica (para testing)
   */
  async simulateExecution(): Promise<void> {
    console.log("🧪 Simulando ejecución de backup programado...");
    await this.executeScheduledBackup();
  }
}

// Instancia singleton
export const backupScheduler = new BackupScheduler();

// Auto-inicializar cuando se importa
backupScheduler.start().catch(console.error);
