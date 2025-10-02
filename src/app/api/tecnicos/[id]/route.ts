import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/tecnicos/[id] - Obtener técnico específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log("🔍 Obteniendo técnico con ID:", id);

    const user = await prisma.user.findUnique({
      where: {
        id: id,
        role: "TECHNICIAN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Técnico no encontrado",
        },
        { status: 404 }
      );
    }

    // Simular datos adicionales
    const tecnico = {
      id: user.id,
      name: user.name,
      phone: `3${Math.floor(Math.random() * 900000000) + 100000000}`,
      email: user.email,
      skills: ["Motor", "Transmisión", "Frenos"],
      capacityPerDay: 5,
      currentLoad: Math.floor(Math.random() * 6),
      workHours: {
        start: "08:00",
        end: "17:00",
      },
      active: user.isActive,
      avatarUrl: null,
      notes: "Técnico especializado con experiencia.",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log("✅ Técnico encontrado:", user.name);

    return NextResponse.json({
      success: true,
      data: tecnico,
      message: "Técnico obtenido exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo técnico:", error);
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

// PUT /api/tecnicos/[id] - Actualizar técnico
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, phone, email, skills, capacityPerDay, workHours, active, avatarUrl, notes } =
      body;

    console.log("✏️ Actualizando técnico:", id);

    const user = await prisma.user.update({
      where: {
        id: id,
        role: "TECHNICIAN",
      },
      data: {
        name: name?.trim(),
        email: email,
        isActive: active !== false,
      },
    });

    console.log("✅ Técnico actualizado exitosamente");

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        phone,
        email: user.email,
        skills: skills || [],
        capacityPerDay: capacityPerDay || 5,
        workHours: workHours || { start: "08:00", end: "17:00" },
        active: user.isActive,
        avatarUrl: avatarUrl || null,
        notes: notes || "",
        updatedAt: user.updatedAt,
      },
      message: "Técnico actualizado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error actualizando técnico:", error);
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

// DELETE /api/tecnicos/[id] - Desactivar técnico
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log("🗑️ Desactivando técnico:", id);

    const user = await prisma.user.update({
      where: {
        id: id,
        role: "TECHNICIAN",
      },
      data: {
        isActive: false,
      },
    });

    console.log("✅ Técnico desactivado exitosamente");

    return NextResponse.json({
      success: true,
      message: "Técnico desactivado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error desactivando técnico:", error);
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
