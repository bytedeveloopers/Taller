import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const customerId = searchParams.get("customerId");

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

    // Obtener vehículos con sus relaciones
    const vehicles = await prisma.vehicle.findMany({
      where: {
        ...dateFilter,
        ...customerFilter,
      },
      include: {
        customer: true,
        tasks: {
          include: {
            technician: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Análisis por marca
    const marcasAnalysis = new Map();
    const modelosAnalysis = new Map();
    const yearAnalysis = new Map();

    vehicles.forEach((vehicle) => {
      const brand = vehicle.brand || "Sin marca";
      const model = vehicle.model || "Sin modelo";
      const year = vehicle.year || new Date().getFullYear();

      // Análisis por marca
      if (!marcasAnalysis.has(brand)) {
        marcasAnalysis.set(brand, {
          brand,
          count: 0,
          avgMileage: 0,
          totalServices: 0,
          avgServiceValue: 0,
          newestYear: year,
          oldestYear: year,
        });
      }

      const marcaData = marcasAnalysis.get(brand);
      marcaData.count++;
      marcaData.totalServices += vehicle.tasks.length;
      marcaData.avgServiceValue += vehicle.tasks.reduce((sum, task) => sum + 0, 0); // Task model doesn't have total field
      marcaData.newestYear = Math.max(marcaData.newestYear, year);
      marcaData.oldestYear = Math.min(marcaData.oldestYear, year);

      // Análisis por modelo
      const modelKey = `${brand} ${model}`;
      if (!modelosAnalysis.has(modelKey)) {
        modelosAnalysis.set(modelKey, {
          brand,
          model,
          count: 0,
          avgYear: 0,
          totalServices: 0,
        });
      }

      const modelData = modelosAnalysis.get(modelKey);
      modelData.count++;
      modelData.avgYear = (modelData.avgYear * (modelData.count - 1) + year) / modelData.count;
      modelData.totalServices += vehicle.tasks.length;

      // Análisis por año
      if (!yearAnalysis.has(year)) {
        yearAnalysis.set(year, 0);
      }
      yearAnalysis.set(year, yearAnalysis.get(year) + 1);
    });

    // Procesar datos de marcas
    const marcasData = Array.from(marcasAnalysis.values())
      .map((marca) => ({
        ...marca,
        avgServiceValue: marca.count > 0 ? marca.avgServiceValue / marca.count : 0,
        avgServicesPerVehicle: marca.count > 0 ? marca.totalServices / marca.count : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Procesar datos de modelos
    const modelosData = Array.from(modelosAnalysis.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 modelos

    // Procesar datos por año
    const yearsData = Array.from(yearAnalysis.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year - a.year);

    // Calcular próximas revisiones (estimado cada 6 meses)
    const now = new Date();
    const proximasRevisiones = vehicles
      .map((vehicle) => {
        const lastService = vehicle.tasks[0];
        if (!lastService) return null;

        const lastServiceDate = new Date(lastService.createdAt);
        const nextReviewDate = new Date(lastServiceDate);
        nextReviewDate.setMonth(nextReviewDate.getMonth() + 6);

        const daysUntilReview = Math.floor(
          (nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: vehicle.id,
          code: vehicle.code,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          plate: vehicle.plate,
          customer: vehicle.customer.name,
          lastService: lastServiceDate,
          nextReview: nextReviewDate,
          daysUntilReview,
          isOverdue: daysUntilReview < 0,
          priority: daysUntilReview < 30 ? "alta" : daysUntilReview < 60 ? "media" : "baja",
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.daysUntilReview - b.daysUntilReview);

    // KPIs
    const totalVehiculos = vehicles.length;
    const vehiculosConServicios = vehicles.filter((v) => v.tasks.length > 0).length;
    const promedioServiciosPorVehiculo =
      totalVehiculos > 0
        ? vehicles.reduce((sum, v) => sum + v.tasks.length, 0) / totalVehiculos
        : 0;

    const vehiculosVencidos = proximasRevisiones.filter((v) => v.isOverdue).length;
    const vehiculosProximaRevision = proximasRevisiones.filter(
      (v) => v.daysUntilReview >= 0 && v.daysUntilReview <= 30
    ).length;

    // Edad promedio de la flota
    const currentYear = new Date().getFullYear();
    const edadPromedio =
      totalVehiculos > 0
        ? vehicles.reduce((sum, v) => sum + (currentYear - (v.year || currentYear)), 0) /
          totalVehiculos
        : 0;

    const response = {
      success: true,
      data: {
        resumen: {
          totalVehiculos,
          vehiculosConServicios,
          promedioServiciosPorVehiculo,
          vehiculosVencidos,
          vehiculosProximaRevision,
          edadPromedio,
          marcasMasComunes: marcasData.slice(0, 3).map((m) => m.brand),
          modeloMasComun: modelosData[0]?.model || "N/A",
        },
        marcas: marcasData,
        modelos: modelosData,
        distribucionAnos: yearsData,
        proximasRevisiones: proximasRevisiones.slice(0, 50),
        vehiculos: vehicles.map((v) => ({
          id: v.id,
          code: v.code,
          brand: v.brand,
          model: v.model,
          year: v.year,
          plate: v.plate,
          customer: v.customer.name,
          totalServices: v.tasks.length,
          lastService: v.tasks[0]?.createdAt || null,
          mileage: v.mileage || 0,
        })),
        kpis: [
          {
            title: "Total Vehículos",
            value: totalVehiculos.toString(),
            trend: 0,
            color: "blue",
          },
          {
            title: "Con Servicios",
            value: `${vehiculosConServicios} (${
              totalVehiculos > 0 ? ((vehiculosConServicios / totalVehiculos) * 100).toFixed(1) : 0
            }%)`,
            trend: vehiculosConServicios > totalVehiculos * 0.8 ? 1 : 0,
            color: "green",
          },
          {
            title: "Revisiones Vencidas",
            value: vehiculosVencidos.toString(),
            trend: vehiculosVencidos > 0 ? -1 : 1,
            color: vehiculosVencidos > 0 ? "red" : "green",
          },
          {
            title: "Próximas Revisiones",
            value: vehiculosProximaRevision.toString(),
            trend: 0,
            color: "yellow",
          },
        ],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error en reporte vehiculos:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
