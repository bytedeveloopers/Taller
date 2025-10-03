import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const technicianId = searchParams.get("technicianId");

    // Construir condiciones de filtro
    const dateFilter =
      startDate && endDate
        ? {
            scheduledAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {};

    const technicianFilter = technicianId
      ? {
          technicianId: technicianId,
        }
      : {};

    // Obtener todas las citas con sus relaciones
    const appointments = await prisma.appointment.findMany({
      where: {
        ...dateFilter,
        ...technicianFilter,
      },
      include: {
        customer: true,
        vehicle: true,
        technician: true,
      },
      orderBy: { scheduledAt: "desc" },
    });

    // Análisis de cumplimiento
    const now = new Date();
    const appointmentAnalysis = appointments.map((apt) => {
      const appointmentDate = new Date(apt.scheduledAt);
      const isPast = appointmentDate < now;
      const wasCompleted = apt.status === "COMPLETED";
      const wasRescheduled = false; // Field doesn't exist in schema
      const wasNoShow = apt.status === "NO_SHOW";
      const wasCancelled = apt.status === "CANCELLED";

      // Calcular puntualidad (simplificado sin campo doneAt)
      let wasOnTime = false;
      if (wasCompleted) {
        // Asumir que si está completada, fue puntual
        wasOnTime = true;
      }

      // Determinar estado de cumplimiento
      let complianceStatus = "pendiente";
      if (isPast) {
        if (wasCompleted) {
          complianceStatus = wasOnTime ? "cumplida-puntual" : "cumplida-tardia";
        } else if (wasNoShow) {
          complianceStatus = "no-asistio";
        } else if (wasCancelled) {
          complianceStatus = "cancelada";
        } else if (wasRescheduled) {
          complianceStatus = "reprogramada";
        } else {
          complianceStatus = "incumplida";
        }
      }

      return {
        id: apt.id,
        date: apt.scheduledAt,
        time: apt.scheduledAt.toLocaleTimeString(),
        customer: apt.customer?.name || "Sin cliente",
        vehicle: apt.vehicle ? `${apt.vehicle.brand} ${apt.vehicle.model}` : "Sin vehículo",
        technician: apt.technician?.name || "Sin asignar",
        status: apt.status,
        complianceStatus,
        rescheduledCount: 0, // Field doesn't exist
        doneAt: null, // Field doesn't exist
        wasOnTime,
        isPast,
        description: apt.notes || "",
      };
    });

    // Calcular métricas por técnico
    const technicianMetrics = new Map();

    appointmentAnalysis.forEach((apt) => {
      const techName = apt.technician;

      if (!technicianMetrics.has(techName)) {
        technicianMetrics.set(techName, {
          name: techName,
          totalAppointments: 0,
          completedOnTime: 0,
          completedLate: 0,
          noShows: 0,
          cancelled: 0,
          rescheduled: 0,
          pending: 0,
          utilizationRate: 0,
          punctualityRate: 0,
        });
      }

      const metrics = technicianMetrics.get(techName);
      metrics.totalAppointments++;

      switch (apt.complianceStatus) {
        case "cumplida-puntual":
          metrics.completedOnTime++;
          break;
        case "cumplida-tardia":
          metrics.completedLate++;
          break;
        case "no-asistio":
          metrics.noShows++;
          break;
        case "cancelada":
          metrics.cancelled++;
          break;
        case "reprogramada":
          metrics.rescheduled++;
          break;
        case "pendiente":
          metrics.pending++;
          break;
      }
    });

    // Calcular tasas para cada técnico
    const technicianData = Array.from(technicianMetrics.values())
      .map((tech) => {
        const completed = tech.completedOnTime + tech.completedLate;
        const total = tech.totalAppointments;

        return {
          ...tech,
          completionRate: total > 0 ? (completed / total) * 100 : 0,
          punctualityRate: completed > 0 ? (tech.completedOnTime / completed) * 100 : 0,
          noShowRate: total > 0 ? (tech.noShows / total) * 100 : 0,
          reschedulingRate: total > 0 ? (tech.rescheduled / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.completionRate - a.completionRate);

    // Análisis por día de la semana
    const dayAnalysis = new Map();
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    appointmentAnalysis.forEach((apt) => {
      const dayOfWeek = new Date(apt.date).getDay();
      const dayName = dayNames[dayOfWeek];

      if (!dayAnalysis.has(dayName)) {
        dayAnalysis.set(dayName, {
          day: dayName,
          total: 0,
          completed: 0,
          onTime: 0,
          noShows: 0,
        });
      }

      const dayData = dayAnalysis.get(dayName);
      dayData.total++;

      if (
        apt.complianceStatus === "cumplida-puntual" ||
        apt.complianceStatus === "cumplida-tardia"
      ) {
        dayData.completed++;
      }
      if (apt.complianceStatus === "cumplida-puntual") {
        dayData.onTime++;
      }
      if (apt.complianceStatus === "no-asistio") {
        dayData.noShows++;
      }
    });

    const dayDistribution = Array.from(dayAnalysis.values()).map((day) => ({
      ...day,
      completionRate: day.total > 0 ? (day.completed / day.total) * 100 : 0,
      punctualityRate: day.completed > 0 ? (day.onTime / day.completed) * 100 : 0,
      noShowRate: day.total > 0 ? (day.noShows / day.total) * 100 : 0,
    }));

    // KPIs generales
    const totalCitas = appointmentAnalysis.length;
    const citasCompletadas = appointmentAnalysis.filter(
      (a) => a.complianceStatus === "cumplida-puntual" || a.complianceStatus === "cumplida-tardia"
    ).length;
    const citasPuntuales = appointmentAnalysis.filter(
      (a) => a.complianceStatus === "cumplida-puntual"
    ).length;
    const citasNoShow = appointmentAnalysis.filter(
      (a) => a.complianceStatus === "no-asistio"
    ).length;
    const citasReprogramadas = appointmentAnalysis.filter((a) => a.rescheduledCount > 0).length;

    const tasaCumplimiento = totalCitas > 0 ? (citasCompletadas / totalCitas) * 100 : 0;
    const tasaPuntualidad = citasCompletadas > 0 ? (citasPuntuales / citasCompletadas) * 100 : 0;
    const tasaNoShow = totalCitas > 0 ? (citasNoShow / totalCitas) * 100 : 0;
    const tasaReprogramacion = totalCitas > 0 ? (citasReprogramadas / totalCitas) * 100 : 0;

    const response = {
      success: true,
      data: {
        resumen: {
          totalCitas,
          citasCompletadas,
          citasPuntuales,
          citasNoShow,
          citasReprogramadas,
          tasaCumplimiento,
          tasaPuntualidad,
          tasaNoShow,
          tasaReprogramacion,
        },
        citas: appointmentAnalysis,
        tecnicos: technicianData,
        distribucionDias: dayDistribution,
        kpis: [
          {
            title: "Tasa Cumplimiento",
            value: `${tasaCumplimiento.toFixed(1)}%`,
            trend: tasaCumplimiento >= 80 ? 1 : tasaCumplimiento >= 60 ? 0 : -1,
            color: tasaCumplimiento >= 80 ? "green" : tasaCumplimiento >= 60 ? "yellow" : "red",
          },
          {
            title: "Puntualidad",
            value: `${tasaPuntualidad.toFixed(1)}%`,
            trend: tasaPuntualidad >= 70 ? 1 : tasaPuntualidad >= 50 ? 0 : -1,
            color: tasaPuntualidad >= 70 ? "green" : tasaPuntualidad >= 50 ? "yellow" : "red",
          },
          {
            title: "No Show",
            value: `${tasaNoShow.toFixed(1)}%`,
            trend: tasaNoShow <= 10 ? 1 : tasaNoShow <= 20 ? 0 : -1,
            color: tasaNoShow <= 10 ? "green" : tasaNoShow <= 20 ? "yellow" : "red",
          },
          {
            title: "Reprogramaciones",
            value: citasReprogramadas.toString(),
            trend: tasaReprogramacion <= 15 ? 1 : tasaReprogramacion <= 25 ? 0 : -1,
            color: tasaReprogramacion <= 15 ? "green" : tasaReprogramacion <= 25 ? "yellow" : "red",
          },
        ],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error en reporte agenda-cumplimiento:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
