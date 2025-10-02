import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener todos los vehículos en recepción
export async function GET() {
  try {
    const vehiculos = await prisma.vehicle.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        inspectionPhotos: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true,
            tieneDano: true,
          },
        },
        appointments: {
          include: {
            technician: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: vehiculos.map((vehiculo) => ({
        id: vehiculo.id,
        codigoSeguimiento: vehiculo.trackingCode,
        cliente: vehiculo.customer.name,
        telefono: vehiculo.customer.phone,
        email: vehiculo.customer.email,
        vehiculo: `${vehiculo.brand} ${vehiculo.model} ${vehiculo.year}`,
        placa: vehiculo.licensePlate,
        color: vehiculo.color,
        kilometraje: vehiculo.mileage,
        estado: vehiculo.status,
        evidencias: vehiculo.inspectionPhotos.length,
        fotosInspeccion: vehiculo.inspectionPhotos,
        tecnico: vehiculo.appointments[0]?.technician?.name || "No asignado",
        fechaIngreso: vehiculo.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Crear nuevo vehículo en recepción
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cliente,
      telefono,
      email,
      marca,
      modelo,
      año,
      placa,
      color,
      kilometraje,
      observaciones,
    } = body;

    if (!cliente || !telefono || !marca || !modelo || !año) {
      return NextResponse.json(
        { error: "Cliente, teléfono, marca, modelo y año son requeridos" },
        { status: 400 }
      );
    }

    // Generar código de seguimiento único
    const fecha = new Date();
    const año_actual = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    const hora = String(fecha.getHours()).padStart(2, "0");
    const minuto = String(fecha.getMinutes()).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const codigoSeguimiento = `TLR-${año_actual}${mes}${dia}-${hora}${minuto}-${random}`;

    // Crear o encontrar cliente
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [{ phone: telefono }, { email: email || "" }],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: cliente,
          phone: telefono,
          email: email || null,
        },
      });
    }

    // Crear vehículo
    const nuevoVehiculo = await prisma.vehicle.create({
      data: {
        trackingCode: codigoSeguimiento,
        brand: marca,
        model: modelo,
        year: parseInt(año),
        licensePlate: placa || null,
        color: color || null,
        mileage: kilometraje ? parseInt(kilometraje) : null,
        customerId: customer.id,
        status: "RECEIVED",
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // Crear cita inicial si hay observaciones
    if (observaciones) {
      await prisma.appointment.create({
        data: {
          scheduledAt: new Date(),
          notes: observaciones,
          vehicleId: nuevoVehiculo.id,
          customerId: customer.id,
          status: "SCHEDULED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Vehículo registrado exitosamente",
      data: {
        id: nuevoVehiculo.id,
        codigoSeguimiento: nuevoVehiculo.trackingCode,
        cliente: nuevoVehiculo.customer.name,
        vehiculo: `${nuevoVehiculo.brand} ${nuevoVehiculo.model} ${nuevoVehiculo.year}`,
        placa: nuevoVehiculo.licensePlate,
        estado: nuevoVehiculo.status,
      },
    });
  } catch (error) {
    console.error("Error al crear vehículo:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT - Actualizar estado del vehículo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, observaciones } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID y estado son requeridos" }, { status: 400 });
    }

    const vehiculoActualizado = await prisma.vehicle.update({
      where: { id },
      data: { status },
      include: {
        customer: {
          select: { name: true },
        },
      },
    });

    // Crear nota si se proporciona
    if (observaciones) {
      await prisma.appointment.create({
        data: {
          scheduledAt: new Date(),
          notes: observaciones,
          vehicleId: id,
          customerId: vehiculoActualizado.customerId,
          status: "SCHEDULED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Estado actualizado exitosamente",
      data: vehiculoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar vehículo:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
