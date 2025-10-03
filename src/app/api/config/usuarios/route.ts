import { configurationService } from "@/services/ConfigurationService";
import { UsuariosPermisosConfig } from "@/types/configuration";
import { NextRequest, NextResponse } from "next/server";

const defaultUsuarios: UsuariosPermisosConfig = {
  roles: [
    {
      rol: "ADMIN",
      permisos: [
        "clientes.read",
        "clientes.write",
        "clientes.delete",
        "vehiculos.read",
        "vehiculos.write",
        "vehiculos.delete",
        "ot.read",
        "ot.write",
        "ot.delete",
        "ot.changeState",
        "cotizaciones.read",
        "cotizaciones.write",
        "cotizaciones.delete",
        "evidencias.read",
        "evidencias.write",
        "evidencias.delete",
        "verCostos",
        "exportar",
        "configurar",
      ],
    },
    {
      rol: "RECEPCION",
      permisos: [
        "clientes.read",
        "clientes.write",
        "clientes.delete",
        "vehiculos.read",
        "vehiculos.write",
        "vehiculos.delete",
        "ot.read",
        "ot.write",
        "cotizaciones.read",
        "cotizaciones.write",
        "cotizaciones.delete",
        "evidencias.read",
        "evidencias.write",
        "exportar",
      ],
    },
    {
      rol: "TECNICO",
      permisos: ["ot.read", "ot.changeState", "evidencias.read", "evidencias.write"],
    },
    {
      rol: "AUDITOR",
      permisos: [
        "clientes.read",
        "vehiculos.read",
        "ot.read",
        "cotizaciones.read",
        "evidencias.read",
        "exportar",
      ],
    },
    {
      rol: "INVITADO",
      permisos: ["ot.read", "evidencias.read"],
    },
  ],
  seguridad: {
    longitudMinPass: 8,
    intentosMax: 3,
  },
};

export async function GET() {
  try {
    const config = await configurationService.getConfigurationByNamespace("usuarios");

    return NextResponse.json({
      success: true,
      data: config || defaultUsuarios,
    });
  } catch (error) {
    console.error("Error fetching usuarios config:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener configuración de usuarios" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: UsuariosPermisosConfig = await request.json();

    // Validations
    if (!data.roles || data.roles.length === 0) {
      return NextResponse.json(
        { success: false, error: "Se requiere al menos un rol" },
        { status: 400 }
      );
    }

    if (data.seguridad.longitudMinPass < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Save configuration
    for (const [key, value] of Object.entries(data)) {
      await configurationService.setSetting({
        namespace: "usuarios",
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
    console.error("Error updating usuarios config:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar configuración de usuarios" },
      { status: 500 }
    );
  }
}
