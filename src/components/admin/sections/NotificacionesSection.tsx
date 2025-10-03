"use client";

import { TestNotificationButton } from "@/components/notifications/TestNotificationButton";
import {
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  CogIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  InformationCircleIcon,
  TrashIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface Props {
  stats: any;
}

interface MockNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  readAt: Date | null;
  createdAt: Date;
  entityType?: string;
  entityId?: string;
}

const mockNotifications: MockNotification[] = [
  {
    id: "1",
    type: "TASK_ASSIGNED",
    title: "Nueva tarea asignada",
    body: 'Se ha asignado la tarea "Cambio de aceite Toyota Corolla" al técnico Juan Pérez',
    priority: "HIGH",
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    entityType: "TASK",
    entityId: "task-1",
  },
  {
    id: "2",
    type: "APPOINTMENT_REMINDER",
    title: "Recordatorio de cita",
    body: "Cita programada para las 2:00 PM - Cliente: María González",
    priority: "MEDIUM",
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    entityType: "APPOINTMENT",
    entityId: "appt-1",
  },
  {
    id: "3",
    type: "QUOTE_APPROVED",
    title: "¡Cotización aprobada!",
    body: "El cliente Carlos Ruiz ha aprobado la cotización #COT-2024-001 por $2,500.00",
    priority: "HIGH",
    readAt: new Date(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    entityType: "QUOTE",
    entityId: "quote-1",
  },
  {
    id: "4",
    type: "VEHICLE_STATUS_CHANGED",
    title: "Vehículo listo para entrega",
    body: "El vehículo Honda Civic (ABC-123) está listo para ser recogido por el cliente",
    priority: "MEDIUM",
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    entityType: "VEHICLE",
    entityId: "vehicle-1",
  },
  {
    id: "5",
    type: "SYSTEM_MAINTENANCE",
    title: "Mantenimiento del sistema",
    body: "El sistema estará en mantenimiento el próximo domingo de 2:00 AM a 4:00 AM",
    priority: "LOW",
    readAt: new Date(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    entityType: "SYSTEM",
    entityId: "maint-1",
  },
];

export default function NotificacionesSection({ stats }: Props) {
  const [notifications, setNotifications] = useState<MockNotification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "HIGH" | "MEDIUM" | "LOW">("all");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
      case "TASK_COMPLETED":
        return <CheckCircleIcon className="h-5 w-5" />;
      case "APPOINTMENT_REMINDER":
        return <CalendarIcon className="h-5 w-5" />;
      case "QUOTE_APPROVED":
      case "QUOTE_REJECTED":
        return <DocumentTextIcon className="h-5 w-5" />;
      case "VEHICLE_STATUS_CHANGED":
        return <TruckIcon className="h-5 w-5" />;
      case "SYSTEM_MAINTENANCE":
        return <CogIcon className="h-5 w-5" />;
      default:
        return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "border-red-500 bg-red-50 text-red-700";
      case "MEDIUM":
        return "border-yellow-500 bg-yellow-50 text-yellow-700";
      case "LOW":
        return "border-green-500 bg-green-50 text-green-700";
      default:
        return "border-gray-500 bg-gray-50 text-gray-700";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, readAt: new Date() } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, readAt: notif.readAt || new Date() }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "read" && !notif.readAt) return false;
    if (filter === "unread" && notif.readAt) return false;
    if (priorityFilter !== "all" && notif.priority !== priorityFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-white">{notifications.length}</p>
            </div>
            <BellIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Sin Leer</p>
              <p className="text-3xl font-bold text-red-400">{unreadCount}</p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Alta Prioridad</p>
              <p className="text-3xl font-bold text-orange-400">
                {notifications.filter((n) => n.priority === "HIGH").length}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-orange-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Hoy</p>
              <p className="text-3xl font-bold text-green-400">
                {
                  notifications.filter(
                    (n) => new Date(n.createdAt).toDateString() === new Date().toDateString()
                  ).length
                }
              </p>
            </div>
            <CalendarIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filtros y acciones */}
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-secondary-700 text-gray-300 hover:text-white"
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "unread"
                  ? "bg-red-600 text-white"
                  : "bg-secondary-700 text-gray-300 hover:text-white"
              }`}
            >
              Sin leer ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "read"
                  ? "bg-green-600 text-white"
                  : "bg-secondary-700 text-gray-300 hover:text-white"
              }`}
            >
              Leídas ({notifications.length - unreadCount})
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-secondary-700 text-white px-3 py-2 rounded-lg text-sm border border-secondary-600"
            >
              <option value="all">Todas las prioridades</option>
              <option value="HIGH">Alta prioridad</option>
              <option value="MEDIUM">Prioridad media</option>
              <option value="LOW">Baja prioridad</option>
            </select>

            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Marcar todas como leídas
            </button>
          </div>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="bg-secondary-800 rounded-xl border border-secondary-700">
        <div className="p-6 border-b border-secondary-700">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <BellIcon className="h-6 w-6 mr-2 text-primary-400" />
            Notificaciones ({filteredNotifications.length})
          </h3>
        </div>

        <div className="divide-y divide-secondary-700">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No hay notificaciones con los filtros seleccionados</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-secondary-700 transition-colors ${
                  !notification.readAt ? "bg-secondary-750" : ""
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`flex-shrink-0 p-2 rounded-lg ${getPriorityColor(
                      notification.priority
                    )}`}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4
                          className={`text-sm font-medium ${
                            !notification.readAt ? "text-white" : "text-gray-300"
                          }`}
                        >
                          {notification.title}
                          {!notification.readAt && (
                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">{notification.body}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {notification.createdAt.toLocaleString("es-ES")}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              notification.priority === "HIGH"
                                ? "bg-red-100 text-red-800"
                                : notification.priority === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {notification.priority === "HIGH"
                              ? "Alta"
                              : notification.priority === "MEDIUM"
                              ? "Media"
                              : "Baja"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.readAt && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-blue-400 rounded"
                            title="Marcar como leída"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-400 rounded"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sección de pruebas */}
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <h3 className="text-lg font-semibold text-white mb-4">Herramientas de Desarrollo</h3>
        <TestNotificationButton />
      </div>
    </div>
  );
}
