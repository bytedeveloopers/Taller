import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST - Asignar o reasignar técnico a una orden de trabajo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, technicianId, notas, crearRecordatorio, recordatorio } = body;

    if (!vehicleId || !technicianId) {
      return NextResponse.json(
        { success: false, error: "VehicleId y technicianId son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el técnico existe y está activo
    const tecnico = await prisma.user.findFirst({
      where: {
        id: technicianId,
        role: "TECHNICIAN",
        isActive: true,
      },
    });

    if (!tecnico) {
      return NextResponse.json(
        { success: false, error: "Técnico no encontrado o inactivo" },
        { status: 404 }
      );
    }

    // Verificar que el vehículo existe
    const vehiculo = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { customer: true },
    });

    if (!vehiculo) {
      return NextResponse.json(
        { success: false, error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    // Obtener la cita/OT actual si existe
    const citaExistente = await prisma.appointment.findFirst({
      where: { vehicleId },
      orderBy: { createdAt: "desc" },
    });

    let appointment;

    if (citaExistente) {
      // Actualizar cita existente
      appointment = await prisma.appointment.update({
        where: { id: citaExistente.id },
        data: {
          technicianId,
          notes: notas || citaExistente.notes,
          updatedAt: new Date(),
        },
        include: {
          technician: { select: { name: true } },
          customer: { select: { name: true } },
          vehicle: { select: { brand: true, model: true, trackingCode: true } },
        },
      });

      // Crear registro de historial de reasignación
      await prisma.appointment.create({
        data: {
          scheduledAt: new Date(),
          notes: `Reasignado de ${
            citaExistente.technicianId ? "técnico anterior" : "sin asignar"
          } a ${tecnico.name}. ${notas || ""}`,
          vehicleId,
          customerId: vehiculo.customerId,
          technicianId,
          status: "SCHEDULED",
        },
      });
    } else {
      // Crear nueva cita/OT
      appointment = await prisma.appointment.create({
        data: {
          scheduledAt: new Date(),
          notes: `Asignado a ${tecnico.name}. ${notas || "Nueva asignación"}`,
          vehicleId,
          customerId: vehiculo.customerId,
          technicianId,
          status: "SCHEDULED",
        },
        include: {
          technician: { select: { name: true } },
          customer: { select: { name: true } },
          vehicle: { select: { brand: true, model: true, trackingCode: true } },
        },
      });
    }

    // Actualizar estado del vehículo
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: "IN_PROGRESS" },
    });

    // Crear recordatorio si se solicita
    let recordatorioCreado = null;
    if (crearRecordatorio && recordatorio) {
      // Crear el recordatorio en la tabla específica
      recordatorioCreado = await prisma.reminder.create({
        data: {
          ordenTrabajoId: vehicleId,
          fechaRecordatorio: new Date(recordatorio.fechaInicio),
          mensaje: `${recordatorio.tipo.toUpperCase()}: ${recordatorio.titulo}. ${
            recordatorio.lugar ? `Lugar: ${recordatorio.lugar}` : ""
          }`,
          tipo: recordatorio.tipo.toUpperCase(),
          activo: true,
        },
      });

      // También crear una cita programada para el técnico
      await prisma.appointment.create({
        data: {
          scheduledAt: new Date(recordatorio.fechaInicio),
          estimatedDuration: recordatorio.duracion || 60,
          notes: `RECORDATORIO: ${recordatorio.titulo}`,
          vehicleId,
          customerId: vehiculo.customerId,
          technicianId,
          status: "SCHEDULED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: citaExistente ? "Técnico reasignado exitosamente" : "Técnico asignado exitosamente",
      data: {
        appointment: {
          id: appointment.id,
          vehicleId: appointment.vehicleId,
          technicianId: appointment.technicianId,
          technicianName: appointment.technician?.name,
          customerName: appointment.customer?.name,
          vehicleInfo: `${appointment.vehicle?.brand} ${appointment.vehicle?.model}`,
          trackingCode: appointment.vehicle?.trackingCode,
          notes: appointment.notes,
          scheduledAt: appointment.scheduledAt,
          status: appointment.status,
        },
        recordatorio: recordatorioCreado
          ? {
              id: recordatorioCreado.id,
              titulo: recordatorio.titulo,
              tipo: recordatorio.tipo,
              fechaInicio: recordatorioCreado.fechaRecordatorio,
              mensaje: recordatorioCreado.mensaje,
            }
          : null,
        isReasignacion: !!citaExistente,
      },
    });
  } catch (error) {
    console.error("Error al asignar técnico:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener historial de asignaciones de un vehículo
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

    const historial = await prisma.appointment.findMany({
      where: { vehicleId },
      include: {
        technician: { select: { name: true } },
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: historial.map((item) => ({
        id: item.id,
        fecha: item.createdAt,
        tecnico: item.technician?.name || "Sin asignar",
        notas: item.notes,
        estado: item.status,
        fechaProgramada: item.scheduledAt,
      })),
    });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
