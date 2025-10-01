"use client";

import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

interface Props {
  stats: any;
}

export default function VehiculosSection({ stats }: Props) {
  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Vehículos</p>
              <p className="text-3xl font-bold text-white">{stats?.totalVehiculos || 0}</p>
            </div>
            <TruckIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">En Reparación</p>
              <p className="text-3xl font-bold text-white">{stats?.citasEnProceso || 0}</p>
            </div>
            <WrenchScrewdriverIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Mantenimientos</p>
              <p className="text-3xl font-bold text-white">24</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Inspecciones</p>
              <p className="text-3xl font-bold text-white">8</p>
            </div>
            <ClipboardDocumentListIcon className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Herramientas de gestión */}
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Base de Datos de Vehículos</h2>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por placa, marca, modelo..."
                className="pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
              />
            </div>

            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2">
              <PlusIcon className="h-5 w-5" />
              <span>Nuevo Vehículo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secciones principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos Técnicos */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <WrenchScrewdriverIcon className="h-6 w-6 mr-2 text-blue-400" />
            Datos Técnicos
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-secondary-700/50 rounded-lg hover:bg-secondary-700 transition-colors cursor-pointer">
              <h4 className="font-medium text-white mb-2">Especificaciones del Motor</h4>
              <p className="text-sm text-gray-400">Tipo, cilindrada, potencia, combustible</p>
            </div>

            <div className="p-4 bg-secondary-700/50 rounded-lg hover:bg-secondary-700 transition-colors cursor-pointer">
              <h4 className="font-medium text-white mb-2">Sistema de Transmisión</h4>
              <p className="text-sm text-gray-400">Manual, automática, CVT, tipo de tracción</p>
            </div>

            <div className="p-4 bg-secondary-700/50 rounded-lg hover:bg-secondary-700 transition-colors cursor-pointer">
              <h4 className="font-medium text-white mb-2">Dimensiones y Peso</h4>
              <p className="text-sm text-gray-400">Largo, ancho, alto, peso, capacidad de carga</p>
            </div>

            <div className="p-4 bg-secondary-700/50 rounded-lg hover:bg-secondary-700 transition-colors cursor-pointer">
              <h4 className="font-medium text-white mb-2">Sistemas de Seguridad</h4>
              <p className="text-sm text-gray-400">ABS, airbags, control de estabilidad</p>
            </div>
          </div>
        </div>

        {/* Historial de Reparaciones */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ClipboardDocumentListIcon className="h-6 w-6 mr-2 text-green-400" />
            Historial de Reparaciones
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-secondary-700/50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white">Cambio de Aceite</h4>
                <span className="text-xs text-gray-400">15/09/2024</span>
              </div>
              <p className="text-sm text-gray-400 mb-2">Cambio de aceite 5W-30 y filtro</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-400">Completado</span>
                <span className="text-sm text-white font-medium">Q180.00</span>
              </div>
            </div>

            <div className="p-4 bg-secondary-700/50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white">Revisión de Frenos</h4>
                <span className="text-xs text-gray-400">10/09/2024</span>
              </div>
              <p className="text-sm text-gray-400 mb-2">Inspección sistema de frenos</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-400">En Proceso</span>
                <span className="text-sm text-white font-medium">Q350.00</span>
              </div>
            </div>

            <div className="p-4 bg-secondary-700/50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white">Diagnóstico General</h4>
                <span className="text-xs text-gray-400">05/09/2024</span>
              </div>
              <p className="text-sm text-gray-400 mb-2">Scanner y revisión completa</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-400">Completado</span>
                <span className="text-sm text-white font-medium">Q120.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
