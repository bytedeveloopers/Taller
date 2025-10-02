import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// PATCH /api/tecnicos/[id]/toggle-status - Cambiar estado activo/inactivo
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log("🔄 Cambiando estado del técnico:", id);

    // Obtener el estado actual
    const currentUser = await prisma.user.findUnique({
      where: {
        id: id,
        role: "TECHNICIAN",
      },
      select: {
        isActive: true,
        name: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Técnico no encontrado",
        },
        { status: 404 }
      );
    }

    // Cambiar el estado
    const updatedUser = await prisma.user.update({
      where: {
        id: id,
        role: "TECHNICIAN",
      },
      data: {
        isActive: !currentUser.isActive,
      },
    });

    const newStatus = updatedUser.isActive ? "activado" : "desactivado";
    console.log(`✅ Técnico ${currentUser.name} ${newStatus} exitosamente`);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        active: updatedUser.isActive,
      },
      message: `Técnico ${newStatus} exitosamente`,
    });
  } catch (error) {
    console.error("❌ Error cambiando estado del técnico:", error);
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
