import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/tecnicos/[id]/workload - Obtener carga de trabajo y capacidad del técnico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week"; // day, week, month

    console.log("⚖️ Obteniendo carga de trabajo del técnico:", id);

    // Verificar que el técnico existe
    const technician = await prisma.user.findUnique({
      where: {
        id: id,
        role: "TECHNICIAN",
      },
    });

    if (!technician) {
      return NextResponse.json(
        {
          success: false,
          error: "Técnico no encontrado",
        },
        { status: 404 }
      );
    }

    // Simular datos de carga de trabajo
    const workload = {
      period,
      capacity: {
        hoursPerDay: 8,
        daysPerWeek: 6,
        maxOrdersPerDay: 5,
        maxOrdersPerWeek: 25,
      },
      current: {
        assignedOrders: Math.floor(Math.random() * 6) + 2, // 2-7
        hoursScheduled: Math.floor(Math.random() * 30) + 20, // 20-49
        availableHours: Math.floor(Math.random() * 15) + 3, // 3-17
        utilizationRate: Math.floor(Math.random() * 30) + 70, // 70-99%
      },

      // Distribución por día de la semana
      weeklyDistribution: [
        { day: "Lun", assigned: Math.floor(Math.random() * 4) + 1, capacity: 5 },
        { day: "Mar", assigned: Math.floor(Math.random() * 4) + 1, capacity: 5 },
        { day: "Mié", assigned: Math.floor(Math.random() * 4) + 1, capacity: 5 },
        { day: "Jue", assigned: Math.floor(Math.random() * 4) + 1, capacity: 5 },
        { day: "Vie", assigned: Math.floor(Math.random() * 4) + 1, capacity: 5 },
        { day: "Sáb", assigned: Math.floor(Math.random() * 3) + 1, capacity: 3 },
      ],

      // Histórico de los últimos 30 días
      historical: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        ordersCompleted: Math.floor(Math.random() * 4) + 1,
        hoursWorked: Math.floor(Math.random() * 4) + 4, // 4-7 horas
        utilizationRate: Math.floor(Math.random() * 30) + 70,
      })),

      // Análisis de capacidad
      analysis: {
        status:
          Math.random() > 0.7 ? "SOBRECARGADO" : Math.random() > 0.4 ? "OPTIMO" : "DISPONIBLE",
        recommendations: [
          "Redistribuir 2 órdenes de trabajo para equilibrar carga",
          "Programar capacitación en horario de menor carga",
          "Considerar asignación de órdenes de alta prioridad",
        ],
        nextAvailableSlot: {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          time: "14:00",
          duration: "3 horas",
        },
      },

      // Comparación con promedios
      benchmarks: {
        workshopAverage: {
          utilizationRate: 82,
          ordersPerWeek: 18,
          hoursPerWeek: 40,
        },
        personalBest: {
          utilizationRate: 95,
          ordersPerWeek: 23,
          hoursPerWeek: 45,
        },
      },
    };

    // Calcular semáforo de carga
    const utilizationRate = workload.current.utilizationRate;
    let loadStatus: "DISPONIBLE" | "OPTIMO" | "SOBRECARGADO";
    let loadColor: "green" | "yellow" | "red";

    if (utilizationRate < 70) {
      loadStatus = "DISPONIBLE";
      loadColor = "green";
    } else if (utilizationRate < 90) {
      loadStatus = "OPTIMO";
      loadColor = "yellow";
    } else {
      loadStatus = "SOBRECARGADO";
      loadColor = "red";
    }

    workload.analysis.status = loadStatus;

    console.log("✅ Carga de trabajo obtenida exitosamente");

    return NextResponse.json({
      success: true,
      data: {
        ...workload,
        loadIndicator: {
          status: loadStatus,
          color: loadColor,
          percentage: utilizationRate,
        },
      },
      message: "Carga de trabajo obtenida exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo carga de trabajo:", error);
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
