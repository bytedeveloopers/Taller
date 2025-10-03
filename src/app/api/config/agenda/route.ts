import { configurationService } from "@/services/ConfigurationService";
import { AgendaConfig } from "@/types/configuration";
import { NextRequest, NextResponse } from "next/server";

const defaultAgenda: AgendaConfig = {
  tiposCita: [
    {
      id: "consulta",
      nombre: "Consulta",
      duracionMinutos: 30,
      bufferMinutos: 15,
      color: "#3b82f6",
    },
    {
      id: "revision",
      nombre: "Revisión",
      duracionMinutos: 60,
      bufferMinutos: 30,
      color: "#10b981",
    },
    {
      id: "reparacion",
      nombre: "Reparación",
      duracionMinutos: 120,
      bufferMinutos: 60,
      color: "#f59e0b",
    },
    { id: "entrega", nombre: "Entrega", duracionMinutos: 15, bufferMinutos: 5, color: "#059669" },
  ],
  reglas: {
    antiDobleBooking: true,
    anticipacionMinMin: 60,
    maxCitasPorFranja: 3,
  },
  horarioLaboral: {
    inicio: "08:00",
    fin: "18:00",
    descansos: [{ inicio: "12:00", fin: "13:00" }],
  },
  feriados: [],
};

export async function GET() {
  try {
    const config = await configurationService.getConfigurationByNamespace("agenda");

    return NextResponse.json({
      success: true,
      data: config || defaultAgenda,
    });
  } catch (error) {
    console.error("Error fetching agenda config:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener configuración de agenda" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: AgendaConfig = await request.json();

    // Save configuration
    for (const [key, value] of Object.entries(data)) {
      await configurationService.setSetting({
        namespace: "agenda",
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
    console.error("Error updating agenda config:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar configuración de agenda" },
      { status: 500 }
    );
  }
}
