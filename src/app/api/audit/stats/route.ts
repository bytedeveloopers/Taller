import { AuditFilters, MockAuditService } from "@/services/MockAuditService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Obtener filtros para las estadísticas
    const filters: AuditFilters = {};

    if (searchParams.get("actorId")) {
      filters.actorId = searchParams.get("actorId")!;
    }

    if (searchParams.get("entityType")) {
      filters.entityType = searchParams.get("entityType")!;
    }

    if (searchParams.get("dateFrom")) {
      filters.dateFrom = new Date(searchParams.get("dateFrom")!);
    }

    if (searchParams.get("dateTo")) {
      filters.dateTo = new Date(searchParams.get("dateTo")!);
    }

    // Obtener estadísticas
    const stats = await MockAuditService.getStats(filters);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
