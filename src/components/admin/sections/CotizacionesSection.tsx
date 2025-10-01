"use client";

import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface Props {
  stats: any;
}

export default function CotizacionesSection({ stats }: Props) {
  const cotizaciones = [
    {
      id: 1,
      cliente: "Juan Pérez",
      vehiculo: "Honda Civic 2018",
      total: 1250,
      estado: "pendiente",
      fecha: "2024-09-15",
    },
    {
      id: 2,
      cliente: "María García",
      vehiculo: "Toyota Corolla 2020",
      total: 850,
      estado: "aprobada",
      fecha: "2024-09-14",
    },
    {
      id: 3,
      cliente: "Carlos López",
      vehiculo: "Nissan Sentra 2019",
      total: 2100,
      estado: "enviada",
      fecha: "2024-09-13",
    },
    {
      id: 4,
      cliente: "Ana Rodríguez",
      vehiculo: "Ford Focus 2017",
      total: 950,
      estado: "rechazada",
      fecha: "2024-09-12",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas de cotizaciones */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Cotizaciones</p>
              <p className="text-3xl font-bold text-white">
                {stats?.totalCotizaciones || cotizaciones.length}
              </p>
            </div>
            <DocumentTextIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pendientes</p>
              <p className="text-3xl font-bold text-white">
                {cotizaciones.filter((c) => c.estado === "pendiente").length}
              </p>
            </div>
            <ClockIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Aprobadas</p>
              <p className="text-3xl font-bold text-white">
                {cotizaciones.filter((c) => c.estado === "aprobada").length}
              </p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Valor Total</p>
              <p className="text-3xl font-bold text-white">
                Q{cotizaciones.reduce((sum, c) => sum + c.total, 0).toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Gestión de Cotizaciones</h2>

          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2">
              <PlusIcon className="h-5 w-5" />
              <span>Nueva Cotización</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de cotizaciones */}
      <div className="bg-secondary-800 rounded-xl border border-secondary-700">
        <div className="p-6 border-b border-secondary-700">
          <h3 className="text-xl font-semibold text-white">Cotizaciones Recientes</h3>
        </div>

        <div className="p-6 space-y-4">
          {cotizaciones.map((cotizacion) => (
            <div
              key={cotizacion.id}
              className="p-6 bg-secondary-700/50 rounded-lg hover:bg-secondary-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-white">
                    COT-2024-{cotizacion.id.toString().padStart(3, "0")}
                  </h4>
                  <p className="text-sm text-gray-400">{cotizacion.cliente}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cotizacion.estado === "pendiente"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : cotizacion.estado === "aprobada"
                      ? "bg-green-500/20 text-green-400"
                      : cotizacion.estado === "enviada"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {cotizacion.estado.charAt(0).toUpperCase() + cotizacion.estado.slice(1)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Vehículo</p>
                  <p className="text-sm text-white font-medium">{cotizacion.vehiculo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Fecha</p>
                  <p className="text-sm text-white font-medium">
                    {new Date(cotizacion.fecha).toLocaleDateString("es-GT")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-sm text-white font-medium">
                    Q{cotizacion.total.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                  Ver Detalles
                </button>
                {cotizacion.estado === "pendiente" && (
                  <>
                    <button className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                      Aprobar
                    </button>
                    <button className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors flex items-center space-x-1">
                      <PaperAirplaneIcon className="h-3 w-3" />
                      <span>Enviar</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proceso de cotización */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <PlusIcon className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Crear Cotización</h3>
          </div>
          <p className="text-gray-400 mb-4">Generar nueva cotización para cliente</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Seleccionar servicios</li>
            <li>• Calcular costos</li>
            <li>• Generar documento</li>
          </ul>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Aprobar</h3>
          </div>
          <p className="text-gray-400 mb-4">Revisar y aprobar cotizaciones</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Verificar precios</li>
            <li>• Confirmar disponibilidad</li>
            <li>• Autorizar descuentos</li>
          </ul>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <PaperAirplaneIcon className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Enviar a Cliente</h3>
          </div>
          <p className="text-gray-400 mb-4">Envío automático al cliente</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Email automático</li>
            <li>• WhatsApp opcional</li>
            <li>• Seguimiento de lectura</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
