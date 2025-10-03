import { configurationService } from "@/services/ConfigurationService";
import { NextRequest, NextResponse } from "next/server";

// GET /api/configuration/wait-causes - Get wait causes
export async function GET() {
  try {
    const waitCauses = await configurationService.getWaitCauses();

    return NextResponse.json({
      success: true,
      data: waitCauses,
    });
  } catch (error) {
    console.error("Error fetching wait causes:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las causas de espera" },
      { status: 500 }
    );
  }
}

// POST /api/configuration/wait-causes - Create new wait cause
export async function POST(request: NextRequest) {
  try {
    const { name, description, color, sortOrder } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const waitCause = await configurationService.createWaitCause({
      name,
      description,
      color,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: waitCause,
      message: "Causa de espera creada exitosamente",
    });
  } catch (error) {
    console.error("Error creating wait cause:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la causa de espera" },
      { status: 500 }
    );
  }
}
