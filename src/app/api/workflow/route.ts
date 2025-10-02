import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Flujo secuencial definido
const WORKFLOW_SEQUENCE = [
  "RECEPCION",
  "INGRESO",
  "DIAGNOSTICO",
  "COTIZACION_APROBACION",
  "PROCESO_DESARME",
  "ESPERA",
  "PROCESO_ARMADO",
  "PRUEBA_CALIDAD",
  "ENTREGA",
] as const;

type VehicleStatus = (typeof WORKFLOW_SEQUENCE)[number];

// GET - Obtener historial de workflow de un vehículo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");

    if (!vehicleId) {
      return NextResponse.json(
        { success: false, error: "vehicleId es requerido" },
        { status: 400 }
      );
    }

    // Obtener historial de workflow del vehículo
    const workflowHistory = await prisma.workflowStatus.findMany({
      where: { vehicleId },
      include: {
        technician: {
          select: { id: true, name: true },
        },
        vehicle: {
          select: {
            id: true,
            trackingCode: true,
            brand: true,
            model: true,
            status: true,
          },
        },
      },
      orderBy: { timestamp: "asc" },
    });

    // Determinar el próximo estado disponible
    const currentStatus = workflowHistory[workflowHistory.length - 1]?.status;
    const currentIndex = WORKFLOW_SEQUENCE.indexOf(currentStatus as VehicleStatus);
    const nextStatus =
      currentIndex < WORKFLOW_SEQUENCE.length - 1 ? WORKFLOW_SEQUENCE[currentIndex + 1] : null;

    return NextResponse.json({
      success: true,
      data: {
        vehicleId,
        currentStatus,
        nextStatus,
        workflowSequence: WORKFLOW_SEQUENCE,
        history: workflowHistory,
      },
    });
  } catch (error) {
    console.error("Error obteniendo workflow:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Actualizar estado del workflow (solo técnicos)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, newStatus, technicianId, notes } = body;

    // Validaciones básicas
    if (!vehicleId || !newStatus || !technicianId) {
      return NextResponse.json(
        { success: false, error: "vehicleId, newStatus y technicianId son requeridos" },
        { status: 400 }
      );
    }

    // Validar que el estado sea válido
    if (!WORKFLOW_SEQUENCE.includes(newStatus as VehicleStatus)) {
      return NextResponse.json(
        { success: false, error: "Estado de workflow inválido" },
        { status: 400 }
      );
    }

    // Verificar que el técnico existe y está activo
    const technician = await prisma.user.findFirst({
      where: {
        id: technicianId,
        role: "TECHNICIAN",
        isActive: true,
      },
    });

    if (!technician) {
      return NextResponse.json(
        { success: false, error: "Técnico no encontrado o inactivo" },
        { status: 404 }
      );
    }

    // Verificar que el vehículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        appointments: {
          where: { technicianId },
          take: 1,
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el técnico está asignado al vehículo
    if (vehicle.appointments.length === 0) {
      return NextResponse.json(
        { success: false, error: "El técnico no está asignado a este vehículo" },
        { status: 403 }
      );
    }

    // Obtener el estado actual del workflow
    const currentWorkflow = await prisma.workflowStatus.findFirst({
      where: { vehicleId },
      orderBy: { timestamp: "desc" },
    });

    const currentStatus = currentWorkflow?.status || "RECEPCION";
    const currentIndex = WORKFLOW_SEQUENCE.indexOf(currentStatus as VehicleStatus);
    const newIndex = WORKFLOW_SEQUENCE.indexOf(newStatus as VehicleStatus);

    // Validar que el flujo sea secuencial (solo avanzar al siguiente estado o retroceder uno)
    if (newIndex !== currentIndex + 1 && newIndex !== currentIndex - 1) {
      return NextResponse.json(
        {
          success: false,
          error: `Solo se puede avanzar al siguiente estado o retroceder uno. Estado actual: ${currentStatus}, próximo permitido: ${
            WORKFLOW_SEQUENCE[currentIndex + 1] || "ENTREGA"
          }`,
        },
        { status: 400 }
      );
    }

    // Crear transacción para actualizar vehículo y crear registro de workflow
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar estado del vehículo
      const updatedVehicle = await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: newStatus },
      });

      // Crear registro en historial de workflow
      const workflowRecord = await tx.workflowStatus.create({
        data: {
          vehicleId,
          status: newStatus,
          technicianId,
          notes: notes || `Estado actualizado de ${currentStatus} a ${newStatus}`,
          timestamp: new Date(),
        },
        include: {
          technician: {
            select: { id: true, name: true },
          },
        },
      });

      return { vehicle: updatedVehicle, workflow: workflowRecord };
    });

    return NextResponse.json({
      success: true,
      message: "Estado de workflow actualizado exitosamente",
      data: {
        vehicle: result.vehicle,
        workflow: result.workflow,
        previousStatus: currentStatus,
        newStatus: newStatus,
      },
    });
  } catch (error) {
    console.error("Error actualizando workflow:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
