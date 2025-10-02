import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ordenTrabajoId, fechaRecordatorio, mensaje, tipo = "ASIGNACION" } = body;

    // Validación de datos requeridos
    if (!ordenTrabajoId || !fechaRecordatorio || !mensaje) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos incompletos. Se requiere ordenTrabajoId, fechaRecordatorio y mensaje",
        },
        { status: 400 }
      );
    }

    // Crear el recordatorio en la base de datos
    const recordatorio = await prisma.reminder.create({
      data: {
        ordenTrabajoId,
        fechaRecordatorio: new Date(fechaRecordatorio),
        mensaje,
        tipo,
        activo: true,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: recordatorio,
      message: "Recordatorio creado exitosamente",
    });
  } catch (error) {
    console.error("Error al crear recordatorio:", error);
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ordenTrabajoId = searchParams.get("ordenTrabajoId");
    const activos = searchParams.get("activos") === "true";

    let whereClause: any = {};

    if (ordenTrabajoId) {
      whereClause.ordenTrabajoId = ordenTrabajoId;
    }

    if (activos) {
      whereClause.activo = true;
      whereClause.fechaRecordatorio = {
        gte: new Date(),
      };
    }

    const recordatorios = await prisma.reminder.findMany({
      where: whereClause,
      orderBy: {
        fechaRecordatorio: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: recordatorios,
    });
  } catch (error) {
    console.error("Error al obtener recordatorios:", error);
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, activo, completado } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID del recordatorio es requerido",
        },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (typeof activo === "boolean") {
      updateData.activo = activo;
    }

    if (typeof completado === "boolean") {
      updateData.completado = completado;
      if (completado) {
        updateData.fechaCompletado = new Date();
      }
    }

    const recordatorio = await prisma.reminder.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: recordatorio,
      message: "Recordatorio actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar recordatorio:", error);
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
