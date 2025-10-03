"use client";

import { AuditEvent, AuditFilters } from "@/services/MockAuditService";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  CogIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FunnelIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";

interface Props {
  stats: any;
}

interface AuditStats {
  total: number;
  today: number;
  actionCounts: Record<string, number>;
  entityCounts: Record<string, number>;
  recentActivity: AuditEvent[];
}

const AuditoriaSection = ({ stats }: Props) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Estado de filtros UI
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  const fetchAuditEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.entityType) params.append("entityType", filters.entityType);
      if (filters.action) params.append("action", filters.action);
      if (filters.actorId) params.append("actorId", filters.actorId);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom.toISOString());
      if (filters.dateTo) params.append("dateTo", filters.dateTo.toISOString());
      params.append("page", pagination.page.toString());

      const response = await fetch(`/api/audit?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Convertir las fechas de string a Date objects
      const eventsWithDates = (data.events || []).map((event: any) => ({
        ...event,
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
      }));

      setEvents(eventsWithDates);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (error) {
      console.error("Error fetching audit events:", error);
      // Set empty events array and reset pagination on error
      setEvents([]);
      setPagination({ page: 1, totalPages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  const fetchAuditStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.entityType) params.append("entityType", filters.entityType);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom.toISOString());
      if (filters.dateTo) params.append("dateTo", filters.dateTo.toISOString());

      const response = await fetch(`/api/audit/stats?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAuditStats(data);
    } catch (error) {
      console.error("Error fetching audit stats:", error);
      // Set default stats on error
      setAuditStats({
        total: 0,
        today: 0,
        actionCounts: {},
        entityCounts: {},
        recentActivity: [],
      });
    }
  }, [filters]);

  useEffect(() => {
    fetchAuditEvents();
    fetchAuditStats();
  }, [fetchAuditEvents, fetchAuditStats]);

  const applyFilters = () => {
    const newFilters: AuditFilters = {};

    if (entityTypeFilter) newFilters.entityType = entityTypeFilter;
    if (actionFilter) newFilters.action = actionFilter;
    if (actorFilter) newFilters.actorId = actorFilter;
    if (dateFromFilter) newFilters.dateFrom = new Date(dateFromFilter);
    if (dateToFilter) newFilters.dateTo = new Date(dateToFilter);

    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFiltersPanelOpen(false);
  };

  const clearFilters = () => {
    setEntityTypeFilter("");
    setActionFilter("");
    setActorFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const exportToCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.entityType) params.append("entityType", filters.entityType);
      if (filters.action) params.append("action", filters.action);
      if (filters.actorId) params.append("actorId", filters.actorId);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom.toISOString());
      if (filters.dateTo) params.append("dateTo", filters.dateTo.toISOString());

      const response = await fetch(`/api/audit/export?${params}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting audit events:", error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "update":
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case "delete":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case "status_change":
        return <ArrowRightIcon className="h-5 w-5 text-yellow-500" />;
      case "assign":
        return <UserIcon className="h-5 w-5 text-purple-500" />;
      case "merge":
        return <UserGroupIcon className="h-5 w-5 text-indigo-500" />;
      case "pause":
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      case "resume":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "approve":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case "reject":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case "upload":
        return <CameraIcon className="h-5 w-5 text-blue-600" />;
      case "reprogram":
        return <CalendarIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <CogIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "work_order":
        return <DocumentTextIcon className="h-4 w-4 text-blue-500" />;
      case "client":
        return <UserIcon className="h-4 w-4 text-green-500" />;
      case "vehicle":
        return <TruckIcon className="h-4 w-4 text-purple-500" />;
      case "quote":
        return <CurrencyDollarIcon className="h-4 w-4 text-yellow-500" />;
      case "appointment":
        return <CalendarIcon className="h-4 w-4 text-red-500" />;
      case "media":
        return <CameraIcon className="h-4 w-4 text-indigo-500" />;
      default:
        return <CogIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Hace un momento";
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;

    return dateObj.toLocaleDateString("es-MX");
  };

  return (
    <div className="p-6 bg-secondary-800 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="h-8 w-8 text-primary-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Auditoría del Sistema</h1>
            <p className="text-gray-400">Registro inmutable de todas las acciones del sistema</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {auditStats && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-secondary-700 rounded-lg p-6 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Eventos</p>
                <p className="text-2xl font-bold text-white">{auditStats.total.toLocaleString()}</p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-secondary-700 rounded-lg p-6 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Eventos Hoy</p>
                <p className="text-2xl font-bold text-white">{auditStats.today}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-secondary-700 rounded-lg p-6 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tipos de Acción</p>
                <p className="text-2xl font-bold text-white">
                  {Object.keys(auditStats.actionCounts).length}
                </p>
              </div>
              <CogIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-secondary-700 rounded-lg p-6 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Entidades Afectadas</p>
                <p className="text-2xl font-bold text-white">
                  {Object.keys(auditStats.entityCounts).length}
                </p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filtros y Acciones */}
      <div className="bg-secondary-700 rounded-lg p-4 mb-6 border border-secondary-600">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setFiltersPanelOpen(!filtersPanelOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filtros</span>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${filtersPanelOpen ? "rotate-180" : ""}`}
              />
            </button>

            {Object.keys(filters).length > 0 && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-400 hover:text-white border border-secondary-600 hover:border-secondary-500 rounded-lg transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">{pagination.total} eventos encontrados</span>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {filtersPanelOpen && (
          <div className="mt-4 pt-4 border-t border-secondary-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Entidad
                </label>
                <select
                  value={entityTypeFilter}
                  onChange={(e) => setEntityTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todas</option>
                  <option value="work_order">Órdenes de Trabajo</option>
                  <option value="client">Clientes</option>
                  <option value="vehicle">Vehículos</option>
                  <option value="quote">Cotizaciones</option>
                  <option value="appointment">Citas</option>
                  <option value="media">Archivos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Acción</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todas</option>
                  <option value="create">Crear</option>
                  <option value="update">Actualizar</option>
                  <option value="delete">Eliminar</option>
                  <option value="status_change">Cambio de Estado</option>
                  <option value="assign">Asignar</option>
                  <option value="approve">Aprobar</option>
                  <option value="reject">Rechazar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Desde</label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Hasta</label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={applyFilters}
                  className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de eventos */}
      <div className="bg-secondary-700 rounded-lg border border-secondary-600">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Cargando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center">
            <ShieldCheckIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No se encontraron eventos de auditoría</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-secondary-600">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-4 hover:bg-secondary-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">{getActionIcon(event.action)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {getEntityIcon(event.entityType)}
                          <span className="text-sm text-gray-400">
                            {event.entityType}#{event.entityId}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-400">{event.actorName}</span>
                        </div>
                        <p className="text-white font-medium">{event.summary}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                          <span>{formatRelativeTime(event.createdAt)}</span>
                          <span>{new Date(event.createdAt).toLocaleString("es-MX")}</span>
                          {event.meta?.ip ? <span>IP: {String(event.meta.ip)}</span> : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            <div className="p-4 border-t border-secondary-600 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Mostrando {(pagination.page - 1) * 50 + 1}-
                {Math.min(pagination.page * 50, pagination.total)} de {pagination.total} eventos
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-400">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de detalle de evento */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-secondary-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-600">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Detalle del Evento</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  {getActionIcon(selectedEvent.action)}
                  <div>
                    <h3 className="text-white font-medium">{selectedEvent.summary}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(selectedEvent.createdAt).toLocaleString("es-MX")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Actor</label>
                    <p className="text-white">{selectedEvent.actorName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Acción</label>
                    <p className="text-white capitalize">
                      {selectedEvent.action.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Entidad</label>
                    <p className="text-white">
                      {selectedEvent.entityType}#{selectedEvent.entityId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">IP</label>
                    <p className="text-white">{String(selectedEvent.meta?.ip) || "N/A"}</p>
                  </div>
                </div>

                {selectedEvent.diff && (
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Cambios</label>
                    <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-600">
                      {Object.entries(selectedEvent.diff).map(([field, change]) => (
                        <div key={field} className="mb-2 last:mb-0">
                          <span className="text-gray-300 font-medium">{field}:</span>
                          <div className="ml-4 text-sm">
                            <span className="text-red-400">- {String(change.from)}</span>
                            <br />
                            <span className="text-green-400">+ {String(change.to)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.meta && Object.keys(selectedEvent.meta).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Metadatos
                    </label>
                    <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-600">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(selectedEvent.meta, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditoriaSection;
