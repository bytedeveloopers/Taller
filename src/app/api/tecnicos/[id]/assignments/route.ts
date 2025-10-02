import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/tecnicos/[id]/assignments - Obtener asignaciones del técnico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    console.log("📋 Obteniendo asignaciones del técnico:", id);

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

    // Simular asignaciones de órdenes de trabajo
    const assignments = [
      {
        id: "1",
        workOrderId: "OT-2024-001",
        vehicleInfo: {
          plate: "ABC123",
          brand: "Toyota",
          model: "Corolla",
          year: 2020,
        },
        customerInfo: {
          name: "Juan Pérez",
          phone: "3001234567",
        },
        title: "Mantenimiento preventivo completo",
        description: "Cambio de aceite, filtros y revisión general",
        status: "EN_PROGRESO",
        priority: "MEDIA",
        estimatedHours: 4,
        assignedDate: new Date("2024-01-20"),
        dueDate: new Date("2024-01-22"),
        progress: 75,
      },
      {
        id: "2",
        workOrderId: "OT-2024-002",
        vehicleInfo: {
          plate: "XYZ789",
          brand: "Chevrolet",
          model: "Aveo",
          year: 2019,
        },
        customerInfo: {
          name: "María García",
          phone: "3009876543",
        },
        title: "Reparación de frenos",
        description: "Cambio de pastillas y discos de freno delanteros",
        status: "PENDIENTE",
        priority: "ALTA",
        estimatedHours: 3,
        assignedDate: new Date("2024-01-21"),
        dueDate: new Date("2024-01-21"),
        progress: 0,
      },
      {
        id: "3",
        workOrderId: "OT-2024-003",
        vehicleInfo: {
          plate: "DEF456",
          brand: "Ford",
          model: "Focus",
          year: 2018,
        },
        customerInfo: {
          name: "Carlos López",
          phone: "3005555555",
        },
        title: "Diagnóstico motor",
        description: "Revisión por falla en el motor",
        status: "COMPLETADA",
        priority: "BAJA",
        estimatedHours: 2,
        assignedDate: new Date("2024-01-19"),
        dueDate: new Date("2024-01-20"),
        progress: 100,
      },
    ];

    // Aplicar filtros
    let filteredAssignments = [...assignments];

    if (status) {
      filteredAssignments = filteredAssignments.filter((a) => a.status === status);
    }

    if (priority) {
      filteredAssignments = filteredAssignments.filter((a) => a.priority === priority);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredAssignments = filteredAssignments.filter((a) => a.assignedDate >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredAssignments = filteredAssignments.filter((a) => a.assignedDate <= toDate);
    }

    // Estadísticas
    const stats = {
      total: assignments.length,
      pendientes: assignments.filter((a) => a.status === "PENDIENTE").length,
      enProgreso: assignments.filter((a) => a.status === "EN_PROGRESO").length,
      completadas: assignments.filter((a) => a.status === "COMPLETADA").length,
      horasEstimadas: assignments.reduce((sum, a) => sum + a.estimatedHours, 0),
    };

    console.log("✅ Asignaciones obtenidas exitosamente");

    return NextResponse.json({
      success: true,
      data: {
        assignments: filteredAssignments,
        stats,
      },
      message: "Asignaciones obtenidas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo asignaciones:", error);
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
