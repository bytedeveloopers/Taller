"use client";

import { useToast } from "@/components/ui/ToastNotification";
import { createEventFromTaskAssignment } from "@/lib/calendar-integration";
import {
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface Tecnico {
  id: string;
  name: string;
  email: string;
  carga: {
    porcentaje: number;
    color: string;
    tareas: number;
    citas: number;
    horasEstimadas: number;
    detalle: string;
  };
}

interface Recordatorio {
  titulo: string;
  tipo: "cita" | "recogida" | "entrega" | "llamada";
  fechaInicio: string;
  fechaFin: string;
  lugar?: string;
  duracion: number;
}

interface AsignarTecnicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleInfo: {
    cliente: string;
    vehiculo: string;
    placa: string;
    codigoSeguimiento: string;
  };
  tecnicoActual?: string | null;
  onSuccess: (data: any) => void;
}

export default function AsignarTecnicoModal({
  isOpen,
  onClose,
  vehicleId,
  vehicleInfo,
  tecnicoActual,
  onSuccess,
}: AsignarTecnicoModalProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTecnicos, setLoadingTecnicos] = useState(false);

  // Estados del formulario
  const [selectedTecnico, setSelectedTecnico] = useState<string>("");
  const [notas, setNotas] = useState("");
  const [crearRecordatorio, setCrearRecordatorio] = useState(false);
  const [recordatorio, setRecordatorio] = useState<Recordatorio>({
    titulo: "",
    tipo: "cita",
    fechaInicio: "",
    fechaFin: "",
    lugar: "",
    duracion: 60,
  });
  const [crearEventoCalendario, setCrearEventoCalendario] = useState(false);

  // Cargar técnicos con su carga de trabajo
  const cargarTecnicos = async () => {
    setLoadingTecnicos(true);
    try {
      const response = await fetch("/api/tecnicos/carga");
      const result = await response.json();

      if (result.success) {
        setTecnicos(result.data);
      } else {
        showError("Error", "No se pudieron cargar los técnicos");
      }
    } catch (error) {
      console.error("Error al cargar técnicos:", error);
      showError("Error", "Error de conexión al cargar técnicos");
    } finally {
      setLoadingTecnicos(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarTecnicos();
      // Configurar fecha por defecto para recordatorio (mañana a las 10:00)
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      mañana.setHours(10, 0, 0, 0);
      const fechaInicio = mañana.toISOString().slice(0, 16);

      const fechaFin = new Date(mañana);
      fechaFin.setHours(11, 0, 0, 0);

      setRecordatorio((prev) => ({
        ...prev,
        fechaInicio,
        fechaFin: fechaFin.toISOString().slice(0, 16),
      }));
    }
  }, [isOpen]);

  // Limpiar formulario al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSelectedTecnico("");
      setNotas("");
      setCrearRecordatorio(false);
      setCrearEventoCalendario(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTecnico) {
      showWarning("Campo Requerido", "Debe seleccionar un técnico");
      return;
    }

    if (crearRecordatorio && !recordatorio.titulo.trim()) {
      showWarning("Campo Requerido", "Debe ingresar un título para el recordatorio");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vehicleId,
        technicianId: selectedTecnico,
        notas: notas.trim() || null,
        crearRecordatorio,
        recordatorio: crearRecordatorio ? recordatorio : null,
      };

      const response = await fetch("/api/asignacion/tecnico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        const tecnicoSeleccionado = tecnicos.find((t) => t.id === selectedTecnico);

        showSuccess(
          result.data.isReasignacion ? "Técnico Reasignado" : "Técnico Asignado",
          `${vehicleInfo.vehiculo} (${vehicleInfo.placa}) ${
            result.data.isReasignacion ? "reasignado" : "asignado"
          } a ${tecnicoSeleccionado?.name}`
        );

        if (result.data.recordatorio) {
          showSuccess(
            "Recordatorio Creado",
            `${result.data.recordatorio.tipo.toUpperCase()}: ${result.data.recordatorio.titulo}`
          );
        }

        // Crear evento de calendario si está seleccionado
        if (crearEventoCalendario && result.data.task) {
          try {
            // Programar el evento para mañana a las 10:00 AM por defecto
            const mañana = new Date();
            mañana.setDate(mañana.getDate() + 1);
            mañana.setHours(10, 0, 0, 0);

            await createEventFromTaskAssignment(
              result.data.task.id,
              selectedTecnico,
              mañana,
              "CITA"
            );

            showSuccess(
              "Evento de Calendario Creado",
              "Se ha programado automáticamente un evento en el calendario"
            );
          } catch (error) {
            console.error("Error al crear evento de calendario:", error);
            // No mostramos error al usuario para no interrumpir el flujo principal
          }
        }

        onSuccess(result.data);
        onClose();
      } else {
        showError("Error", result.error || "No se pudo asignar el técnico");
      }
    } catch (error) {
      console.error("Error al asignar técnico:", error);
      showError("Error", "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const getCargaColor = (color: string) => {
    switch (color) {
      case "green":
        return "text-green-500 bg-green-500/10";
      case "yellow":
        return "text-yellow-500 bg-yellow-500/10";
      case "red":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getCargaIcon = (color: string) => {
    switch (color) {
      case "green":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "yellow":
        return <ClockIcon className="h-4 w-4" />;
      case "red":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-secondary-800 border border-secondary-700 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <UserIcon className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {tecnicoActual ? "Reasignar Técnico" : "Asignar Técnico"}
                </h2>
                <p className="text-sm text-gray-400">
                  {vehicleInfo.cliente} - {vehicleInfo.vehiculo} ({vehicleInfo.placa})
                </p>
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
            {/* Selección de Técnico */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Técnico <span className="text-red-400">*</span>
              </label>

              {loadingTecnicos ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tecnicos.map((tecnico) => (
                    <label
                      key={tecnico.id}
                      className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all hover:bg-secondary-700/50 ${
                        selectedTecnico === tecnico.id
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-secondary-600 bg-secondary-700/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tecnico"
                        value={tecnico.id}
                        checked={selectedTecnico === tecnico.id}
                        onChange={(e) => setSelectedTecnico(e.target.value)}
                        className="sr-only"
                      />

                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-secondary-600 rounded-lg">
                            <UserIcon className="h-5 w-5 text-gray-300" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{tecnico.name}</h3>
                            <p className="text-sm text-gray-400">{tecnico.email}</p>
                            <p className="text-xs text-gray-500">{tecnico.carga.detalle}</p>
                          </div>
                        </div>

                        {/* Semáforo de carga */}
                        <div
                          className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getCargaColor(
                            tecnico.carga.color
                          )}`}
                        >
                          {getCargaIcon(tecnico.carga.color)}
                          <span className="text-sm font-medium">{tecnico.carga.porcentaje}%</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Notas adicionales</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="Comentarios adicionales sobre la asignación..."
              />
            </div>

            {/* Toggle Recordatorio */}
            <div className="flex items-center justify-between p-4 bg-secondary-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-500/10 rounded-lg">
                  <BellIcon className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Crear recordatorio</h3>
                  <p className="text-sm text-gray-400">
                    Programar una cita o recordatorio relacionado
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={crearRecordatorio}
                  onChange={(e) => setCrearRecordatorio(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-600 peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {/* Campos del Recordatorio */}
            {crearRecordatorio && (
              <div className="space-y-4 p-4 bg-secondary-700/30 rounded-lg border border-secondary-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Título <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={recordatorio.titulo}
                      onChange={(e) =>
                        setRecordatorio((prev) => ({ ...prev, titulo: e.target.value }))
                      }
                      className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      placeholder="Ej: Recogida de vehículo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Tipo</label>
                    <select
                      value={recordatorio.tipo}
                      onChange={(e) =>
                        setRecordatorio((prev) => ({ ...prev, tipo: e.target.value as any }))
                      }
                      className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="cita">Cita</option>
                      <option value="recogida">Recogida</option>
                      <option value="entrega">Entrega</option>
                      <option value="llamada">Llamada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Fecha y hora inicio
                    </label>
                    <input
                      type="datetime-local"
                      value={recordatorio.fechaInicio}
                      onChange={(e) =>
                        setRecordatorio((prev) => ({ ...prev, fechaInicio: e.target.value }))
                      }
                      className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Duración (minutos)
                    </label>
                    <input
                      type="number"
                      value={recordatorio.duracion}
                      onChange={(e) =>
                        setRecordatorio((prev) => ({
                          ...prev,
                          duracion: parseInt(e.target.value) || 60,
                        }))
                      }
                      min="15"
                      max="480"
                      step="15"
                      className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Lugar (opcional)
                  </label>
                  <input
                    type="text"
                    value={recordatorio.lugar}
                    onChange={(e) =>
                      setRecordatorio((prev) => ({ ...prev, lugar: e.target.value }))
                    }
                    className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    placeholder="Ej: Taller principal, Oficina cliente..."
                  />
                </div>
              </div>
            )}

            {/* Opción de Evento de Calendario */}
            <div className="flex items-center justify-between p-4 bg-secondary-700/20 rounded-lg border border-secondary-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Crear evento en calendario</h3>
                  <p className="text-sm text-gray-400">
                    Programar automáticamente un evento de trabajo para mañana
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={crearEventoCalendario}
                  onChange={(e) => setCrearEventoCalendario(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-600 peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-secondary-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading || !selectedTecnico}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{loading ? "Asignando..." : tecnicoActual ? "Reasignar" : "Asignar"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
