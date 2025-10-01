"use client";

import { useState } from "react";

type TipoNoti = "cita_nueva" | "servicio_completado" | "pago_pendiente" | "recordatorio";

interface Notification {
  id: string;
  tipo: TipoNoti;
  mensaje: string;
  tiempo: string;
  leida: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "n1",
      tipo: "cita_nueva",
      mensaje: "Nueva cita agendada para mañana - Honda Accord",
      tiempo: "hace 5 minutos",
      leida: false,
    },
    {
      id: "n2",
      tipo: "servicio_completado",
      mensaje: "Servicio completado: Mantenimiento BMW X3",
      tiempo: "hace 1 hora",
      leida: false,
    },
    {
      id: "n3",
      tipo: "pago_pendiente",
      mensaje: "Pago pendiente: Juan Pérez - Q850",
      tiempo: "hace 2 horas",
      leida: true,
    },
  ]);

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, leida: true } : n))
    );
  };

  const addNotification = (notification: Omit<Notification, "id">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const removeNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const getUnreadCount = () => notifications.filter((n) => !n.leida).length;

  return {
    notifications,
    markNotificationAsRead,
    addNotification,
    removeNotification,
    getUnreadCount,
  };
}

export type { Notification, TipoNoti };
