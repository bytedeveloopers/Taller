import { MockAuditService } from "@/services/MockAuditService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await MockAuditService.getEventById(params.id);

    if (!event) {
      return NextResponse.json({ error: "Evento de auditoría no encontrado" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching audit event:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: "Los eventos de auditoría son inmutables" }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: "Los eventos de auditoría no se pueden eliminar" },
    { status: 405 }
  );
}
