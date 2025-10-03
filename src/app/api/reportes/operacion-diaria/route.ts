import { OperacionDiariaData, VehicleStatus } from "@/types";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const technicianId = searchParams.get("technicianId");
    const status = searchParams.get("status") as VehicleStatus;

    // Fechas por defecto (hoy)
    const today = new Date();
    const startDate = dateFrom ? new Date(dateFrom) : new Date(today.setHours(0, 0, 0, 0));
    const endDate = dateTo ? new Date(dateTo) : new Date(today.setHours(23, 59, 59, 999));

    // Construir filtros dinámicos
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      isActive: true,
    };

    if (technicianId) {
      whereClause.tasks = {
        some: {
          technicianId: technicianId,
        },
      };
    }

    if (status) {
      whereClause.status = status;
    }

    // 1. Ingresos del día (vehículos recibidos)
    const ingresosDia = await prisma.vehicle.count({
      where: {
        ...whereClause,
        status: "RECEIVED",
      },
    });

    // 2. OTs activas (no finalizadas ni entregadas)
    const otsActivas = await prisma.vehicle.count({
      where: {
        ...whereClause,
        status: {
          notIn: ["COMPLETED", "DELIVERED"],
        },
      },
    });

    // 3. OTs finalizadas
    const otsFinalizadas = await prisma.vehicle.count({
      where: {
        ...whereClause,
        status: "COMPLETED",
      },
    });

    // 4. OTs entregadas
    const otsEntregadas = await prisma.vehicle.count({
      where: {
        ...whereClause,
        status: "DELIVERED",
      },
    });

    // 5. Obtener detalles de vehículos con sus relaciones
    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          include: {
            technician: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 6. Calcular métricas de SLA y atrasadas
    let atrasadasCount = 0;
    let slaOnTime = 0;
    const currentDate = new Date();

    const detalleOTs = vehicles.map((vehicle) => {
      const diasEnTaller = Math.floor(
        (currentDate.getTime() - vehicle.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Criterio simple: más de 7 días = atrasada (mejorar con SLA real)
      const isAtrasada = diasEnTaller > 7 && !["COMPLETED", "DELIVERED"].includes(vehicle.status);

      if (isAtrasada) {
        atrasadasCount++;
      } else if (["COMPLETED", "DELIVERED"].includes(vehicle.status)) {
        slaOnTime++;
      }

      return {
        id: vehicle.id,
        trackingCode: vehicle.trackingCode,
        cliente: vehicle.customer.name,
        vehiculo: `${vehicle.brand} ${vehicle.model} (${vehicle.year})`,
        tecnico: vehicle.tasks[0]?.technician?.name,
        status: vehicle.status as VehicleStatus,
        fechaIngreso: vehicle.createdAt,
        diasEnTaller,
        slaDeadline: vehicle.slaDeadline,
        isAtrasada,
      };
    });

    // Calcular porcentajes
    const totalOTs = otsActivas + otsFinalizadas + otsEntregadas;
    const atrasadasPercent = totalOTs > 0 ? (atrasadasCount / totalOTs) * 100 : 0;
    const slaPercentage =
      totalOTs > 0 ? ((slaOnTime + (totalOTs - atrasadasCount - slaOnTime)) / totalOTs) * 100 : 0;

    const reportData: OperacionDiariaData = {
      ingresosDia,
      otsActivas,
      otsFinalizadas,
      otsEntregadas,
      atrasadasCount,
      atrasadasPercent,
      slaOnTime,
      slaPercentage,
      detalleOTs,
    };

    return NextResponse.json({
      success: true,
      data: reportData,
      filters: {
        dateFrom: startDate.toISOString(),
        dateTo: endDate.toISOString(),
        technicianId,
        status,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in operacion-diaria report:", error);
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
