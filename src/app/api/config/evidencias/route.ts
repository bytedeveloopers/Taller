import { configurationService } from "@/services/ConfigurationService";
import { EvidenciasConfig } from "@/types/configuration";
import { NextRequest, NextResponse } from "next/server";

const defaultEvidencias: EvidenciasConfig = {
  requeridasPorEstado: [
    { estadoId: "ingreso", minFotos: 5 },
    { estadoId: "entregado", minFotos: 3 },
  ],
  tamanioMaxMB: 10,
  formatosPermitidos: ["jpg", "png", "mp4"],
  compresionAuto: true,
  selloAgua: false,
  gps: true,
  retencionMeses: 24,
  privacidadPorDefecto: "interna",
};

export async function GET() {
  try {
    const config = await configurationService.getConfigurationByNamespace("evidencias");

    return NextResponse.json({
      success: true,
      data: config || defaultEvidencias,
    });
  } catch (error) {
    console.error("Error fetching evidencias config:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener configuración de evidencias" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: EvidenciasConfig = await request.json();

    // Validations
    if (data.tamanioMaxMB <= 0 || data.tamanioMaxMB > 100) {
      return NextResponse.json(
        { success: false, error: "El tamaño máximo debe estar entre 1 y 100 MB" },
        { status: 400 }
      );
    }

    if (data.retencionMeses <= 0) {
      return NextResponse.json(
        { success: false, error: "La retención debe ser mayor a 0 meses" },
        { status: 400 }
      );
    }

    // Save configuration
    for (const [key, value] of Object.entries(data)) {
      await configurationService.setSetting({
        namespace: "evidencias",
        key,
        value,
        type:
          typeof value === "object"
            ? "json"
            : typeof value === "boolean"
            ? "boolean"
            : typeof value === "number"
            ? "number"
            : "string",
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error updating evidencias config:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar configuración de evidencias" },
      { status: 500 }
    );
  }
}
