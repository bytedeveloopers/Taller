import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Fechas por defecto
    const today = new Date();
    const startDate = dateFrom ? new Date(dateFrom) : new Date(today.setHours(0, 0, 0, 0));
    const endDate = dateTo ? new Date(dateTo) : new Date(today.setHours(23, 59, 59, 999));

    // Placeholder data - será implementado completamente
    const reportData = {
      tatPromedio: 48, // horas
      tiemposPorEtapa: [
        { etapa: "Diagnóstico", promedio: 4, percentiles: { p50: 3, p75: 5, p90: 8 } },
        { etapa: "Desarme", promedio: 6, percentiles: { p50: 4, p75: 7, p90: 12 } },
        { etapa: "Armado", promedio: 8, percentiles: { p50: 6, p75: 10, p90: 16 } },
        { etapa: "Prueba", promedio: 2, percentiles: { p50: 1, p75: 2, p90: 4 } },
      ],
      onTimePercentage: 78.5,
      enEsperaPercentage: 15.2,
      causasEspera: [
        { causa: "Repuestos", count: 12, percentage: 45.2 },
        { causa: "Cliente", count: 8, percentage: 30.1 },
        { causa: "Técnico", count: 6, percentage: 24.7 },
      ],
      detalleOTs: [], // Será implementado
    };

    return NextResponse.json({
      success: true,
      data: reportData,
      filters: { dateFrom: startDate.toISOString(), dateTo: endDate.toISOString() },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in tiempos-sla report:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
