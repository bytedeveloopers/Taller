"use client";

import { BellIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";

interface NotificationBellProps {
  userId: string;
  className?: string;
}

export function NotificationBell({ userId, className = "" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount] = useState(3); // Mock data temporalmente
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={handleToggle}
        className={`relative p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors ${className}`}
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="h-6 w-6 text-blue-400" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-50"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Notificaciones</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <p className="text-gray-300 text-sm mb-3">Sistema de notificaciones activo</p>
            <div className="space-y-2">
              <div className="bg-gray-700 p-3 rounded-lg border-l-4 border-blue-500">
                <p className="text-white text-sm font-medium">🔧 Sistema activado</p>
                <p className="text-gray-400 text-xs">
                  El sistema de notificaciones está funcionando correctamente
                </p>
                <p className="text-gray-500 text-xs mt-1">hace 5 minutos</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg border-l-4 border-green-500">
                <p className="text-white text-sm font-medium">✅ Base de datos conectada</p>
                <p className="text-gray-400 text-xs">Todas las tablas de notificaciones creadas</p>
                <p className="text-gray-500 text-xs mt-1">hace 10 minutos</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg border-l-4 border-yellow-500">
                <p className="text-white text-sm font-medium">🚀 API disponible</p>
                <p className="text-gray-400 text-xs">
                  Endpoints de notificaciones listos para usar
                </p>
                <p className="text-gray-500 text-xs mt-1">hace 15 minutos</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-600">
              <button className="w-full text-center text-blue-400 hover:text-blue-300 text-xs">
                Ver todas las notificaciones
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
