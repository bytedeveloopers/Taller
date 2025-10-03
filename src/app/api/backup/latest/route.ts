import { BackupService } from "@/services/BackupService";
import { NextResponse } from "next/server";

// GET /api/backup/latest - Obtener el último log de backup
export async function GET() {
  try {
    const log = await BackupService.getLatest();

    return NextResponse.json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error("Error obteniendo último backup:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener el último backup" },
      { status: 500 }
    );
  }
}
