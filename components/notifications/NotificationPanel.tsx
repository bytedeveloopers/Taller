"use client";

import { Notification, useNotifications } from "@/hooks/useNotifications";
import {
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";

interface NotificationPanelProps {
  userId: string;
  onClose: () => void;
  onMarkAsRead: (notificationIds: string[] | "all") => Promise<void>;
  onDelete: (notificationId: string) => Promise<void>;
}

export function NotificationPanel({
  userId,
  onClose,
  onMarkAsRead,
  onDelete,
}: NotificationPanelProps) {
  const { notifications, loading, fetchNotifications } = useNotifications(userId);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    fetchNotifications({ limit: 20 });
  }, [fetchNotifications]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 bg-red-50";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50";
      case "LOW":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
      case "TASK_COMPLETED":
      case "TASK_OVERDUE":
      case "TASK_STATUS_CHANGED":
        return <CheckCircleIcon className="h-5 w-5" />;
      case "APPOINTMENT_REMINDER":
      case "APPOINTMENT_CONFIRMED":
      case "APPOINTMENT_CANCELLED":
      case "APPOINTMENT_RESCHEDULED":
        return <CalendarIcon className="h-5 w-5" />;
      case "QUOTE_APPROVED":
      case "QUOTE_REJECTED":
      case "QUOTE_SENT":
        return <DocumentTextIcon className="h-5 w-5" />;
      case "SYSTEM_MAINTENANCE":
      case "SYSTEM_ERROR":
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case "GENERAL":
        return <InformationCircleIcon className="h-5 w-5" />;
      default:
        return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  const handleSelectNotification = (notificationId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedNotifications((prev) => [...prev, notificationId]);
    } else {
      setSelectedNotifications((prev) => prev.filter((id) => id !== notificationId));
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    await onMarkAsRead(selectedNotifications);
    setSelectedNotifications([]);
  };

  const handleMarkAllAsRead = async () => {
    await onMarkAsRead("all");
    setSelectedNotifications([]);
  };

  const unreadNotifications = notifications.filter((n) => !n.readAt);

  return (
    <div className="max-h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
          {unreadNotifications.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
              {unreadNotifications.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-2">
            {selectedNotifications.length > 0 && (
              <button
                onClick={handleMarkSelectedAsRead}
                className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded"
              >
                <CheckIcon className="h-4 w-4" />
                <span>Marcar leídas ({selectedNotifications.length})</span>
              </button>
            )}
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-medium text-gray-600 hover:text-gray-800"
            disabled={unreadNotifications.length === 0}
          >
            Marcar todas como leídas
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <UserIcon className="h-12 w-12 mb-2 text-gray-300" />
            <p className="text-sm">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isSelected={selectedNotifications.includes(notification.id)}
                onSelect={handleSelectNotification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                getTypeIcon={getTypeIcon}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-center p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              // En una implementación completa, esto abriría la página completa de notificaciones
              console.log("Ver todas las notificaciones");
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (notificationId: string, isSelected: boolean) => void;
  onMarkAsRead: (notificationIds: string[]) => Promise<void>;
  onDelete: (notificationId: string) => Promise<void>;
  getTypeIcon: (type: string) => JSX.Element;
  getPriorityColor: (priority: string) => string;
}

function NotificationItem({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onDelete,
  getTypeIcon,
  getPriorityColor,
}: NotificationItemProps) {
  const [showActions, setShowActions] = useState(false);

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onMarkAsRead([notification.id]);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onDelete(notification.id);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(notification.id, !isSelected);
  };

  return (
    <div
      className={`relative p-3 hover:bg-gray-50 transition-colors ${
        !notification.readAt ? "bg-blue-50" : ""
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Selection checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />

        {/* Icon */}
        <div className={`flex-shrink-0 p-1 rounded ${getPriorityColor(notification.priority)}`}>
          {getTypeIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  !notification.readAt ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {notification.title}
              </p>
              <p
                className={`text-sm mt-1 ${
                  !notification.readAt ? "text-gray-700" : "text-gray-500"
                }`}
              >
                {notification.body}
              </p>

              {/* Related entity info */}
              {(notification.task ||
                notification.quote ||
                notification.appointment ||
                notification.customer ||
                notification.vehicle) && (
                <div className="mt-2 text-xs text-gray-500">
                  {notification.task && <span>Tarea: {notification.task.title}</span>}
                  {notification.quote && <span>Cotización: {notification.quote.quoteNumber}</span>}
                  {notification.appointment && <span>Cita: {notification.appointment.title}</span>}
                  {notification.customer && <span>Cliente: {notification.customer.name}</span>}
                  {notification.vehicle && (
                    <span>
                      Vehículo: {notification.vehicle.brand} {notification.vehicle.model}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2 mt-2">
                <ClockIcon className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
                {!notification.readAt && <span className="h-2 w-2 bg-blue-500 rounded-full"></span>}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-1 ml-2">
                {!notification.readAt && (
                  <button
                    onClick={handleMarkAsRead}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    title="Marcar como leída"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Eliminar"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
