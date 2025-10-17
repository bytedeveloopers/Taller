"use client";

import { Technician } from "@/types";
import {
  CalendarDaysIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface Props {
  tecnicos: Technician[];
  loading: boolean;
  busqueda: string;
  setBusqueda: (value: string) => void;
  filtroEstado: string;
  setFiltroEstado: (value: string) => void;
  filtroHabilidades: string;
  setFiltroHabilidades: (value: string) => void;
  filtroCarga: string;
  setFiltroCarga: (value: string) => void;
  onEditar: (tecnico: Technician) => void;
  onVerFicha360: (tecnico: Technician) => void;
  onVerAgenda: (tecnico: Technician) => void;
  onToggleEstado: (id: string, activo: boolean) => void;
}

export default function ListadoTecnicos({
  tecnicos,
  loading,
  busqueda,
  setBusqueda,
  filtroEstado,
  setFiltroEstado,
  filtroHabilidades,
  setFiltroHabilidades,
  filtroCarga,
  setFiltroCarga,
  onEditar,
  onVerFicha360,
  onVerAgenda,
  onToggleEstado,
}: Props) {
  // Semáforo para la barra
  const getLoadColor = (loadPercentage: number) => {
    if (loadPercentage <= 50) return "bg-green-500";
    if (loadPercentage <= 80) return "bg-yellow-500";
    return "bg-red-500";
  };
  const getLoadStatus = (loadPercentage: number) => {
    if (loadPercentage <= 50) return "Baja";
    if (loadPercentage <= 80) return "Media";
    return "Alta";
  };
  const getLoadStatusColor = (loadPercentage: number) => {
    if (loadPercentage <= 50) return "text-green-600 bg-green-100";
    if (loadPercentage <= 80) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-secondary-600 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filtros y búsqueda */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-secondary-600 border border-secondary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-secondary-600 border border-secondary-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          <input
            type="text"
            placeholder="Filtrar por habilidades..."
            value={filtroHabilidades}
            onChange={(e) => setFiltroHabilidades(e.target.value)}
            className="bg-secondary-600 border border-secondary-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
          />

          <select
            value={filtroCarga}
            onChange={(e) => setFiltroCarga(e.target.value)}
            className="bg-secondary-600 border border-secondary-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          >
            <option value="todos">Todas las cargas</option>
            <option value="baja">Carga baja (≤50%)</option>
            <option value="media">Carga media (≤80%)</option>
            <option value="alta">Carga alta (&gt;80%)</option>
          </select>
        </div>
      </div>

      {/* Tabla de técnicos */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-600">
          <thead className="bg-secondary-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Técnico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Habilidades
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Capacidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Carga Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-secondary-700 divide-y divide-secondary-600">
            {tecnicos.map((tecnico) => {
              // Normaliza capacidad y carga desde posibles aliases:
              const capacity =
                Number((tecnico as any).capacidad ?? tecnico.capacityPerDay ?? 0) || 0;
              const currentLoad =
                Number(
                  (tecnico as any).carga ??
                    (tecnico as any).cargaActual ??
                    (tecnico as any).jobsToday ??
                    (tecnico as any).currentLoad ??
                    0
                ) || 0;

              // % sobre la capacidad (100% = capacidad)
              const pct = Math.min(
                100,
                Math.max(
                  0,
                  Math.round(capacity > 0 ? (currentLoad / Math.max(1, capacity)) * 100 : 0)
                )
              );

              return (
                <tr key={tecnico.id} className="hover:bg-secondary-600">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {tecnico.avatarUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={tecnico.avatarUrl}
                            alt={tecnico.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {tecnico.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{tecnico.name}</div>
                        {tecnico.email && (
                          <div className="text-sm text-gray-400">{tecnico.email}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {tecnico.phone}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {tecnico.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {tecnico.skills.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{tecnico.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Capacidad (normalizada) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {capacity} trabajos/día
                  </td>

                  {/* CARGA ACTUAL: muestra X/100% y barra basada en pct */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          {/* <- AQUÍ el cambio: X/100% */}
                          <span>{pct}/100%</span>
                          </div>
                        <div className="w-full bg-secondary-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getLoadColor(pct)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getLoadStatusColor(
                          pct
                        )}`}
                      >
                        {getLoadStatus(pct)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={tecnico.active}
                        onChange={(e) => onToggleEstado(tecnico.id, e.target.checked)}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span
                        className={`ml-2 text-sm ${
                          tecnico.active ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tecnico.active ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onVerFicha360(tecnico)}
                      className="text-blue-400 hover:text-blue-300 p-1 hover:bg-secondary-600 rounded transition-colors"
                      title="Ver ficha 360°"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditar(tecnico)}
                      className="text-green-400 hover:text-green-300 p-1 hover:bg-secondary-600 rounded transition-colors"
                      title="Editar técnico"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onVerAgenda(tecnico)}
                      className="text-purple-400 hover:text-purple-300 p-1 hover:bg-secondary-600 rounded transition-colors"
                      title="Ver agenda"
                    >
                      <CalendarDaysIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {tecnicos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">No hay técnicos</h3>
              <p className="mt-1 text-sm text-gray-400">Comienza agregando un técnico al equipo.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
