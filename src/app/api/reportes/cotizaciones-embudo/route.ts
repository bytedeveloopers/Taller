import { CotizacionesEmbudoData } from "@/types";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const technicianId = searchParams.get("technicianId");
    const customerId = searchParams.get("customerId");

    // Definir rango de fechas
    const today = new Date();
    const startDate = dateFrom ? new Date(dateFrom) : new Date(today.setHours(0, 0, 0, 0));
    const endDate = dateTo ? new Date(dateTo) : new Date(today.setHours(23, 59, 59, 999));

    // Construir filtros base
    const baseFilters: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (technicianId) {
      baseFilters.createdById = technicianId;
    }

    if (customerId) {
      baseFilters.customerId = customerId;
    }

    // 1. Obtener todas las cotizaciones del período
    const cotizaciones = await prisma.quote.findMany({
      where: baseFilters,
      include: {
        customer: {
          select: { name: true },
        },
        vehicle: {
          select: { brand: true, model: true, year: true, licensePlate: true },
        },
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Calcular métricas del embudo
    const totalCotizaciones = cotizaciones.length;
    const borradores = cotizaciones.filter((q) => q.status === "DRAFT").length;
    const enviadas = cotizaciones.filter((q) => q.status === "SENT").length;
    const aprobadas = cotizaciones.filter((q) => q.status === "APPROVED").length;
    const rechazadas = cotizaciones.filter((q) => q.status === "REJECTED").length;
    const expiradas = cotizaciones.filter((q) => q.status === "EXPIRED").length;

    // 3. Calcular tasas de conversión
    const conversionRates = {
      borrador_a_enviada: borradores > 0 ? (enviadas / (borradores + enviadas)) * 100 : 0,
      enviada_a_aprobada: enviadas > 0 ? (aprobadas / enviadas) * 100 : 0,
      enviada_a_rechazada: enviadas > 0 ? (rechazadas / enviadas) * 100 : 0,
      enviada_a_ajuste: 0, // Para implementar cuando se agregue estado ADJUSTMENT_REQUESTED
    };

    // 4. Calcular tiempos promedio
    const cotizacionesConTiempos = cotizaciones.filter((q) => q.sentAt && q.responseTime);
    const tiempoRespuestaPromedio =
      cotizacionesConTiempos.length > 0
        ? cotizacionesConTiempos.reduce((sum, q) => sum + (q.responseTime || 0), 0) /
          cotizacionesConTiempos.length
        : 0;

    const cotizacionesAprobadas = cotizaciones.filter(
      (q) => q.status === "APPROVED" && q.approvedAt
    );
    const tiempoAprobacionPromedio =
      cotizacionesAprobadas.length > 0
        ? cotizacionesAprobadas.reduce((sum, q) => {
            if (q.sentAt && q.approvedAt) {
              return (
                sum +
                (new Date(q.approvedAt).getTime() - new Date(q.sentAt).getTime()) / (1000 * 60 * 60)
              );
            }
            return sum;
          }, 0) / cotizacionesAprobadas.length
        : 0;

    const tiemposPromedio = {
      tiempo_respuesta: tiempoRespuestaPromedio,
      tiempo_aprobacion: tiempoAprobacionPromedio,
    };

    // 5. Tasa de aprobación y montos
    const tasaAprobacion =
      enviadas + aprobadas > 0 ? (aprobadas / (enviadas + aprobadas)) * 100 : 0;
    const montoAprobado = cotizacionesAprobadas.reduce((sum, q) => sum + Number(q.total), 0);

    const detalleMontos = {
      totalEnviadas: enviadas,
      totalAprobadas: aprobadas,
      totalRechazadas: rechazadas,
    };

    // 6. Razones de rechazo (mock data - implementar cuando se capture)
    const razonesRechazo = [
      { razon: "Precio muy alto", count: Math.floor(rechazadas * 0.4), percentage: 40 },
      { razon: "Tiempo de entrega", count: Math.floor(rechazadas * 0.3), percentage: 30 },
      { razon: "Servicio no necesario", count: Math.floor(rechazadas * 0.2), percentage: 20 },
      { razon: "Otros", count: Math.floor(rechazadas * 0.1), percentage: 10 },
    ].filter((r) => r.count > 0);

    // 7. Detalle de cotizaciones
    const detalleCotizaciones = cotizaciones.map((q) => ({
      id: q.id,
      quoteNumber: q.quoteNumber,
      cliente: q.customer.name,
      vehiculo: `${q.vehicle.brand} ${q.vehicle.model} ${q.vehicle.year}`,
      monto: Number(q.total),
      status: q.status,
      fechaCreacion: q.createdAt,
      fechaEnvio: q.sentAt,
      fechaRespuesta: q.approvedAt || q.rejectedAt,
      tiempoRespuesta: q.responseTime,
      razonRechazo: q.rejectionReason,
    }));

    const data: CotizacionesEmbudoData = {
      totalCotizaciones,
      conversionRates,
      tiemposPromedio,
      tasaAprobacion,
      montoAprobado,
      detalleMontos,
      razonesRechazo,
      detalleCotizaciones,
    };

    return NextResponse.json({
      success: true,
      data,
      filters: {
        dateFrom: startDate.toISOString(),
        dateTo: endDate.toISOString(),
        technicianId,
        customerId,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en reporte cotizaciones embudo:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
