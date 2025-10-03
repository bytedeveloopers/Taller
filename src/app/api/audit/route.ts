import { AuditFilters, MockAuditService } from "@/services/MockAuditService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Obtener parámetros de filtrado
    const filters: AuditFilters = {};

    if (searchParams.get("actorId")) {
      filters.actorId = searchParams.get("actorId")!;
    }

    if (searchParams.get("entityType")) {
      filters.entityType = searchParams.get("entityType")!;
    }

    if (searchParams.get("entityId")) {
      filters.entityId = searchParams.get("entityId")!;
    }

    if (searchParams.get("action")) {
      filters.action = searchParams.get("action")!;
    }

    if (searchParams.get("dateFrom")) {
      filters.dateFrom = new Date(searchParams.get("dateFrom")!);
    }

    if (searchParams.get("dateTo")) {
      filters.dateTo = new Date(searchParams.get("dateTo")!);
    }

    // Parámetros de paginación
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Obtener eventos
    const result = await MockAuditService.getEvents(filters, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching audit events:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Los eventos de auditoría son de solo lectura" },
    { status: 405 }
  );
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
