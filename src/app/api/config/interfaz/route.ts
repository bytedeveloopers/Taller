import { configurationService } from "@/services/ConfigurationService";
import { InterfazConfig } from "@/types/configuration";
import { NextRequest, NextResponse } from "next/server";

const defaultInterfaz: InterfazConfig = {
  tema: "dark",
  colorPrimario: "#3b82f6",
  densidad: "normal",
  homeWidgets: ["totalOrdenes", "ordenesHoy", "citasHoy", "ingresos"],
  tablas: {
    ordenes: { columnasVisibles: ["numero", "cliente", "vehiculo", "estado", "fecha"] },
    clientes: { columnasVisibles: ["nombre", "telefono", "email", "vehiculos"] },
    vehiculos: { columnasVisibles: ["placa", "marca", "modelo", "cliente"] },
    cotizaciones: { columnasVisibles: ["numero", "cliente", "vehiculo", "estado", "total"] },
  },
  accesibilidad: {
    fuenteBasePx: 14,
    altoContraste: false,
  },
};

export async function GET() {
  try {
    const config = await configurationService.getConfigurationByNamespace("interfaz");

    return NextResponse.json({
      success: true,
      data: config || defaultInterfaz,
    });
  } catch (error) {
    console.error("Error fetching interfaz config:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener configuración de interfaz" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: InterfazConfig = await request.json();

    // Validations
    if (data.accesibilidad.fuenteBasePx < 10 || data.accesibilidad.fuenteBasePx > 24) {
      return NextResponse.json(
        { success: false, error: "El tamaño de fuente debe estar entre 10 y 24px" },
        { status: 400 }
      );
    }

    // Save configuration
    for (const [key, value] of Object.entries(data)) {
      await configurationService.setSetting({
        namespace: "interfaz",
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
    console.error("Error updating interfaz config:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar configuración de interfaz" },
      { status: 500 }
    );
  }
}
