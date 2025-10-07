"use client";

import {
  ArrowPathIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface Vehiculo {
  id: string;
  licensePlate?: string;
  vin?: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  nickname?: string;
  notes?: string;
  nextServiceAtDate?: string;
  nextServiceAtKm?: number;
  customerId: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  status: string;
  isActive: boolean;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    appointments: number;
    quotes: number;
  };
  lastVisit?: string;
}

interface Props {
  vehiculos: Vehiculo[];
  loading: boolean;
  onEditarVehiculo: (vehiculo: Vehiculo) => void;
  onVerFicha360: (vehiculo: Vehiculo) => void;
  onEliminarVehiculo: (vehiculoId: string) => void;
  onRecargar: () => void;
}

export default function ListadoVehiculos({
  vehiculos,
  loading,
  onEditarVehiculo,
  onVerFicha360,
  onEliminarVehiculo,
  onRecargar,
}: Props) {
  const [vistaTabla, setVistaTabla] = useState(true);

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "No disponible";
    return new Date(fecha).toLocaleDateString("es-GT");
  };

  const calcularDiasProximoMantenimiento = (fecha: string) => {
    if (!fecha) return null;
    const hoy = new Date();
    const fechaMantenimiento = new Date(fecha);
    const diferencia = Math.ceil(
      (fechaMantenimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diferencia;
  };

  const getEstadoBadge = (vehiculo: Vehiculo) => {
    if (!vehiculo.isActive) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">
          Inactivo
        </span>
      );
    }

    if (vehiculo.status === "en_taller") {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-400">
          En Taller
        </span>
      );
    }

    const dias = vehiculo.nextServiceAtDate
      ? calcularDiasProximoMantenimiento(vehiculo.nextServiceAtDate)
      : null;
    if (dias !== null && dias <= 7) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">
          Mantenimiento Urgente
        </span>
      );
    } else if (dias !== null && dias <= 30) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
          Mantenimiento Próximo
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Activo</span>
    );
  };

  if (loading) {
    return (
      <div className="bg-secondary-800 rounded-xl p-8 border border-secondary-700">
        <div className="flex items-center justify-center">
          <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-400">Cargando vehículos...</span>
        </div>
      </div>
    );
  }

  if (vehiculos.length === 0) {
    return (
      <div className="bg-secondary-800 rounded-xl p-8 border border-secondary-700 text-center">
        <TruckIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No hay vehículos</h3>
        <p className="text-gray-400 mb-4">No se encontraron vehículos con los filtros actuales</p>
        <button
          onClick={onRecargar}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-secondary-800 rounded-xl border border-secondary-700">
      {/* Header de la tabla */}
      <div className="p-6 border-b border-secondary-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Vehículos ({vehiculos.length})</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onRecargar}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Recargar"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setVistaTabla(!vistaTabla)}
              className="px-3 py-1 text-sm bg-secondary-700 text-gray-300 rounded hover:bg-secondary-600 transition-colors"
            >
              {vistaTabla ? "Vista Tarjetas" : "Vista Tabla"}
            </button>
          </div>
        </div>
      </div>

      {vistaTabla ? (
        // Vista de tabla
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Vehículo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Mantenimiento
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Última Visita
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-700">
              {vehiculos.map((vehiculo) => (
                <tr key={vehiculo.id} className="hover:bg-secondary-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-secondary-600 flex items-center justify-center">
                          <TruckIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {vehiculo.brand} {vehiculo.model} {vehiculo.year}
                        </div>
                        <div className="text-sm text-gray-400">
                          {vehiculo.licensePlate && `Placa: ${vehiculo.licensePlate}`}
                          {vehiculo.nickname && ` • ${vehiculo.nickname}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{vehiculo.customer.name}</div>
                    <div className="text-sm text-gray-400">{vehiculo.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4">{getEstadoBadge(vehiculo)}</td>
                  <td className="px-6 py-4">
                    {vehiculo.nextServiceAtDate ? (
                      <div className="text-sm">
                        <div className="text-white">
                          {formatearFecha(vehiculo.nextServiceAtDate)}
                        </div>
                        {(() => {
                          const dias = calcularDiasProximoMantenimiento(vehiculo.nextServiceAtDate);
                          if (dias !== null) {
                            if (dias < 0) {
                              return (
                                <div className="text-red-400 text-xs">
                                  Vencido hace {Math.abs(dias)} días
                                </div>
                              );
                            } else if (dias === 0) {
                              return <div className="text-yellow-400 text-xs">¡Hoy!</div>;
                            } else {
                              return <div className="text-gray-400 text-xs">En {dias} días</div>;
                            }
                          }
                          return null;
                        })()}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No programado</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400">
                      {vehiculo.lastVisit ? formatearFecha(vehiculo.lastVisit) : "Sin visitas"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onVerFicha360(vehiculo)}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Ver ficha 360°"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditarVehiculo(vehiculo)}
                        className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEliminarVehiculo(vehiculo.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Desactivar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Vista de tarjetas
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehiculos.map((vehiculo) => (
              <div
                key={vehiculo.id}
                className="bg-secondary-700 rounded-lg p-6 border border-secondary-600 hover:border-secondary-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-lg bg-secondary-600 flex items-center justify-center mr-3">
                      <TruckIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">
                        {vehiculo.brand} {vehiculo.model}
                      </h4>
                      <p className="text-gray-400 text-sm">{vehiculo.year}</p>
                    </div>
                  </div>
                  {getEstadoBadge(vehiculo)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cliente:</span>
                    <span className="text-white">{vehiculo.customer.name}</span>
                  </div>
                  {vehiculo.licensePlate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Placa:</span>
                      <span className="text-white">{vehiculo.licensePlate}</span>
                    </div>
                  )}
                  {vehiculo.mileage && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kilometraje:</span>
                      <span className="text-white">{vehiculo.mileage?.toLocaleString()} km</span>
                    </div>
                  )}
                  {vehiculo.nextServiceAtDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Próximo servicio:</span>
                      <span className="text-white">
                        {formatearFecha(vehiculo.nextServiceAtDate)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-secondary-600">
                  <div className="text-xs text-gray-400">
                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {vehiculo._count?.appointments || 0} citas
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onVerFicha360(vehiculo)}
                      className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Ver ficha 360°"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditarVehiculo(vehiculo)}
                      className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEliminarVehiculo(vehiculo.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Desactivar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
