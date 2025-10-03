import { notificationService } from "@/lib/services/notificationService";
import { NextRequest, NextResponse } from "next/server";

// POST - Crear notificación de prueba para testear el sistema
export async function POST(request: NextRequest) {
  try {
    const { userId = "demo-admin-user" } = await request.json().catch(() => ({}));

    // Crear una notificación de prueba del sistema
    const testNotification = await notificationService.createNotification({
      userId,
      type: "SYSTEM_MAINTENANCE",
      title: "Sistema de notificaciones activado",
      body: "El sistema de notificaciones ha sido implementado exitosamente y está funcionando correctamente.",
      priority: "MEDIUM",
      payload: {
        feature: "notifications-system",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
      },
      groupKey: `system-activation-${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      notification: testNotification,
      message: "Notificación de prueba creada exitosamente",
    });
  } catch (error) {
    console.error("Error creating test notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error creating test notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
