import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const customerId = searchParams.get("customerId");
    const vehicleId = searchParams.get("vehicleId");

    // Construir condiciones de filtro
    const dateFilter =
      startDate && endDate
        ? {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {};

    const customerFilter = customerId
      ? {
          customerId: parseInt(customerId),
        }
      : {};

    const vehicleFilter = vehicleId
      ? {
          vehicleId: parseInt(vehicleId),
        }
      : {};

    // Obtener todas las tareas con sus relaciones
    const tasks = await prisma.task.findMany({
      where: {
        ...dateFilter,
        vehicle: {
          ...customerFilter,
          ...vehicleFilter,
        },
      },
      include: {
        vehicle: {
          include: {
            customer: true,
          },
        },
        technician: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Análisis de clientes
    const customerAnalysis = new Map();

    tasks.forEach((task) => {
      const customerId = task.vehicle.customerId;

      if (!customerAnalysis.has(customerId)) {
        customerAnalysis.set(customerId, {
          id: customerId,
          name: task.vehicle.customer.name,
          email: task.vehicle.customer.email,
          phone: task.vehicle.customer.phone,
          firstVisit: task.createdAt,
          lastVisit: task.createdAt,
          totalVisits: 0,
          totalSpent: 0,
          avgDaysBetweenVisits: 0,
          vehicles: new Set(),
          services: new Set(),
          status: "nuevo", // nuevo, regular, frecuente, inactivo
        });
      }

      const customer = customerAnalysis.get(customerId);
      customer.totalVisits++;
      customer.totalSpent += 0; // Task model doesn't have total cost field
      customer.vehicles.add(task.vehicle.id);
      customer.services.add(task.title || "general");

      if (task.createdAt < customer.firstVisit) {
        customer.firstVisit = task.createdAt;
      }
      if (task.createdAt > customer.lastVisit) {
        customer.lastVisit = task.createdAt;
      }
    });

    // Calcular métricas por cliente
    const now = new Date();
    const clientesData = Array.from(customerAnalysis.values()).map((customer) => {
      // Calcular días entre visitas
      const daysSinceFirst = Math.floor(
        (customer.lastVisit.getTime() - customer.firstVisit.getTime()) / (1000 * 60 * 60 * 24)
      );
      customer.avgDaysBetweenVisits =
        customer.totalVisits > 1 ? Math.floor(daysSinceFirst / (customer.totalVisits - 1)) : 0;

      // Días desde última visita
      const daysSinceLastVisit = Math.floor(
        (now.getTime() - customer.lastVisit.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determinar estado del cliente
      if (customer.totalVisits === 1 && daysSinceLastVisit <= 30) {
        customer.status = "nuevo";
      } else if (
        customer.totalVisits >= 2 &&
        customer.totalVisits < 5 &&
        daysSinceLastVisit <= 90
      ) {
        customer.status = "regular";
      } else if (customer.totalVisits >= 5 && daysSinceLastVisit <= 60) {
        customer.status = "frecuente";
      } else if (daysSinceLastVisit > 180) {
        customer.status = "inactivo";
      } else {
        customer.status = "regular";
      }

      return {
        ...customer,
        vehicleCount: customer.vehicles.size,
        serviceTypes: Array.from(customer.services),
        daysSinceLastVisit,
        avgSpentPerVisit: customer.totalVisits > 0 ? customer.totalSpent / customer.totalVisits : 0,
      };
    });

    // Calcular KPIs
    const totalClientes = clientesData.length;
    const clientesNuevos = clientesData.filter((c) => c.status === "nuevo").length;
    const clientesRegulares = clientesData.filter((c) => c.status === "regular").length;
    const clientesFrecuentes = clientesData.filter((c) => c.status === "frecuente").length;
    const clientesInactivos = clientesData.filter((c) => c.status === "inactivo").length;

    const totalFacturado = clientesData.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgSpentPerCustomer = totalClientes > 0 ? totalFacturado / totalClientes : 0;
    const avgVisitsPerCustomer =
      totalClientes > 0
        ? clientesData.reduce((sum, c) => sum + c.totalVisits, 0) / totalClientes
        : 0;

    // Calcular tasa de retención (clientes con más de 1 visita)
    const clientesConRetorno = clientesData.filter((c) => c.totalVisits > 1).length;
    const tasaRetencion = totalClientes > 0 ? (clientesConRetorno / totalClientes) * 100 : 0;

    // Top clientes por valor
    const topClientesPorValor = clientesData
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Análisis de frecuencia
    const distribucionFrecuencia = {
      "1 visita": clientesData.filter((c) => c.totalVisits === 1).length,
      "2-3 visitas": clientesData.filter((c) => c.totalVisits >= 2 && c.totalVisits <= 3).length,
      "4-6 visitas": clientesData.filter((c) => c.totalVisits >= 4 && c.totalVisits <= 6).length,
      "7+ visitas": clientesData.filter((c) => c.totalVisits >= 7).length,
    };

    const response = {
      success: true,
      data: {
        resumen: {
          totalClientes,
          clientesNuevos,
          clientesRegulares,
          clientesFrecuentes,
          clientesInactivos,
          tasaRetencion,
          avgSpentPerCustomer,
          avgVisitsPerCustomer,
          totalFacturado,
        },
        clientes: clientesData.sort((a, b) => b.totalSpent - a.totalSpent),
        topClientesPorValor,
        distribucionFrecuencia,
        kpis: [
          {
            title: "Total Clientes",
            value: totalClientes.toString(),
            trend: 0,
            color: "blue",
          },
          {
            title: "Tasa Retención",
            value: `${tasaRetencion.toFixed(1)}%`,
            trend: tasaRetencion >= 60 ? 1 : tasaRetencion >= 40 ? 0 : -1,
            color: tasaRetencion >= 60 ? "green" : tasaRetencion >= 40 ? "yellow" : "red",
          },
          {
            title: "Valor Promedio",
            value: `$${avgSpentPerCustomer.toLocaleString()}`,
            trend: 0,
            color: "green",
          },
          {
            title: "Clientes Frecuentes",
            value: clientesFrecuentes.toString(),
            trend: 1,
            color: "purple",
          },
        ],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error en reporte clientes-retencion:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
