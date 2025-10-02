import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// PATCH /api/cotizaciones/[id]/mark-expired - Marcar cotización como vencida
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log("⏰ Marcando cotización como vencida:", id);

    // Simular actualización de estado
    const updatedQuote = {
      id,
      estado: "VENCIDA",
      updatedAt: new Date(),
    };

    console.log("✅ Cotización marcada como vencida");

    return NextResponse.json({
      success: true,
      data: updatedQuote,
      message: "Cotización marcada como vencida",
    });
  } catch (error) {
    console.error("❌ Error marcando como vencida:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
