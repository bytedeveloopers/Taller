import { configurationService } from "@/services/ConfigurationService";
import { NextRequest, NextResponse } from "next/server";

// GET /api/configuration/roles/[id] - Get role by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = await configurationService.getRole(params.id);

    if (!role) {
      return NextResponse.json({ success: false, error: "Rol no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json({ success: false, error: "Error al obtener el rol" }, { status: 500 });
  }
}

// PUT /api/configuration/roles/[id] - Update role
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { displayName, description, isActive, permissionIds } = await request.json();

    const updatedRole = await configurationService.updateRole(params.id, {
      displayName,
      description,
      isActive,
      permissionIds,
    });

    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: "Rol actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar el rol" },
      { status: 500 }
    );
  }
}
