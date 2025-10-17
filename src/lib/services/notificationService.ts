import { prisma } from "@/lib/prisma";
import {
  NotificationChannel,
  NotificationIntensity,
  NotificationPriority,
  NotificationType,
} from "@prisma/client";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  taskId?: string;
  quoteId?: string;
  appointmentId?: string;
  customerId?: string;
  vehicleId?: string;
  payload?: any;
  groupKey?: string;
}

export interface NotificationSettings {
  inAppNotifications: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  intensity: NotificationIntensity;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  workdaysOnly: boolean;
  taskReminders: boolean;
  appointmentReminders: boolean;
  quoteUpdates: boolean;
  systemAlerts: boolean;
}

class NotificationService {
  /**
   * Crear una nueva notificación
   */
  async createNotification(params: CreateNotificationParams) {
    const {
      userId,
      type,
      title,
      body,
      priority = "MEDIUM",
      channel = "IN_APP",
      taskId,
      quoteId,
      appointmentId,
      customerId,
      vehicleId,
      payload,
      groupKey,
    } = params;

    try {
      // Verificar configuraciones del usuario
      const userSettings = await this.getUserSettings(userId);

      // Verificar si el usuario tiene habilitado este tipo de notificación
      if (!this.shouldSendNotification(type, userSettings)) {
        console.log(`Notification skipped for user ${userId} - disabled in settings`);
        return null;
      }

      // Verificar horarios de silencio
      if (this.isInQuietHours(userSettings)) {
        console.log(`Notification deferred for user ${userId} - quiet hours`);
        // En una implementación completa, podríamos diferir la notificación
        // Por ahora, la creamos pero podríamos marcarla como diferida
      }

      // Verificar si existe una notificación similar reciente (evitar spam)
      if (groupKey) {
        const recentSimilar = await prisma.notification.findFirst({
          where: {
            userId,
            groupKey,
            createdAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000), // Últimos 5 minutos
            },
          },
        });

        if (recentSimilar) {
          console.log(`Duplicate notification avoided for user ${userId}, groupKey: ${groupKey}`);
          return recentSimilar;
        }
      }

      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          body,
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
        },
      });

      // En una implementación completa, aquí se enviarían las notificaciones
      // por otros canales (email, WhatsApp, push, etc.)
      await this.sendNotificationByChannel(notification, userSettings);

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Crear notificaciones masivas para múltiples usuarios
   */
  async createBulkNotifications(
    userIds: string[],
    notificationData: Omit<CreateNotificationParams, "userId">
  ) {
    const notifications = [];

    for (const userId of userIds) {
      try {
        const notification = await this.createNotification({
          ...notificationData,
          userId,
        });
        if (notification) {
          notifications.push(notification);
        }
      } catch (error) {
        console.error(`Error creating notification for user ${userId}:`, error);
      }
    }

    return notifications;
  }

  /**
   * Obtener configuraciones de notificación del usuario
   */
  async getUserSettings(userId: string): Promise<NotificationSettings> {
    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId },
    });

    // Valores por defecto si no existen configuraciones
    return (
      settings || {
        inAppNotifications: true,
        emailNotifications: true,
        whatsappNotifications: false,
        intensity: "NORMAL",
        quietHoursStart: undefined,
        quietHoursEnd: undefined,
        workdaysOnly: false,
        taskReminders: true,
        appointmentReminders: true,
        quoteUpdates: true,
        systemAlerts: true,
      }
    );
  }

  /**
   * Verificar si se debe enviar la notificación según configuraciones del usuario
   */
  private shouldSendNotification(type: NotificationType, settings: NotificationSettings): boolean {
    // Verificar por tipo de notificación
    switch (type) {
      case "TASK_ASSIGNED":
      case "TASK_COMPLETED":
      case "TASK_OVERDUE":
      case "TASK_STATUS_CHANGED":
        return settings.taskReminders;

      case "APPOINTMENT_REMINDER":
      case "APPOINTMENT_CONFIRMED":
      case "APPOINTMENT_CANCELLED":
      case "APPOINTMENT_RESCHEDULED":
        return settings.appointmentReminders;

      case "QUOTE_APPROVED":
      case "QUOTE_REJECTED":
      case "QUOTE_SENT":
        return settings.quoteUpdates;

      case "SYSTEM_MAINTENANCE":
      case "SYSTEM_ERROR":
        return settings.systemAlerts;

      default:
        return true; // Por defecto, enviar notificaciones de tipos no categorizados
    }
  }

  /**
   * Verificar si estamos en horario de silencio
   */
  private isInQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quietHoursStart || !settings.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = settings.quietHoursStart.split(":").map(Number);
    const [endHour, endMin] = settings.quietHoursEnd.split(":").map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Verificar si es solo días laborables
    if (settings.workdaysOnly) {
      const dayOfWeek = now.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Domingo = 0, Sábado = 6
        return false; // No aplicar horario de silencio en fines de semana
      }
    }

    // Caso normal: horario de silencio dentro del mismo día
    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    }

    // Caso especial: horario de silencio cruza medianoche
    return currentTime >= startTime || currentTime <= endTime;
  }

  /**
   * Enviar notificación por el canal correspondiente
   */
  private async sendNotificationByChannel(notification: any, settings: NotificationSettings) {
    // Por ahora solo manejo in-app, pero aquí se implementarían otros canales
    if (settings.emailNotifications && notification.channel === "EMAIL") {
      await this.sendEmailNotification(notification);
    }

    if (settings.whatsappNotifications && notification.channel === "WHATSAPP") {
      await this.sendWhatsAppNotification(notification);
    }

    // Las notificaciones in-app ya están guardadas en la base de datos
    console.log(`Notification created: ${notification.title} for user ${notification.userId}`);
  }

  /**
   * Enviar notificación por email (placeholder)
   */
  private async sendEmailNotification(notification: any) {
    // Implementar integración con servicio de email (SendGrid, Resend, etc.)
    console.log(`Email notification would be sent: ${notification.title}`);
  }

  /**
   * Enviar notificación por WhatsApp (placeholder)
   */
  private async sendWhatsAppNotification(notification: any) {
    // Implementar integración con WhatsApp Business API
    console.log(`WhatsApp notification would be sent: ${notification.title}`);
  }

  /**
   * Marcar notificaciones como leídas
   */
  async markAsRead(userId: string, notificationIds: string[] | "all") {
    const where: any = { userId };

    if (notificationIds === "all") {
      where.readAt = null;
    } else {
      where.id = { in: notificationIds };
    }

    const result = await prisma.notification.updateMany({
      where,
      data: {
        readAt: new Date(),
      },
    });

    return result;
  }

  /**
   * Obtener conteo de notificaciones no leídas
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  /**
   * Limpiar notificaciones antiguas (tarea de mantenimiento)
   */
  async cleanupOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        readAt: {
          not: null,
        },
      },
    });

    console.log(`Cleaned up ${result.count} old notifications`);
    return result;
  }
}

// Singleton pattern para el servicio de notificaciones
export const notificationService = new NotificationService();
