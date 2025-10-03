/**
 * API endpoint para obtener el estado del último respaldo
 * GET /api/backup/status - Obtiene información del último respaldo y estado actual
 */

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Obtener el último backup log
    const latestBackup = await prisma.backupLog.findFirst({
      orderBy: { fechaInicio: "desc" },
    });

    // Obtener estadísticas de respaldos
    const stats = await prisma.backupLog.groupBy({
      by: ["estado"],
      _count: {
        id: true,
      },
    });

    // Calcular espacio total usado por respaldos
    const totalSizeResult = await prisma.backupLog.aggregate({
      _sum: {
        tamanioBytes: true,
      },
      where: {
        estado: "completado",
        tamanioBytes: {
          not: null,
        },
      },
    });

    const totalSizeBytes = totalSizeResult._sum.tamanioBytes || BigInt(0);
    const totalSizeMB = Number(totalSizeBytes) / (1024 * 1024);

    // Formatear estadísticas
    const estadisticas = {
      total: stats.reduce((acc, stat) => acc + stat._count.id, 0),
      completados: stats.find((s) => s.estado === "completado")?._count.id || 0,
      errores: stats.find((s) => s.estado === "error")?._count.id || 0,
      enProgreso: stats.find((s) => s.estado === "en_progreso")?._count.id || 0,
      espacioTotalMB: Math.round(totalSizeMB * 100) / 100,
    };

    return NextResponse.json({
      success: true,
      data: {
        ultimoRespaldo: latestBackup
          ? {
              id: latestBackup.id,
              estado: latestBackup.estado,
              fechaInicio: latestBackup.fechaInicio,
              fechaFin: latestBackup.fechaFin,
              tamanioMB: latestBackup.tamanioBytes
                ? Math.round((Number(latestBackup.tamanioBytes) / (1024 * 1024)) * 100) / 100
                : null,
              duracionSegundos: latestBackup.duracionMs
                ? Math.round(latestBackup.duracionMs / 1000)
                : null,
              tipoDestino: latestBackup.tipoDestino,
              encriptado: latestBackup.encriptado,
              error: latestBackup.error,
            }
          : null,
        estadisticas,
      },
    });
  } catch (error) {
    console.error("Error getting backup status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener el estado de respaldos",
      },
      { status: 500 }
    );
  }
}
