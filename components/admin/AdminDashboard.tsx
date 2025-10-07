"use client";

import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  HomeIcon,
  TruckIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Importar componentes de cada sección
import DashboardOverview from "./DashboardOverview";
import AuditoriaSection from "./sections/AuditoriaSection";
import CalendarioSection from "./sections/CalendarioSection";
import ClientesSection from "./sections/ClientesSection";
import ConfiguracionSection from "./sections/ConfiguracionSection";
import CotizacionesSection from "./sections/CotizacionesSection";
import NotificacionesSection from "./sections/NotificacionesSection";
import OrdenesTrabajoSection from "./sections/OrdenesTrabajoSection";
import RecepcionSection from "./sections/RecepcionSection";
import ReportesSection from "./sections/ReportesSection";
import TecnicosSection from "./sections/TecnicosSection";
import VehiculosSection from "./sections/VehiculosSection";

// Definir las secciones del menú según la nueva estructura
const menuSections = [
  {
    id: "resumen",
    name: "Resumen & KPIs",
    icon: HomeIcon,
    component: DashboardOverview,
    description: "Diario/semana/mes, SLA por etapa",
  },
  {
    id: "recepcion",
    name: "Recepción",
    icon: ClipboardDocumentListIcon,
    component: RecepcionSection,
    description: "Validación check-ins, QR, evidencias",
  },
  {
    id: "clientes",
    name: "Clientes",
    icon: UserGroupIcon,
    component: ClientesSection,
    description: "Alta/edición, fusiones, historial",
  },
  {
    id: "vehiculos",
    name: "Vehículos",
    icon: TruckIcon,
    component: VehiculosSection,
    description: "Ficha técnica, historial/evidencias",
  },
  {
    id: "tecnicos",
    name: "Técnicos",
    icon: UserIcon,
    component: TecnicosSection,
    description: "Asignaciones, carga, desempeño",
  },
  {
    id: "ordenes",
    name: "Órdenes de Trabajo",
    icon: DocumentTextIcon,
    component: OrdenesTrabajoSection,
    description: "Flujo completo, tiempos, SLA",
  },
  {
    id: "cotizaciones",
    name: "Cotizaciones",
    icon: CurrencyDollarIcon,
    component: CotizacionesSection,
    description: "Borradores, aprobación, envío",
  },
  {
    id: "calendario",
    name: "Agenda/Calendario",
    icon: CalendarDaysIcon,
    component: CalendarioSection,
    description: "Citas, capacidad por técnico",
  },
  {
    id: "reportes",
    name: "Reportes",
    icon: ChartBarIcon,
    component: ReportesSection,
    description: "Productividad, tiempos, eficiencia",
  },
  {
    id: "notificaciones",
    name: "Notificaciones & Alertas",
    icon: BellIcon,
    component: NotificacionesSection,
    description: "Check-ins, retrasos, trabajos en espera",
  },
  {
    id: "auditoria",
    name: "Auditoría",
    icon: DocumentDuplicateIcon,
    component: AuditoriaSection,
    description: "Bitácora, versiones de registros",
  },
  {
    id: "configuracion",
    name: "Configuración",
    icon: CogIcon,
    component: ConfiguracionSection,
    description: "Taller, usuarios, RBAC, retención",
  },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("resumen");
  const { stats, loading, error } = useDashboardStats();
  const router = useRouter();

  const handleLogout = () => {
    // Limpiar datos de sesión si existieran
    // localStorage.removeItem('token'); // Ejemplo si se usa localStorage
    // sessionStorage.clear(); // Ejemplo si se usa sessionStorage

    // Redireccionar al login
    router.push("/admin");
  };

  // Encontrar la sección activa
  const currentSection = menuSections.find((section) => section.id === activeSection);
  const CurrentComponent = currentSection?.component || DashboardOverview;

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Cargando Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-white text-lg">Error al cargar el dashboard</p>
          <p className="text-gray-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-secondary-900 flex overflow-hidden">
      {/* Sidebar Fijo - Altura completa de pantalla */}
      <div className="w-80 bg-secondary-800 border-r border-secondary-700 flex flex-col h-full">
        {/* Header del Sidebar - Fijo */}
        <div className="p-6 border-b border-secondary-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Dashboard ADMIN</h2>
            <p className="text-sm text-gray-400">Sistema de Gestión del Taller</p>
          </div>
        </div>

        {/* Navegación - Con scroll independiente */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          {menuSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-primary-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-secondary-700 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 mr-3 transition-colors flex-shrink-0" />
                <div className="text-left flex-1">
                  <p className="font-medium text-sm">{section.name}</p>
                  <p className="text-xs opacity-75 mt-0.5">{section.description}</p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer del Sidebar - Fijo */}
        <div className="p-4 border-t border-secondary-700 flex-shrink-0 space-y-3">
          {/* Botón de Cerrar Sesión */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg bg-red-600/10 border border-red-600/30 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200 group"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 transition-colors flex-shrink-0" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>

          {/* Info del Sistema */}
          <div className="bg-secondary-700/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Sistema Online</span>
            </div>
            <p className="text-xs text-gray-400">
              Versión 2.0.0 • {new Date().toLocaleDateString("es-GT")}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Principal - Scroll independiente */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header de la sección activa - Fijo */}
        <div className="bg-secondary-800 border-b border-secondary-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentSection && (
                <>
                  <div className="p-2 bg-primary-600 rounded-lg">
                    <currentSection.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{currentSection.name}</h1>
                    <p className="text-gray-400">{currentSection.description}</p>
                  </div>
                </>
              )}
            </div>

            {/* Notificaciones e Indicadores de estado */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="flex items-center">
                <NotificationBell userId="demo-admin-user" className="mr-2" />
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-400">Última actualización</p>
                <p className="text-white font-medium">{new Date().toLocaleTimeString("es-GT")}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">En Línea</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la sección - Con scroll independiente */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-6">
            <CurrentComponent
              stats={
                stats || {
                  totalCitas: 0,
                  citasPendientes: 0,
                  citasCompletadas: 0,
                  citasEnProceso: 0,
                  citasHoy: 0,
                  citasEstaSemana: 0,
                  totalClientes: 0,
                  totalVehiculos: 0,
                  vehiculosActivos: 0,
                  proximoMantenimiento: 0,
                  enTaller: 0,
                  totalCotizaciones: 0,
                  cotizacionesAprobadas: 0,
                  ingresos: { total: 0, pendiente: 0 },
                  recentAppointments: [],
                  tasaCompletado: 0,
                  satisfaccionCliente: 0,
                  // Propiedades adicionales para OrdenesTrabajoSection
                  total: 0,
                  recibidos: 0,
                  enProceso: 0,
                  esperandoRepuestos: 0,
                  completados: 0,
                  entregados: 0,
                }
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
