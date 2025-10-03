import { prisma } from "@/lib/prisma";
import { NotificationPriority, NotificationType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener notificaciones con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const read = searchParams.get("read");
    const type = searchParams.get("type") as NotificationType | null;
    const priority = searchParams.get("priority") as NotificationPriority | null;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const where: any = {
      userId,
    };

    if (read !== null) {
      where.readAt = read === "true" ? { not: null } : null;
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            status: true,
          },
        },
        appointment: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            status: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            trackingCode: true,
            brand: true,
            model: true,
            year: true,
          },
        },
      },
    });

    const total = await prisma.notification.count({ where });
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: total > offset + limit,
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Crear nueva notificación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      title,
      body: notificationBody,
      priority = "MEDIUM",
      channel = "IN_APP",
      taskId,
      quoteId,
      appointmentId,
      customerId,
      vehicleId,
      payload,
      groupKey,
    } = body;

    if (!userId || !type || !title || !notificationBody) {
      return NextResponse.json(
        { error: "userId, type, title, and body are required" },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body: notificationBody,
        priority,
        channel,
        taskId,
        quoteId,
        appointmentId,
        customerId,
        vehicleId,
        payload,
        groupKey,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            status: true,
          },
        },
        appointment: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            status: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            trackingCode: true,
            brand: true,
            model: true,
            year: true,
          },
        },
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PATCH - Marcar notificaciones como leídas (bulk operation)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationIds, markAllAsRead = false } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    let where: any = { userId };

    if (markAllAsRead) {
      where.readAt = null;
    } else if (notificationIds && notificationIds.length > 0) {
      where.id = { in: notificationIds };
    } else {
      return NextResponse.json(
        { error: "notificationIds required or set markAllAsRead to true" },
        { status: 400 }
      );
    }

    const result = await prisma.notification.updateMany({
      where,
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Notifications marked as read",
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
