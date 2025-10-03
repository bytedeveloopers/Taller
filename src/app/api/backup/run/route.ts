import { BackupService } from "@/services/BackupService";
import { NextRequest, NextResponse } from "next/server";

// POST /api/backup/run - Ejecutar backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = request.headers.get("x-user-id") || "unknown";

    const result = await BackupService.runBackup(userId, body.override);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error ejecutando backup:", error);
    return NextResponse.json(
      { success: false, error: "Error al ejecutar el backup" },
      { status: 500 }
    );
  }
}
