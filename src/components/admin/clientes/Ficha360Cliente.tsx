"use client";

import { useToast } from "@/components/ui/ToastNotification";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  TruckIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface Cliente360 {
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
  consents?: Record<string, boolean>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastVisit?: string;
  vehicles: Array<{
    id: string;
    brand: string;
    model: string;
    year: number;
    licensePlate?: string;
    trackingCode: string;
    status: string;
    color?: string;
    mileage?: number;
    createdAt: string;
  }>;
  appointments: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    service?: string;
    notes?: string;
    vehicle?: {
      brand: string;
      model: string;
      licensePlate?: string;
    };
  }>;
  quotes: Array<{
    id: string;
    status: string;
    total: number;
    createdAt: string;
    approvedAt?: string;
    vehicle?: {
      brand: string;
      model: string;
      licensePlate?: string;
    };
  }>;
  timeline: Array<{
    id: string;
    tipo: string;
    titulo: string;
    descripcion: string;
    fecha: string;
    datos?: any;
  }>;
  stats: {
    vehiculosCount: number;
    citasCount: number;
    cotizacionesCount: number;
    cotizacionesAprobadas: number;
    cotizacionesAprobadaRate: number;
    totalGastado: number;
    promedioCitasPorMes?: number;
    diasDesdeUltimaVisita?: number;
  };
  reminders: Array<{
    id: string;
    type: string;
    title: string;
    scheduledFor: string;
    completed: boolean;
  }>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  onEdit?: () => void;
}

const TABS = [
  { key: "general", label: "Información General", icon: DocumentTextIcon },
  { key: "vehiculos", label: "Vehículos", icon: TruckIcon },
  { key: "citas", label: "Historial de Citas", icon: CalendarDaysIcon },
  { key: "cotizaciones", label: "Cotizaciones", icon: ClipboardDocumentListIcon },
  { key: "timeline", label: "Timeline", icon: ClockIcon },
  { key: "stats", label: "Estadísticas", icon: ChartBarIcon },
];

const CONTACT_PREFERENCES = {
  PHONE: { label: "Teléfono", icon: PhoneIcon, color: "text-blue-400" },
  WHATSAPP: { label: "WhatsApp", icon: PhoneIcon, color: "text-green-400" },
  EMAIL: { label: "Email", icon: EnvelopeIcon, color: "text-purple-400" },
} as const;

const STATUS_COLORS = {
  SCHEDULED: "bg-blue-500/20 text-blue-400",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-400",
  COMPLETED: "bg-green-500/20 text-green-400",
  CANCELLED: "bg-red-500/20 text-red-400",
  PENDING: "bg-orange-500/20 text-orange-400",
  APPROVED: "bg-green-500/20 text-green-400",
  REJECTED: "bg-red-500/20 text-red-400",
} as const;

/* ---------------- Normalizadores seguros ---------------- */

const toStringArray = (val: unknown): string[] => {
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  if (typeof val === "string") {
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const toBoolRecord = (val: unknown): Record<string, boolean> => {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const rec: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      rec[k] = Boolean(v);
    }
    return rec;
  }
  return {};
};

const toArray = <T,>(val: unknown, mapItem: (x: any) => T): T[] => {
  if (!val) return [];
  const a = Array.isArray(val) ? val : [];
  return a.map(mapItem).filter(Boolean);
};

const parseNumber = (n: unknown, fallback = 0): number =>
  typeof n === "number" ? n : Number.isFinite(Number(n)) ? Number(n) : fallback;

const parseString = (s: unknown, fallback = ""): string =>
  typeof s === "string" ? s : s == null ? fallback : String(s);

/** Mapea la respuesta de la API al shape fuerte de Cliente360 */
const mapApiToCliente360 = (data: any): Cliente360 => {
  const vehicles = toArray(data.vehicles ?? data.vehiculos, (v: any) => ({
    id: parseString(v.id),
    brand: parseString(v.brand),
    model: parseString(v.model),
    year: parseNumber(v.year),
    licensePlate: v.licensePlate ?? v.placa ?? undefined,
    trackingCode: parseString(v.trackingCode ?? v.codigo_seguimiento ?? v.code),
    status: parseString(v.status ?? "PENDING"),
    color: v.color ?? undefined,
    mileage: v.mileage != null ? parseNumber(v.mileage) : undefined,
    createdAt: parseString(v.createdAt ?? v.created_at ?? new Date().toISOString()),
  }));

  const appointments = toArray(data.appointments ?? data.ordenes, (a: any) => ({
    id: parseString(a.id),
    scheduledAt: parseString(a.scheduledAt ?? a.fecha ?? a.createdAt ?? a.created_at),
    status: parseString(a.status ?? "SCHEDULED"),
    service: a.service ?? a.servicio ?? undefined,
    notes: a.notes ?? undefined,
    vehicle: a.vehicle
      ? {
          brand: parseString(a.vehicle.brand),
          model: parseString(a.vehicle.model),
          licensePlate: a.vehicle.licensePlate ?? undefined,
        }
      : undefined,
  }));

  const quotes = toArray(data.quotes ?? data.cotizaciones, (q: any) => ({
    id: parseString(q.id),
    status: parseString(q.status ?? "PENDING"),
    total: parseNumber(q.total, 0),
    createdAt: parseString(q.createdAt ?? q.created_at ?? new Date().toISOString()),
    approvedAt: q.approvedAt ?? q.approved_at ?? undefined,
    vehicle: q.vehicle
      ? {
          brand: parseString(q.vehicle.brand),
          model: parseString(q.vehicle.model),
          licensePlate: q.vehicle.licensePlate ?? undefined,
        }
      : undefined,
  }));

  const timeline = toArray(data.timeline, (t: any) => ({
    id: parseString(t.id ?? crypto.randomUUID?.() ?? String(Math.random())),
    tipo: parseString(t.tipo ?? t.type ?? "event"),
    titulo: parseString(t.titulo ?? t.title ?? "Evento"),
    descripcion: parseString(t.descripcion ?? t.description ?? ""),
    fecha: parseString(t.fecha ?? t.date ?? new Date().toISOString()),
    datos: t.datos ?? t.data ?? undefined,
  }));

  const statsRaw = data.stats ?? {};
  const stats = {
    vehiculosCount: parseNumber(statsRaw.vehiculosCount ?? vehicles.length, 0),
    citasCount: parseNumber(statsRaw.citasCount ?? appointments.length, 0),
    cotizacionesCount: parseNumber(statsRaw.cotizacionesCount ?? quotes.length, 0),
    cotizacionesAprobadas: parseNumber(statsRaw.cotizacionesAprobadas ?? 0, 0),
    cotizacionesAprobadaRate: parseNumber(statsRaw.cotizacionesAprobadaRate ?? 0, 0),
    totalGastado: parseNumber(statsRaw.totalGastado ?? 0, 0),
    promedioCitasPorMes: statsRaw.promedioCitasPorMes != null ? parseNumber(statsRaw.promedioCitasPorMes) : undefined,
    diasDesdeUltimaVisita:
      statsRaw.diasDesdeUltimaVisita != null ? parseNumber(statsRaw.diasDesdeUltimaVisita) : undefined,
  };

  return {
    id: parseString(data.id),
    name: parseString(data.name),
    phone: parseString(data.phone),
    email: data.email ?? undefined,
    altPhone: data.alt_phone ?? data.altPhone ?? undefined,
    address: data.address ?? undefined,
    contactPreference: parseString(data.contact_preference ?? data.contactPreference ?? "PHONE"),
    labels: toStringArray(data.labels),
    notes: data.notes ?? undefined,
    pickupPoints: data.pickup_points ?? data.pickupPoints ?? undefined,
    consents: toBoolRecord(data.consents),
    isActive: Boolean(data.is_active ?? data.isActive ?? true),
    createdAt: parseString(data.created_at ?? data.createdAt ?? new Date().toISOString()),
    updatedAt: parseString(data.updated_at ?? data.updatedAt ?? new Date().toISOString()),
    lastVisit: data.lastVisit ?? data.updated_at ?? data.updatedAt ?? undefined,
    vehicles,
    appointments,
    quotes,
    timeline,
    stats,
    reminders: toArray(data.reminders, (r: any) => ({
      id: parseString(r.id),
      type: parseString(r.type ?? "general"),
      title: parseString(r.title ?? r.titulo ?? "Recordatorio"),
      scheduledFor: parseString(r.scheduledFor ?? r.fecha ?? new Date().toISOString()),
      completed: Boolean(r.completed),
    })),
  };
};

/* ---------------- Componente ---------------- */

export default function Ficha360Cliente({ isOpen, onClose, clienteId, onEdit }: Props) {
  const { showSuccess, showError } = useToast();
  const [cliente, setCliente] = useState<Cliente360 | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Cargar datos del cliente
  const cargarCliente = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clients/${clienteId}`);
      const result = await response.json();

      if (!response.ok || !result?.data) {
        throw new Error(result?.error || "No se pudo cargar la información del cliente");
      }

      const mapped = mapApiToCliente360(result.data);
      setCliente(mapped);
    } catch (error: any) {
      console.error("Error cargando cliente:", error);
      showError("Error", error?.message || "Error de conexión al cargar cliente");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && clienteId) {
      cargarCliente();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, clienteId]);

  // Marcar recordatorio como completado
  const completarRecordatorio = async (recordatorioId: string) => {
    try {
      const response = await fetch(`/api/clients/${clienteId}/recordatorios/${recordatorioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      if (response.ok) {
        await cargarCliente();
        showSuccess("Éxito", "Recordatorio marcado como completado");
      } else {
        showError("Error", "No se pudo actualizar el recordatorio");
      }
    } catch (error) {
      console.error("Error completando recordatorio:", error);
      showError("Error", "Error de conexión");
    }
  };

  // Renderizar etiqueta
  const renderEtiqueta = (label: string) => {
    const config =
      {
        VIP: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
        FLOTA: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
        REFERIDO: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
        EMPRESA: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
        PARTICULAR: { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" },
        FRECUENTE: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
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

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatearMoneda = (monto: number) =>
    new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(monto);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-secondary-800 rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {cliente?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{cliente?.name || "Cargando..."}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                {cliente && (
                  <>
                    <span className="flex items-center">
                      {(() => {
                        const pref =
                          CONTACT_PREFERENCES[
                            (cliente.contactPreference as keyof typeof CONTACT_PREFERENCES) || "PHONE"
                          ];
                        const ContactIcon = pref?.icon;
                        return ContactIcon ? (
                          <ContactIcon className={`h-4 w-4 mr-1 ${pref.color}`} />
                        ) : null;
                      })()}
                      {cliente.phone}
                    </span>
                    {cliente.email && (
                      <span className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-500" />
                        {cliente.email}
                      </span>
                    )}
                    <span>Cliente desde {formatearFecha(cliente.createdAt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onEdit}
              className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
              title="Editar cliente"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Etiquetas y estado */}
        {cliente && (
          <div className="px-6 py-4 border-b border-secondary-700">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {(cliente.labels ?? []).map((label) => renderEtiqueta(label))}
                {!cliente.isActive && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                    Inactivo
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-green-400">
                  <TruckIcon className="h-4 w-4 mr-1" />
                  {cliente.stats?.vehiculosCount ?? 0} vehículos
                </div>
                <div className="flex items-center text-blue-400">
                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                  {cliente.stats?.citasCount ?? 0} citas
                </div>
                <div className="flex items-center text-purple-400">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  {cliente.stats?.cotizacionesCount ?? 0} cotizaciones
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-secondary-700">
          <nav className="flex space-x-8 px-6">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-280px)]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-400">Cargando información...</span>
            </div>
          ) : cliente ? (
            <div>
              {/* General */}
              {activeTab === "general" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Info contacto */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-secondary-700 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <PhoneIcon className="h-5 w-5 mr-2" />
                        Información de Contacto
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Teléfono Principal
                          </label>
                          <p className="text-white">{cliente.phone}</p>
                        </div>
                        {cliente.altPhone && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Teléfono Alternativo
                            </label>
                            <p className="text-white">{cliente.altPhone}</p>
                          </div>
                        )}
                        {cliente.email && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Email
                            </label>
                            <p className="text-white">{cliente.email}</p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Preferencia de Contacto
                          </label>
                          <p className="text-white">
                            {
                              CONTACT_PREFERENCES[
                                (cliente.contactPreference as keyof typeof CONTACT_PREFERENCES) ||
                                  "PHONE"
                              ]?.label
                            }
                          </p>
                        </div>
                      </div>
                      {cliente.address && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Dirección
                          </label>
                          <p className="text-white">{cliente.address}</p>
                        </div>
                      )}
                      {cliente.pickupPoints && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Puntos de Recogida/Entrega
                          </label>
                          <p className="text-white">{cliente.pickupPoints}</p>
                        </div>
                      )}
                    </div>

                    {cliente.notes && (
                      <div className="bg-secondary-700 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                          <DocumentTextIcon className="h-5 w-5 mr-2" />
                          Notas
                        </h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{cliente.notes}</p>
                      </div>
                    )}

                    {/* Consentimientos */}
                    {cliente.consents && Object.keys(cliente.consents).length > 0 && (
                      <div className="bg-secondary-700 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Consentimientos</h3>
                        <div className="space-y-2">
                          {Object.entries(cliente.consents).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                              {value ? (
                                <CheckCircleIcon className="h-4 w-4 text-green-400" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 text-red-400" />
                              )}
                              <span className="text-sm text-gray-300">{key}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar estadísticas */}
                  <div className="space-y-6">
                    <div className="bg-secondary-700 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Estadísticas Rápidas</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Total Gastado</span>
                          <span className="text-white font-medium">
                            {formatearMoneda(cliente.stats?.totalGastado ?? 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Tasa de Aprobación</span>
                          <span className="text-white font-medium">
                            {cliente.stats?.cotizacionesAprobadaRate ?? 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Citas/Mes Promedio</span>
                          <span className="text-white font-medium">
                            {((cliente.stats?.promedioCitasPorMes ?? 0) as number).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Última Visita</span>
                          <span className="text-white font-medium">
                            {(cliente.stats?.diasDesdeUltimaVisita || 0) === 0
                              ? "Hoy"
                              : `Hace ${cliente.stats?.diasDesdeUltimaVisita || 0} días`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recordatorios */}
                    {cliente.reminders && cliente.reminders.length > 0 && (
                      <div className="bg-secondary-700 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Recordatorios</h3>
                        <div className="space-y-3">
                          {cliente.reminders
                            .filter((r) => !r.completed)
                            .map((reminder) => (
                              <div key={reminder.id} className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-white">{reminder.title}</p>
                                  <p className="text-xs text-gray-400">
                                    {formatearFecha(reminder.scheduledFor)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => completarRecordatorio(reminder.id)}
                                  className="p-1 text-green-400 hover:text-green-300 transition-colors"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Acciones rápidas */}
                    <div className="bg-secondary-700 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Acciones Rápidas</h3>
                      <div className="space-y-2">
                        <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          Llamar
                        </button>
                        {cliente.email && (
                          <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                            Enviar Email
                          </button>
                        )}
                        <button className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors">
                          <CalendarDaysIcon className="h-4 w-4 mr-2" />
                          Nueva Cita
                        </button>
                        <button className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors">
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          Nueva Cotización
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vehículos */}
              {activeTab === "vehiculos" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Vehículos del Cliente</h3>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Agregar Vehículo
                    </button>
                  </div>

                  {(cliente.vehicles ?? []).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cliente.vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="bg-secondary-700 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-white font-medium">
                                {vehicle.brand} {vehicle.model}
                              </h4>
                              <p className="text-sm text-gray-400">Año {vehicle.year}</p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                STATUS_COLORS[vehicle.status as keyof typeof STATUS_COLORS] ||
                                "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {vehicle.status}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {vehicle.licensePlate && (
                              <div className="flex justify-between">
                                <span className="text-gray-300">Placa:</span>
                                <span className="text-white">{vehicle.licensePlate}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-300">Código:</span>
                              <span className="text-white font-mono text-sm">
                                {vehicle.trackingCode}
                              </span>
                            </div>
                            {vehicle.color && (
                              <div className="flex justify-between">
                                <span className="text-gray-300">Color:</span>
                                <span className="text-white">{vehicle.color}</span>
                              </div>
                            )}
                            {vehicle.mileage != null && (
                              <div className="flex justify-between">
                                <span className="text-gray-300">Kilometraje:</span>
                                <span className="text-white">
                                  {vehicle.mileage.toLocaleString()} km
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-4 border-t border-secondary-600">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                Registrado {formatearFecha(vehicle.createdAt)}
                              </span>
                              <button className="p-1 text-blue-400 hover:text-blue-300 transition-colors">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-12">
                      <TruckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        No hay vehículos registrados
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Este cliente aún no tiene vehículos asociados
                      </p>
                      <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Agregar Primer Vehículo
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Citas */}
              {activeTab === "citas" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Historial de Citas</h3>

                  {(cliente.appointments ?? []).length > 0 ? (
                    <div className="space-y-4">
                      {cliente.appointments.map((appointment) => (
                        <div key={appointment.id} className="bg-secondary-700 rounded-lg p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-white font-medium">
                                  {appointment.service || "Servicio general"}
                                </h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    STATUS_COLORS[
                                      appointment.status as keyof typeof STATUS_COLORS
                                    ] || "bg-gray-500/20 text-gray-400"
                                  }`}
                                >
                                  {appointment.status}
                                </span>
                              </div>

                              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                                <span className="flex items-center">
                                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                  {formatearFecha(appointment.scheduledAt)}
                                </span>
                                {appointment.vehicle && (
                                  <span className="flex items-center">
                                    <TruckIcon className="h-4 w-4 mr-1" />
                                    {appointment.vehicle.brand} {appointment.vehicle.model}
                                    {appointment.vehicle.licensePlate &&
                                      ` - ${appointment.vehicle.licensePlate}`}
                                  </span>
                                )}
                              </div>

                              {appointment.notes && (
                                <p className="text-gray-300 text-sm">{appointment.notes}</p>
                              )}
                            </div>

                            <button className="p-1 text-blue-400 hover:text-blue-300 transition-colors">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-12">
                      <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        No hay citas registradas
                      </h3>
                      <p className="text-gray-400">Este cliente aún no tiene historial de citas</p>
                    </div>
                  )}
                </div>
              )}

              {/* Cotizaciones */}
              {activeTab === "cotizaciones" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Historial de Cotizaciones</h3>

                  {(cliente.quotes ?? []).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {cliente.quotes.map((quote) => (
                        <div key={quote.id} className="bg-secondary-700 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    STATUS_COLORS[quote.status as keyof typeof STATUS_COLORS] ||
                                    "bg-gray-500/20 text-gray-400"
                                  }`}
                                >
                                  {quote.status}
                                </span>
                              </div>
                              <p className="text-2xl font-bold text-white">
                                {formatearMoneda(quote.total)}
                              </p>
                            </div>
                            <button className="p-1 text-blue-400 hover:text-blue-300 transition-colors">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </div>

                          {quote.vehicle && (
                            <div className="flex items-center text-sm text-gray-400 mb-2">
                              <TruckIcon className="h-4 w-4 mr-1" />
                              {quote.vehicle.brand} {quote.vehicle.model}
                              {quote.vehicle.licensePlate && ` - ${quote.vehicle.licensePlate}`}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Creada: {formatearFecha(quote.createdAt)}</span>
                            {quote.approvedAt && (
                              <span>Aprobada: {formatearFecha(quote.approvedAt)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-12">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No hay cotizaciones</h3>
                      <p className="text-gray-400">
                        Este cliente aún no tiene cotizaciones registradas
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              {activeTab === "timeline" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Timeline de Actividad</h3>

                  {(cliente.timeline ?? []).length > 0 ? (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {cliente.timeline.map((item, index) => (
                          <li key={item.id}>
                            <div className="relative pb-8">
                              {index !== cliente.timeline.length - 1 && (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-secondary-600" />
                              )}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-secondary-800">
                                    <ClockIcon className="h-4 w-4 text-white" />
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-white font-medium">{item.titulo}</p>
                                    <p className="text-sm text-gray-400">{item.descripcion}</p>
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-400">
                                    {formatearFecha(item.fecha)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center p-12">
                      <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        No hay actividad registrada
                      </h3>
                      <p className="text-gray-400">
                        El timeline se actualizará con las interacciones del cliente
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              {activeTab === "stats" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-secondary-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Vehículos Registrados</p>
                        <p className="text-3xl font-bold text-white">
                          {cliente.stats?.vehiculosCount ?? 0}
                        </p>
                      </div>
                      <TruckIcon className="h-12 w-12 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-secondary-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total de Citas</p>
                        <p className="text-3xl font-bold text-white">
                          {cliente.stats?.citasCount ?? 0}
                        </p>
                      </div>
                      <CalendarDaysIcon className="h-12 w-12 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-secondary-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Cotizaciones</p>
                        <p className="text-3xl font-bold text-white">
                          {cliente.stats?.cotizacionesCount ?? 0}
                        </p>
                      </div>
                      <DocumentTextIcon className="h-12 w-12 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-secondary-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Cotizaciones Aprobadas</p>
                        <p className="text-3xl font-bold text-white">
                          {cliente.stats?.cotizacionesAprobadas ?? 0}
                        </p>
                        <p className="text-sm text-green-400">
                          {cliente.stats?.cotizacionesAprobadaRate ?? 0}% de aprobación
                        </p>
                      </div>
                      <CheckCircleIcon className="h-12 w-12 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-secondary-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Gastado</p>
                        <p className="text-3xl font-bold text-white">
                          {formatearMoneda(cliente.stats?.totalGastado ?? 0)}
                        </p>
                      </div>
                      <ChartBarIcon className="h-12 w-12 text-yellow-500" />
                    </div>
                  </div>

                  <div className="bg-secondary-700 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Promedio Citas/Mes</p>
                        <p className="text-3xl font-bold text-white">
                          {((cliente.stats?.promedioCitasPorMes ?? 0) as number).toFixed(1)}
                        </p>
                      </div>
                      <ClockIcon className="h-12 w-12 text-orange-500" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-12">
              <XCircleIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No se pudo cargar la información del cliente
              </h3>
              <p className="text-gray-400">
                Intenta recargar la página o contacta al soporte técnico
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
