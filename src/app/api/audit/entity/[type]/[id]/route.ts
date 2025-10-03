import { MockAuditService } from "@/services/MockAuditService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await MockAuditService.getEventsByEntity(params.type, params.id, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching entity audit events:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
