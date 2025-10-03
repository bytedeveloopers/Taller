import { configurationService } from "@/services/ConfigurationService";
import { NotificacionesConfig } from "@/types/configuration";
import { NextRequest, NextResponse } from "next/server";

const defaultNotificaciones: NotificacionesConfig = {
  eventos: [
    { evento: "sla.porVencer", activo: true, modo: "inmediata" },
    { evento: "sla.vencido", activo: true, modo: "inmediata" },
    { evento: "ot.cambioEstado", activo: true, modo: "digest", cadaHoras: 4 },
    { evento: "cita.creada", activo: true, modo: "inmediata" },
    { evento: "cita.proxima", activo: true, modo: "inmediata" },
    { evento: "cotizacion.aprobada", activo: true, modo: "inmediata" },
    { evento: "cotizacion.rechazada", activo: true, modo: "inmediata" },
    { evento: "evidencia.subida", activo: false, modo: "digest", cadaHoras: 8 },
  ],
  dnd: [
    { rol: "TECNICO", desde: "22:00", hasta: "06:00" },
    { rol: "ADMIN", desde: "23:00", hasta: "05:00" },
  ],
};

export async function GET() {
  try {
    const config = await configurationService.getConfigurationByNamespace("notificaciones");

    return NextResponse.json({
      success: true,
      data: config || defaultNotificaciones,
    });
  } catch (error) {
    console.error("Error fetching notificaciones config:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener configuración de notificaciones" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: NotificacionesConfig = await request.json();

    // Save configuration
    for (const [key, value] of Object.entries(data)) {
      await configurationService.setSetting({
        namespace: "notificaciones",
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
    console.error("Error updating notificaciones config:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar configuración de notificaciones" },
      { status: 500 }
    );
  }
}
