import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener evento específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const event = await prisma.appointment.findUnique({
      where: { id },
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
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error al obtener evento:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT - Actualizar evento completo
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      title,
      type,
      scheduledAt,
      startAt,
      endAt,
      estimatedDuration,
      location,
      note,
      vehicleId,
      customerId,
      technicianId,
      taskId,
      reminder24h,
      reminder1h,
      reminder15m,
      isBlocker,
      status,
    } = body;

    // Verificar que el evento existe
    const existingEvent = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Validaciones
    if (isBlocker && !technicianId) {
      return NextResponse.json(
        { error: "Los bloqueos requieren seleccionar un técnico" },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.appointment.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingEvent.title,
        type: type || existingEvent.type,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : existingEvent.scheduledAt,
        startAt: startAt ? new Date(startAt) : existingEvent.startAt,
        endAt: endAt ? new Date(endAt) : existingEvent.endAt,
        estimatedDuration:
          estimatedDuration !== undefined ? estimatedDuration : existingEvent.estimatedDuration,
        location: location !== undefined ? location : existingEvent.location,
        note: note !== undefined ? note : existingEvent.note,
        vehicleId: vehicleId !== undefined ? vehicleId : existingEvent.vehicleId,
        customerId: customerId !== undefined ? customerId : existingEvent.customerId,
        technicianId: technicianId !== undefined ? technicianId : existingEvent.technicianId,
        taskId: taskId !== undefined ? taskId : existingEvent.taskId,
        reminder24h: reminder24h !== undefined ? reminder24h : existingEvent.reminder24h,
        reminder1h: reminder1h !== undefined ? reminder1h : existingEvent.reminder1h,
        reminder15m: reminder15m !== undefined ? reminder15m : existingEvent.reminder15m,
        isBlocker: isBlocker !== undefined ? isBlocker : existingEvent.isBlocker,
        status: status || existingEvent.status,
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
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: "Evento actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PATCH - Actualización parcial (para drag & drop)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { scheduledAt, startAt, endAt } = body;

    // Verificar que el evento existe
    const existingEvent = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Actualizar solo los campos de fecha/hora
    const updatedEvent = await prisma.appointment.update({
      where: { id },
      data: {
        scheduledAt: scheduledAt ? new Date(scheduledAt) : existingEvent.scheduledAt,
        startAt: startAt ? new Date(startAt) : existingEvent.startAt,
        endAt: endAt ? new Date(endAt) : existingEvent.endAt,
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
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: "Evento reprogramado exitosamente",
    });
  } catch (error) {
    console.error("Error al reprogramar evento:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar evento
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Verificar que el evento existe
    const existingEvent = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Evento eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
