const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function migrateVehicleStatus() {
  try {
    console.log("🔄 Iniciando migración de estados de vehículos...");

    // Mapeo de estados antiguos a nuevos
    const statusMapping = {
      RECEIVED: "RECEPCION",
      IN_PROGRESS: "INGRESO",
      WAITING_PARTS: "ESPERA",
      COMPLETED: "PRUEBA_CALIDAD",
      DELIVERED: "ENTREGA",
    };

    // Obtener todos los vehículos con sus estados actuales
    const vehicles = await prisma.$queryRaw`
      SELECT id, status FROM vehicles
    `;

    console.log(`📋 Encontrados ${vehicles.length} vehículos para migrar`);

    // Actualizar cada vehículo usando SQL directo
    for (const vehicle of vehicles) {
      const oldStatus = vehicle.status;
      const newStatus = statusMapping[oldStatus] || "RECEPCION";

      console.log(`🔄 Vehículo ${vehicle.id}: ${oldStatus} -> ${newStatus}`);

      await prisma.$executeRaw`
        UPDATE vehicles
        SET status = ${newStatus}
        WHERE id = ${vehicle.id}
      `;
    }

    console.log("✅ Migración de estados completada exitosamente");
  } catch (error) {
    console.error("❌ Error en la migración:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateVehicleStatus().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
