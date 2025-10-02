import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("🌱 Iniciando seed de la base de datos...");

    // Verificar si ya hay datos
    const existingVehicles = await prisma.vehicle.count();
    if (existingVehicles > 0) {
      return NextResponse.json({
        success: true,
        message: "La base de datos ya tiene datos",
        data: { vehiculosExistentes: existingVehicles },
      });
    }

    // Crear clientes de prueba
    const cliente1 = await prisma.customer.create({
      data: {
        name: "Juan Pérez",
        phone: "5551-2345",
        email: "juan.perez@email.com",
        address: "Zona 10, Ciudad de Guatemala",
      },
    });

    const cliente2 = await prisma.customer.create({
      data: {
        name: "María García",
        phone: "5556-7890",
        email: "maria.garcia@email.com",
        address: "Zona 15, Ciudad de Guatemala",
      },
    });

    // Crear técnicos de prueba
    const tecnico1 = await prisma.user.create({
      data: {
        name: "Carlos Mendoza",
        email: "carlos.mendoza@taller.com",
        password: "password123",
        role: "TECHNICIAN",
        isActive: true,
      },
    });

    const tecnico2 = await prisma.user.create({
      data: {
        name: "Ana López",
        email: "ana.lopez@taller.com",
        password: "password123",
        role: "TECHNICIAN",
        isActive: true,
      },
    });

    // Crear vehículos de prueba
    const vehiculo1 = await prisma.vehicle.create({
      data: {
        trackingCode: "TLR-20251002-1045-ABC",
        brand: "Toyota",
        model: "Corolla",
        year: 2020,
        licensePlate: "P-123ABC",
        color: "Blanco",
        mileage: 25000,
        status: "RECEIVED",
        customerId: cliente1.id,
      },
    });

    const vehiculo2 = await prisma.vehicle.create({
      data: {
        trackingCode: "TLR-20251002-1100-DEF",
        brand: "Honda",
        model: "Civic",
        year: 2019,
        licensePlate: "P-456DEF",
        color: "Azul",
        mileage: 30000,
        status: "IN_PROGRESS",
        customerId: cliente2.id,
      },
    });

    const vehiculo3 = await prisma.vehicle.create({
      data: {
        trackingCode: "TLR-20251002-1115-GHI",
        brand: "Nissan",
        model: "Sentra",
        year: 2021,
        licensePlate: "P-789GHI",
        color: "Rojo",
        mileage: 15000,
        status: "RECEIVED",
        customerId: cliente1.id,
      },
    });

    // Crear citas/asignaciones
    await prisma.appointment.create({
      data: {
        scheduledAt: new Date(),
        notes: "Asignado a Carlos Mendoza para mantenimiento general",
        vehicleId: vehiculo2.id,
        customerId: cliente2.id,
        technicianId: tecnico1.id,
        status: "IN_PROGRESS",
        estimatedDuration: 120,
      },
    });

    // Crear algunas fotos de inspección
    await prisma.inspectionPhoto.create({
      data: {
        nombre: "Inspección frontal",
        ubicacion: "Parte frontal del vehículo",
        observacion: "Pequeño rayón en el parachoques frontal",
        tieneDano: true,
        vehicleId: vehiculo1.id,
        technicianId: tecnico1.id,
      },
    });

    await prisma.inspectionPhoto.create({
      data: {
        nombre: "Estado de llantas",
        ubicacion: "Llanta delantera derecha",
        observacion: "Desgaste normal, buen estado general",
        tieneDano: false,
        vehicleId: vehiculo1.id,
        technicianId: tecnico1.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Seed completado exitosamente!",
      data: {
        clientes: 2,
        tecnicos: 2,
        vehiculos: 3,
        citas: 1,
        fotos: 2,
      },
    });
  } catch (error) {
    console.error("❌ Error en el seed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al poblar la base de datos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
