import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener ficha 360° del cliente
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: clienteId } = await params;

    if (!clienteId) {
      return NextResponse.json(
        { success: false, error: "ID del cliente es requerido" },
        { status: 400 }
      );
    }

    // Obtener información completa del cliente
    const cliente = await prisma.customer.findUnique({
      where: { id: clienteId },
      include: {
        // Vehículos del cliente
        vehicles: {
          include: {
            appointments: {
              include: {
                technician: {
                  select: { id: true, name: true },
                },
              },
              orderBy: { createdAt: "desc" },
              take: 3,
            },
            inspectionPhotos: {
              select: {
                id: true,
                nombre: true,
                ubicacion: true,
                tieneDano: true,
                timestamp: true,
              },
            },
            workflowHistory: {
              include: {
                technician: {
                  select: { id: true, name: true },
                },
              },
              orderBy: { timestamp: "desc" },
              take: 5,
            },
          },
        },

        // Órdenes de trabajo (appointments)
        appointments: {
          include: {
            vehicle: {
              select: {
                id: true,
                brand: true,
                model: true,
                year: true,
                licensePlate: true,
                trackingCode: true,
                status: true,
              },
            },
            technician: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },

        // Cotizaciones
        quotes: {
          include: {
            vehicle: {
              select: {
                id: true,
                brand: true,
                model: true,
                licensePlate: true,
              },
            },
            items: true,
          },
          orderBy: { createdAt: "desc" },
        },

        // Contadores para estadísticas
        _count: {
          select: {
            vehicles: true,
            appointments: true,
            quotes: true,
          },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json({ success: false, error: "Cliente no encontrado" }, { status: 404 });
    }

    // Procesar etiquetas
    const labels = cliente.labels ? cliente.labels.split(",").filter(Boolean) : [];

    // Calcular estadísticas
    const cotizacionesAprobadas = cliente.quotes.filter((q) => q.status === "APPROVED").length;
    const montoTotalGastado = cliente.quotes
      .filter((q) => q.status === "APPROVED")
      .reduce((sum, quote) => sum + Number(quote.total), 0);

    // Calcular días desde la creación del cliente para promedio de citas por mes
    const diasDesdeCreacion = Math.max(
      1,
      Math.floor((Date.now() - new Date(cliente.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    );
    const mesesDesdeCreacion = Math.max(0.1, diasDesdeCreacion / 30);
    const promedioCitasPorMes = cliente._count.appointments / mesesDesdeCreacion;

    // Calcular días desde última visita
    const ultimaCita =
      cliente.appointments.length > 0
        ? cliente.appointments.reduce((latest, cita) =>
            new Date(cita.scheduledAt) > new Date(latest.scheduledAt) ? cita : latest
          )
        : null;
    const diasDesdeUltimaVisita = ultimaCita
      ? Math.floor(
          (Date.now() - new Date(ultimaCita.scheduledAt).getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    const stats = {
      vehiculosCount: cliente._count.vehicles,
      citasCount: cliente._count.appointments,
      cotizacionesCount: cliente._count.quotes,
      cotizacionesAprobadas: cotizacionesAprobadas,
      cotizacionesAprobadaRate:
        cliente._count.quotes > 0
          ? Math.round((cotizacionesAprobadas / cliente._count.quotes) * 100)
          : 0,
      totalGastado: montoTotalGastado,
      promedioCitasPorMes: Math.round(promedioCitasPorMes * 10) / 10, // Redondear a 1 decimal
      diasDesdeUltimaVisita: diasDesdeUltimaVisita || 0,
      // Estadísticas adicionales para compatibilidad
      totalVehiculos: cliente._count.vehicles,
      totalOrdenes: cliente._count.appointments,
      totalCotizaciones: cliente._count.quotes,
      cotizacionesRechazadas: cliente.quotes.filter((q) => q.status === "REJECTED").length,
      cotizacionesPendientes: cliente.quotes.filter((q) => q.status === "SENT").length,
      tasaAprobacion:
        cliente._count.quotes > 0
          ? Math.round((cotizacionesAprobadas / cliente._count.quotes) * 100)
          : 0,
      montoTotalCotizaciones: montoTotalGastado,
      ordenesActivas: cliente.appointments.filter((a) =>
        ["SCHEDULED", "IN_PROGRESS"].includes(a.status)
      ).length,
    };

    // Recopilar todas las evidencias (fotos de inspección)
    const evidencias = cliente.vehicles
      .flatMap((vehiculo) =>
        vehiculo.inspectionPhotos.map((foto) => ({
          ...foto,
          vehiculo: {
            id: vehiculo.id,
            descripcion: `${vehiculo.brand} ${vehiculo.model} ${vehiculo.year}`,
            placa: vehiculo.licensePlate,
          },
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Timeline de actividad reciente
    const timeline: Array<{
      id: string;
      tipo: string;
      fecha: Date;
      titulo: string;
      descripcion: string;
      datos: any;
    }> = [];

    // Agregar órdenes recientes
    cliente.appointments.slice(0, 10).forEach((orden) => {
      timeline.push({
        id: `orden-${orden.id}`,
        tipo: "orden",
        fecha: orden.createdAt,
        titulo: `Nueva orden de trabajo`,
        descripcion: `${orden.vehicle.brand} ${orden.vehicle.model} - ${orden.status}`,
        datos: orden,
      });
    });

    // Agregar cotizaciones recientes
    cliente.quotes.slice(0, 10).forEach((cotizacion) => {
      timeline.push({
        id: `cotizacion-${cotizacion.id}`,
        tipo: "cotizacion",
        fecha: cotizacion.createdAt,
        titulo: `Cotización ${
          cotizacion.status === "APPROVED"
            ? "aprobada"
            : cotizacion.status === "REJECTED"
            ? "rechazada"
            : "enviada"
        }`,
        descripcion: `${cotizacion.vehicle.brand} ${cotizacion.vehicle.model} - $${cotizacion.total}`,
        datos: cotizacion,
      });
    });

    // Ordenar timeline por fecha
    timeline.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // Formatear respuesta
    const clienteCompleto = {
      id: cliente.id,
      name: cliente.name,
      phone: cliente.phone,
      email: cliente.email,
      altPhone: cliente.altPhone,
      address: cliente.address,
      contactPreference: cliente.contactPreference,
      labels,
      notes: cliente.notes,
      pickupPoints: cliente.pickupPoints,
      consents: cliente.consents,
      lastVisit: cliente.lastVisit,
      isActive: cliente.isActive,
      createdAt: cliente.createdAt,
      updatedAt: cliente.updatedAt,

      // Datos relacionados
      vehiculos: cliente.vehicles,
      ordenes: cliente.appointments,
      cotizaciones: cliente.quotes,
      evidencias,
      timeline: timeline.slice(0, 20), // Últimas 20 actividades

      // Estadísticas
      stats,
    };

    return NextResponse.json({
      success: true,
      data: clienteCompleto,
    });
  } catch (error) {
    console.error("Error obteniendo ficha del cliente:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear recordatorio para el cliente
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: clienteId } = await params;
    const data = await request.json();
    const { mensaje, fechaRecordatorio, tipo = "SEGUIMIENTO" } = data;

    if (!clienteId || !mensaje || !fechaRecordatorio) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos para crear recordatorio" },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const cliente = await prisma.customer.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      return NextResponse.json({ success: false, error: "Cliente no encontrado" }, { status: 404 });
    }

    // Crear recordatorio (usaremos la tabla de recordatorios existing)
    const recordatorio = await prisma.reminder.create({
      data: {
        ordenTrabajoId: clienteId, // Reutilizamos este campo para el cliente
        fechaRecordatorio: new Date(fechaRecordatorio),
        mensaje,
        tipo,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Recordatorio creado exitosamente",
      data: recordatorio,
    });
  } catch (error) {
    console.error("Error creando recordatorio:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
