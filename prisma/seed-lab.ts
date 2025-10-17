import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedLab() {
  console.log("🧪 Seeding laboratory database (minimal data)...");

  try {
    // Crear solo el usuario administrador
    const admin = await prisma.user.create({
      data: {
        email: "admin@taller.com",
        name: "Administrador",
        password: "admin123", // En producción usar hash
        role: "ADMIN",
        isActive: true,
      },
    });

    console.log("✅ Admin user created:", admin.email);
    console.log("🎯 Laboratory database seeded successfully!");
    console.log("📧 Login: admin@taller.com");
    console.log("🔑 Password: admin123");
  } catch (error) {
    console.error("❌ Error seeding laboratory database:", error);
    throw error;
  }
}

seedLab()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
