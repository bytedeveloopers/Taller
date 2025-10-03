import { configurationService } from "@/services/ConfigurationService";
import { NextResponse } from "next/server";

// GET /api/configuration/permissions - Get all permissions
export async function GET() {
  try {
    const permissions = await configurationService.getPermissions();

    return NextResponse.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener los permisos" },
      { status: 500 }
    );
  }
}
