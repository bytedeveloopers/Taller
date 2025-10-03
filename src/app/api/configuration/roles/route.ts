import { configurationService } from "@/services/ConfigurationService";
import { NextRequest, NextResponse } from "next/server";

// GET /api/configuration/roles - Get all roles
export async function GET() {
  try {
    const roles = await configurationService.getRoles();

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener los roles" },
      { status: 500 }
    );
  }
}

// POST /api/configuration/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const { name, displayName, description, permissionIds } = await request.json();

    if (!name || !displayName) {
      return NextResponse.json(
        { success: false, error: "El nombre y nombre para mostrar son requeridos" },
        { status: 400 }
      );
    }

    const role = await configurationService.createRole({
      name,
      displayName,
      description,
      permissionIds,
    });

    return NextResponse.json({
      success: true,
      data: role,
      message: "Rol creado exitosamente",
    });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json({ success: false, error: "Error al crear el rol" }, { status: 500 });
  }
}
