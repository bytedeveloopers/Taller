"use client";

import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  UserPlusIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ToastNotification {
  id: string;
  tipo: "success" | "error" | "warning" | "info";
  mensaje: string;
  timestamp: Date;
}

interface TecnicoLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    id: "inicio",
    name: "Inicio",
    href: "/tecnico/dashboard",
    icon: HomeIcon,
    description: "Resumen del día",
    badge: null,
  },
  {
    id: "ordenes",
    name: "Mis Órdenes",
    href: "/tecnico/ordenes",
    icon: ClipboardDocumentListIcon,
    description: "Kanban y lista",
    badge: null,
  },
  {
    id: "recepcion",
    name: "Recepción",
    href: "/tecnico/recepcion",
    icon: UserPlusIcon,
    description: "Check-in rápido (fotos 360 + firma)",
    badge: null,
  },
  {
    id: "diagnostico",
    name: "Diagnóstico",
    href: "/tecnico/diagnostico",
    icon: WrenchScrewdriverIcon,
    description: "Checklist y notas",
    badge: null,
  },
  {
    id: "metricas",
    name: "Mis Métricas",
    href: "/tecnico/metricas",
    icon: ChartBarIcon,
    description: "Tiempos, cumplimiento, retrabajos",
    badge: null,
  },
  {
    id: "agenda",
    name: "Agenda",
    href: "/tecnico/agenda",
    icon: CalendarDaysIcon,
    description: "Citas/slots en lectura",
    badge: null,
  },
];

export default function TecnicoLayout({ children }: TecnicoLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [alertasSinLeer, setAlertasSinLeer] = useState(0);
  const [userInfo, setUserInfo] = useState({
    nombre: "Técnico Demo",
    especialidad: "Motor y transmisión",
    turno: "8:00 AM - 5:00 PM",
  });

  // Guard de rol - verificar que es técnico
  useEffect(() => {
    // TODO: Implementar verificación real de JWT/sesión
    const userRole = "TECHNICIAN"; // Simular desde token/localStorage

    if (userRole !== "TECHNICIAN") {
      router.push("/admin");
      return;
    }
  }, [router]);

  // Polling de alertas y notificaciones
  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        // TODO: Implementar llamada real a API
        const response = await fetch("/api/notificaciones?user=me");
        if (response.ok) {
          const data = await response.json();
          setAlertasSinLeer(data.sinLeer || 0);
        }
      } catch (error) {
        console.error("Error fetching alertas:", error);
      }
    };

    fetchAlertas();
    const interval = setInterval(fetchAlertas, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    // Limpiar datos de sesión
    localStorage.removeItem("userToken");
    sessionStorage.clear();

    // Redireccionar al login
    router.push("/admin");
  };

  const addToast = (tipo: ToastNotification["tipo"], mensaje: string) => {
    const newToast: ToastNotification = {
      id: Date.now().toString(),
      tipo,
      mensaje,
      timestamp: new Date(),
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      removeToast(newToast.id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getToastColor = (tipo: ToastNotification["tipo"]) => {
    switch (tipo) {
      case "success":
        return "bg-green-600 border-green-500";
      case "error":
        return "bg-red-600 border-red-500";
      case "warning":
        return "bg-yellow-600 border-yellow-500";
      case "info":
        return "bg-blue-600 border-blue-500";
      default:
        return "bg-gray-600 border-gray-500";
    }
  };

  const isActive = (href: string) => {
    if (href === "/tecnico/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="h-screen bg-secondary-900 flex overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-secondary-800 border-r border-secondary-700">
          {/* Header del Sidebar */}
          <div className="p-6 border-b border-secondary-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Panel Técnico</h2>
                <p className="text-sm text-gray-400">{userInfo.nombre}</p>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                    active
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-secondary-700 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3 transition-colors flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs opacity-75 mt-0.5">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer del Sidebar */}
          <div className="p-4 border-t border-secondary-700 space-y-3">
            {/* Info del técnico */}
            <div className="bg-secondary-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Disponible</span>
              </div>
              <p className="text-xs text-gray-400">{userInfo.especialidad}</p>
              <p className="text-xs text-gray-400">{userInfo.turno}</p>
            </div>

            {/* Botón de cerrar sesión */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 rounded-lg bg-red-600/10 border border-red-600/30 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Mobile */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed left-0 top-0 h-full w-80 bg-secondary-800 border-r border-secondary-700">
          {/* Contenido del sidebar móvil (mismo que desktop) */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Panel Técnico</h2>
                <p className="text-sm text-gray-400">{userInfo.nombre}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-secondary-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navegación móvil */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-secondary-700 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs opacity-75 mt-0.5">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header móvil */}
        <div className="lg:hidden bg-secondary-800 border-b border-secondary-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-secondary-700"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              {/* Notificaciones */}
              <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-secondary-700">
                <BellIcon className="h-5 w-5" />
                {alertasSinLeer > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {alertasSinLeer}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-600/10"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Área de contenido */}
        <main className="flex-1 overflow-auto bg-secondary-900 min-h-screen">{children}</main>
      </div>

      {/* Sistema de Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-full border rounded-lg p-4 shadow-lg ${getToastColor(
              toast.tipo
            )} transform transition-all duration-300 ease-in-out`}
          >
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{toast.mensaje}</p>
                <p className="text-xs text-gray-300 mt-1">{toast.timestamp.toLocaleTimeString()}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-white hover:text-gray-300"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook para usar el sistema de toasts desde componentes hijos
export const useToast = () => {
  // Este hook se implementaría con un contexto React
  // Por simplicidad, exportamos función placeholder
  return {
    addToast: (tipo: "success" | "error" | "warning" | "info", mensaje: string) => {
      console.log(`Toast: ${tipo} - ${mensaje}`);
    },
  };
};
