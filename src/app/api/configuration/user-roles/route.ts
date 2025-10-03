import { configurationService } from "@/services/ConfigurationService";
import { NextRequest, NextResponse } from "next/server";

// GET /api/configuration/user-roles - Get users with their roles
export async function GET() {
  try {
    const users = await configurationService.getUsersWithRoles();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users with roles:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener usuarios con roles" },
      { status: 500 }
    );
  }
}

// POST /api/configuration/user-roles - Assign role to user
export async function POST(request: NextRequest) {
  try {
    const { userId, roleId, assignedBy } = await request.json();

    if (!userId || !roleId || !assignedBy) {
      return NextResponse.json(
        { success: false, error: "Usuario, rol y asignador son requeridos" },
        { status: 400 }
      );
    }

    const userRole = await configurationService.assignRole(userId, roleId, assignedBy);

    return NextResponse.json({
      success: true,
      data: userRole,
      message: "Rol asignado exitosamente",
    });
  } catch (error) {
    console.error("Error assigning role:", error);
    return NextResponse.json({ success: false, error: "Error al asignar el rol" }, { status: 500 });
  }
}

// DELETE /api/configuration/user-roles - Revoke role from user
export async function DELETE(request: NextRequest) {
  try {
    const { userId, roleId } = await request.json();

    if (!userId || !roleId) {
      return NextResponse.json(
        { success: false, error: "Usuario y rol son requeridos" },
        { status: 400 }
      );
    }

    await configurationService.revokeRole(userId, roleId);

    return NextResponse.json({
      success: true,
      message: "Rol revocado exitosamente",
    });
  } catch (error) {
    console.error("Error revoking role:", error);
    return NextResponse.json({ success: false, error: "Error al revocar el rol" }, { status: 500 });
  }
}
