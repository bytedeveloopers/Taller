import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/tecnicos/[id]/performance - Obtener métricas de desempeño del técnico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // días

    console.log("📊 Obteniendo métricas de desempeño del técnico:", id);

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

    // Simular métricas de desempeño
    const performance = {
      periodDays: parseInt(period),
      ordersCompleted: Math.floor(Math.random() * 20) + 15,
      averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
      onTimeDelivery: Math.floor(Math.random() * 20) + 80, // 80-100%
      efficiency: Math.floor(Math.random() * 15) + 85, // 85-100%
      totalHoursWorked: Math.floor(Math.random() * 50) + 120,
      averageHoursPerOrder: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0 horas

      // Datos para gráficos
      weeklyOrders: [
        { week: "Sem 1", completed: Math.floor(Math.random() * 5) + 3 },
        { week: "Sem 2", completed: Math.floor(Math.random() * 5) + 4 },
        { week: "Sem 3", completed: Math.floor(Math.random() * 5) + 3 },
        { week: "Sem 4", completed: Math.floor(Math.random() * 5) + 5 },
      ],

      skillsRating: [
        { skill: "Motor", rating: Math.floor(Math.random() * 2) + 4 },
        { skill: "Transmisión", rating: Math.floor(Math.random() * 2) + 3 },
        { skill: "Frenos", rating: Math.floor(Math.random() * 2) + 4 },
        { skill: "Suspensión", rating: Math.floor(Math.random() * 2) + 3 },
        { skill: "Sistema Eléctrico", rating: Math.floor(Math.random() * 2) + 3 },
      ],

      recentFeedback: [
        {
          orderId: "OT-2024-001",
          customerName: "Juan Pérez",
          rating: 5,
          comment: "Excelente trabajo, muy profesional",
          date: new Date("2024-01-20"),
        },
        {
          orderId: "OT-2024-002",
          customerName: "María García",
          rating: 4,
          comment: "Buen servicio, entrega a tiempo",
          date: new Date("2024-01-18"),
        },
        {
          orderId: "OT-2024-003",
          customerName: "Carlos López",
          rating: 5,
          comment: "Muy satisfecho con la reparación",
          date: new Date("2024-01-15"),
        },
      ],

      // Comparación con el promedio del taller
      comparison: {
        averageRating: {
          technician: 4.6,
          workshop: 4.2,
        },
        efficiency: {
          technician: 92,
          workshop: 87,
        },
        onTimeDelivery: {
          technician: 95,
          workshop: 88,
        },
      },
    };

    console.log("✅ Métricas de desempeño obtenidas exitosamente");

    return NextResponse.json({
      success: true,
      data: performance,
      message: "Métricas de desempeño obtenidas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo métricas de desempeño:", error);
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
