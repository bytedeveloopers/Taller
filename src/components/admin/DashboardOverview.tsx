"use client";

import { TestNotificationButton } from "@/components/notifications/TestNotificationButton";
import { SimpleChart } from "@/components/ui/Charts";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TruckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

/** Stats que vienen del backend para el dashboard del admin */
export interface DashboardStats {
  totalCitas: number;
  citasHoy: number;
  citasPendientes: number;
  citasEnProceso: number;
  citasCompletadas: number;

  totalClientes: number;
  totalVehiculos: number;

  totalCotizaciones: number;
  ingresos: {
    total: number;
    pendiente: number;
  };

  /** Eficiencia % (0–100) */
  tasaCompletado: number;

  /** Satisfacción: promedio 1–5 o % (el front normaliza) */
  satisfaccionCliente: number;

  /** Cantidad de encuestas consideradas (para saber si hay datos) */
  satisfaccionCount?: number;

  /** Capacidad % (0–100) */
  capacidad?: number;

  recentAppointments?: any[];
}

interface Props {
  stats: DashboardStats;
}

export default function DashboardOverview({ stats }: Props) {
  // -------- KPIs normalizados --------
  // Eficiencia (0–100)
  const eficienciaPct =
    typeof stats?.tasaCompletado === "number"
      ? Math.max(0, Math.min(100, Math.round(stats.tasaCompletado)))
      : 0;

  // Satisfacción:
  // Si NO hay encuestas (satisfaccionCount === 0 o undefined) => 0
  // Si viene 1–5 => *20; si ya es %, lo usamos.
  const encuestas = Number(stats?.satisfaccionCount ?? 0);
  let satisfaccionPct = 0;
  let satisfaccionLabel = "Satisfacción";

  if (encuestas > 0 && typeof stats?.satisfaccionCliente === "number") {
    if (stats.satisfaccionCliente <= 5) {
      const rating = Number(stats.satisfaccionCliente.toFixed(1));
      satisfaccionPct = Math.round(rating * 20); // 4.7 -> 94
      satisfaccionLabel = `Satisfacción (${rating}/5)`;
    } else {
      satisfaccionPct = Math.max(0, Math.min(100, Math.round(stats.satisfaccionCliente)));
      satisfaccionLabel = `Satisfacción (${satisfaccionPct}%)`;
    }
  } else {
    // sin datos
    satisfaccionPct = 0;
    satisfaccionLabel = "Satisfacción (sin datos)";
  }

  // Capacidad (0–100), si no llega, 0
  const capacidadPct =
    typeof stats?.capacidad === "number"
      ? Math.max(0, Math.min(100, Math.round(stats.capacidad)))
      : 0;

  // Helpers moneda
  const montoTotal = Number(stats?.ingresos?.total || 0);
  const montoPendiente = Number(stats?.ingresos?.pendiente || 0);

  return (
    <div className="space-y-8">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Vehículos ingresados */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Vehículos Ingresados</p>
              <p className="text-3xl font-bold text-white">{stats?.totalVehiculos ?? 0}</p>
              <p className="text-gray-300 text-xs">Total registrados</p>
            </div>
            <TruckIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        {/* Vehículos en proceso */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Vehículos en Proceso</p>
              <p className="text-3xl font-bold text-white">{stats?.citasEnProceso ?? 0}</p>
              <p className="text-gray-300 text-xs">Trabajos activos</p>
            </div>
            <WrenchScrewdriverIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        {/* Vehículos finalizados */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Vehículos Finalizados</p>
              <p className="text-3xl font-bold text-white">{stats?.citasCompletadas ?? 0}</p>
              <p className="text-gray-300 text-xs">Trabajos completados</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>

        {/* Cotizaciones pendientes */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Cotizaciones Pendientes</p>
              <p className="text-3xl font-bold text-white">{stats?.totalCotizaciones ?? 0}</p>
              <p className="text-gray-300 text-xs">Por aprobar</p>
            </div>
            <ClockIcon className="h-12 w-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado general */}
        <SimpleChart
          title="Estado de Trabajos"
          type="donut"
          data={[
            { label: "En Proceso", value: stats?.citasEnProceso ?? 0, color: "#f59e0b" },
            { label: "Finalizados", value: stats?.citasCompletadas ?? 0, color: "#10b981" },
            { label: "Pendientes", value: stats?.citasPendientes ?? 0, color: "#3b82f6" },
          ]}
        />

        {/* Rendimiento del Taller (0–100) */}
        <SimpleChart
          title="Rendimiento del Taller"
          type="bar"
          data={[
            { label: "Eficiencia", value: eficienciaPct, color: "#10b981" },
            { label: satisfaccionLabel, value: satisfaccionPct, color: "#3b82f6" },
            { label: "Capacidad", value: capacidadPct, color: "#8b5cf6" },
          ]}
        />

        {/* Resumen financiero */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-400" />
            Resumen Financiero
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <span className="text-green-300 font-medium">Ingresos</span>
              <span className="text-green-400 font-bold">Q{montoTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <span className="text-yellow-300 font-medium">Pendientes</span>
              <span className="text-yellow-400 font-bold">Q{montoPendiente.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <span className="text-blue-300 font-medium">Clientes Totales</span>
              <span className="text-blue-400 font-bold">{stats?.totalClientes ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Citas recientes */}
      <div className="bg-secondary-800 rounded-xl border border-secondary-700">
        <div className="p-6 border-b border-secondary-700">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <ClockIcon className="h-6 w-6 mr-2 text-primary-400" />
            Actividad Reciente
          </h3>
        </div>
        <div className="p-6">
          {(stats?.recentAppointments?.length || 0) > 0 ? (
            <div className="space-y-4">
              {(stats?.recentAppointments || []).slice(0, 5).map((appointment: any) => (
                <div
                  key={appointment?.id ?? Math.random()}
                  className="flex items-center justify-between p-4 bg-secondary-700/50 rounded-lg hover:bg-secondary-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary-400 rounded-full" />
                    <div>
                      <p className="font-medium text-white">
                        {appointment?.customer?.name || "Cliente"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {appointment?.vehicle?.brand} {appointment?.vehicle?.model}{" "}
                        {appointment?.vehicle?.year}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">
                      {appointment?.scheduledAt
                        ? new Date(appointment.scheduledAt).toLocaleDateString("es-GT")
                        : "-"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appointment?.scheduledAt
                        ? new Date(appointment.scheduledAt).toLocaleTimeString("es-GT", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDaysIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No hay actividad reciente</p>
            </div>
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer group">
          <div className="text-center">
            <UserGroupIcon className="h-12 w-12 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-white mb-2">Gestión de Clientes</h4>
            <p className="text-xs text-gray-400">Registro y consulta de datos</p>
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer group">
          <div className="text-center">
            <TruckIcon className="h-12 w-12 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-white mb-2">Base de Vehículos</h4>
            <p className="text-xs text-gray-400">Datos técnicos e historial</p>
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer group">
          <div className="text-center">
            <WrenchScrewdriverIcon className="h-12 w-12 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-white mb-2">Órdenes de Trabajo</h4>
            <p className="text-xs text-gray-400">Seguimiento completo</p>
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer group">
          <div className="text-center">
            <ChartBarIcon className="h-12 w-12 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-white mb-2">Reportes</h4>
            <p className="text-xs text-gray-400">Estadísticas y análisis</p>
          </div>
        </div>
      </div>

      {/* Test Notification Section */}
      <div className="mt-8">
        <TestNotificationButton />
      </div>
    </div>
  );
}
