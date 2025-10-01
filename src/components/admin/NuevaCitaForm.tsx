"use client";

import { useToast } from "@/components/ui/ToastNotification";
import { useCustomersAndVehicles } from "@/hooks/useCustomersAndVehicles";
import {
  CalendarDaysIcon,
  ClockIcon,
  TruckIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface NuevaCitaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (citaData: {
    scheduledAt: string;
    estimatedDuration?: number;
    notes?: string;
    vehicleId: string;
    customerId: string;
    technicianId?: string;
  }) => Promise<void>;
}

export default function NuevaCitaForm({ isOpen, onClose, onSubmit }: NuevaCitaFormProps) {
  const { customers, loading } = useCustomersAndVehicles();
  const { showSuccess, showError, showWarning, ToastContainer } = useToast();
  const [formData, setFormData] = useState({
    telefono: "",
    vehicleId: "",
    fecha: "",
    hora: "",
    duracion: 60,
    notas: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);
  const [mostrarFormularioCliente, setMostrarFormularioCliente] = useState(false);
  const [datosClienteNuevo, setDatosClienteNuevo] = useState({
    nombre: "",
    email: "",
    direccion: "",
  });
  const [vehiculoNuevo, setVehiculoNuevo] = useState({
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    placa: "",
  });

  // Buscar cliente por teléfono
  const buscarClientePorTelefono = (telefono: string) => {
    if (!telefono || telefono.length < 8) {
      setClienteEncontrado(null);
      setMostrarFormularioCliente(false);
      return;
    }

    const cliente = customers.find((c) =>
      c.phone.replace(/\s|-/g, "").includes(telefono.replace(/\s|-/g, ""))
    );

    setClienteEncontrado(cliente || null);
    setMostrarFormularioCliente(!cliente && telefono.length >= 8);
    // Resetear vehículo seleccionado cuando cambia el cliente
    setFormData((prev) => ({ ...prev, vehicleId: "" }));
  };

  // Obtener vehículos del cliente encontrado
  const vehiculosDisponibles = clienteEncontrado?.vehicles || [];

  // Crear cliente y vehículo nuevos
  const crearClienteYVehiculo = async () => {
    try {
      // Crear cliente
      const clienteResponse = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: datosClienteNuevo.nombre,
          phone: formData.telefono,
          email: datosClienteNuevo.email || undefined,
          address: datosClienteNuevo.direccion || undefined,
        }),
      });

      if (!clienteResponse.ok) throw new Error("Error creando cliente");
      const clienteData = await clienteResponse.json();

      // Crear vehículo
      const vehiculoResponse = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: vehiculoNuevo.marca,
          model: vehiculoNuevo.modelo,
          year: vehiculoNuevo.año,
          licensePlate: vehiculoNuevo.placa || undefined,
          customerId: clienteData.customer.id,
        }),
      });

      if (!vehiculoResponse.ok) throw new Error("Error creando vehículo");
      const vehiculoData = await vehiculoResponse.json();

      // Actualizar estado con el nuevo cliente y vehículo
      const nuevoCliente = {
        ...clienteData.customer,
        vehicles: [vehiculoData.vehicle],
      };

      setClienteEncontrado(nuevoCliente);
      setFormData((prev) => ({ ...prev, vehicleId: vehiculoData.vehicle.id }));
      setMostrarFormularioCliente(false);

      showSuccess(
        "👤 Cliente Creado Exitosamente",
        `✅ ${datosClienteNuevo.nombre} y su vehículo ${vehiculoNuevo.marca} ${vehiculoNuevo.modelo} han sido registrados correctamente. Ahora puedes programar la cita.`,
        6000 // Duración más larga para mensaje informativo
      );

      return { cliente: clienteData.customer, vehiculo: vehiculoData.vehicle };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteEncontrado || !formData.vehicleId || !formData.fecha || !formData.hora) {
      if (!clienteEncontrado && mostrarFormularioCliente) {
        showWarning(
          "Cliente Requerido",
          "Primero debes crear el cliente usando el botón 'Crear Cliente y Vehículo'"
        );
      } else {
        showWarning(
          "Campos Obligatorios",
          "Por favor completa todos los campos: cliente, vehículo, fecha y hora"
        );
      }
      return;
    }

    setSubmitting(true);

    try {
      const scheduledAt = `${formData.fecha}T${formData.hora}:00`;

      await onSubmit({
        scheduledAt,
        estimatedDuration: formData.duracion,
        notes: formData.notas || undefined,
        vehicleId: formData.vehicleId,
        customerId: clienteEncontrado.id,
      });

      // Resetear formulario
      setFormData({
        telefono: "",
        vehicleId: "",
        fecha: "",
        hora: "",
        duracion: 60,
        notas: "",
      });
      setClienteEncontrado(null);
      setMostrarFormularioCliente(false);
      setDatosClienteNuevo({ nombre: "", email: "", direccion: "" });
      setVehiculoNuevo({ marca: "", modelo: "", año: new Date().getFullYear(), placa: "" });

      showSuccess(
        "✨ ¡Cita Creada Exitosamente!",
        `📅 Fecha: ${new Date(scheduledAt).toLocaleDateString("es-GT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })} a las ${new Date(scheduledAt).toLocaleTimeString("es-GT", {
          hour: "2-digit",
          minute: "2-digit",
        })}
👤 Cliente: ${clienteEncontrado.name}
🚗 Vehículo: ${clienteEncontrado.vehicles.find((v: any) => v.id === formData.vehicleId)?.brand} ${
          clienteEncontrado.vehicles.find((v: any) => v.id === formData.vehicleId)?.model
        }`,
        7000 // Duración más larga para leer toda la información
      );
      onClose();
    } catch (error) {
      console.error("Error creating appointment:", error);
      showError(
        "Error al Crear Cita",
        "No se pudo crear la cita. Verifica los datos e intenta nuevamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleTelefonoChange = (telefono: string) => {
    setFormData({ ...formData, telefono });
    buscarClientePorTelefono(telefono);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-secondary-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-primary-400/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nueva Cita</h2>
              <p className="text-sm text-gray-400">Programa una nueva cita para el taller</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cliente por Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <UserIcon className="h-4 w-4 inline mr-2" />
              Número de Teléfono del Cliente *
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleTelefonoChange(e.target.value)}
              placeholder="Ej: 5555-5555 o 55555555"
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
              disabled={loading}
            />
            {/* Mostrar información del cliente encontrado */}
            {formData.telefono && formData.telefono.length >= 8 && (
              <div className="mt-2 p-3 rounded-lg bg-secondary-700/50 border border-secondary-600">
                {clienteEncontrado ? (
                  <div className="flex items-center text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="font-medium">
                      Cliente encontrado: {clienteEncontrado.name}
                    </span>
                    {clienteEncontrado.email && (
                      <span className="text-gray-400 ml-2">({clienteEncontrado.email})</span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center text-yellow-400 mb-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      <span>Cliente no encontrado con este teléfono</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMostrarFormularioCliente(!mostrarFormularioCliente)}
                      className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                    >
                      {mostrarFormularioCliente ? "❌ Cancelar" : "➕ Crear Cliente Nuevo"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulario de Cliente Nuevo */}
          {mostrarFormularioCliente && (
            <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-primary-400 flex items-center">
                👤 Datos del Cliente Nuevo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={datosClienteNuevo.nombre}
                    onChange={(e) =>
                      setDatosClienteNuevo({ ...datosClienteNuevo, nombre: e.target.value })
                    }
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={datosClienteNuevo.email}
                    onChange={(e) =>
                      setDatosClienteNuevo({ ...datosClienteNuevo, email: e.target.value })
                    }
                    placeholder="cliente@email.com"
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dirección (opcional)
                </label>
                <input
                  type="text"
                  value={datosClienteNuevo.direccion}
                  onChange={(e) =>
                    setDatosClienteNuevo({ ...datosClienteNuevo, direccion: e.target.value })
                  }
                  placeholder="Dirección del cliente"
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <h3 className="text-lg font-semibold text-primary-400 flex items-center pt-4">
                🚗 Datos del Vehículo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Marca *</label>
                  <input
                    type="text"
                    value={vehiculoNuevo.marca}
                    onChange={(e) => setVehiculoNuevo({ ...vehiculoNuevo, marca: e.target.value })}
                    placeholder="Toyota, Honda, etc."
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Modelo *</label>
                  <input
                    type="text"
                    value={vehiculoNuevo.modelo}
                    onChange={(e) => setVehiculoNuevo({ ...vehiculoNuevo, modelo: e.target.value })}
                    placeholder="Corolla, Civic, etc."
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Año *</label>
                  <input
                    type="number"
                    value={vehiculoNuevo.año}
                    onChange={(e) =>
                      setVehiculoNuevo({ ...vehiculoNuevo, año: parseInt(e.target.value) })
                    }
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Placa (opcional)
                </label>
                <input
                  type="text"
                  value={vehiculoNuevo.placa}
                  onChange={(e) =>
                    setVehiculoNuevo({ ...vehiculoNuevo, placa: e.target.value.toUpperCase() })
                  }
                  placeholder="P123ABC"
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Botón para crear cliente */}
              <div className="pt-4 border-t border-primary-500/30">
                <button
                  type="button"
                  onClick={async () => {
                    if (
                      !datosClienteNuevo.nombre ||
                      !vehiculoNuevo.marca ||
                      !vehiculoNuevo.modelo
                    ) {
                      showWarning(
                        "Datos Incompletos",
                        "Por favor completa el nombre del cliente, marca y modelo del vehículo"
                      );
                      return;
                    }

                    try {
                      setSubmitting(true);
                      await crearClienteYVehiculo();
                    } catch (error) {
                      showError(
                        "Error al Crear Cliente",
                        "No se pudo crear el cliente y vehículo. Verifica los datos e intenta nuevamente."
                      );
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-bold shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando Cliente...
                    </div>
                  ) : (
                    "👤 Crear Cliente y Vehículo"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Vehículo - Solo mostrar si hay cliente encontrado y no se está creando uno nuevo */}
          {clienteEncontrado && !mostrarFormularioCliente && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <TruckIcon className="h-4 w-4 inline mr-2" />
                Vehículo *
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Selecciona un vehículo</option>
                {vehiculosDisponibles.map((vehicle: any) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} {vehicle.year}
                    {vehicle.licensePlate && ` - ${vehicle.licensePlate}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <CalendarDaysIcon className="h-4 w-4 inline mr-2" />
                Fecha *
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <ClockIcon className="h-4 w-4 inline mr-2" />
                Hora *
              </label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Duración Estimada */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duración Estimada (minutos)
            </label>
            <select
              value={formData.duracion}
              onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value={30}>30 min - Servicio rápido</option>
              <option value={60}>1 hora - Servicio estándar</option>
              <option value={90}>1.5 horas - Servicio intermedio</option>
              <option value={120}>2 horas - Servicio completo</option>
              <option value={180}>3 horas - Reparación mayor</option>
              <option value={240}>4 horas - Trabajo extenso</option>
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notas del Servicio
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Describe el servicio a realizar, problemas reportados, etc."
              rows={4}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-secondary-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white bg-secondary-700 hover:bg-secondary-600 rounded-lg transition-all font-medium"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all font-bold shadow-lg hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </div>
              ) : (
                "✨ Crear Cita"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
