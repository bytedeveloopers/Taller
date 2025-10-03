"use client";

import { NotificationPriority, NotificationType } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  task?: {
    id: string;
    title: string;
    status: string;
  };
  quote?: {
    id: string;
    quoteNumber: string;
    status: string;
  };
  appointment?: {
    id: string;
    title: string;
    scheduledAt: Date;
    status: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  vehicle?: {
    id: string;
    trackingCode: string;
    brand: string;
    model: string;
    year: number;
  };
}

export interface NotificationSettings {
  inAppNotifications: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  intensity: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  workdaysOnly: boolean;
  taskReminders: boolean;
  appointmentReminders: boolean;
  quoteUpdates: boolean;
  systemAlerts: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  settings: NotificationSettings | null;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationIds: string[] | "all") => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

interface NotificationFilters {
  read?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}

export function useNotifications(userId: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  // Obtener notificaciones con filtros
  const fetchNotifications = useCallback(
    async (filters: NotificationFilters = {}) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          userId,
          ...Object.fromEntries(
            Object.entries(filters).map(([key, value]) => [key, String(value)])
          ),
        });

        const response = await fetch(`/api/notifications?${params}`);

        if (!response.ok) {
          throw new Error("Error al cargar notificaciones");
        }

        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Marcar notificaciones como leídas
  const markAsRead = useCallback(
    async (notificationIds: string[] | "all") => {
      if (!userId) return;

      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            notificationIds: notificationIds === "all" ? undefined : notificationIds,
            markAllAsRead: notificationIds === "all",
          }),
        });

        if (!response.ok) {
          throw new Error("Error al marcar como leído");
        }

        // Actualizar estado local
        if (notificationIds === "all") {
          setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
          setUnreadCount(0);
        } else {
          setNotifications((prev) =>
            prev.map((n) => (notificationIds.includes(n.id) ? { ...n, readAt: new Date() } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error marking notifications as read:", err);
      }
    },
    [userId]
  );

  // Eliminar notificación
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/notifications/${notificationId}?userId=${userId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Error al eliminar notificación");
        }

        // Actualizar estado local
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Si la notificación no estaba leída, decrementar contador
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.readAt) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error deleting notification:", err);
      }
    },
    [userId, notifications]
  );

  // Actualizar configuraciones
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      if (!userId) return;

      try {
        const response = await fetch("/api/notifications/settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            ...newSettings,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar configuraciones");
        }

        const updatedSettings = await response.json();
        setSettings(updatedSettings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error updating notification settings:", err);
      }
    },
    [userId]
  );

  // Refrescar contador de no leídas
  const refreshUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/notifications?userId=${userId}&limit=1`);

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Error refreshing unread count:", err);
    }
  }, [userId]);

  // Cargar configuraciones al montar
  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/notifications/settings?userId=${userId}`);

        if (response.ok) {
          const settingsData = await response.json();
          setSettings(settingsData);
        }
      } catch (err) {
        console.error("Error loading notification settings:", err);
      }
    };

    loadSettings();
  }, [userId]);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Polling para notificaciones en tiempo real (opcional)
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [userId, refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    settings,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    updateSettings,
    refreshUnreadCount,
  };
}
