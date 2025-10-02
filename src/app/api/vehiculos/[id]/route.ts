import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/vehiculos/[id] - Obtener vehículo específico
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const vehiculo = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        appointments: {
          include: {
            customer: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            scheduledAt: "desc",
          },
          take: 10,
        },
        quotes: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        inspectionPhotos: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
        _count: {
          select: {
            appointments: true,
            quotes: true,
          },
        },
      },
    });

    if (!vehiculo) {
      return NextResponse.json(
        {
          success: false,
          error: "Vehículo no encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vehiculo,
    });
  } catch (error) {
    console.error("Error obteniendo vehículo:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// PUT /api/vehiculos/[id] - Actualizar vehículo
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      customerId,
      licensePlate,
      vin,
      brand,
      model,
      year,
      color,
      mileage,
      fuelType,
      transmission,
      nickname,
      notes,
      nextServiceAtDate,
      nextServiceAtKm,
      isActive,
    } = body;

    // Verificar que el vehículo existe
    const vehiculoExistente = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehiculoExistente) {
      return NextResponse.json(
        {
          success: false,
          error: "Vehículo no encontrado",
        },
        { status: 404 }
      );
    }

    // Validaciones
    if (!customerId || !brand || !model || !year) {
      return NextResponse.json(
        {
          success: false,
          error: "Los campos customerId, brand, model y year son requeridos",
        },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const cliente = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!cliente) {
      return NextResponse.json(
        {
          success: false,
          error: "Cliente no encontrado",
        },
        { status: 404 }
      );
    }

    // Verificar duplicados por placa (excluyendo el vehículo actual)
    if (licensePlate) {
      const vehiculoConPlaca = await prisma.vehicle.findFirst({
        where: {
          licensePlate,
          NOT: { id },
        },
      });

      if (vehiculoConPlaca) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe otro vehículo con esa placa",
          },
          { status: 409 }
        );
      }
    }

    // Verificar duplicados por VIN (excluyendo el vehículo actual)
    if (vin) {
      const vehiculoConVin = await prisma.vehicle.findFirst({
        where: {
          vin,
          NOT: { id },
        },
      });

      if (vehiculoConVin) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe otro vehículo con ese VIN",
          },
          { status: 409 }
        );
      }
    }

    // Actualizar vehículo
    const vehiculoActualizado = await prisma.vehicle.update({
      where: { id },
      data: {
        customerId,
        licensePlate: licensePlate || null,
        vin: vin || null,
        brand,
        model,
        year: parseInt(year),
        color: color || null,
        mileage: mileage ? parseInt(mileage) : null,
        fuelType: fuelType || null,
        transmission: transmission || null,
        nickname: nickname || null,
        notes: notes || null,
        nextServiceAtDate: nextServiceAtDate ? new Date(nextServiceAtDate) : null,
        nextServiceAtKm: nextServiceAtKm ? parseInt(nextServiceAtKm) : null,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
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
      success: true,
      data: vehiculoActualizado,
      message: "Vehículo actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error actualizando vehículo:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/vehiculos/[id] - Desactivar vehículo (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar que el vehículo existe
    const vehiculoExistente = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehiculoExistente) {
      return NextResponse.json(
        {
          success: false,
          error: "Vehículo no encontrado",
        },
        { status: 404 }
      );
    }

    // Verificar si tiene citas activas o en proceso
    const citasActivas = await prisma.appointment.count({
      where: {
        vehicleId: id,
        status: {
          in: ["SCHEDULED", "IN_PROGRESS"],
        },
      },
    });

    if (citasActivas > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No se puede desactivar el vehículo porque tiene citas activas o en proceso",
        },
        { status: 409 }
      );
    }

    // Desactivar vehículo (soft delete)
    const vehiculoDesactivado = await prisma.vehicle.update({
      where: { id },
      data: {
        isActive: false,
        status: "DELIVERED",
        updatedAt: new Date(),
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
      success: true,
      data: vehiculoDesactivado,
      message: "Vehículo desactivado exitosamente",
    });
  } catch (error) {
    console.error("Error desactivando vehículo:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
