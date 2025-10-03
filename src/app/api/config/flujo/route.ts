import { configurationService } from "@/services/ConfigurationService";
import { FlujoSLAConfig } from "@/types/configuration";
import { NextRequest, NextResponse } from "next/server";

const defaultFlujo: FlujoSLAConfig = {
  estados: [
    { id: "ingreso", nombre: "Ingreso", color: "#3b82f6" },
    { id: "diagnostico", nombre: "Diagnóstico", color: "#f59e0b" },
    { id: "desarme", nombre: "Proceso desarme", color: "#ef4444" },
    { id: "espera", nombre: "Espera", color: "#6b7280" },
    { id: "armado", nombre: "Proceso armado", color: "#10b981" },
    { id: "prueba", nombre: "En prueba", color: "#8b5cf6" },
    { id: "finalizado", nombre: "Finalizado", color: "#059669" },
    { id: "entregado", nombre: "Recepción/Entregado", color: "#064e3b" },
  ],
  transiciones: [
    { fromId: "ingreso", toIds: ["diagnostico"] },
    { fromId: "diagnostico", toIds: ["desarme", "espera"] },
    { fromId: "desarme", toIds: ["espera", "armado"] },
    { fromId: "espera", toIds: ["desarme", "armado"] },
    { fromId: "armado", toIds: ["prueba"] },
    { fromId: "prueba", toIds: ["finalizado", "armado"] },
    { fromId: "finalizado", toIds: ["entregado"] },
  ],
  slas: [
    { estadoId: "diagnostico", horas: 24, alertarAl80: true },
    { estadoId: "prueba", horas: 8, alertarAl80: true },
  ],
  acciones: [
    {
      estadoId: "diagnostico",
      checklist: ["Revisar motor", "Verificar sistema eléctrico"],
      camposObligatorios: ["diagnostico"],
    },
    {
      estadoId: "entregado",
      checklist: ["Verificar calidad", "Documentos completos"],
      camposObligatorios: ["cotizacionId"],
    },
  ],
};

export async function GET() {
  try {
    const config = await configurationService.getConfigurationByNamespace("flujo");

    return NextResponse.json({
      success: true,
      data: config || defaultFlujo,
    });
  } catch (error) {
    console.error("Error fetching flujo config:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener configuración de flujo" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: FlujoSLAConfig = await request.json();

    // Validations
    if (!data.estados || data.estados.length === 0) {
      return NextResponse.json(
        { success: false, error: "Se requiere al menos un estado" },
        { status: 400 }
      );
    }

    // Validate SLA hours
    for (const sla of data.slas) {
      if (sla.horas && sla.horas <= 0) {
        return NextResponse.json(
          { success: false, error: "Las horas del SLA deben ser positivas" },
          { status: 400 }
        );
      }
    }

    // Save configuration
    for (const [key, value] of Object.entries(data)) {
      await configurationService.setSetting({
        namespace: "flujo",
        key,
        value,
        type: typeof value === "object" ? "json" : "string",
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error updating flujo config:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar configuración de flujo" },
      { status: 500 }
    );
  }
}
