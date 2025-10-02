import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/cotizaciones/[id]/timeline - Obtener timeline de eventos
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log("📅 Obteniendo timeline de cotización:", id);

    // Simular eventos del timeline
    const timeline = [
      {
        id: "1",
        quoteId: id,
        tipo: "CREADA",
        descripcion: "Cotización creada",
        metadata: {},
        userId: "admin-1",
        createdAt: new Date("2024-01-20T09:00:00"),
        user: {
          id: "admin-1",
          name: "Admin Usuario",
        },
      },
      {
        id: "2",
        quoteId: id,
        tipo: "EDITADA",
        descripcion: "Cotización editada - se actualizaron los items",
        metadata: { changes: "items" },
        userId: "admin-1",
        createdAt: new Date("2024-01-20T10:30:00"),
        user: {
          id: "admin-1",
          name: "Admin Usuario",
        },
      },
      {
        id: "3",
        quoteId: id,
        tipo: "ENVIADA",
        descripcion: "Enlace público generado",
        metadata: { method: "link" },
        userId: "admin-1",
        createdAt: new Date("2024-01-20T11:00:00"),
        user: {
          id: "admin-1",
          name: "Admin Usuario",
        },
      },
      {
        id: "4",
        quoteId: id,
        tipo: "VISTA",
        descripcion: "Cliente visualizó la cotización",
        metadata: { ip: "192.168.1.100" },
        userId: null,
        createdAt: new Date("2024-01-20T14:25:00"),
        user: null,
      },
    ];

    console.log(`✅ Timeline obtenido: ${timeline.length} eventos`);

    return NextResponse.json({
      success: true,
      data: timeline,
      message: "Timeline obtenido exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo timeline:", error);
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
