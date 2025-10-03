import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener configuración de notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId },
    });

    // Si no existe configuración, devolver valores por defecto
    if (!settings) {
      const defaultSettings = {
        userId,
        inAppNotifications: true,
        emailNotifications: true,
        whatsappNotifications: false,
        intensity: "NORMAL",
        quietHoursStart: null,
        quietHoursEnd: null,
        workdaysOnly: false,
        taskReminders: true,
        appointmentReminders: true,
        quoteUpdates: true,
        systemAlerts: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST/PUT - Crear o actualizar configuración de notificaciones
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      inAppNotifications = true,
      emailNotifications = true,
      whatsappNotifications = false,
      intensity = "NORMAL",
      quietHoursStart,
      quietHoursEnd,
      workdaysOnly = false,
      taskReminders = true,
      appointmentReminders = true,
      quoteUpdates = true,
      systemAlerts = true,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const settings = await prisma.userNotificationSettings.upsert({
      where: { userId },
      update: {
        inAppNotifications,
        emailNotifications,
        whatsappNotifications,
        intensity,
        quietHoursStart,
        quietHoursEnd,
        workdaysOnly,
        taskReminders,
        appointmentReminders,
        quoteUpdates,
        systemAlerts,
        updatedAt: new Date(),
      },
      create: {
        userId,
        inAppNotifications,
        emailNotifications,
        whatsappNotifications,
        intensity,
        quietHoursStart,
        quietHoursEnd,
        workdaysOnly,
        taskReminders,
        appointmentReminders,
        quoteUpdates,
        systemAlerts,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
