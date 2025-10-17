"use client";

import {
  BellIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  DocumentTextIcon,
  PencilIcon,
  PhotoIcon,
  TruckIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

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
  appointments?: any[];
  quotes?: any[];
  inspectionPhotos?: any[];
  _count?: {
    appointments: number;
    quotes: number;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehiculoId: string;
  onEdit: () => void;
}

export default function Ficha360Vehiculo({ isOpen, onClose, vehiculoId, onEdit }: Props) {
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (isOpen && vehiculoId) {
      cargarVehiculo();
    }
  }, [isOpen, vehiculoId]);

  const cargarVehiculo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vehiculos/${vehiculoId}`);
      const result = await response.json();

      if (result.success) {
        setVehiculo(result.data);
      } else {
        console.error("Error cargando vehículo:", result.error);
      }
    } catch (error) {
      console.error("Error cargando vehículo:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "No disponible";
    return new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const tabs = [
    { id: "general", name: "General", icon: TruckIcon },
    { id: "historial", name: "Historial", icon: CalendarIcon },
    { id: "cotizaciones", name: "Cotizaciones", icon: CurrencyDollarIcon },
    { id: "documentos", name: "Documentos", icon: DocumentIcon },
    { id: "fotos", name: "Fotos", icon: PhotoIcon },
    { id: "recordatorios", name: "Recordatorios", icon: BellIcon },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center">
            <TruckIcon className="h-6 w-6 text-blue-400 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                {vehiculo ? `${vehiculo.brand} ${vehiculo.model} ${vehiculo.year}` : "Cargando..."}
              </h2>
              {vehiculo && (
                <p className="text-gray-400 text-sm">
                  {vehiculo.licensePlate && `Placa: ${vehiculo.licensePlate}`}
                  {vehiculo.nickname && ` • ${vehiculo.nickname}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Cargando información del vehículo...</p>
            </div>
          </div>
        ) : vehiculo ? (
          <>
            {/* Tabs */}
            <div className="border-b border-secondary-700">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-400"
                          : "border-transparent text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "general" && (
                <div className="space-y-6">
                  {/* Información del Cliente */}
                  <div className="bg-secondary-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-blue-400" />
                      Información del Cliente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Nombre
                        </label>
                        <p className="text-white">{vehiculo.customer.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Teléfono
                        </label>
                        <p className="text-white">{vehiculo.customer.phone}</p>
                      </div>
                      {vehiculo.customer.email && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Email
                          </label>
                          <p className="text-white">{vehiculo.customer.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Especificaciones del Vehículo */}
                  <div className="bg-secondary-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <TruckIcon className="h-5 w-5 mr-2 text-blue-400" />
                      Especificaciones
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Marca
                        </label>
                        <p className="text-white">{vehiculo.brand}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Modelo
                        </label>
                        <p className="text-white">{vehiculo.model}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Año</label>
                        <p className="text-white">{vehiculo.year}</p>
                      </div>
                      {vehiculo.color && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Color
                          </label>
                          <p className="text-white">{vehiculo.color}</p>
                        </div>
                      )}
                      {vehiculo.mileage && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Kilometraje
                          </label>
                          <p className="text-white">{vehiculo.mileage.toLocaleString()} km</p>
                        </div>
                      )}
                      {vehiculo.fuelType && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Combustible
                          </label>
                          <p className="text-white capitalize">{vehiculo.fuelType}</p>
                        </div>
                      )}
                      {vehiculo.transmission && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Transmisión
                          </label>
                          <p className="text-white capitalize">{vehiculo.transmission}</p>
                        </div>
                      )}
                      {vehiculo.vin && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            VIN
                          </label>
                          <p className="text-white font-mono text-sm">{vehiculo.vin}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Código de Seguimiento
                        </label>
                        <p className="text-white font-mono text-sm">{vehiculo.trackingCode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mantenimiento */}
                  <div className="bg-secondary-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-blue-400" />
                      Información de Mantenimiento
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vehiculo.nextServiceAtDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Próximo Servicio (Fecha)
                          </label>
                          <p className="text-white">{formatearFecha(vehiculo.nextServiceAtDate)}</p>
                          {(() => {
                            const dias = calcularDiasProximoMantenimiento(
                              vehiculo.nextServiceAtDate!
                            );
                            if (dias !== null) {
                              if (dias < 0) {
                                return (
                                  <p className="text-red-400 text-sm">
                                    Vencido hace {Math.abs(dias)} días
                                  </p>
                                );
                              } else if (dias === 0) {
                                return <p className="text-yellow-400 text-sm">¡Hoy!</p>;
                              } else if (dias <= 7) {
                                return <p className="text-orange-400 text-sm">En {dias} días</p>;
                              } else {
                                return <p className="text-green-400 text-sm">En {dias} días</p>;
                              }
                            }
                            return null;
                          })()}
                        </div>
                      )}
                      {vehiculo.nextServiceAtKm && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Próximo Servicio (Kilometraje)
                          </label>
                          <p className="text-white">
                            {vehiculo.nextServiceAtKm.toLocaleString()} km
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notas */}
                  {vehiculo.notes && (
                    <div className="bg-secondary-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-400" />
                        Notas
                      </h3>
                      <p className="text-gray-300 whitespace-pre-wrap">{vehiculo.notes}</p>
                    </div>
                  )}

                  {/* Estadísticas Rápidas */}
                  <div className="bg-secondary-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <ChartBarIcon className="h-5 w-5 mr-2 text-blue-400" />
                      Estadísticas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">
                          {vehiculo._count?.appointments || 0}
                        </p>
                        <p className="text-gray-400 text-sm">Citas Totales</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {vehiculo._count?.quotes || 0}
                        </p>
                        <p className="text-gray-400 text-sm">Cotizaciones</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-400">
                          {vehiculo.inspectionPhotos?.length || 0}
                        </p>
                        <p className="text-gray-400 text-sm">Fotos de Inspección</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "historial" && (
                <div className="space-y-6">
                  <div className="bg-secondary-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Historial de Citas</h3>
                    {vehiculo.appointments && vehiculo.appointments.length > 0 ? (
                      <div className="space-y-4">
                        {vehiculo.appointments.map((cita: any) => (
                          <div key={cita.id} className="p-4 bg-secondary-600 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-white">{cita.service}</h4>
                              <span className="text-xs text-gray-400">
                                {formatearFecha(cita.scheduledDate)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{cita.description}</p>
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  cita.status === "completed"
                                    ? "bg-green-500/20 text-green-400"
                                    : cita.status === "in_progress"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-gray-500/20 text-gray-400"
                                }`}
                              >
                                {cita.status}
                              </span>
                              {cita.totalCost && (
                                <span className="text-sm text-white font-medium">
                                  Q{cita.totalCost.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-8">
                        No hay historial de citas para este vehículo
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "cotizaciones" && (
                <div className="space-y-6">
                  <div className="bg-secondary-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Cotizaciones</h3>
                    {vehiculo.quotes && vehiculo.quotes.length > 0 ? (
                      <div className="space-y-4">
                        {vehiculo.quotes.map((cotizacion: any) => (
                          <div key={cotizacion.id} className="p-4 bg-secondary-600 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-white">{cotizacion.service}</h4>
                              <span className="text-xs text-gray-400">
                                {formatearFecha(cotizacion.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{cotizacion.description}</p>
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  cotizacion.status === "approved"
                                    ? "bg-green-500/20 text-green-400"
                                    : cotizacion.status === "pending"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {cotizacion.status}
                              </span>
                              <span className="text-sm text-white font-medium">
                                Q{cotizacion.totalCost?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-8">
                        No hay cotizaciones para este vehículo
                      </p>
                    )}
                  </div>
                </div>
              )}

              {["documentos", "fotos", "recordatorios"].map(
                (tabId) =>
                  activeTab === tabId && (
                    <div key={tabId} className="space-y-6">
                      <div className="bg-secondary-700 rounded-lg p-8 text-center">
                        <DocumentIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">
                          {tabId === "documentos" && "Documentos"}
                          {tabId === "fotos" && "Fotos de Inspección"}
                          {tabId === "recordatorios" && "Recordatorios"}
                        </h3>
                        <p className="text-gray-400 mb-4">
                          Esta sección estará disponible próximamente
                        </p>
                      </div>
                    </div>
                  )
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">No se pudo cargar la información del vehículo</p>
          </div>
        )}
      </div>
    </div>
  );
}
