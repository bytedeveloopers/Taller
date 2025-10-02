import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/tecnicos/stats - Estadísticas de técnicos
export async function GET(request: NextRequest) {
  try {
    console.log("📊 Obteniendo estadísticas de técnicos...");

    // Obtener técnicos de la base de datos
    const tecnicos = await prisma.user.findMany({
      where: {
        role: "TECHNICIAN",
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    // Calcular estadísticas simuladas
    const totalTecnicos = tecnicos.length;
    const tecnicosActivos = tecnicos.filter((t) => t.isActive).length;

    // Simular carga promedio (en producción vendría de la tabla de asignaciones)
    const cargaPromedio = Math.floor(Math.random() * 30) + 50; // 50-80%

    // Calcular disponibles (técnicos activos con carga baja)
    const disponibles = Math.floor(tecnicosActivos * 0.6); // ~60% disponibles

    const stats = {
      totalTecnicos,
      tecnicosActivos,
      cargaPromedio,
      disponibles,
    };

    console.log("✅ Estadísticas de técnicos obtenidas:", stats);

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Estadísticas obtenidas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas de técnicos:", error);
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
