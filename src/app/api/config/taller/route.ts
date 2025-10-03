import { configurationService } from "@/services/ConfigurationService";
import { DatosTaller } from "@/types/configuration";
import { NextRequest, NextResponse } from "next/server";

const defaultTaller: DatosTaller = {
  nombreComercial: "Mi Taller Automotriz",
  telefonos: ["+502 1234-5678"],
  direccion: "Dirección del taller",
  horario: "L-V 8:00-18:00, S 8:00-14:00",
  zonaHoraria: "America/Guatemala",
  moneda: "GTQ",
  ivaPorc: 12,
  formatoFecha: "dd/MM/yyyy",
  idioma: "es-GT",
  mostrarPreciosATecnicos: false,
  kilometrajeUnidad: "km",
  condicionesServicio: "Condiciones generales de servicio...",
  camposPersonalizados: [],
};

export async function GET() {
  try {
    const config = await configurationService.getConfigurationByNamespace("taller");

    return NextResponse.json({
      success: true,
      data: config || defaultTaller,
    });
  } catch (error) {
    console.error("Error fetching taller config:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener configuración del taller" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: DatosTaller = await request.json();

    // Validations
    if (!data.nombreComercial?.trim()) {
      return NextResponse.json(
        { success: false, error: "El nombre comercial es requerido" },
        { status: 400 }
      );
    }

    if (data.ivaPorc < 0 || data.ivaPorc > 100) {
      return NextResponse.json(
        { success: false, error: "El IVA debe estar entre 0 y 100%" },
        { status: 400 }
      );
    }

    // Save each setting
    for (const [key, value] of Object.entries(data)) {
      await configurationService.setSetting({
        namespace: "taller",
        key,
        value,
        type:
          typeof value === "boolean"
            ? "boolean"
            : typeof value === "number"
            ? "number"
            : Array.isArray(value) || (typeof value === "object" && value !== null)
            ? "json"
            : "string",
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error updating taller config:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar configuración del taller" },
      { status: 500 }
    );
  }
}
