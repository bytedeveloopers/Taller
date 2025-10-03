import { configurationService } from "@/services/ConfigurationService";
import { NextRequest, NextResponse } from "next/server";

// GET /api/configuration/templates - Get document templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const templates = await configurationService.getDocumentTemplates(type || undefined);

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las plantillas" },
      { status: 500 }
    );
  }
}

// POST /api/configuration/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    const { type, name, content, variables, createdBy } = await request.json();

    if (!type || !name || !content || !createdBy) {
      return NextResponse.json(
        { success: false, error: "Tipo, nombre, contenido y creador son requeridos" },
        { status: 400 }
      );
    }

    const template = await configurationService.createDocumentTemplate({
      type,
      name,
      content,
      variables,
      createdBy,
    });

    return NextResponse.json({
      success: true,
      data: template,
      message: "Plantilla creada exitosamente",
    });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la plantilla" },
      { status: 500 }
    );
  }
}
