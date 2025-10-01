import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand, model, year, licensePlate, customerId } = body;

    // Validar campos requeridos
    if (!brand || !model || !year || !customerId) {
      return NextResponse.json(
        { error: "Marca, modelo, año y cliente son requeridos" },
        { status: 400 }
      );
    }

    // Generar código de seguimiento único
    const trackingCode = `VH-${Date.now().toString().slice(-6)}`;

    // Crear vehículo
    const vehicle = await prisma.vehicle.create({
      data: {
        brand,
        model,
        year: parseInt(year),
        licensePlate: licensePlate || null,
        trackingCode,
        customerId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Vehículo creado exitosamente",
      vehicle,
    });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
