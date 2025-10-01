"use client";

import { useCustomersAndVehicles } from "@/hooks/useCustomersAndVehicles";
import {
  CalendarDaysIcon,
  CheckIcon,
  ClockIcon,
  TruckIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface EditarCitaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    citaId: string,
    citaData: {
      scheduledAt: string;
      estimatedDuration?: number;
      notes?: string;
      status: string;
    }
  ) => Promise<void>;
  cita: {
    id: string;
    cliente: string;
    vehiculo: string;
    servicio: string;
    fecha: string;
    hora: string;
    estado: string;
    _original: any;
  } | null;
}

export default function EditarCitaForm({ isOpen, onClose, onSubmit, cita }: EditarCitaFormProps) {
  const { customers, loading } = useCustomersAndVehicles();
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    duracion: 60,
    notas: "",
    estado: "SCHEDULED",
  });
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos de la cita cuando se abre el modal
  useEffect(() => {
    if (cita && isOpen) {
      const scheduledAt = new Date(cita._original.scheduledAt);
      setFormData({
        fecha: scheduledAt.toISOString().split("T")[0],
        hora: scheduledAt.toTimeString().slice(0, 5),
        duracion: cita._original.estimatedDuration || 60,
        notas: cita._original.notes || "",
        estado: cita._original.status,
      });
    }
  }, [cita, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cita || !formData.fecha || !formData.hora) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    setSubmitting(true);

    try {
      const scheduledAt = `${formData.fecha}T${formData.hora}:00`;

      await onSubmit(cita.id, {
        scheduledAt,
        estimatedDuration: formData.duracion,
        notes: formData.notas || undefined,
        status: formData.estado,
      });

      onClose();
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Error al actualizar la cita. Por favor intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !cita) return null;

  const statusOptions = [
    { value: "SCHEDULED", label: "⏳ Pendiente", color: "text-yellow-400" },
    { value: "IN_PROGRESS", label: "🔧 En Proceso", color: "text-blue-400" },
    { value: "COMPLETED", label: "✅ Completada", color: "text-green-400" },
    { value: "CANCELLED", label: "❌ Cancelada", color: "text-red-400" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-secondary-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-primary-400/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Editar Cita</h2>
              <p className="text-sm text-gray-400">Modificar detalles de la cita programada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Información del Cliente y Vehículo (Solo lectura) */}
        <div className="p-6 bg-secondary-700/50 border-b border-secondary-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-primary-400" />
              <div>
                <p className="text-sm text-gray-400">Cliente</p>
                <p className="text-white font-medium">{cita.cliente}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TruckIcon className="h-5 w-5 text-primary-400" />
              <div>
                <p className="text-sm text-gray-400">Vehículo</p>
                <p className="text-white font-medium">{cita.vehiculo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado de la Cita
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-bold shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Actualizar Cita
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
