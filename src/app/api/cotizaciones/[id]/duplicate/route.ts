import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// POST /api/cotizaciones/[id]/duplicate - Duplicar cotización
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log("📋 Duplicando cotización:", id);

    // Simular obtención de cotización original
    const originalQuote = {
      id: `duplicate_${Date.now()}`,
      workOrderId: null, // No copiar OT
      clientId: "client-1",
      vehicleId: "vehicle-1",
      estado: "BORRADOR",
      moneda: "GTQ",
      subtotal: 1000,
      impuestos: 120,
      descuento: 0,
      total: 1120,
      fechaCreacion: new Date(),
      vencimientoAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // +72h
      publicToken: null,
      publicExpiresAt: null,
      termsVersion: "1.0",
      sentVia: "link",
      createdAt: new Date(),
      updatedAt: new Date(),

      items: [
        {
          id: `item_${Date.now()}_1`,
          quoteId: `duplicate_${Date.now()}`,
          concepto: "Cambio de aceite",
          descripcion: "Cambio de aceite sintético 5W-30",
          cantidad: 1,
          precioUnitario: 500,
          tipo: "SERVICIO",
          nota: "",
          orden: 1,
          subtotal: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `item_${Date.now()}_2`,
          quoteId: `duplicate_${Date.now()}`,
          concepto: "Filtro de aceite",
          descripcion: "Filtro de aceite original",
          cantidad: 1,
          precioUnitario: 500,
          tipo: "REPUESTO",
          nota: "",
          orden: 2,
          subtotal: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    console.log("✅ Cotización duplicada exitosamente");

    return NextResponse.json({
      success: true,
      data: originalQuote,
      message: "Cotización duplicada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error duplicando cotización:", error);
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
