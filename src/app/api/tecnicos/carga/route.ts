import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - Obtener técnicos con su carga de trabajo actual
export async function GET() {
  try {
    // Obtener todos los técnicos
    const tecnicos = await prisma.user.findMany({
      where: {
        role: "TECHNICIAN",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        assignedTasks: {
          where: {
            status: {
              in: ["PENDING", "IN_PROGRESS"],
            },
          },
          select: {
            id: true,
            estimatedTime: true,
            actualTime: true,
            priority: true,
            status: true,
          },
        },
        appointments: {
          where: {
            status: {
              in: ["SCHEDULED", "IN_PROGRESS"],
            },
          },
          select: {
            id: true,
            estimatedDuration: true,
            status: true,
          },
        },
        _count: {
          select: {
            assignedTasks: {
              where: {
                status: {
                  in: ["PENDING", "IN_PROGRESS"],
                },
              },
            },
            appointments: {
              where: {
                status: {
                  in: ["SCHEDULED", "IN_PROGRESS"],
                },
              },
            },
          },
        },
      },
    });

    // Calcular carga de trabajo para cada técnico
    const tecnicosConCarga = tecnicos.map((tecnico) => {
      // Calcular horas de tareas pendientes/en progreso
      const horasTareas = tecnico.assignedTasks.reduce((total, tarea) => {
        const tiempo = tarea.estimatedTime || 60; // Default 1 hora si no está especificado
        const multiplicador =
          tarea.priority === "URGENT" ? 1.5 : tarea.priority === "HIGH" ? 1.2 : 1;
        return total + tiempo * multiplicador;
      }, 0);

      // Calcular horas de citas programadas
      const horasCitas = tecnico.appointments.reduce((total, cita) => {
        const duracion = cita.estimatedDuration || 120; // Default 2 horas
        return total + duracion;
      }, 0);

      // Total de minutos de trabajo
      const totalMinutos = horasTareas + horasCitas;
      const totalHoras = totalMinutos / 60;

      // Calcular porcentaje de carga (asumiendo 40 horas laborales por semana)
      const horasLaboralesSemana = 40;
      const porcentajeCarga = Math.min(Math.round((totalHoras / horasLaboralesSemana) * 100), 100);

      // Determinar color del semáforo
      let colorCarga = "green";
      if (porcentajeCarga > 80) {
        colorCarga = "red";
      } else if (porcentajeCarga > 50) {
        colorCarga = "yellow";
      }

      return {
        id: tecnico.id,
        name: tecnico.name,
        email: tecnico.email,
        carga: {
          porcentaje: porcentajeCarga,
          color: colorCarga,
          tareas: tecnico._count.assignedTasks,
          citas: tecnico._count.appointments,
          horasEstimadas: Math.round(totalHoras * 10) / 10, // Redondear a 1 decimal
          detalle: `${tecnico._count.assignedTasks} tareas, ${tecnico._count.appointments} citas`,
        },
      };
    });

    // Ordenar por menor carga primero
    const tecnicosOrdenados = tecnicosConCarga.sort(
      (a, b) => a.carga.porcentaje - b.carga.porcentaje
    );

    return NextResponse.json({
      success: true,
      data: tecnicosOrdenados,
    });
  } catch (error) {
    console.error("Error al obtener técnicos con carga:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
