import { NextRequest, NextResponse } from "next/server";

// GET - Obtener fotos de inspección de un vehículo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");

    if (!vehicleId) {
      return NextResponse.json({ error: "ID del vehículo es requerido" }, { status: 400 });
    }

    // TODO: Implementar modelo de fotos de inspección en el schema de Prisma
    // Por ahora retornamos datos de ejemplo
    const fotosInspeccion = [
      {
        id: `${vehicleId}-1`,
        nombre: "Vista Frontal",
        ubicacion: "Frente completo del vehículo",
        observacion: "Estado general excelente",
        timestamp: new Date().toISOString(),
        tecnico: "Sistema",
        tieneDano: false,
        vehicleId: vehicleId,
      },
    ];

    return NextResponse.json({
      success: true,
      data: fotosInspeccion,
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
    const { vehicleId, ubicacion, observacion, tieneDano, tecnico } = body;

    if (!vehicleId || !ubicacion) {
      return NextResponse.json(
        { error: "ID del vehículo y ubicación son requeridos" },
        { status: 400 }
      );
    }

    // TODO: Implementar guardado real en base de datos
    // Por ahora simulamos la respuesta
    const nuevaFoto = {
      id: `${vehicleId}-${Date.now()}`,
      nombre: `Foto ${ubicacion}`,
      ubicacion,
      observacion: observacion || "Sin observaciones adicionales",
      timestamp: new Date().toISOString(),
      tecnico: tecnico || "Sistema",
      tieneDano: tieneDano || false,
      vehicleId,
    };

    return NextResponse.json({
      success: true,
      message: "Foto de inspección agregada exitosamente",
      data: nuevaFoto,
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

    // TODO: Implementar eliminación real en base de datos

    return NextResponse.json({
      success: true,
      message: "Foto eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar foto de inspección:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
