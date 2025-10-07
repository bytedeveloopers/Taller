// instrumentation.ts
export async function register() {
  // Import dinámico para evitar Edge y cargar solo en Node
  const { initBackupSystem } = await import("./src/lib/backup-init");

  // Si luego tengo una función real:
  // const { runBackupNow } = await import("./src/lib/run-backup");
  // await initBackupSystem(() => runBackupNow(), 24 * 60 * 60 * 1000);

  await initBackupSystem(); // por ahora usa job por defecto
}
