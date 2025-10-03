import { configurationService } from "@/services/ConfigurationService";
import { NextRequest, NextResponse } from "next/server";

// POST /api/configuration/initialize - Initialize default configuration
export async function POST(request: NextRequest) {
  try {
    await configurationService.initializeDefaultSettings();

    return NextResponse.json({
      success: true,
      message: "Configuración inicializada exitosamente",
    });
  } catch (error) {
    console.error("Error initializing configuration:", error);
    return NextResponse.json(
      { success: false, error: "Error al inicializar la configuración" },
      { status: 500 }
    );
  }
}
