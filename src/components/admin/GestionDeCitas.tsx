"use client";

import {
  CalendarDaysIcon,
  CheckIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

// Tipos
type EstadoCita = "pendiente" | "en_proceso" | "completada" | "cancelada";

interface Cita {
  id: string;
  cliente: string;
  vehiculo: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: EstadoCita;
  telefono: string;
  total?: number;
}

interface GestionDeCitasProps {
  citas: Cita[];
  onUpdateCita: (id: string, estado: EstadoCita) => void; // lo mantenemos para pasos futuros
  onDeleteCita: (id: string) => void;
  onCreateCita: (cita: Omit<Cita, "id">) => void;

  // NUEVO: callbacks opcionales para ver/editar
  onViewCita?: (cita: Cita) => void;
  onEditCita?: (citaActualizada: Cita) => void;
}

/* ------------ Badge de estado (solo lectura) ------------ */
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

  const text =
    estado === "pendiente"
      ? "🟡 Pendiente"
      : estado === "en_proceso"
      ? "🔵 En Proceso"
      : estado === "completada"
      ? "🟢 Completada"
      : "🔴 Cancelada";

  return <span className={`${base} ${styles} select-none`}>{text}</span>;
}
/* -------------------------------------------------------- */

export default function GestionDeCitas({
  citas,
  onUpdateCita,
  onDeleteCita,
  onCreateCita,
  onViewCita,
  onEditCita,
}: GestionDeCitasProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | EstadoCita>("todos");
  const [showNewCitaForm, setShowNewCitaForm] = useState(false);

  // Modales de ver/editar
  const [citaToView, setCitaToView] = useState<Cita | null>(null);
  const [citaToEdit, setCitaToEdit] = useState<Cita | null>(null);

  // Form nueva cita
  const [newCita, setNewCita] = useState({
    cliente: "",
    vehiculo: "",
    servicio: "",
    fecha: "",
    hora: "",
    telefono: "",
    total: 0,
  });

  const filteredCitas = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return citas.filter((c) => {
      const matchesSearch =
        c.cliente.toLowerCase().includes(q) ||
        c.vehiculo.toLowerCase().includes(q) ||
        c.servicio.toLowerCase().includes(q) ||
        c.telefono.toLowerCase().includes(q);
      const matchesFilter = filterEstado === "todos" || c.estado === filterEstado;
      return matchesSearch && matchesFilter;
    });
  }, [citas, filterEstado, searchTerm]);

  const handleCreateCita = () => {
    if (
      !newCita.cliente ||
      !newCita.vehiculo ||
      !newCita.servicio ||
      !newCita.fecha ||
      !newCita.hora
    ) {
      return;
    }
    onCreateCita({ ...newCita, estado: "pendiente" });
    setNewCita({
      cliente: "",
      vehiculo: "",
      servicio: "",
      fecha: "",
      hora: "",
      telefono: "",
      total: 0,
    });
    setShowNewCitaForm(false);
  };

  const handleView = (c: Cita) => {
    if (onViewCita) {
      onViewCita(c);
      return;
    }
    setCitaToView(c);
  };

  const handleEdit = (c: Cita) => {
    // Clon para editar
    setCitaToEdit({ ...c });
  };

  const handleSaveEdit = () => {
    if (!citaToEdit) return;
    if (onEditCita) {
      onEditCita(citaToEdit);
    } else {
      alert("Implementa onEditCita en el padre para persistir cambios.");
      console.log("Cita editada (simulada):", citaToEdit);
    }
    setCitaToEdit(null);
  };

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
              onChange={(e) => setFilterEstado(e.target.value as any)}
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
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-400 uppercase tracking-wider border-r border-primary-400/10">
                  💰 Total
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-primary-400 uppercase tracking-wider">
                  ⚡ Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-secondary-800 divide-y divide-secondary-700">
              {filteredCitas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <CalendarDaysIcon className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-lg font-medium">No se encontraron citas</p>
                      <p className="text-sm">Intenta ajustar los filtros o crear una nueva cita</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCitas.map((c, index) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-secondary-700 transition-colors border-l-4 ${
                      c.estado === "pendiente"
                        ? "border-l-yellow-500"
                        : c.estado === "en_proceso"
                        ? "border-l-blue-500"
                        : c.estado === "completada"
                        ? "border-l-green-500"
                        : "border-l-red-500"
                    } ${index % 2 === 0 ? "bg-secondary-800" : "bg-secondary-800/50"}`}
                  >
                    {/* Cliente (wrap) */}
                    <td className="px-6 py-4 whitespace-normal break-words border-r border-secondary-700">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {c.cliente.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white break-words">
                            {c.cliente}
                          </div>
                          <div className="text-sm text-gray-400 whitespace-nowrap">
                            {c.telefono}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vehículo */}
                    <td className="px-6 py-4 whitespace-normal break-words border-r border-secondary-700">
                      <div className="text-sm font-medium text-white break-words">{c.vehiculo}</div>
                      <div className="text-xs text-gray-400">🚗 Vehículo registrado</div>
                    </td>

                    {/* Servicio */}
                    <td className="px-6 py-4 whitespace-normal break-words border-r border-secondary-700">
                      <div className="text-sm font-medium text-white break-words">{c.servicio}</div>
                      <div className="text-xs text-gray-400">🔧 Servicio especializado</div>
                    </td>

                    {/* Fecha/Hora */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-secondary-700">
                      <div className="text-sm font-medium text-white">📅 {c.fecha}</div>
                      <div className="text-sm text-gray-400">🕐 {c.hora}</div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-secondary-700">
                      <EstadoBadge estado={c.estado} />
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 whitespace-nowrap border-r border-secondary-700">
                      {c.total ? (
                        <div className="text-lg font-bold text-primary-400">
                          💰 Q{c.total.toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">💸 Sin costo</span>
                      )}
                    </td>

                    {/* Acciones — AHORA EN UNA SOLA LÍNEA */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleView(c)}
                          className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-all hover:scale-110 shadow-md"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white transition-all hover:scale-110 shadow-md"
                          title="Editar cita"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCita(c.id)}
                          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-all hover:scale-110 shadow-md"
                          title="Eliminar cita"
                        >
                          <TrashIcon className="h-4 w-4" />
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

      {/* Modal Nueva Cita */}
      {showNewCitaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-secondary-800 rounded-lg p-6 w-full max-w-md border border-primary-400/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-400">Nueva Cita</h3>
              <button
                onClick={() => setShowNewCitaForm(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={newCita.cliente}
                onChange={(e) => setNewCita({ ...newCita, cliente: e.target.value })}
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Vehículo"
                value={newCita.vehiculo}
                onChange={(e) => setNewCita({ ...newCita, vehiculo: e.target.value })}
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Servicio"
                value={newCita.servicio}
                onChange={(e) => setNewCita({ ...newCita, servicio: e.target.value })}
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="date"
                value={newCita.fecha}
                onChange={(e) => setNewCita({ ...newCita, fecha: e.target.value })}
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="time"
                value={newCita.hora}
                onChange={(e) => setNewCita({ ...newCita, hora: e.target.value })}
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={newCita.telefono}
                onChange={(e) => setNewCita({ ...newCita, telefono: e.target.value })}
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                placeholder="Total (opcional)"
                value={newCita.total}
                onChange={(e) => setNewCita({ ...newCita, total: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateCita}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-md text-white font-medium transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                Crear Cita
              </button>
              <button
                onClick={() => setShowNewCitaForm(false)}
                className="flex-1 px-4 py-2 bg-secondary-600 hover:bg-secondary-700 rounded-md text-white font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Cita */}
      {citaToView && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-secondary-800 rounded-lg p-6 w-full max-w-lg border border-primary-400/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-400">Detalles de la Cita</h3>
              <button
                onClick={() => setCitaToView(null)}
                className="text-gray-400 hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <span className="text-gray-400">Cliente:</span>
                <div className="font-semibold">{citaToView.cliente}</div>
              </div>
              <div>
                <span className="text-gray-400">Teléfono:</span>
                <div className="font-semibold">{citaToView.telefono}</div>
              </div>
              <div>
                <span className="text-gray-400">Vehículo:</span>
                <div className="font-semibold">{citaToView.vehiculo}</div>
              </div>
              <div>
                <span className="text-gray-400">Servicio:</span>
                <div className="font-semibold">{citaToView.servicio}</div>
              </div>
              <div>
                <span className="text-gray-400">Fecha:</span>
                <div className="font-semibold">{citaToView.fecha}</div>
              </div>
              <div>
                <span className="text-gray-400">Hora:</span>
                <div className="font-semibold">{citaToView.hora}</div>
              </div>
              <div>
                <span className="text-gray-400">Estado:</span>
                <div className="font-semibold capitalize">
                  {citaToView.estado.replace("_", " ")}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Total:</span>
                <div className="font-semibold">
                  {citaToView.total ? `Q${citaToView.total.toLocaleString()}` : "Sin costo"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Cita */}
      {citaToEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-secondary-800 rounded-lg p-6 w-full max-w-lg border border-primary-400/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-400">Editar Cita</h3>
              <button
                onClick={() => setCitaToEdit(null)}
                className="text-gray-400 hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white"
                value={citaToEdit.cliente}
                onChange={(e) => setCitaToEdit({ ...citaToEdit, cliente: e.target.value })}
                placeholder="Cliente"
              />
              <input
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white"
                value={citaToEdit.telefono}
                onChange={(e) => setCitaToEdit({ ...citaToEdit, telefono: e.target.value })}
                placeholder="Teléfono"
              />
              <input
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white"
                value={citaToEdit.vehiculo}
                onChange={(e) => setCitaToEdit({ ...citaToEdit, vehiculo: e.target.value })}
                placeholder="Vehículo"
              />
              <input
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white"
                value={citaToEdit.servicio}
                onChange={(e) => setCitaToEdit({ ...citaToEdit, servicio: e.target.value })}
                placeholder="Servicio"
              />
              <input
                type="date"
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white"
                value={citaToEdit.fecha}
                onChange={(e) => setCitaToEdit({ ...citaToEdit, fecha: e.target.value })}
              />
              <input
                type="time"
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white"
                value={citaToEdit.hora}
                onChange={(e) => setCitaToEdit({ ...citaToEdit, hora: e.target.value })}
              />
              <input
                type="number"
                className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white"
                value={citaToEdit.total ?? 0}
                onChange={(e) =>
                  setCitaToEdit({
                    ...citaToEdit,
                    total: Number.isNaN(+e.target.value) ? 0 : parseFloat(e.target.value),
                  })
                }
                placeholder="Total"
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-md text-white font-medium transition-colors"
              >
                Guardar cambios
              </button>
              <button
                onClick={() => setCitaToEdit(null)}
                className="flex-1 px-4 py-2 bg-secondary-600 hover:bg-secondary-700 rounded-md text-white font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { Cita, EstadoCita };
