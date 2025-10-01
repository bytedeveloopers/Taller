"use client";

import {
  EnvelopeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface Props {
  stats: any;
}

export default function ClientesSection({ stats }: Props) {
  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Clientes</p>
              <p className="text-3xl font-bold text-white">{stats?.totalClientes || 0}</p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Clientes Activos</p>
              <p className="text-3xl font-bold text-white">
                {Math.floor((stats?.totalClientes || 0) * 0.8)}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Nuevos Este Mes</p>
              <p className="text-3xl font-bold text-white">12</p>
            </div>
            <PlusIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Acciones y filtros */}
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Gestión de Clientes</h2>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                className="pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2">
              <PlusIcon className="h-5 w-5" />
              <span>Nuevo Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de funcionalidades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registro de Clientes */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Registro de Clientes</h3>
          </div>
          <p className="text-gray-400 mb-4">Crear y gestionar perfiles completos de clientes</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Datos personales y de contacto</li>
            <li>• Información de facturación</li>
            <li>• Preferencias y notas</li>
          </ul>
        </div>

        {/* Consulta de Datos */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <MagnifyingGlassIcon className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Consulta de Datos</h3>
          </div>
          <p className="text-gray-400 mb-4">Búsqueda avanzada y consulta de información</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Búsqueda por nombre, teléfono, email</li>
            <li>• Filtros avanzados</li>
            <li>• Exportar listados</li>
          </ul>
        </div>

        {/* Historial de Servicios */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <PhoneIcon className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Historial de Servicios</h3>
          </div>
          <p className="text-gray-400 mb-4">Seguimiento completo de servicios realizados</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Historial completo de citas</li>
            <li>• Servicios realizados</li>
            <li>• Gastos y facturación</li>
          </ul>
        </div>
      </div>

      {/* Próximamente */}
      <div className="bg-gradient-to-r from-primary-900/50 to-secondary-800 rounded-xl p-6 border border-primary-500/30">
        <h3 className="text-xl font-semibold text-white mb-4">🚀 Próximamente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-5 w-5 text-primary-400" />
            <span className="text-gray-300">Sistema de notificaciones por email</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPinIcon className="h-5 w-5 text-primary-400" />
            <span className="text-gray-300">Geolocalización de clientes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
