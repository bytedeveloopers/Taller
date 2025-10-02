const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createInitialWorkflowRecords() {
  try {
    console.log("🔄 Creando registros iniciales de workflow...");

    // Obtener todos los vehículos
    const vehicles = await prisma.vehicle.findMany({
      include: {
        appointments: {
          where: {
            technicianId: { not: null },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    console.log(`📋 Procesando ${vehicles.length} vehículos`);

    for (const vehicle of vehicles) {
      // Verificar si ya existe un registro de workflow para este vehículo
      const existingRecord = await prisma.workflowStatus.findFirst({
        where: { vehicleId: vehicle.id },
      });

      if (!existingRecord) {
        // Crear registro inicial con el estado actual
        await prisma.workflowStatus.create({
          data: {
            vehicleId: vehicle.id,
            status: vehicle.status,
            technicianId: vehicle.appointments[0]?.technicianId || null,
            notes: `Estado inicial: ${vehicle.status}`,
            timestamp: vehicle.createdAt,
          },
        });

        console.log(
          `✅ Registro creado para vehículo ${vehicle.trackingCode} - Estado: ${vehicle.status}`
        );
      } else {
        console.log(`⏭️  Registro ya existe para vehículo ${vehicle.trackingCode}`);
      }
    }

    console.log("✅ Registros iniciales de workflow creados exitosamente");
  } catch (error) {
    console.error("❌ Error creando registros de workflow:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createInitialWorkflowRecords().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
