import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// POST /api/cotizaciones/[id]/generate-link - Generar enlace público
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log("🔗 Generando enlace público para cotización:", id);

    // Generar token único
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    // Simular actualización de cotización con token
    const updatedQuote = {
      id,
      publicToken: token,
      publicExpiresAt: expiresAt,
      estado: "ENVIADA",
      sentVia: "link",
      updatedAt: new Date(),
    };

    console.log("✅ Enlace generado exitosamente");

    return NextResponse.json({
      success: true,
      data: {
        token,
        expiresAt,
        publicUrl: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/cotizacion/${token}`,
      },
      message: "Enlace generado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error generando enlace:", error);
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
