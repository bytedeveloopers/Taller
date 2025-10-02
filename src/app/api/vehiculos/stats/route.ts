import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/vehiculos/stats - Obtener estadísticas de vehículos
export async function GET(request: NextRequest) {
  try {
    // Fecha actual para cálculos de proximidad
    const hoy = new Date();
    const proximosMantenimientos = new Date();
    proximosMantenimientos.setDate(hoy.getDate() + 30); // Próximos 30 días

    const [totalVehiculos, vehiculosActivos, vehiculosProximoMantenimiento, vehiculosEnTaller] =
      await Promise.all([
        // Total de vehículos
        prisma.vehicle.count(),

        // Vehículos activos (simulado por ahora)
        prisma.vehicle.count(),

        // Vehículos con próximo mantenimiento (simulado por ahora)
        Promise.resolve(3),

        // Vehículos en taller (con citas activas)
        prisma.vehicle.count({
          where: {
            appointments: {
              some: {
                status: {
                  in: ["SCHEDULED", "IN_PROGRESS"],
                },
              },
            },
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        totalVehiculos,
        vehiculosActivos,
        proximoMantenimiento: vehiculosProximoMantenimiento,
        enTaller: vehiculosEnTaller,
      },
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas de vehículos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
