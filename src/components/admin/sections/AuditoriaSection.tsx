"use client";

import {
  ArrowPathIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface Props {
  stats: any;
}

export default function AuditoriaSection({ stats }: Props) {
  const actividadReciente = [
    {
      id: 1,
      accion: "Actualización de cliente",
      usuario: "María García",
      registro: "Cliente #1234 - Juan Pérez",
      timestamp: "2024-09-15 14:30:25",
      tipo: "UPDATE",
      detalles: "Actualizó teléfono de contacto",
    },
    {
      id: 2,
      accion: "Creación de OT",
      usuario: "Carlos López",
      registro: "OT-2024-091",
      timestamp: "2024-09-15 14:15:10",
      tipo: "CREATE",
      detalles: "Nueva orden de trabajo para Honda Civic",
    },
    {
      id: 3,
      accion: "Cambio de estado",
      usuario: "Ana Rodríguez",
      registro: "OT-2024-090",
      timestamp: "2024-09-15 13:45:33",
      tipo: "UPDATE",
      detalles: 'Cambió estado de "Diagnóstico" a "En Proceso"',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Registros Hoy</p>
              <p className="text-3xl font-bold text-white">247</p>
              <p className="text-gray-300 text-xs">Actividades registradas</p>
            </div>
            <DocumentDuplicateIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Usuarios Activos</p>
              <p className="text-3xl font-bold text-white">8</p>
              <p className="text-gray-300 text-xs">En las últimas 24h</p>
            </div>
            <UserIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Versiones</p>
              <p className="text-3xl font-bold text-white">156</p>
              <p className="text-gray-300 text-xs">Registros versionados</p>
            </div>
            <ArrowPathIcon className="h-12 w-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Retención</p>
              <p className="text-3xl font-bold text-white">365</p>
              <p className="text-gray-300 text-xs">Días configurados</p>
            </div>
            <ClockIcon className="h-12 w-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Herramientas de búsqueda */}
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-white">Bitácora de Auditoría</h2>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por usuario, acción, registro..."
                className="pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
              />
            </div>

            <select className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Todos los tipos</option>
              <option>CREATE</option>
              <option>UPDATE</option>
              <option>DELETE</option>
            </select>
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm">Hoy</button>
          <button className="px-3 py-1 bg-secondary-700 text-gray-300 rounded-full text-sm hover:bg-secondary-600">
            Esta semana
          </button>
          <button className="px-3 py-1 bg-secondary-700 text-gray-300 rounded-full text-sm hover:bg-secondary-600">
            Este mes
          </button>
          <button className="px-3 py-1 bg-secondary-700 text-gray-300 rounded-full text-sm hover:bg-secondary-600">
            Último año
          </button>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-secondary-800 rounded-xl border border-secondary-700">
        <div className="p-6 border-b border-secondary-700">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <ClockIcon className="h-6 w-6 mr-2 text-primary-400" />
            Actividad Reciente
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {actividadReciente.map((actividad) => (
            <div
              key={actividad.id}
              className="p-4 bg-secondary-700/50 rounded-lg hover:bg-secondary-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      actividad.tipo === "CREATE"
                        ? "bg-green-500"
                        : actividad.tipo === "UPDATE"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <div>
                    <h4 className="font-medium text-white">{actividad.accion}</h4>
                    <p className="text-sm text-gray-400">por {actividad.usuario}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      actividad.tipo === "CREATE"
                        ? "bg-green-500/20 text-green-400"
                        : actividad.tipo === "UPDATE"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {actividad.tipo}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Registro Afectado</p>
                  <p className="text-sm text-white font-medium">{actividad.registro}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Fecha y Hora</p>
                  <p className="text-sm text-white font-medium">{actividad.timestamp}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Detalles</p>
                  <p className="text-sm text-gray-300">{actividad.detalles}</p>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center space-x-1 text-xs">
                  <EyeIcon className="h-3 w-3" />
                  <span>Ver Detalles</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuración de auditoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Políticas de retención */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ClockIcon className="h-6 w-6 mr-2 text-orange-400" />
            Políticas de Retención
          </h3>

          <div className="space-y-4">
            <div className="p-3 bg-secondary-700/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">Evidencias/Fotos</h4>
                <span className="text-green-400 font-bold">2 años</span>
              </div>
              <p className="text-xs text-gray-400">Retención automática con respaldo en la nube</p>
            </div>

            <div className="p-3 bg-secondary-700/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">Registros de Auditoría</h4>
                <span className="text-blue-400 font-bold">1 año</span>
              </div>
              <p className="text-xs text-gray-400">Bitácora completa de actividades</p>
            </div>

            <div className="p-3 bg-secondary-700/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">Versiones de Registros</h4>
                <span className="text-purple-400 font-bold">6 meses</span>
              </div>
              <p className="text-xs text-gray-400">Historial de cambios en registros</p>
            </div>
          </div>
        </div>

        {/* Métricas de auditoría */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <DocumentDuplicateIcon className="h-6 w-6 mr-2 text-blue-400" />
            Métricas de Sistema
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <span className="text-green-300 font-medium">Espacio Utilizado</span>
              <span className="text-green-400 font-bold">2.4 GB</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <span className="text-blue-300 font-medium">Registros Totales</span>
              <span className="text-blue-400 font-bold">125,847</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <span className="text-yellow-300 font-medium">Próxima Limpieza</span>
              <span className="text-yellow-400 font-bold">15 días</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <span className="text-purple-300 font-medium">Backup Automático</span>
              <span className="text-purple-400 font-bold">Activo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
