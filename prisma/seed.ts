import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Crear usuarios (admin y técnicos)
    const admin = await prisma.user.create({
      data: {
        email: "admin@taller.com",
        nombre: "Administrador",
        password: "admin123", // En producción usar hash
        role: "ADMIN",
      },
    });

    const technician1 = await prisma.user.create({
      data: {
        email: "juan@taller.com",
        name: "Juan Pérez",
        password: "tech123",
        role: "TECHNICIAN",
      },
    });

    const technician2 = await prisma.user.create({
      data: {
        email: "maria@taller.com",
        name: "María González",
        password: "tech123",
        role: "TECHNICIAN",
      },
    });

    // Crear clientes
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: "Carlos Mendoza",
          email: "carlos@email.com",
          phone: "5551-2345",
          address: "Zona 10, Guatemala",
        },
      }),
      prisma.customer.create({
        data: {
          name: "Ana López",
          email: "ana@email.com",
          phone: "5552-3456",
          address: "Zona 4, Guatemala",
        },
      }),
      prisma.customer.create({
        data: {
          name: "Roberto Silva",
          email: "roberto@email.com",
          phone: "5553-4567",
          address: "Carretera a El Salvador",
        },
      }),
      prisma.customer.create({
        data: {
          name: "Lucía Herrera",
          email: "lucia@email.com",
          phone: "5554-5678",
          address: "Zona 15, Guatemala",
        },
      }),
      prisma.customer.create({
        data: {
          name: "Diego Morales",
          email: "diego@email.com",
          phone: "5555-6789",
          address: "Mixco, Guatemala",
        },
      }),
    ]);

    // Crear vehículos
    const vehicles = await Promise.all([
      prisma.vehicle.create({
        data: {
          trackingCode: "VEH001",
          brand: "Toyota",
          model: "Corolla",
          year: 2019,
          licensePlate: "P-123ABC",
          color: "Blanco",
          mileage: 45000,
          customerId: customers[0].id,
          status: "RECEIVED",
        },
      }),
      prisma.vehicle.create({
        data: {
          trackingCode: "VEH002",
          brand: "Honda",
          model: "Civic",
          year: 2020,
          licensePlate: "P-456DEF",
          color: "Negro",
          mileage: 32000,
          customerId: customers[1].id,
          status: "IN_PROGRESS",
        },
      }),
      prisma.vehicle.create({
        data: {
          trackingCode: "VEH003",
          brand: "Nissan",
          model: "Sentra",
          year: 2018,
          licensePlate: "P-789GHI",
          color: "Azul",
          mileage: 58000,
          customerId: customers[2].id,
          status: "COMPLETED",
        },
      }),
      prisma.vehicle.create({
        data: {
          trackingCode: "VEH004",
          brand: "Hyundai",
          model: "Elantra",
          year: 2021,
          licensePlate: "P-012JKL",
          color: "Rojo",
          mileage: 25000,
          customerId: customers[3].id,
          status: "WAITING_PARTS",
        },
      }),
      prisma.vehicle.create({
        data: {
          trackingCode: "VEH005",
          brand: "Mazda",
          model: "3",
          year: 2022,
          licensePlate: "P-345MNO",
          color: "Gris",
          mileage: 15000,
          customerId: customers[4].id,
          status: "RECEIVED",
        },
      }),
    ]);

    // Crear citas
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await Promise.all([
      prisma.appointment.create({
        data: {
          scheduledAt: today,
          estimatedDuration: 120,
          status: "IN_PROGRESS",
          notes: "Cambio de aceite y filtros",
          vehicleId: vehicles[0].id,
          customerId: customers[0].id,
          technicianId: technician1.id,
        },
      }),
      prisma.appointment.create({
        data: {
          scheduledAt: tomorrow,
          estimatedDuration: 180,
          status: "SCHEDULED",
          notes: "Revisión de frenos",
          vehicleId: vehicles[1].id,
          customerId: customers[1].id,
          technicianId: technician2.id,
        },
      }),
      prisma.appointment.create({
        data: {
          scheduledAt: nextWeek,
          estimatedDuration: 240,
          status: "SCHEDULED",
          notes: "Mantenimiento general",
          vehicleId: vehicles[2].id,
          customerId: customers[2].id,
          technicianId: technician1.id,
        },
      }),
      prisma.appointment.create({
        data: {
          scheduledAt: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Ayer
          estimatedDuration: 90,
          status: "COMPLETED",
          notes: "Alineación y balanceo",
          vehicleId: vehicles[3].id,
          customerId: customers[3].id,
          technicianId: technician2.id,
        },
      }),
    ]);

    // Crear algunas tareas
    await Promise.all([
      prisma.task.create({
        data: {
          title: "Cambio de aceite",
          description: "Cambiar aceite y filtro de aceite",
          status: "COMPLETED",
          priority: "MEDIUM",
          estimatedTime: 60,
          actualTime: 45,
          vehicleId: vehicles[0].id,
          technicianId: technician1.id,
          createdById: admin.id,
          completedAt: new Date(),
        },
      }),
      prisma.task.create({
        data: {
          title: "Revisión de frenos",
          description: "Inspeccionar pastillas y discos de freno",
          status: "IN_PROGRESS",
          priority: "HIGH",
          estimatedTime: 120,
          vehicleId: vehicles[1].id,
          technicianId: technician2.id,
          createdById: admin.id,
          startedAt: new Date(),
        },
      }),
    ]);

    // Crear cotizaciones
    await Promise.all([
      prisma.quote.create({
        data: {
          quoteNumber: "COT-001",
          description: "Mantenimiento preventivo completo",
          subtotal: 1200.0,
          tax: 144.0,
          total: 1344.0,
          status: "APPROVED",
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          vehicleId: vehicles[0].id,
          customerId: customers[0].id,
          createdById: admin.id,
          approvedAt: new Date(),
          items: {
            create: [
              {
                description: "Cambio de aceite sintético",
                quantity: 1,
                unitPrice: 350.0,
                total: 350.0,
              },
              {
                description: "Filtro de aceite",
                quantity: 1,
                unitPrice: 150.0,
                total: 150.0,
              },
              {
                description: "Revisión de frenos",
                quantity: 1,
                unitPrice: 400.0,
                total: 400.0,
              },
              {
                description: "Alineación",
                quantity: 1,
                unitPrice: 300.0,
                total: 300.0,
              },
            ],
          },
        },
      }),
      prisma.quote.create({
        data: {
          quoteNumber: "COT-002",
          description: "Reparación sistema de frenos",
          subtotal: 2800.0,
          tax: 336.0,
          total: 3136.0,
          status: "SENT",
          validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          vehicleId: vehicles[1].id,
          customerId: customers[1].id,
          createdById: admin.id,
          items: {
            create: [
              {
                description: "Pastillas de freno delanteras",
                quantity: 1,
                unitPrice: 800.0,
                total: 800.0,
              },
              {
                description: "Discos de freno",
                quantity: 2,
                unitPrice: 600.0,
                total: 1200.0,
              },
              {
                description: "Mano de obra",
                quantity: 4,
                unitPrice: 200.0,
                total: 800.0,
              },
            ],
          },
        },
      }),
    ]);

    console.log("✅ Database seeded successfully!");
    console.log("📊 Created:");
    console.log("  - 3 users (1 admin, 2 technicians)");
    console.log("  - 5 customers");
    console.log("  - 5 vehicles");
    console.log("  - 4 appointments");
    console.log("  - 2 tasks");
    console.log("  - 2 quotes with items");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
