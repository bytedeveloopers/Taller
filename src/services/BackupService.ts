import { prisma } from "@/lib/prisma";
import { BackupCfg, BackupLog } from "@/types/configuration";
import archiver from "archiver";
import { spawn } from "child_process";
import crypto from "crypto";
import { createReadStream, createWriteStream, promises as fs } from "fs";
import path from "path";
import { pipeline } from "stream/promises";

export class BackupService {
  private static readonly BACKUP_DIR = path.join(process.cwd(), "backups");
  private static readonly TEMP_DIR = path.join(process.cwd(), "temp");
  private static readonly UPLOADS_DIR = path.join(process.cwd(), "uploads");
  private static readonly TEMPLATES_DIR = path.join(process.cwd(), "templates");

  /**
   * Ejecuta un backup completo
   */
  static async runBackup(
    userId: string,
    override?: Partial<BackupCfg>
  ): Promise<{ logId: string }> {
    // Obtener configuración
    const config = await this.getBackupConfig();
    const finalConfig = { ...config, ...override };

    // Crear log inicial
    const logId = crypto.randomUUID();
    await prisma.backupLog.create({
      data: {
        id: logId,
        userId,
        status: "RUNNING",
        message: "Iniciando proceso de backup...",
        scopeBd: finalConfig.ambito.bd,
        scopeAdj: finalConfig.ambito.adjuntos,
        scopeTpl: finalConfig.ambito.plantillas,
        sizeBytes: 0,
      },
    });

    try {
      // Ejecutar backup en segundo plano
      this.executeBackup(logId, userId, finalConfig).catch(async (error) => {
        console.error("Error en backup:", error);
        await prisma.backupLog.update({
          where: { id: logId },
          data: {
            status: "ERROR",
            message: error.message || "Error desconocido durante el backup",
          },
        });
      });

      return { logId };
    } catch (error) {
      await prisma.backupLog.update({
        where: { id: logId },
        data: {
          status: "ERROR",
          message: error instanceof Error ? error.message : "Error desconocido",
        },
      });
      throw error;
    }
  }

  /**
   * Ejecuta el proceso de backup
   */
  private static async executeBackup(
    logId: string,
    userId: string,
    config: BackupCfg
  ): Promise<void> {
    const tempDir = path.join(this.TEMP_DIR, logId);
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(this.BACKUP_DIR, { recursive: true });

    const files: string[] = [];
    const manifest: any = {
      version: "1.0",
      created: new Date().toISOString(),
      userId,
      scope: config.ambito,
      files: [],
      checksums: {},
    };

    try {
      // 1. Backup de base de datos
      if (config.ambito.bd) {
        await this.updateLog(logId, "RUNNING", "Creando backup de base de datos...");
        const dbFile = await this.backupDatabase(tempDir);
        if (dbFile) {
          files.push(dbFile);
          manifest.files.push({ type: "database", path: dbFile });
        }
      }

      // 2. Backup de evidencias
      if (config.ambito.adjuntos) {
        await this.updateLog(logId, "RUNNING", "Copiando evidencias...");
        const uploadsBackup = await this.backupDirectory(
          this.UPLOADS_DIR,
          path.join(tempDir, "uploads")
        );
        if (uploadsBackup) {
          files.push("uploads");
          manifest.files.push({ type: "uploads", path: "uploads" });
        }
      }

      // 3. Backup de plantillas
      if (config.ambito.plantillas) {
        await this.updateLog(logId, "RUNNING", "Copiando plantillas...");
        const templatesBackup = await this.backupDirectory(
          this.TEMPLATES_DIR,
          path.join(tempDir, "templates")
        );
        if (templatesBackup) {
          files.push("templates");
          manifest.files.push({ type: "templates", path: "templates" });
        }
      }

      // 4. Backup de configuración
      await this.updateLog(logId, "RUNNING", "Exportando configuración...");
      const configFile = await this.backupConfig(tempDir);
      files.push(configFile);
      manifest.files.push({ type: "config", path: configFile });

      // 5. Calcular checksums
      await this.updateLog(logId, "RUNNING", "Calculando checksums...");
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        try {
          const checksum = await this.calculateChecksum(filePath);
          manifest.checksums[file] = checksum;
        } catch (error) {
          console.warn(`No se pudo calcular checksum para ${file}:`, error);
        }
      }

      // 6. Crear manifest
      const manifestPath = path.join(tempDir, "manifest.json");
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      files.push("manifest.json");

      // 7. Crear archivo tar.gz
      await this.updateLog(logId, "RUNNING", "Empaquetando archivos...");
      const backupFileName = `backup_${logId}_${Date.now()}.tar.gz`;
      let backupPath = path.join(this.BACKUP_DIR, backupFileName);

      await this.createTarGz(tempDir, backupPath);

      // 8. Cifrado si está habilitado
      if (config.destino.cifrado) {
        await this.updateLog(logId, "RUNNING", "Cifrando backup...");
        const encryptedPath = `${backupPath}.enc`;
        const { iv, authTag } = await this.encryptFile(backupPath, encryptedPath);

        // Actualizar manifest con datos de cifrado
        manifest.encryption = { iv: iv.toString("hex"), authTag: authTag.toString("hex") };
        await fs.writeFile(path.join(tempDir, "manifest.json"), JSON.stringify(manifest, null, 2));

        // Eliminar archivo no cifrado
        await fs.unlink(backupPath);
        backupPath = encryptedPath;
      }

      // 9. Procesar destino
      let finalLocation = backupPath;
      if (config.destino.tipo !== "descarga") {
        await this.updateLog(logId, "RUNNING", `Subiendo a ${config.destino.tipo}...`);
        finalLocation = await this.uploadToDestination(backupPath, config.destino, backupFileName);
      }

      // 10. Obtener tamaño final
      const stats = await fs.stat(backupPath);
      const sizeBytes = stats.size;

      // 11. Actualizar log final
      await prisma.backupLog.update({
        where: { id: logId },
        data: {
          status: "OK",
          message: "Backup completado exitosamente",
          location: finalLocation,
          sizeBytes: BigInt(sizeBytes),
        },
      });

      // 12. Limpiar archivos temporales
      await this.cleanupTemp(tempDir);

      // 13. Aplicar retención
      await this.applyRetention(config.programacion.retencionDias);
    } catch (error) {
      await this.updateLog(
        logId,
        "ERROR",
        error instanceof Error ? error.message : "Error desconocido"
      );
      await this.cleanupTemp(tempDir);
      throw error;
    }
  }

  /**
   * Crea backup de la base de datos
   */
  private static async backupDatabase(tempDir: string): Promise<string | null> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return null;

    const fileName = "database.sql.gz";
    const outputPath = path.join(tempDir, fileName);

    if (databaseUrl.includes("postgresql")) {
      // PostgreSQL
      const url = new URL(databaseUrl);
      await this.runCommand(
        "pg_dump",
        [
          "-h",
          url.hostname,
          "-p",
          url.port || "5432",
          "-U",
          url.username,
          "-d",
          url.pathname.slice(1),
          "--no-password",
          "-f",
          outputPath.replace(".gz", ""),
        ],
        { PGPASSWORD: url.password }
      );

      // Comprimir
      await this.runCommand("gzip", [outputPath.replace(".gz", "")]);
    } else if (databaseUrl.includes("mysql")) {
      // MySQL
      const url = new URL(databaseUrl);
      await this.runCommand(
        "mysqldump",
        [
          `-h${url.hostname}`,
          `-P${url.port || "3306"}`,
          `-u${url.username}`,
          `-p${url.password}`,
          url.pathname.slice(1),
        ],
        {},
        outputPath
      );

      // Comprimir
      await this.runCommand("gzip", [outputPath.replace(".gz", "")]);
    }

    return fileName;
  }

  /**
   * Crea backup de un directorio
   */
  private static async backupDirectory(sourceDir: string, targetDir: string): Promise<boolean> {
    try {
      await fs.access(sourceDir);
      await this.copyDirectory(sourceDir, targetDir);
      return true;
    } catch (error) {
      console.warn(`Directorio ${sourceDir} no existe o no es accesible`);
      return false;
    }
  }

  /**
   * Crea backup de la configuración
   */
  private static async backupConfig(tempDir: string): Promise<string> {
    const config = await prisma.setting.findMany();
    const configData = config.reduce((acc, setting) => {
      if (!acc[setting.namespace]) {
        acc[setting.namespace] = {};
      }
      acc[setting.namespace][setting.key] = setting.value;
      return acc;
    }, {} as any);

    const fileName = "config.json";
    const configPath = path.join(tempDir, fileName);
    await fs.writeFile(configPath, JSON.stringify(configData, null, 2));

    return fileName;
  }

  /**
   * Crea archivo tar.gz
   */
  private static async createTarGz(sourceDir: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath);
      const archive = archiver("tar", { gzip: true });

      output.on("close", resolve);
      archive.on("error", reject);

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  /**
   * Cifra un archivo
   */
  private static async encryptFile(
    inputPath: string,
    outputPath: string
  ): Promise<{ iv: Buffer; authTag: Buffer }> {
    const key = crypto.scryptSync(process.env.BACKUP_ENCRYPTION_KEY || "default-key", "salt", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM("aes-256-gcm", key, iv);

    const input = createReadStream(inputPath);
    const output = createWriteStream(outputPath);

    await pipeline(input, cipher, output);

    const authTag = cipher.getAuthTag();
    return { iv, authTag };
  }

  /**
   * Sube archivo al destino configurado
   */
  private static async uploadToDestination(
    filePath: string,
    destino: BackupCfg["destino"],
    fileName: string
  ): Promise<string> {
    switch (destino.tipo) {
      case "s3":
      case "minio":
        return this.uploadToS3(filePath, destino.credenciales, fileName);
      case "ftp":
        // TODO: Implementar FTP
        throw new Error("Destino FTP no implementado aún");
      case "drive":
        // TODO: Implementar Google Drive
        throw new Error("Destino Google Drive no implementado aún");
      default:
        return filePath;
    }
  }

  /**
   * Sube archivo a S3/MinIO
   */
  private static async uploadToS3(
    filePath: string,
    credentials: any,
    fileName: string
  ): Promise<string> {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const client = new S3Client({
      region: credentials.region || "us-east-1",
      endpoint: credentials.endpoint,
      forcePathStyle: credentials.endpoint ? true : false, // Para MinIO
      credentials: {
        accessKeyId: credentials.accessKey,
        secretAccessKey: credentials.secretKey,
      },
    });

    const fileStream = createReadStream(filePath);
    const key = `${credentials.basePath || "backups"}/${fileName}`;

    await client.send(
      new PutObjectCommand({
        Bucket: credentials.bucket,
        Key: key,
        Body: fileStream,
      })
    );

    return `s3://${credentials.bucket}/${key}`;
  }

  /**
   * Obtiene la configuración de backup
   */
  static async getBackupConfig(): Promise<any> {
    try {
      const setting = await prisma.setting.findUnique({
        where: { namespace_key: { namespace: "backup", key: "config" } },
      });

      if (setting) {
        return setting.value;
      }
    } catch (error) {
      console.warn("Error obteniendo configuración de backup:", error);
    }

    // Configuración por defecto compatible con el frontend
    return {
      // Ámbito del respaldo
      incluirDatos: true,
      incluirEsquema: true,
      incluirUploads: true,
      incluirPlantillas: true,
      incluirConfiguracion: true,

      // Programación automática
      habilitado: false,
      frecuencia: "diario",
      hora: "02:30",
      diaSemana: 0,
      diaMes: 1,
      retencionDias: 30,
      maxRespaldos: 10,

      // Destino de almacenamiento
      tipoDestino: "local",
      rutaLocal: "/var/backups/taller",
      s3Endpoint: "",
      s3Bucket: "",
      s3AccessKey: "",
      s3SecretKey: "",
      encriptar: false,
    };
  }

  /**
   * Guarda la configuración de backup
   */
  static async saveBackupConfig(config: any): Promise<void> {
    await prisma.setting.upsert({
      where: { namespace_key: { namespace: "backup", key: "config" } },
      update: { value: config },
      create: {
        namespace: "backup",
        key: "config",
        value: config,
        type: "json",
        isSystem: false,
      },
    });
  }

  /**
   * Obtiene logs de backup
   */
  static async getLogs(
    page: number = 1,
    limit: number = 20
  ): Promise<{ logs: BackupLog[]; total: number }> {
    const [logs, total] = await Promise.all([
      prisma.backupLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.backupLog.count(),
    ]);

    return {
      logs: logs.map(this.mapLogToInterface),
      total,
    };
  }

  /**
   * Obtiene un log específico
   */
  static async getLog(id: string): Promise<BackupLog | null> {
    const log = await prisma.backupLog.findUnique({ where: { id } });
    return log ? this.mapLogToInterface(log) : null;
  }

  /**
   * Obtiene el último log
   */
  static async getLatest(): Promise<BackupLog | null> {
    const log = await prisma.backupLog.findFirst({
      orderBy: { createdAt: "desc" },
    });
    return log ? this.mapLogToInterface(log) : null;
  }

  /**
   * Aplica políticas de retención
   */
  private static async applyRetention(retentionDays: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const oldLogs = await prisma.backupLog.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { not: "RUNNING" },
      },
    });

    for (const log of oldLogs) {
      if (log.location && log.location.startsWith("file://")) {
        try {
          await fs.unlink(log.location.replace("file://", ""));
        } catch (error) {
          console.warn(`No se pudo eliminar archivo ${log.location}:`, error);
        }
      }
    }

    await prisma.backupLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { not: "RUNNING" },
      },
    });
  }

  /**
   * Utilidades auxiliares
   */
  private static async updateLog(id: string, status: string, message: string): Promise<void> {
    await prisma.backupLog.update({
      where: { id },
      data: { status, message },
    });
  }

  private static async runCommand(
    command: string,
    args: string[],
    env?: any,
    outputFile?: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { env: { ...process.env, ...env } });

      if (outputFile) {
        const output = createWriteStream(outputFile);
        proc.stdout.pipe(output);
      }

      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Command ${command} failed with code ${code}`));
      });

      proc.on("error", reject);
    });
  }

  private static async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const files = await fs.readdir(src);

    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      const stat = await fs.stat(srcPath);

      if (stat.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  private static async calculateChecksum(filePath: string): Promise<string> {
    const hash = crypto.createHash("sha256");
    const stream = createReadStream(filePath);

    for await (const chunk of stream) {
      hash.update(chunk);
    }

    return hash.digest("hex");
  }

  private static async cleanupTemp(tempDir: string): Promise<void> {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`No se pudo limpiar directorio temporal ${tempDir}:`, error);
    }
  }

  private static mapLogToInterface(log: any): BackupLog {
    return {
      id: log.id,
      fecha: log.createdAt.toISOString(),
      usuario: log.userId,
      tamanoBytes: Number(log.sizeBytes || 0),
      estado: log.status,
      mensaje: log.message,
      ubicacion: log.location,
      scope: {
        bd: log.scopeBd,
        adjuntos: log.scopeAdj,
        plantillas: log.scopeTpl,
      },
    };
  }
}
