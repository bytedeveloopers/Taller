"use client";

import { AuditEvent } from "@/services/MockAuditService";
import {
  ArrowRightIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface Props {
  entityType: string;
  entityId: string;
  entityName?: string;
  className?: string;
}

export const AuditTimeline = ({ entityType, entityId, entityName, className = "" }: Props) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchEntityEvents();
  }, [entityType, entityId]);

  const fetchEntityEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/audit/entity/${entityType}/${entityId}?page=${page}&limit=20`
      );
      const data = await response.json();

      if (data.events) {
        setEvents(data.events);
        setHasMore(data.hasNextPage);
      }
    } catch (error) {
      console.error("Error fetching entity audit events:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    try {
      const response = await fetch(
        `/api/audit/entity/${entityType}/${entityId}?page=${page + 1}&limit=20`
      );
      const data = await response.json();

      if (data.events) {
        setEvents((prev) => [...prev, ...data.events]);
        setHasMore(data.hasNextPage);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading more events:", error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "update":
        return <DocumentTextIcon className="h-4 w-4 text-blue-500" />;
      case "delete":
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case "status_change":
        return <ArrowRightIcon className="h-4 w-4 text-yellow-500" />;
      case "assign":
        return <UserIcon className="h-4 w-4 text-purple-500" />;
      case "merge":
        return <UserGroupIcon className="h-4 w-4 text-indigo-500" />;
      case "pause":
        return <ClockIcon className="h-4 w-4 text-orange-500" />;
      case "resume":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "approve":
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case "reject":
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      case "upload":
        return <CameraIcon className="h-4 w-4 text-blue-600" />;
      case "reprogram":
        return <CalendarIcon className="h-4 w-4 text-purple-600" />;
      default:
        return <CogIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Hace un momento";
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;

    return date.toLocaleDateString("es-MX");
  };

  if (loading) {
    return (
      <div className={`bg-secondary-700 rounded-lg border border-secondary-600 p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <ShieldCheckIcon className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Historial de Auditoría</h3>
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-400 mt-2 text-sm">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`bg-secondary-700 rounded-lg border border-secondary-600 p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <ShieldCheckIcon className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Historial de Auditoría</h3>
        </div>
        <div className="text-center py-4">
          <ShieldCheckIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No hay eventos de auditoría registrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-secondary-700 rounded-lg border border-secondary-600 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Historial de Auditoría</h3>
        </div>
        <div className="text-sm text-gray-400">
          {events.length} evento{events.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="relative">
            {/* Línea de tiempo */}
            {index < events.length - 1 && (
              <div className="absolute left-4 top-8 bottom-0 w-px bg-secondary-600"></div>
            )}

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 bg-secondary-800 rounded-full p-2 border border-secondary-600">
                {getActionIcon(event.action)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium text-sm">{event.summary}</p>
                  <span className="text-gray-400 text-xs">
                    {formatRelativeTime(event.createdAt)}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                  <span>{event.actorName}</span>
                  <span>•</span>
                  <span>{event.createdAt.toLocaleString("es-MX")}</span>
                  {event.meta?.ip && (
                    <>
                      <span>•</span>
                      <span>IP: {event.meta.ip as string}</span>
                    </>
                  )}
                </div>

                {/* Mostrar diff si existe */}
                {event.diff && Object.keys(event.diff).length > 0 && (
                  <div className="mt-2 bg-secondary-800 rounded p-2 border border-secondary-600">
                    <div className="text-xs text-gray-300">
                      {Object.entries(event.diff).map(([field, change]) => (
                        <div key={field} className="mb-1 last:mb-0">
                          <span className="font-medium">{field}:</span>
                          <span className="text-red-400 ml-2">"{String(change.from)}"</span>
                          <span className="text-gray-500 mx-1">→</span>
                          <span className="text-green-400">"{String(change.to)}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Botón para cargar más */}
        {hasMore && (
          <div className="text-center pt-4">
            <button
              onClick={loadMore}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
            >
              Cargar más eventos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
