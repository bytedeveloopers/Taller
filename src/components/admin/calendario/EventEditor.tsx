"use client";

import {
  AppointmentStatus,
  CalendarEvent,
  CalendarEventCreate,
  Customer,
  EVENT_TYPE_LABELS,
  EventType,
  Task,
  User,
  Vehicle,
} from "@/types";
import {
  CalendarDaysIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";

interface EventEditorProps {
  event: CalendarEvent | null;
  mode: "create" | "edit";
  technicians: User[];
  customers: Customer[];
  tasks: Task[];
  onSave: () => void;
  onCancel: () => void;
}

const EventEditor: React.FC<EventEditorProps> = ({
  event,
  mode,
  technicians,
  customers,
  tasks,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Datos del formulario
  const [formData, setFormData] = useState<CalendarEventCreate>({
    title: event?.title || "",
    type: event?.type || "CITA",
    scheduledAt: event?.scheduledAt || new Date(),
    startAt: event?.startAt || undefined,
    endAt: event?.endAt || undefined,
    estimatedDuration: event?.estimatedDuration || 60,
    location: event?.location || "",
    note: event?.note || "",
    vehicleId: event?.vehicleId || "",
    customerId: event?.customerId || "",
    technicianId: event?.technicianId || "",
    taskId: event?.taskId || "",
    reminder24h: event?.reminder24h || false,
    reminder1h: event?.reminder1h || false,
    reminder15m: event?.reminder15m || false,
    isBlocker: event?.isBlocker || false,
  });

  const [status, setStatus] = useState<AppointmentStatus>(event?.status || "SCHEDULED");

  useEffect(() => {
    if (formData.customerId) {
      loadVehicles(formData.customerId);
    }
  }, [formData.customerId]);

  useEffect(() => {
    // Auto-calcular endAt basado en startAt y duración
    if (formData.startAt && formData.estimatedDuration) {
      const endTime = new Date(formData.startAt);
      endTime.setMinutes(endTime.getMinutes() + formData.estimatedDuration);
      setFormData((prev) => ({ ...prev, endAt: endTime }));
    }
  }, [formData.startAt, formData.estimatedDuration]);

  const loadVehicles = useCallback(async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/vehicles`);
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.data || []);
      }
    } catch (error) {
      console.error("Error cargando vehículos:", error);
    }
  }, []);

  const handleInputChange = (field: keyof CalendarEventCreate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (
    field: "scheduledAt" | "startAt" | "endAt",
    dateValue: string,
    timeValue: string
  ) => {
    if (dateValue && timeValue) {
      const newDateTime = new Date(`${dateValue}T${timeValue}`);
      handleInputChange(field, newDateTime);
    }
  };

  const validateForm = () => {
    if (!formData.scheduledAt) {
      alert("La fecha y hora son requeridas");
      return false;
    }

    if (formData.isBlocker && !formData.technicianId) {
      alert("Los bloqueos requieren seleccionar un técnico");
      return false;
    }

    if (formData.startAt && formData.endAt && formData.startAt >= formData.endAt) {
      alert("La hora de fin debe ser posterior a la hora de inicio");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const eventData = {
        ...formData,
        status,
        // Si no se especifica startAt, usar scheduledAt
        startAt: formData.startAt || formData.scheduledAt,
      };

      const url =
        mode === "create" ? "/api/calendario/events" : `/api/calendario/events/${event!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        onSave();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al guardar el evento");
      }
    } catch (error) {
      console.error("Error guardando evento:", error);
      alert("Error al guardar el evento");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!event) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/calendario/events/${event.id}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        onSave();
      } else {
        alert("Error al duplicar evento");
      }
    } catch (error) {
      console.error("Error duplicando evento:", error);
      alert("Error al duplicar evento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !confirm("¿Está seguro de eliminar este evento?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/calendario/events/${event.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onSave();
      } else {
        alert("Error al eliminar evento");
      }
    } catch (error) {
      console.error("Error eliminando evento:", error);
      alert("Error al eliminar evento");
    } finally {
      setLoading(false);
    }
  };

  const getFormattedDateTime = (date: Date) => {
    return {
      dateValue: date.toISOString().split("T")[0],
      timeValue: date.toTimeString().split(" ")[0].slice(0, 5),
    };
  };

  const scheduledDateTime = getFormattedDateTime(formData.scheduledAt);
  const startDateTime = formData.startAt
    ? getFormattedDateTime(formData.startAt)
    : { dateValue: "", timeValue: "" };
  const endDateTime = formData.endAt
    ? getFormattedDateTime(formData.endAt)
    : { dateValue: "", timeValue: "" };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-secondary-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary-600 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <CalendarDaysIcon className="h-6 w-6 mr-2" />
              {mode === "create" ? "Nuevo Evento" : "Editar Evento"}
            </h2>
            <p className="text-gray-400">
              {mode === "create"
                ? "Crear un nuevo evento en el calendario"
                : "Modificar evento existente"}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
              Información Básica
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Título (opcional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Descripción personalizada del evento"
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tipo de Evento *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value as EventType)}
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Fecha y Hora Principal *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={scheduledDateTime.dateValue}
                  onChange={(e) =>
                    handleTimeChange("scheduledAt", e.target.value, scheduledDateTime.timeValue)
                  }
                  className="px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="time"
                  value={scheduledDateTime.timeValue}
                  onChange={(e) =>
                    handleTimeChange("scheduledAt", scheduledDateTime.dateValue, e.target.value)
                  }
                  className="px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Hora de Inicio (si difiere de la principal)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDateTime.dateValue}
                  onChange={(e) =>
                    handleTimeChange("startAt", e.target.value, startDateTime.timeValue)
                  }
                  className="px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="time"
                  value={startDateTime.timeValue}
                  onChange={(e) =>
                    handleTimeChange("startAt", startDateTime.dateValue, e.target.value)
                  }
                  className="px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Duración Estimada (minutos)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) =>
                  handleInputChange("estimatedDuration", parseInt(e.target.value) || 60)
                }
                min="15"
                step="15"
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {formData.endAt && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Hora de Fin</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={endDateTime.dateValue}
                    onChange={(e) =>
                      handleTimeChange("endAt", e.target.value, endDateTime.timeValue)
                    }
                    className="px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="time"
                    value={endDateTime.timeValue}
                    onChange={(e) =>
                      handleTimeChange("endAt", endDateTime.dateValue, e.target.value)
                    }
                    className="px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {mode === "edit" && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Estado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="SCHEDULED">Programado</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>
            )}
          </div>

          {/* Asociaciones y configuración */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Asociaciones
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Técnico</label>
              <select
                value={formData.technicianId}
                onChange={(e) => handleInputChange("technicianId", e.target.value)}
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin asignar</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Cliente</label>
              <select
                value={formData.customerId}
                onChange={(e) => handleInputChange("customerId", e.target.value)}
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            {formData.customerId && vehicles.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Vehículo</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => handleInputChange("vehicleId", e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sin vehículo específico</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} {vehicle.year} - {vehicle.licensePlate}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tarea/OT Relacionada
              </label>
              <select
                value={formData.taskId}
                onChange={(e) => handleInputChange("taskId", e.target.value)}
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin tarea asociada</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title} - {task.vehicle?.brand} {task.vehicle?.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                Ubicación
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Dirección o lugar del evento"
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Notas</label>
              <textarea
                value={formData.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
                placeholder="Observaciones adicionales..."
                rows={3}
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Recordatorios */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Recordatorios
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.reminder24h}
                    onChange={(e) => handleInputChange("reminder24h", e.target.checked)}
                    className="rounded border-secondary-500 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-400">24 horas antes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.reminder1h}
                    onChange={(e) => handleInputChange("reminder1h", e.target.checked)}
                    className="rounded border-secondary-500 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-400">1 hora antes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.reminder15m}
                    onChange={(e) => handleInputChange("reminder15m", e.target.checked)}
                    className="rounded border-secondary-500 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-400">15 minutos antes</span>
                </label>
              </div>
            </div>

            {/* Bloqueo */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isBlocker}
                  onChange={(e) => handleInputChange("isBlocker", e.target.checked)}
                  className="rounded border-secondary-500 text-red-600 focus:ring-red-500 focus:ring-2"
                />
                <span className="text-gray-400">Es un bloqueo (vacaciones/licencia)</span>
              </label>
              {formData.isBlocker && (
                <p className="text-yellow-400 text-sm mt-1">
                  Los bloqueos impiden asignar nuevas tareas al técnico en este período.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center pt-6 border-t border-secondary-600 mt-6">
          <div className="flex space-x-3">
            {mode === "edit" && (
              <>
                <button
                  onClick={handleDuplicate}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  disabled={loading}
                >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                  <span>Duplicar</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  disabled={loading}
                >
                  <TrashIcon className="h-5 w-5" />
                  <span>Eliminar</span>
                </button>
              </>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              disabled={loading}
            >
              <CheckIcon className="h-5 w-5" />
              <span>{loading ? "Guardando..." : "Guardar"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventEditor;
