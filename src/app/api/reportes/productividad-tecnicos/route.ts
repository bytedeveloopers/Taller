import { ProductividadTecnicosData } from "@/types";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const technicianId = searchParams.get("technicianId");

    // Definir rango de fechas
    const today = new Date();
    const startDate = dateFrom ? new Date(dateFrom) : new Date(today.setHours(0, 0, 0, 0));
    const endDate = dateTo ? new Date(dateTo) : new Date(today.setHours(23, 59, 59, 999));

    // Construir filtros base
    const baseFilters: any = {};

    if (technicianId) {
      baseFilters.technicianId = technicianId;
    }

    // 1. Obtener todos los técnicos activos
    const tecnicos = await prisma.user.findMany({
      where: {
        role: "TECHNICIAN",
        isActive: true,
        ...(technicianId ? { id: technicianId } : {}),
      },
      include: {
        assignedTasks: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            vehicle: {
              include: {
                customer: { select: { name: true } },
              },
            },
          },
        },
        appointments: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            vehicle: {
              include: {
                customer: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    // 2. Calcular métricas por técnico
    const resumenTecnicos = tecnicos.map((tecnico) => {
      const tareasFinalizadas = tecnico.assignedTasks.filter((t) => t.status === "COMPLETED");
      const totalTareas = tecnico.assignedTasks.length;

      // Calcular on-time percentage (mock - necesita implementación real de SLA)
      const tareasOnTime = tareasFinalizadas.filter((t) => {
        if (t.completedAt && t.createdAt) {
          const horasTranscurridas =
            (new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime()) /
            (1000 * 60 * 60);
          return horasTranscurridas <= (t.estimatedTime ? t.estimatedTime / 60 : 48); // 48h por defecto
        }
        return false;
      });

      const onTimePercentage =
        tareasFinalizadas.length > 0 ? (tareasOnTime.length / tareasFinalizadas.length) * 100 : 0;

      // Carga promedio (tareas activas)
      const tareasActivas = tecnico.assignedTasks.filter(
        (t) => t.status !== "COMPLETED" && t.status !== "CANCELLED"
      );
      const cargaPromedio = tareasActivas.length;

      // Capacidad diaria (mock - 8 tareas por día)
      const capacidadDiaria = 8;
      const utilizacion = capacidadDiaria > 0 ? (cargaPromedio / capacidadDiaria) * 100 : 0;

      // Retrabajos (mock - basado en tareas duplicadas o modificadas)
      const retrabajos = Math.floor(tareasFinalizadas.length * 0.1); // 10% mock

      // Tiempo promedio por OT
      const tiempoPromedioPorOT =
        tareasFinalizadas.length > 0
          ? tareasFinalizadas.reduce((sum, t) => {
              if (t.actualTime) return sum + t.actualTime;
              if (t.completedAt && t.startedAt) {
                return (
                  sum +
                  (new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime()) /
                    (1000 * 60)
                );
              }
              return sum + (t.estimatedTime || 120); // 2h por defecto
            }, 0) / tareasFinalizadas.length
          : 0;

      return {
        id: tecnico.id,
        nombre: tecnico.name,
        otsFinalizadas: tareasFinalizadas.length,
        onTimePercentage,
        cargaPromedio,
        capacidadDiaria,
        utilizacion,
        retrabajos,
        tiempoPromedioPorOT: Math.round(tiempoPromedioPorOT),
      };
    });

    // 3. Distribución de trabajos por tipo
    const distribucionTrabajos = tecnicos.map((tecnico) => {
      const tiposTrabajos: Record<string, number> = {};

      tecnico.assignedTasks.forEach((tarea) => {
        const tipo = tarea.title.includes("Diagnóstico")
          ? "Diagnóstico"
          : tarea.title.includes("Reparación")
          ? "Reparación"
          : tarea.title.includes("Mantenimiento")
          ? "Mantenimiento"
          : tarea.title.includes("Revisión")
          ? "Revisión"
          : "Otros";

        tiposTrabajos[tipo] = (tiposTrabajos[tipo] || 0) + 1;
      });

      return {
        tecnico: tecnico.name,
        porTipo: tiposTrabajos,
      };
    });

    // 4. Detalle por técnico
    const detallePorTecnico: Record<string, any> = {};

    tecnicos.forEach((tecnico) => {
      detallePorTecnico[tecnico.id] = {
        otsDetalle: tecnico.assignedTasks.map((tarea) => {
          const tipoTrabajo = tarea.title.includes("Diagnóstico")
            ? "Diagnóstico"
            : tarea.title.includes("Reparación")
            ? "Reparación"
            : tarea.title.includes("Mantenimiento")
            ? "Mantenimiento"
            : tarea.title.includes("Revisión")
            ? "Revisión"
            : "Otros";

          const tatHoras =
            tarea.completedAt && tarea.startedAt
              ? (new Date(tarea.completedAt).getTime() - new Date(tarea.startedAt).getTime()) /
                (1000 * 60 * 60)
              : (tarea.actualTime || tarea.estimatedTime || 0) / 60;

          const isOnTime = tatHoras <= (tarea.estimatedTime || 120) / 60; // comparar con tiempo estimado
          const isRetrabajo = false; // Mock - implementar lógica real

          return {
            id: tarea.id,
            trackingCode: tarea.vehicle?.trackingCode || "N/A",
            cliente: tarea.vehicle?.customer.name || "N/A",
            vehiculo: tarea.vehicle ? `${tarea.vehicle.brand} ${tarea.vehicle.model}` : "N/A",
            tipoTrabajo,
            fechaInicio: tarea.startedAt || tarea.createdAt,
            fechaFin: tarea.completedAt,
            tatHoras: Math.round(tatHoras * 100) / 100,
            isOnTime,
            isRetrabajo,
          };
        }),
      };
    });

    const data: ProductividadTecnicosData = {
      resumenTecnicos,
      distribucionTrabajos,
      detallePorTecnico,
    };

    return NextResponse.json({
      success: true,
      data,
      filters: {
        dateFrom: startDate.toISOString(),
        dateTo: endDate.toISOString(),
        technicianId,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en reporte productividad técnicos:", error);
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
