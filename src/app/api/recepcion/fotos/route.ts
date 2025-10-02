import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - Obtener fotos de inspección de un vehículo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");

    if (!vehicleId) {
      return NextResponse.json({ error: "ID del vehículo es requerido" }, { status: 400 });
    }

    // Obtener fotos desde la base de datos
    const fotosInspeccion = await prisma.inspectionPhoto.findMany({
      where: { vehicleId },
      include: {
        technician: {
          select: { name: true },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: fotosInspeccion.map((foto) => ({
        id: foto.id,
        nombre: foto.nombre,
        ubicacion: foto.ubicacion,
        observacion: foto.observacion,
        timestamp: foto.timestamp.toISOString(),
        tecnico: foto.technician.name,
        tieneDano: foto.tieneDano,
        vehicleId: foto.vehicleId,
        imageUrl: foto.imageUrl,
      })),
    });
  } catch (error) {
    console.error("Error al obtener fotos de inspección:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Agregar nueva foto de inspección
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, ubicacion, observacion, tieneDano, technicianId, nombre, imageUrl } = body;

    if (!vehicleId || !ubicacion) {
      return NextResponse.json(
        { error: "ID del vehículo y ubicación son requeridos" },
        { status: 400 }
      );
    }

    // Obtener un técnico por defecto si no se proporciona
    let finalTechnicianId = technicianId;
    if (!finalTechnicianId) {
      const defaultTechnician = await prisma.user.findFirst({
        where: { role: "TECHNICIAN" },
      });
      finalTechnicianId = defaultTechnician?.id;
    }

    if (!finalTechnicianId) {
      return NextResponse.json({ error: "No se encontró un técnico válido" }, { status: 400 });
    }

    // Crear la foto de inspección en la base de datos
    const nuevaFoto = await prisma.inspectionPhoto.create({
      data: {
        nombre: nombre || `Foto ${ubicacion}`,
        ubicacion,
        observacion: observacion || "Sin observaciones adicionales",
        tieneDano: tieneDano || false,
        vehicleId,
        technicianId: finalTechnicianId,
        imageUrl: imageUrl || null,
      },
      include: {
        technician: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Foto de inspección agregada exitosamente",
      data: {
        id: nuevaFoto.id,
        nombre: nuevaFoto.nombre,
        ubicacion: nuevaFoto.ubicacion,
        observacion: nuevaFoto.observacion,
        timestamp: nuevaFoto.timestamp.toISOString(),
        tecnico: nuevaFoto.technician.name,
        tieneDano: nuevaFoto.tieneDano,
        vehicleId: nuevaFoto.vehicleId,
        imageUrl: nuevaFoto.imageUrl,
      },
    });
  } catch (error) {
    console.error("Error al agregar foto de inspección:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE - Eliminar foto de inspección
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fotoId = searchParams.get("fotoId");

    if (!fotoId) {
      return NextResponse.json({ error: "ID de la foto es requerido" }, { status: 400 });
    }

    // Eliminar la foto de la base de datos
    await prisma.inspectionPhoto.delete({
      where: { id: fotoId },
    });

    return NextResponse.json({
      success: true,
      message: "Foto eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar foto de inspección:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
