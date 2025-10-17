"use client";

import { useToast } from "@/components/ui/ToastNotification";
import { ReportFilters, ReportType } from "@/types";
import {
  CalendarIcon,
  CameraIcon,
  ChartBarIcon,
  ClockIcon,
  Cog8ToothIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  TruckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

// Componentes de reportes específicos
import AgendaCumplimiento from "../reportes/AgendaCumplimiento";
import ClientesRetencion from "../reportes/ClientesRetencion";
import CotizacionesEmbudo from "../reportes/CotizacionesEmbudo";
import EvidenciasAuditoria from "../reportes/EvidenciasAuditoria";
import OperacionDiaria from "../reportes/OperacionDiaria";
import ProductividadTecnicos from "../reportes/ProductividadTecnicos";
import TiemposSLA from "../reportes/TiemposSLA";
import Vehiculos from "../reportes/Vehiculos";

// Configuración de reportes disponibles
const REPORT_CONFIG = {
  "operacion-diaria": {
    title: "Operación Diaria",
    description: "Ingresos, OTs activas, finalizadas y SLA",
    icon: ChartBarIcon,
    color: "blue",
    component: OperacionDiaria,
  },
  "tiempos-sla": {
    title: "Tiempos & SLA",
    description: "TAT por etapa y cumplimiento de plazos",
    icon: ClockIcon,
    color: "green",
    component: TiemposSLA,
  },
  "cotizaciones-embudo": {
    title: "Cotizaciones (Embudo)",
    description: "Conversiones, aprobación y montos",
    icon: CurrencyDollarIcon,
    color: "yellow",
    component: CotizacionesEmbudo,
  },
  "productividad-tecnicos": {
    title: "Productividad Técnicos",
    description: "OTs finalizadas, on-time y carga",
    icon: UserGroupIcon,
    color: "purple",
    component: ProductividadTecnicos,
  },
  "clientes-retencion": {
    title: "Clientes & Retención",
    description: "Nuevos, recurrentes y frecuencia",
    icon: UserGroupIcon,
    color: "indigo",
    component: ClientesRetencion,
  },
  vehiculos: {
    title: "Vehículos",
    description: "Distribución, historial y revisiones",
    icon: TruckIcon,
    color: "gray",
    component: Vehiculos,
  },
  "agenda-cumplimiento": {
    title: "Agenda & Cumplimiento",
    description: "Citas, reprogramaciones y bloqueos",
    icon: CalendarIcon,
    color: "orange",
    component: AgendaCumplimiento,
  },
  "evidencias-auditoria": {
    title: "Evidencias & Auditoría",
    description: "Fotos por OT y acciones críticas",
    icon: CameraIcon,
    color: "red",
    component: EvidenciasAuditoria,
  },
} as const;

interface ReportesSectionProps {
  stats?: any;
}

const ReportesSection: React.FC<ReportesSectionProps> = ({ stats }) => {
  const { showSuccess, showError } = useToast();

  // Estado principal
  const [activeReport, setActiveReport] = useState<ReportType>("operacion-diaria");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filtros globales
  const [globalFilters, setGlobalFilters] = useState<ReportFilters>({
    preset: "today",
    dateFrom: new Date().toISOString().split("T")[0],
    dateTo: new Date().toISOString().split("T")[0],
  });

  // Datos de técnicos, clientes y vehículos para filtros
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Cargar datos para filtros
  useEffect(() => {
    loadFilterData();
  }, []);

  const loadFilterData = async () => {
    try {
      const [techResponse, customerResponse, vehicleResponse] = await Promise.all([
        fetch("/api/tecnicos"),
        fetch("/api/clients"),
        fetch("/api/vehiculos?active=true"),
      ]);

      if (techResponse.ok) {
        const techData = await techResponse.json();
        setTechnicians(techData.data || []);
      }

      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        setCustomers(customerData.data || []);
      }

      if (vehicleResponse.ok) {
        const vehicleData = await vehicleResponse.json();
        setVehicles(vehicleData.data || []);
      }
    } catch (error) {
      console.error("Error loading filter data:", error);
    }
  };

  // Manejar cambio de preset de fecha
  const handlePresetChange = (preset: "today" | "week" | "month" | "custom") => {
    const today = new Date();
    let dateFrom = today.toISOString().split("T")[0];
    let dateTo = today.toISOString().split("T")[0];

    switch (preset) {
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        dateFrom = weekAgo.toISOString().split("T")[0];
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        dateFrom = monthAgo.toISOString().split("T")[0];
        break;
    }

    setGlobalFilters({
      ...globalFilters,
      preset,
      dateFrom,
      dateTo,
    });
  };

  // Manejar drill-down navigation
  const handleDrillDown = (context: any) => {
    const { type, id, title } = context;

    // Mostrar toast con información
    showSuccess(`Navegando a: ${title}`, `Tipo: ${type}, ID: ${id}`);

    // Aquí puedes implementar la navegación real
    // Por ejemplo, redirigir a la página de detalles de la entidad
    switch (type) {
      case "workOrder":
        // router.push(`/admin/ordenes/${id}`);
        console.log(`Navegar a OT: ${id}`);
        break;
      case "customer":
        // router.push(`/admin/clientes/${id}`);
        console.log(`Navegar a Cliente: ${id}`);
        break;
      case "vehicle":
        // router.push(`/admin/vehiculos/${id}`);
        console.log(`Navegar a Vehículo: ${id}`);
        break;
      case "technician":
        // router.push(`/admin/tecnicos/${id}`);
        console.log(`Navegar a Técnico: ${id}`);
        break;
      case "quote":
        // router.push(`/admin/cotizaciones/${id}`);
        console.log(`Navegar a Cotización: ${id}`);
        break;
      case "appointment":
        // router.push(`/admin/citas/${id}`);
        console.log(`Navegar a Cita: ${id}`);
        break;
      default:
        console.log(`Drill-down no implementado para tipo: ${type}`);
    }
  };

  // Renderizar el componente del reporte activo
  const renderActiveReport = () => {
    const config = REPORT_CONFIG[activeReport];
    if (!config) return null;

    const Component = config.component;
    return <Component filters={globalFilters} onDrillDown={handleDrillDown} />;
  };

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Reportes Operativos</h1>
            <p className="text-gray-400 mt-1">Análisis y métricas del taller en tiempo real</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters
                  ? "bg-primary-500 text-white"
                  : "bg-secondary-700 text-gray-400 hover:text-white"
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>

            <button className="p-2 bg-secondary-700 text-gray-400 hover:text-white rounded-lg transition-colors">
              <Cog8ToothIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navegación de reportes */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.entries(REPORT_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeReport === key;

            return (
              <button
                key={key}
                onClick={() => setActiveReport(key as ReportType)}
                className={`p-3 rounded-lg border transition-all ${
                  isActive
                    ? "border-primary-500 bg-primary-500/10 text-primary-400"
                    : "border-secondary-600 hover:border-secondary-500 text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <div className="text-xs font-medium text-center">{config.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Filtros Globales</h3>
            <button
              onClick={() =>
                setGlobalFilters({
                  preset: "today",
                  dateFrom: new Date().toISOString().split("T")[0],
                  dateTo: new Date().toISOString().split("T")[0],
                })
              }
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Preset de fechas */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Período</label>
              <select
                value={globalFilters.preset || "today"}
                onChange={(e) => handlePresetChange(e.target.value as any)}
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            {/* Rango personalizado */}
            {globalFilters.preset === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Fecha desde</label>
                  <input
                    type="date"
                    value={globalFilters.dateFrom || ""}
                    onChange={(e) =>
                      setGlobalFilters({ ...globalFilters, dateFrom: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Fecha hasta</label>
                  <input
                    type="date"
                    value={globalFilters.dateTo || ""}
                    onChange={(e) => setGlobalFilters({ ...globalFilters, dateTo: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </>
            )}

            {/* Técnico */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Técnico</label>
              <select
                value={globalFilters.technicianId || ""}
                onChange={(e) =>
                  setGlobalFilters({ ...globalFilters, technicianId: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Todos los técnicos</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Cliente</label>
              <select
                value={globalFilters.customerId || ""}
                onChange={(e) =>
                  setGlobalFilters({ ...globalFilters, customerId: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Todos los clientes</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehículo */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Vehículo</label>
              <select
                value={globalFilters.vehicleId || ""}
                onChange={(e) =>
                  setGlobalFilters({ ...globalFilters, vehicleId: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Todos los vehículos</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} ({vehicle.licensePlate || vehicle.trackingCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Contenido del reporte activo */}
      <div className="min-h-[600px]">{renderActiveReport()}</div>
    </div>
  );
};

export default ReportesSection;
