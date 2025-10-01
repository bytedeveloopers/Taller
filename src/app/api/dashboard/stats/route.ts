import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Obtener estadísticas básicas
    const [
      totalCustomers,
      totalVehicles,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      inProgressAppointments,
      todayAppointments,
      thisWeekAppointments,
      totalQuotes,
      approvedQuotes,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.vehicle.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
      prisma.appointment.count({ where: { status: "SCHEDULED" } }),
      prisma.appointment.count({ where: { status: "IN_PROGRESS" } }),
      prisma.appointment.count({
        where: {
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.appointment.count({
        where: {
          scheduledAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      }),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: "APPROVED" } }),
    ]);

    // Calcular ingresos (aproximado basado en cotizaciones aprobadas)
    const approvedQuotesTotal = await prisma.quote.aggregate({
      where: { status: "APPROVED" },
      _sum: { total: true },
    });

    // Obtener citas recientes
    const recentAppointments = await prisma.appointment.findMany({
      take: 5,
      include: {
        customer: true,
        vehicle: true,
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });

    const stats = {
      totalCitas: totalAppointments,
      citasPendientes: pendingAppointments,
      citasCompletadas: completedAppointments,
      citasEnProceso: inProgressAppointments,
      citasHoy: todayAppointments,
      citasEstaSemana: thisWeekAppointments,
      totalClientes: totalCustomers,
      totalVehiculos: totalVehicles,
      totalCotizaciones: totalQuotes,
      cotizacionesAprobadas: approvedQuotes,
      ingresos: {
        total: approvedQuotesTotal._sum.total || 0,
        pendiente: (totalQuotes - approvedQuotes) * 1500, // Estimado promedio
      },
      recentAppointments,
      tasaCompletado:
        totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0,
      satisfaccionCliente: 92, // Placeholder - podrías implementar un sistema de ratings
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Error al obtener las estadísticas" }, { status: 500 });
  }
}
