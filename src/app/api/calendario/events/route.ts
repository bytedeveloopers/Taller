import { prisma } from "@/lib/prisma";
import { AppointmentStatus, EventType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener todos los eventos del calendario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get("technicianId");
    const type = searchParams.get("type") as EventType | null;
    const status = searchParams.get("status") as AppointmentStatus | null;
    const customerId = searchParams.get("customerId");
    const taskId = searchParams.get("taskId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const includeBlockers = searchParams.get("includeBlockers") === "true";

    let whereClause: any = {};

    // Aplicar filtros
    if (technicianId) {
      whereClause.technicianId = technicianId;
    }

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (taskId) {
      whereClause.taskId = taskId;
    }

    if (!includeBlockers) {
      whereClause.isBlocker = false;
    }

    if (startDate && endDate) {
      whereClause.scheduledAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const events = await prisma.appointment.findMany({
      where: whereClause,
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
      orderBy: { scheduledAt: "asc" },
    });

    // Transformar los datos al formato CalendarEvent
    const calendarEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      type: event.type,
      scheduledAt: event.scheduledAt,
      startAt: event.startAt,
      endAt: event.endAt,
      estimatedDuration: event.estimatedDuration,
      location: event.location,
      note: event.note,
      notes: event.notes, // Campo legacy
      status: event.status,
      vehicleId: event.vehicleId,
      customerId: event.customerId,
      technicianId: event.technicianId,
      taskId: event.taskId,
      reminder24h: event.reminder24h,
      reminder1h: event.reminder1h,
      reminder15m: event.reminder15m,
      isBlocker: event.isBlocker,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      // Relaciones
      vehicle: event.vehicle,
      customer: event.customer,
      technician: event.technician,
      task: event.task,
    }));

    return NextResponse.json({
      success: true,
      data: calendarEvents,
    });
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Crear nuevo evento
export async function POST(request: NextRequest) {
  try {
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
    } = body;

    // Validaciones
    if (!scheduledAt) {
      return NextResponse.json({ error: "La fecha y hora son requeridas" }, { status: 400 });
    }

    if (isBlocker && !technicianId) {
      return NextResponse.json(
        { error: "Los bloqueos requieren seleccionar un técnico" },
        { status: 400 }
      );
    }

    // Verificar conflictos si es un bloqueo
    if (isBlocker && technicianId) {
      const conflictingEvents = await prisma.appointment.findMany({
        where: {
          technicianId,
          scheduledAt: {
            gte: new Date(scheduledAt),
            lt: endAt
              ? new Date(endAt)
              : new Date(new Date(scheduledAt).getTime() + (estimatedDuration || 60) * 60000),
          },
          status: {
            in: ["SCHEDULED", "IN_PROGRESS"],
          },
        },
      });

      if (conflictingEvents.length > 0) {
        return NextResponse.json(
          { error: "El técnico ya tiene eventos programados en este horario" },
          { status: 400 }
        );
      }
    }

    const newEvent = await prisma.appointment.create({
      data: {
        title: title || null,
        type: type || "CITA",
        scheduledAt: new Date(scheduledAt),
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
        estimatedDuration: estimatedDuration || null,
        location: location || null,
        note: note || null,
        vehicleId: vehicleId || null,
        customerId: customerId || null,
        technicianId: technicianId || null,
        taskId: taskId || null,
        reminder24h: reminder24h || false,
        reminder1h: reminder1h || false,
        reminder15m: reminder15m || false,
        isBlocker: isBlocker || false,
        status: "SCHEDULED",
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
      data: newEvent,
      message: "Evento creado exitosamente",
    });
  } catch (error) {
    console.error("Error al crear evento:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
