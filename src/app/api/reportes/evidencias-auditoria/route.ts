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
          customer: {
            id: customerId,
          },
        }
      : {};

    const vehicleFilter = vehicleId
      ? {
          id: vehicleId,
        }
      : {};

    // Obtener todas las tareas con sus fotos
    const tasks = await prisma.task.findMany({
      where: {
        ...dateFilter,
        ...(vehicleId ? { vehicleId } : {}),
        vehicle: {
          ...customerFilter,
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

    // Análisis de cobertura de fotos
    const photoAnalysis = tasks.map((task) => {
      // Simulamos datos de fotos ya que el modelo Task no tiene fotos de inspección
      const totalPhotos = 0;
      const areasRequeridas = [
        "exterior-frontal",
        "exterior-trasera",
        "exterior-lateral-izq",
        "exterior-lateral-der",
        "interior-dashboard",
        "interior-asientos",
        "motor",
        "llantas",
      ];

      // Calcular cobertura (simplificado sin fotos reales)
      const areasConFotos = 0;
      const coberturaCompleta = false;
      const porcentajeCobertura = 0;

      // Verificar calidad de documentación (simplificado)
      const tieneFotosAntes = false;
      const tieneFotosDespues = false;
      const tieneObservaciones = false;

      // Calcular score de auditoría
      let auditScore = 0;
      if (totalPhotos >= 5) auditScore += 20;
      if (coberturaCompleta) auditScore += 25;
      if (tieneFotosAntes) auditScore += 20;
      if (tieneFotosDespues) auditScore += 20;
      if (tieneObservaciones) auditScore += 15;

      // Determinar nivel de cumplimiento
      let nivelCumplimiento = "bajo";
      if (auditScore >= 80) nivelCumplimiento = "excelente";
      else if (auditScore >= 60) nivelCumplimiento = "bueno";
      else if (auditScore >= 40) nivelCumplimiento = "regular";

      return {
        id: task.id,
        code: task.id, // Task doesn't have code field
        customer: task.vehicle.customer.name,
        vehicle: `${task.vehicle.brand} ${task.vehicle.model}`,
        technician: task.technician?.name || "Sin asignar",
        createdAt: task.createdAt,
        status: task.status,
        totalPhotos,
        areasConFotos,
        areasRequeridas: areasRequeridas.length,
        porcentajeCobertura,
        coberturaCompleta,
        tieneFotosAntes,
        tieneFotosDespues,
        tieneObservaciones,
        auditScore,
        nivelCumplimiento,
        ultimaModificacion: new Date(task.createdAt).getTime(),
      };
    });

    // Análisis por técnico
    const technicianAudit = new Map();

    photoAnalysis.forEach((analysis) => {
      const techName = analysis.technician;

      if (!technicianAudit.has(techName)) {
        technicianAudit.set(techName, {
          name: techName,
          totalOTs: 0,
          otsConFotos: 0,
          otsConCoberturaCompleta: 0,
          otsConObservaciones: 0,
          promedioFotosPorOT: 0,
          promedioCoberturaPorc: 0,
          promedioAuditScore: 0,
          excelente: 0,
          bueno: 0,
          regular: 0,
          bajo: 0,
        });
      }

      const tech = technicianAudit.get(techName);
      tech.totalOTs++;

      if (analysis.totalPhotos > 0) tech.otsConFotos++;
      if (analysis.coberturaCompleta) tech.otsConCoberturaCompleta++;
      if (analysis.tieneObservaciones) tech.otsConObservaciones++;

      tech.promedioFotosPorOT =
        (tech.promedioFotosPorOT * (tech.totalOTs - 1) + analysis.totalPhotos) / tech.totalOTs;
      tech.promedioCoberturaPorc =
        (tech.promedioCoberturaPorc * (tech.totalOTs - 1) + analysis.porcentajeCobertura) /
        tech.totalOTs;
      tech.promedioAuditScore =
        (tech.promedioAuditScore * (tech.totalOTs - 1) + analysis.auditScore) / tech.totalOTs;

      switch (analysis.nivelCumplimiento) {
        case "excelente":
          tech.excelente++;
          break;
        case "bueno":
          tech.bueno++;
          break;
        case "regular":
          tech.regular++;
          break;
        case "bajo":
          tech.bajo++;
          break;
      }
    });

    const technicianData = Array.from(technicianAudit.values())
      .map((tech) => ({
        ...tech,
        tasaDocumentacion: tech.totalOTs > 0 ? (tech.otsConFotos / tech.totalOTs) * 100 : 0,
        tasaCoberturaCompleta:
          tech.totalOTs > 0 ? (tech.otsConCoberturaCompleta / tech.totalOTs) * 100 : 0,
        tasaObservaciones: tech.totalOTs > 0 ? (tech.otsConObservaciones / tech.totalOTs) * 100 : 0,
      }))
      .sort((a, b) => b.promedioAuditScore - a.promedioAuditScore);

    // Análisis de tendencias
    const tendenciasMensuales = new Map();
    photoAnalysis.forEach((wo) => {
      const month = new Date(wo.createdAt).toISOString().substring(0, 7); // YYYY-MM

      if (!tendenciasMensuales.has(month)) {
        tendenciasMensuales.set(month, {
          month,
          totalOTs: 0,
          otsConFotos: 0,
          promedioCobertura: 0,
          promedioAuditScore: 0,
        });
      }

      const monthData = tendenciasMensuales.get(month);
      monthData.totalOTs++;
      if (wo.totalPhotos > 0) monthData.otsConFotos++;
      monthData.promedioCobertura =
        (monthData.promedioCobertura * (monthData.totalOTs - 1) + wo.porcentajeCobertura) /
        monthData.totalOTs;
      monthData.promedioAuditScore =
        (monthData.promedioAuditScore * (monthData.totalOTs - 1) + wo.auditScore) /
        monthData.totalOTs;
    });

    const tendenciasData = Array.from(tendenciasMensuales.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // KPIs generales
    const totalOTs = photoAnalysis.length;
    const otsConFotos = photoAnalysis.filter((wo) => wo.totalPhotos > 0).length;
    const otsConCoberturaCompleta = photoAnalysis.filter((wo) => wo.coberturaCompleta).length;
    const otsExcelentes = photoAnalysis.filter((wo) => wo.nivelCumplimiento === "excelente").length;

    const tasaDocumentacion = totalOTs > 0 ? (otsConFotos / totalOTs) * 100 : 0;
    const tasaCoberturaCompleta = totalOTs > 0 ? (otsConCoberturaCompleta / totalOTs) * 100 : 0;
    const tasaExcelencia = totalOTs > 0 ? (otsExcelentes / totalOTs) * 100 : 0;

    const promedioFotosPorOT =
      totalOTs > 0 ? photoAnalysis.reduce((sum, wo) => sum + wo.totalPhotos, 0) / totalOTs : 0;
    const promedioAuditScore =
      totalOTs > 0 ? photoAnalysis.reduce((sum, wo) => sum + wo.auditScore, 0) / totalOTs : 0;

    const response = {
      success: true,
      data: {
        resumen: {
          totalOTs,
          otsConFotos,
          otsConCoberturaCompleta,
          otsExcelentes,
          tasaDocumentacion,
          tasaCoberturaCompleta,
          tasaExcelencia,
          promedioFotosPorOT,
          promedioAuditScore,
        },
        evidencias: photoAnalysis,
        tecnicos: technicianData,
        tendencias: tendenciasData,
        distribucionNiveles: {
          excelente: photoAnalysis.filter((analysis) => analysis.nivelCumplimiento === "excelente")
            .length,
          bueno: photoAnalysis.filter((analysis) => analysis.nivelCumplimiento === "bueno").length,
          regular: photoAnalysis.filter((analysis) => analysis.nivelCumplimiento === "regular")
            .length,
          bajo: photoAnalysis.filter((analysis) => analysis.nivelCumplimiento === "bajo").length,
        },
        kpis: [
          {
            title: "Tasa Documentación",
            value: `${tasaDocumentacion.toFixed(1)}%`,
            trend: tasaDocumentacion >= 90 ? 1 : tasaDocumentacion >= 70 ? 0 : -1,
            color: tasaDocumentacion >= 90 ? "green" : tasaDocumentacion >= 70 ? "yellow" : "red",
          },
          {
            title: "Cobertura Completa",
            value: `${tasaCoberturaCompleta.toFixed(1)}%`,
            trend: tasaCoberturaCompleta >= 80 ? 1 : tasaCoberturaCompleta >= 60 ? 0 : -1,
            color:
              tasaCoberturaCompleta >= 80
                ? "green"
                : tasaCoberturaCompleta >= 60
                ? "yellow"
                : "red",
          },
          {
            title: "Nivel Excelente",
            value: `${tasaExcelencia.toFixed(1)}%`,
            trend: tasaExcelencia >= 50 ? 1 : tasaExcelencia >= 30 ? 0 : -1,
            color: tasaExcelencia >= 50 ? "green" : tasaExcelencia >= 30 ? "yellow" : "red",
          },
          {
            title: "Score Promedio",
            value: `${promedioAuditScore.toFixed(0)}/100`,
            trend: promedioAuditScore >= 70 ? 1 : promedioAuditScore >= 50 ? 0 : -1,
            color: promedioAuditScore >= 70 ? "green" : promedioAuditScore >= 50 ? "yellow" : "red",
          },
        ],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error en reporte evidencias-auditoria:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
