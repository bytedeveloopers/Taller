import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/cotizaciones/stats - Obtener estadísticas de cotizaciones
export async function GET(request: NextRequest) {
  try {
    console.log("📊 Obteniendo estadísticas de cotizaciones");

    // Simular estadísticas
    const stats = {
      totalCotizaciones: 25,
      borradores: 3,
      enviadas: 8,
      aprobadas: 12,
      rechazadas: 2,
      ajusteSolicitado: 0,
      vencidas: 0,
      totalMontoMes: 45680.5,
      tasaAprobacion: 85.7, // (aprobadas / (aprobadas + rechazadas)) * 100
      tiempoPromedioRespuesta: 24, // horas
    };

    console.log("✅ Estadísticas obtenidas exitosamente");

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Estadísticas obtenidas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
