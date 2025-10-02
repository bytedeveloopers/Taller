import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/tecnicos/[id]/schedule - Obtener agenda del técnico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const view = searchParams.get("view") || "month"; // day, week, month

    console.log("📅 Obteniendo agenda del técnico:", id);

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

    // Simular eventos de agenda
    const scheduleEvents = [
      {
        id: "1",
        title: "Mantenimiento Toyota Corolla",
        type: "WORK_ORDER",
        orderId: "OT-2024-001",
        date: new Date("2024-01-22"),
        startTime: "08:00",
        endTime: "12:00",
        status: "PROGRAMADA",
        priority: "MEDIA",
        customerName: "Juan Pérez",
        vehiclePlate: "ABC123",
        estimatedHours: 4,
      },
      {
        id: "2",
        title: "Reparación frenos Chevrolet Aveo",
        type: "WORK_ORDER",
        orderId: "OT-2024-002",
        date: new Date("2024-01-22"),
        startTime: "14:00",
        endTime: "17:00",
        status: "PROGRAMADA",
        priority: "ALTA",
        customerName: "María García",
        vehiclePlate: "XYZ789",
        estimatedHours: 3,
      },
      {
        id: "3",
        title: "Cita médica",
        type: "PERSONAL",
        date: new Date("2024-01-23"),
        startTime: "10:00",
        endTime: "11:00",
        status: "CONFIRMADA",
        priority: "ALTA",
        notes: "Revisión médica anual",
      },
      {
        id: "4",
        title: "Capacitación nuevas tecnologías",
        type: "TRAINING",
        date: new Date("2024-01-24"),
        startTime: "09:00",
        endTime: "17:00",
        status: "PROGRAMADA",
        priority: "MEDIA",
        location: "Sala de capacitación",
      },
      {
        id: "5",
        title: "Vacaciones",
        type: "VACATION",
        date: new Date("2024-01-25"),
        startTime: "00:00",
        endTime: "23:59",
        status: "APROBADA",
        priority: "BAJA",
        notes: "Vacaciones programadas",
      },
    ];

    // Filtrar por fecha si se especifica
    let filteredEvents = [...scheduleEvents];
    if (date) {
      const filterDate = new Date(date);
      filteredEvents = filteredEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === filterDate.toDateString();
      });
    }

    // Estadísticas de la agenda
    const stats = {
      totalEvents: scheduleEvents.length,
      workOrders: scheduleEvents.filter((e) => e.type === "WORK_ORDER").length,
      personalEvents: scheduleEvents.filter((e) => e.type === "PERSONAL").length,
      trainings: scheduleEvents.filter((e) => e.type === "TRAINING").length,
      vacations: scheduleEvents.filter((e) => e.type === "VACATION").length,
      hoursScheduled: scheduleEvents
        .filter((e) => e.type === "WORK_ORDER")
        .reduce((sum, e) => sum + (e.estimatedHours || 0), 0),
    };

    // Horario de trabajo
    const workingHours = {
      monday: { start: "08:00", end: "17:00", isWorking: true },
      tuesday: { start: "08:00", end: "17:00", isWorking: true },
      wednesday: { start: "08:00", end: "17:00", isWorking: true },
      thursday: { start: "08:00", end: "17:00", isWorking: true },
      friday: { start: "08:00", end: "17:00", isWorking: true },
      saturday: { start: "08:00", end: "12:00", isWorking: true },
      sunday: { start: "00:00", end: "00:00", isWorking: false },
    };

    console.log("✅ Agenda obtenida exitosamente");

    return NextResponse.json({
      success: true,
      data: {
        events: filteredEvents,
        stats,
        workingHours,
        view,
      },
      message: "Agenda obtenida exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo agenda:", error);
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

// POST /api/tecnicos/[id]/schedule - Crear evento en agenda
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, type, date, startTime, endTime, priority, notes, orderId, location } = body;

    console.log("📅 Creando evento en agenda del técnico:", id);

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

    // Simular creación del evento
    const newEvent = {
      id: Date.now().toString(),
      title,
      type,
      date: new Date(date),
      startTime,
      endTime,
      status: "PROGRAMADA",
      priority: priority || "MEDIA",
      notes: notes || "",
      orderId: orderId || null,
      location: location || null,
      createdAt: new Date(),
    };

    console.log("✅ Evento creado exitosamente en agenda");

    return NextResponse.json({
      success: true,
      data: newEvent,
      message: "Evento creado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error creando evento en agenda:", error);
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
