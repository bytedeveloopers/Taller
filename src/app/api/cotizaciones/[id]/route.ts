import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/cotizaciones/[id] - Obtener cotización específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log("🔍 Obteniendo cotización:", id);

    // Simular cotización específica
    const quote = {
      id,
      workOrderId: "OT-2024-001",
      clientId: "client-1",
      vehicleId: "vehicle-1",
      estado: "ENVIADA",
      moneda: "GTQ",
      subtotal: 1000,
      impuestos: 120,
      descuento: 0,
      total: 1120,
      fechaCreacion: new Date("2024-01-20"),
      vencimientoAt: new Date("2024-01-23"),
      publicToken: "abc123def456",
      publicExpiresAt: new Date("2024-01-23"),
      termsVersion: "1.0",
      updatedAt: new Date(),

      client: {
        id: "client-1",
        name: "Juan Pérez",
        phone: "3001234567",
      },
      vehicle: {
        id: "vehicle-1",
        brand: "Toyota",
        model: "Corolla",
        year: 2020,
        licensePlate: "ABC123",
      },
      items: [
        {
          id: "1",
          quoteId: id,
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
          id: "2",
          quoteId: id,
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

    console.log("✅ Cotización encontrada");

    return NextResponse.json({
      success: true,
      data: quote,
      message: "Cotización obtenida exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo cotización:", error);
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

// PUT /api/cotizaciones/[id] - Actualizar cotización
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { clientId, vehicleId, workOrderId, vencimientoAt, moneda, items } = body;

    console.log("✏️ Actualizando cotización:", id);

    // Calcular nuevos totales
    const subtotal = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    const impuestos = subtotal * 0.12;
    const descuento = 0;
    const total = subtotal + impuestos - descuento;

    // Simular actualización
    const updatedQuote = {
      id,
      clientId,
      vehicleId,
      workOrderId: workOrderId || null,
      estado: "BORRADOR", // Reset to draft on edit
      moneda: moneda || "GTQ",
      subtotal,
      impuestos,
      descuento,
      total,
      vencimientoAt: new Date(vencimientoAt),
      items,
      updatedAt: new Date(),
    };

    console.log("✅ Cotización actualizada exitosamente");

    return NextResponse.json({
      success: true,
      data: updatedQuote,
      message: "Cotización actualizada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error actualizando cotización:", error);
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

// DELETE /api/cotizaciones/[id] - Eliminar cotización
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log("🗑️ Eliminando cotización:", id);

    // Simular eliminación
    console.log("✅ Cotización eliminada exitosamente");

    return NextResponse.json({
      success: true,
      message: "Cotización eliminada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando cotización:", error);
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
