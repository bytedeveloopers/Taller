import { backupScheduler } from "@/services/BackupScheduler";
import { BackupService } from "@/services/BackupService";
import { NextRequest, NextResponse } from "next/server";

// GET /api/config/backup - Obtener configuración de backup
export async function GET() {
  try {
    const config = await BackupService.getBackupConfig();

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error obteniendo configuración de backup:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener la configuración de backup" },
      { status: 500 }
    );
  }
}

// PUT /api/config/backup - Guardar configuración de backup
export async function PUT(request: NextRequest) {
  try {
    const config = await request.json();

    // Validar que la configuración existe
    if (!config || typeof config !== "object") {
      return NextResponse.json(
        { success: false, error: "Configuración inválida" },
        { status: 400 }
      );
    }

    await BackupService.saveBackupConfig(config);

    // Actualizar scheduler con nueva configuración
    await backupScheduler.updateSchedule();

    return NextResponse.json({
      success: true,
      data: config,
      message: "Configuración de backup guardada exitosamente",
    });
  } catch (error) {
    console.error("Error guardando configuración de backup:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar la configuración de backup" },
      { status: 500 }
    );
  }
}
