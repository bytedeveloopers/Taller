import { configurationService } from "@/services/ConfigurationService";
import { NextRequest, NextResponse } from "next/server";

// GET /api/configuration/terms - Get terms versions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const terms = await configurationService.getTermsVersions(type || undefined);

    return NextResponse.json({
      success: true,
      data: terms,
    });
  } catch (error) {
    console.error("Error fetching terms:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener los términos" },
      { status: 500 }
    );
  }
}

// POST /api/configuration/terms - Create new terms version
export async function POST(request: NextRequest) {
  try {
    const { type, version, title, content, publishedBy, makeActive } = await request.json();

    if (!type || !version || !title || !content || !publishedBy) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const termsVersion = await configurationService.createTermsVersion({
      type,
      version,
      title,
      content,
      publishedBy,
      makeActive,
    });

    return NextResponse.json({
      success: true,
      data: termsVersion,
      message: "Versión de términos creada exitosamente",
    });
  } catch (error) {
    console.error("Error creating terms version:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la versión de términos" },
      { status: 500 }
    );
  }
}
