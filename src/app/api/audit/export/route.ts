import { AuditFilters, MockAuditService } from "@/services/MockAuditService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Obtener filtros para la exportación
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

    // Generar CSV
    const csvContent = await MockAuditService.exportToCSV(filters);

    // Preparar nombre del archivo con timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `audit-log-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting audit events:", error);
    return NextResponse.json({ error: "Error al exportar eventos de auditoría" }, { status: 500 });
  }
}
