// src/components/admin/clientes/ListadoClientes.tsx
"use client";

import { useToast } from "@/components/ui/ToastNotification";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  TruckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

interface Cliente {
  id: string;
  name: string;
  phone: string;
  email?: string;
  altPhone?: string;
  address?: string;
  contactPreference: string;
  labels: string[];
  notes?: string;
  pickupPoints?: string;
  lastVisit?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vehicles: Array<{
    id: string;
    brand: string;
    model: string;
    year: number;
    licensePlate?: string;
    trackingCode: string;
    status: string;
  }>;
  lastAppointment?: {
    id: string;
    scheduledAt: string;
    status: string;
  };
  stats: {
    vehiculosCount: number;
    citasCount: number;
    cotizacionesCount: number;
    cotizacionesAprobadas: number;
    cotizacionesAprobadaRate: number;
  };
}

interface Props {
  reloadToken?: number; // 👈 para refrescar al guardar/editar
  onClienteSelect?: (cliente: Cliente) => void;
  onCrearCliente?: () => void;
  onEditarCliente?: (cliente: Cliente) => void;
  onVerFicha?: (cliente: Cliente) => void;
}

const FILTROS = [
  { key: "all", label: "Todos los clientes", icon: UserGroupIcon },
  { key: "withVehicles", label: "Con vehículos", icon: TruckIcon },
  { key: "withoutVehicles", label: "Sin vehículos", icon: DocumentTextIcon },
  { key: "vip", label: "VIP", icon: UserGroupIcon },
  { key: "fleet", label: "Flota", icon: TruckIcon },
  { key: "recent", label: "Últimos 30 días", icon: CalendarDaysIcon },
];

const CONTACT_PREFERENCES = {
  PHONE: { label: "Teléfono", icon: PhoneIcon, color: "text-blue-400" },
  WHATSAPP: { label: "WhatsApp", icon: PhoneIcon, color: "text-green-400" },
  EMAIL: { label: "Email", icon: EnvelopeIcon, color: "text-purple-400" },
} as const;

// Convierte una fila cruda de la API al shape que espera la UI
const toUICliente = (row: any): Cliente => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: row.email ?? undefined,
  altPhone: row.alt_phone ?? undefined,
  address: row.address ?? undefined,
  contactPreference: row.contact_preference || "PHONE",
  labels: row.labels
    ? String(row.labels)
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [],
  notes: row.notes ?? undefined,
  pickupPoints: row.pickup_points ?? undefined,
  lastVisit: row.updated_at,
  isActive: !!row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  vehicles: [],
  lastAppointment: undefined,
  stats: {
    vehiculosCount: 0,
    citasCount: 0,
    cotizacionesCount: 0,
    cotizacionesAprobadas: 0,
    cotizacionesAprobadaRate: 0,
  },
});

export default function ListadoClientes({
  reloadToken,
  onClienteSelect,
  onCrearCliente,
  onEditarCliente,
  onVerFicha,
}: Props) {
  const { showError } = useToast();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const loadedRef = useRef(false);

  // ======= cargar clientes =======
  const cargarClientes = async (resetPage = false) => {
    try {
      setLoading(true);
      const page = resetPage ? 1 : pagination.page;

      // Sólo enviar parámetros que la API soporta
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(pagination.limit));
      if (searchTerm.trim().length > 0) params.set("search", searchTerm.trim());
      if (filtroActivo !== "all") params.set("filter", filtroActivo);

      const response = await fetch(`/api/clients?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Error en el listado");
      }

      const items = Array.isArray(result.items) ? result.items.map(toUICliente) : [];
      setClientes(items);

      setPagination({
        page: result.page ?? page,
        limit: result.pageSize ?? pagination.limit,
        total: result.total ?? items.length,
        pages: result.totalPages ?? 1,
      });
    } catch (error: any) {
      console.error("Error cargando clientes:", error);
      showError("Error", error?.message || "No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  // Primera carga
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      cargarClientes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda / filtro — resetea a página 1
  useEffect(() => {
    const t = setTimeout(() => cargarClientes(true), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filtroActivo]);

  // Cambio de página
  useEffect(() => {
    if (loadedRef.current) cargarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  // 👇 Recarga cuando guardas/actualizas (cambia reloadToken)
  useEffect(() => {
    if (loadedRef.current) cargarClientes(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken]);

  // ======= helpers UI =======
  const formatearUltimaVisita = (fecha?: string) => {
    if (!fecha) return "Nunca";
    const date = new Date(fecha);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(+now - +date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  };

  const renderEtiqueta = (label: string) => {
    const config =
      {
        VIP: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
        FLOTA: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
        REFERIDO: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
      }[label] || { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" };

    return (
      <span
        key={label}
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
      >
        {label}
      </span>
    );
  };

  const renderClienteRow = (cliente: Cliente) => {
    const pref =
      CONTACT_PREFERENCES[cliente.contactPreference as keyof typeof CONTACT_PREFERENCES] ||
      CONTACT_PREFERENCES.PHONE;
    const ContactIcon = pref.icon;

    return (
      <tr
        key={cliente.id}
        className="border-b border-secondary-700 hover:bg-secondary-800/50 transition-colors"
      >
        {/* Cliente */}
        <td className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {cliente.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-white truncate">{cliente.name}</h3>
              <div className="flex items-center mt-1 space-x-2">
                <ContactIcon className={`h-3 w-3 ${pref.color}`} />
                <span className="text-xs text-gray-400">{cliente.phone}</span>
              </div>
              {cliente.email && (
                <div className="flex items-center mt-1">
                  <EnvelopeIcon className="h-3 w-3 text-gray-500 mr-1" />
                  <span className="text-xs text-gray-500 truncate">{cliente.email}</span>
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Vehículos */}
        <td className="p-4">
          <div className="flex items-center">
            <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-white">{cliente.stats.vehiculosCount}</span>
            {cliente.vehicles.length > 0 && (
              <div className="ml-2 text-xs text-gray-400">
                {cliente.vehicles[0].brand} {cliente.vehicles[0].model}
                {cliente.vehicles.length > 1 && ` +${cliente.vehicles.length - 1}`}
              </div>
            )}
          </div>
        </td>

        {/* Última visita */}
        <td className="p-4">
          <span className="text-sm text-gray-300">{formatearUltimaVisita(cliente.lastVisit)}</span>
        </td>

        {/* Etiquetas */}
        <td className="p-4">
          <div className="flex flex-wrap gap-1">{cliente.labels.map((l) => renderEtiqueta(l))}</div>
        </td>

        {/* Stats */}
        <td className="p-4">
          <div className="text-xs text-gray-400 space-y-1">
            <div>Citas: {cliente.stats.citasCount}</div>
            <div>Cotizaciones: {cliente.stats.cotizacionesCount}</div>
            {cliente.stats.cotizacionesCount > 0 && (
              <div className="text-green-400">
                Aprobación: {cliente.stats.cotizacionesAprobadaRate}%
              </div>
            )}
          </div>
        </td>

        {/* Acciones */}
        <td className="p-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onVerFicha?.(cliente)}
              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
              title="Ver ficha 360°"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEditarCliente?.(cliente)}
              className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
              title="Editar cliente"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => {}}
              className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
              title="Fusionar duplicados"
            >
              <UserGroupIcon className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Clientes</h2>
          <p className="text-gray-400">Gestión completa de clientes y relaciones</p>
        </div>
        <button
          onClick={onCrearCliente}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-secondary-900 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {/* Buscador y filtros */}
      <div className="bg-secondary-800 rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono, email o placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="relative">
            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {FILTROS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
            <FunnelIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-secondary-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-2 text-gray-400">Cargando clientes...</span>
          </div>
        ) : clientes.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-900">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Cliente</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Vehículos</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Última Visita</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Etiquetas</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Estadísticas</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Acciones</th>
                  </tr>
                </thead>
                <tbody>{clientes.map(renderClienteRow)}</tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-secondary-700">
                <div className="text-sm text-gray-400">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                  {pagination.total} clientes
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}
                    disabled={pagination.page <= 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-300">
                    Página {pagination.page} de {pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: Math.min(p.page + 1, p.pages) }))
                    }
                    disabled={pagination.page >= pagination.pages}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No se encontraron clientes</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || filtroActivo !== "all"
                ? "Intenta con otros términos de búsqueda o filtros"
                : "Comienza agregando tu primer cliente"}
            </p>
            {!searchTerm && filtroActivo === "all" && (
              <button
                onClick={onCrearCliente}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Crear Primer Cliente
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
