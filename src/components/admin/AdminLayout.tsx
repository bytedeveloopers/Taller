"use client";

import { BellIcon } from "@heroicons/react/24/outline";
import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";

type TabType =
  | "dashboard"
  | "citas"
  | "reportes"
  | "clientes"
  | "vehiculos"
  | "servicios"
  | "facturacion"
  | "configuracion";

type TipoNoti = "cita_nueva" | "servicio_completado" | "pago_pendiente" | "recordatorio";

interface Notification {
  id: string;
  tipo: TipoNoti;
  mensaje: string;
  tiempo: string;
  leida: boolean;
}

interface AdminLayoutProps {
  children: ReactNode;
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
  notifications?: Notification[];
  onMarkNotificationAsRead?: (id: string) => void;
}

export default function AdminLayout({
  children,
  selectedTab,
  onTabChange,
  notifications = [],
  onMarkNotificationAsRead,
}: AdminLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = (tab: TabType) => {
    const titles = {
      dashboard: "Panel Principal",
      citas: "Gestión de Citas",
      reportes: "Reportes y Estadísticas",
      clientes: "Gestión de Clientes",
      vehiculos: "Gestión de Vehículos",
      servicios: "Gestión de Servicios",
      facturacion: "Facturación y Pagos",
      configuracion: "Configuración del Sistema",
    };
    return titles[tab] || "Panel Principal";
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    if (onMarkNotificationAsRead) {
      onMarkNotificationAsRead(notificationId);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-900 text-white flex">
      {/* Sidebar */}
      <Sidebar selectedTab={selectedTab} onTabChange={onTabChange} />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <nav className="bg-secondary-800 border-b border-primary-400/20 shadow-sm sticky top-0 z-40">
          <div className="px-6">
            <div className="flex items-center justify-between h-16">
              {/* Page Title */}
              <h2 className="text-lg font-semibold text-white">{getPageTitle(selectedTab)}</h2>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications((s) => !s)}
                  className="relative p-2 rounded-md bg-secondary-700 hover:bg-primary-500 transition-colors"
                >
                  <BellIcon className="h-6 w-6 text-white" />
                  {notifications.filter((n) => !n.leida).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter((n) => !n.leida).length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-secondary-800 rounded-md shadow-lg ring-1 ring-primary-400/30 z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-3">Notificaciones</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-400">No hay notificaciones</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 rounded-md cursor-pointer transition-colors ${
                                n.leida ? "bg-secondary-700" : "bg-primary-800"
                              }`}
                              onClick={() => handleMarkNotificationAsRead(n.id)}
                            >
                              <p className="text-sm font-medium">{n.mensaje}</p>
                              <p className="text-xs text-gray-400 mt-1">{n.tiempo}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary-900">
          <div className="p-6 min-h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}

export type { Notification, TabType, TipoNoti };
