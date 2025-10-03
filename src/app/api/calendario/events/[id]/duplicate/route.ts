import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST - Duplicar evento
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Obtener el evento original
    const originalEvent = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!originalEvent) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Crear una copia del evento para mañana a la misma hora
    const tomorrow = new Date(originalEvent.scheduledAt);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const duplicatedEvent = await prisma.appointment.create({
      data: {
        scheduledAt: tomorrow,
        estimatedDuration: originalEvent.estimatedDuration,
        status: "SCHEDULED",
        notes: originalEvent.notes,
        vehicleId: originalEvent.vehicleId,
        customerId: originalEvent.customerId,
        technicianId: originalEvent.technicianId,
        // Campos nuevos que se agregaron (con valores por defecto)
        title: null,
        type: "CITA",
        startAt: null,
        endAt: null,
        location: null,
        note: null,
        taskId: null,
        reminder24h: false,
        reminder1h: false,
        reminder15m: false,
        isBlocker: false,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            licensePlate: true,
            trackingCode: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: duplicatedEvent,
      message: "Evento duplicado exitosamente",
    });
  } catch (error) {
    console.error("Error al duplicar evento:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
