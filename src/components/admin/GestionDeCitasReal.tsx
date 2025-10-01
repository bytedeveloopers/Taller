"use client";

import { useAppointments } from "@/hooks/useAppointments";
import { useCustomersAndVehicles } from "@/hooks/useCustomersAndVehicles";
import {
  CalendarDaysIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import EditarCitaForm from "./EditarCitaForm";
import NuevaCitaForm from "./NuevaCitaForm";

// Mapeo de estados de la BD a español
const statusMap = {
  SCHEDULED: "pendiente",
  IN_PROGRESS: "en_proceso",
  COMPLETED: "completada",
  CANCELLED: "cancelada",
  NO_SHOW: "cancelada",
} as const;

const reverseStatusMap = {
  pendiente: "SCHEDULED",
  en_proceso: "IN_PROGRESS",
  completada: "COMPLETED",
  cancelada: "CANCELLED",
} as const;

type EstadoCita = keyof typeof reverseStatusMap;

/* ------------ Badge de estado ------------ */
function EstadoBadge({ estado }: { estado: EstadoCita }) {
  const base =
    "inline-flex items-center px-3 py-2 text-sm font-bold rounded-lg border-2 transition-all";
  const styles =
    estado === "pendiente"
      ? "bg-yellow-500 border-yellow-400 text-yellow-900"
      : estado === "en_proceso"
      ? "bg-blue-500 border-blue-400 text-white"
      : estado === "completada"
      ? "bg-green-500 border-green-400 text-white"
      : "bg-red-500 border-red-400 text-white";

  const icon =
    estado === "pendiente"
      ? "⏳"
      : estado === "en_proceso"
      ? "🔧"
      : estado === "completada"
      ? "✅"
      : "❌";

  const text =
    estado === "pendiente"
      ? "Pendiente"
      : estado === "en_proceso"
      ? "En Proceso"
      : estado === "completada"
      ? "Completada"
      : "Cancelada";

  return (
    <span className={`${base} ${styles}`}>
      {icon} {text}
    </span>
  );
}

export default function GestionDeCitasReal() {
  const {
    appointments,
    loading,
    error,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    createAppointment,
  } = useAppointments();
  const { customers, loading: customersLoading } = useCustomersAndVehicles();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [showNewCitaForm, setShowNewCitaForm] = useState(false);
  const [showEditCitaForm, setShowEditCitaForm] = useState(false);
  const [selectedCita, setSelectedCita] = useState<any>(null);

  // Transformar appointments a formato legacy para compatibilidad
  const citas = useMemo(() => {
    return appointments.map((appointment) => ({
      id: appointment.id,
      cliente: appointment.customer.name,
      vehiculo: `${appointment.vehicle.brand} ${appointment.vehicle.model} ${appointment.vehicle.year}`,
      servicio: appointment.notes || "Servicio general",
      fecha: new Date(appointment.scheduledAt).toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      hora: new Date(appointment.scheduledAt).toLocaleTimeString("es-GT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      estado: statusMap[appointment.status] || "pendiente",
      telefono: appointment.customer.phone,
      total: 0, // Por ahora no tenemos precios en el modelo
      _original: appointment, // Guardamos el appointment original
    }));
  }, [appointments]);

  // Filtros
  const filteredCitas = useMemo(() => {
    return citas.filter((cita) => {
      const matchesSearch =
        !searchTerm ||
        [cita.cliente, cita.vehiculo, cita.servicio, cita.telefono].some((field) =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesEstado = filterEstado === "todos" || cita.estado === filterEstado;

      return matchesSearch && matchesEstado;
    });
  }, [citas, searchTerm, filterEstado]);

  // Handlers
  const handleUpdateEstado = async (id: string, nuevoEstado: EstadoCita) => {
    try {
      const dbStatus = reverseStatusMap[nuevoEstado];
      await updateAppointmentStatus(id, dbStatus);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Error al actualizar el estado de la cita");
    }
  };

  const handleDeleteCita = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta cita?")) {
      try {
        await deleteAppointment(id);
      } catch (error) {
        console.error("Error deleting appointment:", error);
        alert("Error al eliminar la cita");
      }
    }
  };

  const handleEditCita = (cita: any) => {
    setSelectedCita(cita);
    setShowEditCitaForm(true);
  };

  const handleUpdateCita = async (citaId: string, citaData: any) => {
    try {
      await updateAppointment(citaId, citaData);
      setShowEditCitaForm(false);
      setSelectedCita(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  };

  if (loading || customersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-400">Error cargando citas: {error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-primary-400/30">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-transparent animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-1 tracking-tight">
                💼 Gestión de Citas
              </h2>
              <p className="text-primary-100 text-lg font-medium">
                Gestión y seguimiento de citas del taller
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-primary-100">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              Sistema Online • Actualización en Tiempo Real
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Citas Pendientes */}
        <div className="group bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 rounded-2xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-yellow-500/30 relative overflow-hidden border border-yellow-400/30">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-yellow-100 text-sm font-bold uppercase tracking-wider mb-2">
                Pendientes
              </p>
              <p className="text-4xl font-bold mb-1 transition-all duration-300 group-hover:scale-110">
                {citas.filter((c) => c.estado === "pendiente").length}
              </p>
              <p className="text-yellow-200 text-sm font-medium">Por atender</p>
            </div>
            <div className="relative">
              <CalendarDaysIcon className="h-14 w-14 text-yellow-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute -inset-2 bg-yellow-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* Citas En Proceso */}
        <div className="group bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-blue-500/30 relative overflow-hidden border border-blue-400/30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-2">
                En Proceso
              </p>
              <p className="text-4xl font-bold mb-1 transition-all duration-300 group-hover:scale-110">
                {citas.filter((c) => c.estado === "en_proceso").length}
              </p>
              <p className="text-blue-200 text-sm font-medium">Siendo atendidas</p>
            </div>
            <div className="relative">
              <WrenchScrewdriverIcon className="h-14 w-14 text-blue-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute -inset-2 bg-blue-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* Citas Completadas */}
        <div className="group bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-2xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-green-500/30 relative overflow-hidden border border-green-400/30">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-green-100 text-sm font-bold uppercase tracking-wider mb-2">
                Completadas
              </p>
              <p className="text-4xl font-bold mb-1 transition-all duration-300 group-hover:scale-110">
                {citas.filter((c) => c.estado === "completada").length}
              </p>
              <p className="text-green-200 text-sm font-medium">Exitosamente</p>
            </div>
            <div className="relative">
              <CheckIcon className="h-14 w-14 text-green-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute -inset-2 bg-green-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* Citas Canceladas */}
        <div className="group bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-red-500/30 relative overflow-hidden border border-red-400/30">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-red-100 text-sm font-bold uppercase tracking-wider mb-2">
                Canceladas
              </p>
              <p className="text-4xl font-bold mb-1 transition-all duration-300 group-hover:scale-110">
                {citas.filter((c) => c.estado === "cancelada").length}
              </p>
              <p className="text-red-200 text-sm font-medium">No realizadas</p>
            </div>
            <div className="relative">
              <XMarkIcon className="h-14 w-14 text-red-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute -inset-2 bg-red-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros Avanzados */}
      <div className="mb-8 bg-secondary-800 rounded-2xl p-6 border border-primary-400/20 shadow-2xl">
        <h3 className="text-xl font-semibold text-primary-400 mb-6 flex items-center">
          🔍 Filtros Avanzados
          <span className="ml-auto text-sm text-gray-400">{filteredCitas.length} resultados</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Búsqueda Global</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cliente, vehículo, servicio, teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <div className="absolute left-3 top-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="todos">📋 Todos los estados</option>
              <option value="pendiente">🟡 Pendiente</option>
              <option value="en_proceso">🔵 En Proceso</option>
              <option value="completada">🟢 Completada</option>
              <option value="cancelada">🔴 Cancelada</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowNewCitaForm(true)}
              className="group w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <PlusIcon className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90" />
              <span className="relative z-10">✨ Nueva Cita</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-400">
            📊 Mostrando {filteredCitas.length} de {citas.length} citas
          </span>
          <span className="text-primary-400 font-medium">💎 Sistema de Gestión</span>
        </div>
      </div>

      {/* Lista de Citas */}
      <div className="bg-secondary-800 rounded-2xl overflow-hidden border border-primary-400/20 shadow-2xl">
        <div className="bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-900 px-6 py-5 border-b border-primary-400/20">
          <h3 className="text-xl font-semibold text-primary-400 flex items-center">
            📋 Lista de Citas
            <span className="ml-auto text-sm text-gray-400 bg-secondary-700 px-3 py-1 rounded-full">
              {filteredCitas.length} registros
            </span>
          </h3>
        </div>

        <div className="overflow-x-hidden">
          <table className="min-w-full divide-y divide-primary-400/20">
            <thead className="bg-gradient-to-r from-secondary-900 to-secondary-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-400 uppercase tracking-wider border-r border-primary-400/10">
                  👤 Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-400 uppercase tracking-wider border-r border-primary-400/10">
                  🚗 Vehículo
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-400 uppercase tracking-wider border-r border-primary-400/10">
                  🔧 Servicio
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-400 uppercase tracking-wider border-r border-primary-400/10">
                  📅 Fecha/Hora
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-400 uppercase tracking-wider border-r border-primary-400/10">
                  📊 Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-primary-400 uppercase tracking-wider">
                  ⚡ Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-secondary-800 divide-y divide-secondary-700">
              {filteredCitas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <CalendarDaysIcon className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-lg font-medium">No se encontraron citas</p>
                      <p className="text-sm">Intenta ajustar los filtros o crear una nueva cita</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCitas.map((cita, index) => (
                  <tr
                    key={cita.id}
                    className={`hover:bg-secondary-700 transition-colors border-l-4 ${
                      cita.estado === "pendiente"
                        ? "border-l-yellow-500"
                        : cita.estado === "en_proceso"
                        ? "border-l-blue-500"
                        : cita.estado === "completada"
                        ? "border-l-green-500"
                        : "border-l-red-500"
                    } ${index % 2 === 0 ? "bg-secondary-800" : "bg-secondary-800/50"}`}
                  >
                    {/* Cliente */}
                    <td className="px-6 py-4 whitespace-normal break-words border-r border-secondary-700">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {cita.cliente.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white break-words">
                            {cita.cliente}
                          </div>
                          <div className="text-sm text-gray-400 whitespace-nowrap">
                            {cita.telefono}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vehículo */}
                    <td className="px-6 py-4 border-r border-secondary-700">
                      <div className="text-sm text-white font-medium">{cita.vehiculo}</div>
                    </td>

                    {/* Servicio */}
                    <td className="px-6 py-4 border-r border-secondary-700">
                      <div className="text-sm text-gray-300">{cita.servicio}</div>
                    </td>

                    {/* Fecha/Hora */}
                    <td className="px-6 py-4 border-r border-secondary-700">
                      <div className="text-sm text-white font-medium">{cita.fecha}</div>
                      <div className="text-sm text-gray-400">{cita.hora}</div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 border-r border-secondary-700">
                      <EstadoBadge estado={cita.estado} />
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Cambiar Estado */}
                        {cita.estado === "pendiente" && (
                          <button
                            onClick={() => handleUpdateEstado(cita.id, "en_proceso")}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors group"
                            title="Iniciar proceso"
                          >
                            <WrenchScrewdriverIcon className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                          </button>
                        )}

                        {cita.estado === "en_proceso" && (
                          <button
                            onClick={() => handleUpdateEstado(cita.id, "completada")}
                            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors group"
                            title="Completar"
                          >
                            <CheckIcon className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                          </button>
                        )}

                        {/* Editar */}
                        <button
                          onClick={() => handleEditCita(cita)}
                          className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors group"
                          title="Editar cita"
                        >
                          <PencilIcon className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => handleDeleteCita(cita.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors group"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-r from-secondary-900 to-secondary-800 px-6 py-4 border-t border-primary-400/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">💼 Sistema de Gestión de Taller</span>
            <span className="text-primary-400 font-medium">⚡ Actualización en tiempo real</span>
          </div>
        </div>
      </div>

      {/* Formulario de nueva cita */}
      <NuevaCitaForm
        isOpen={showNewCitaForm}
        onClose={() => setShowNewCitaForm(false)}
        onSubmit={async (citaData) => {
          try {
            await createAppointment(citaData);
            setShowNewCitaForm(false);
          } catch (error) {
            console.error("Error creating appointment:", error);
            throw error; // El formulario manejará el error
          }
        }}
      />

      {/* Formulario de editar cita */}
      <EditarCitaForm
        isOpen={showEditCitaForm}
        onClose={() => {
          setShowEditCitaForm(false);
          setSelectedCita(null);
        }}
        onSubmit={handleUpdateCita}
        cita={selectedCita}
      />
    </div>
  );
}
