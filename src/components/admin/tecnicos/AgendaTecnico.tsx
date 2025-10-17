"use client";

import { Technician, TechnicianSchedule } from "@/types";
import {
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  tecnico: Technician;
  onCerrar: () => void;
}

export default function AgendaTecnico({ tecnico, onCerrar }: Props) {
  const [schedule, setSchedule] = useState<TechnicianSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: "REMINDER" as "APPOINTMENT" | "REMINDER" | "BLOCK",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "10:00",
    allDay: false,
  });

  useEffect(() => {
    loadSchedule();
  }, [tecnico.id, selectedDate]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/tecnicos/${tecnico.id}/schedule?date=${selectedDate}`
      );
      const data = await response.json();
      if (data.success) setSchedule(data.data || []);
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      ...newEvent,
      technicianId: tecnico.id,
      startDate: new Date(`${newEvent.startDate}T${newEvent.startTime}`),
      endDate: new Date(`${newEvent.endDate}T${newEvent.endTime}`),
    };

    try {
      const response = await fetch(`/api/tecnicos/${tecnico.id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      const result = await response.json();
      if (result.success) {
        setShowCreateForm(false);
        setNewEvent({
          type: "REMINDER",
          title: "",
          description: "",
          startDate: "",
          endDate: "",
          startTime: "09:00",
          endTime: "10:00",
          allDay: false,
        });
        loadSchedule();
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  // ---------- estilos dark para tipos de evento ----------
  const getEventColor = (type: string) => {
    switch (type) {
      case "APPOINTMENT":
        return "bg-blue-500/15 text-blue-200 border-blue-400/20";
      case "REMINDER":
        return "bg-yellow-500/15 text-yellow-200 border-yellow-400/20";
      case "BLOCK":
        return "bg-red-500/15 text-red-200 border-red-400/20";
      default:
        return "bg-secondary-800 text-gray-200 border-secondary-700";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "APPOINTMENT":
        return "📅";
      case "REMINDER":
        return "⏰";
      case "BLOCK":
        return "🚫";
      default:
        return "📝";
    }
  };

  const getEventTypeName = (type: string) => {
    switch (type) {
      case "APPOINTMENT":
        return "Cita";
      case "REMINDER":
        return "Recordatorio";
      case "BLOCK":
        return "Bloqueo";
      default:
        return "Evento";
    }
  };

  const filteredEvents = schedule.filter((event) => {
    const eventDate = new Date(event.startDate).toISOString().split("T")[0];
    return eventDate === selectedDate;
  });

  // ---- PORTAL para cubrir toda la pantalla (evita la franja) ----
  const container = typeof document !== "undefined" ? document.body : null;
  if (!container) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="bg-secondary-800 border border-secondary-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-700 bg-secondary-800/80">
          <div className="flex items-center gap-3">
            <CalendarDaysIcon className="h-7 w-7 text-primary-300" />
            <div>
              <h2 className="text-lg font-semibold text-white">
                Agenda de {tecnico.name}
              </h2>
              <p className="text-gray-400 text-sm">Gestión de horarios y eventos</p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-secondary-700 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar */}
          <div className="w-80 border-r border-secondary-700 p-6 space-y-6 bg-secondary-900/30">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fecha</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-secondary-900 border border-secondary-700 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Nuevo Evento</span>
              </button>

              <button
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className="w-full bg-secondary-800 text-gray-200 px-4 py-2 rounded-lg border border-secondary-700 hover:bg-secondary-750 transition-colors"
              >
                Ir a Hoy
              </button>
            </div>

            <div className="bg-secondary-900 rounded-lg p-4 border border-secondary-700">
              <h3 className="font-medium text-white mb-2">Información del Técnico</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div>📞 {tecnico.phone}</div>
                {tecnico.email && <div>📧 {tecnico.email}</div>}
                <div>⏰ {tecnico.workHours.start} - {tecnico.workHours.end}</div>
                <div>📊 Capacidad: {tecnico.capacityPerDay} trabajos/día</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">Habilidades</h3>
              <div className="flex flex-wrap gap-1">
                {tecnico.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Eventos para{" "}
                {new Date(selectedDate).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <span className="text-sm text-gray-400">
                {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div key={event.id} className={`border rounded-lg p-4 ${getEventColor(event.type)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getEventIcon(event.type)}</span>
                          <h4 className="font-medium">{event.title}</h4>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-white/10 text-white/80 rounded">
                          {getEventTypeName(event.type)}
                        </span>
                      </div>

                      {event.description && <p className="text-sm mb-2 opacity-80">{event.description}</p>}

                      <div className="flex items-center gap-4 text-xs opacity-80">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>
                            {event.allDay
                              ? "Todo el día"
                              : `${new Date(event.startDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} - ${new Date(event.endDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            event.status === "COMPLETED"
                              ? "bg-green-500/20 text-green-300"
                              : event.status === "CANCELLED"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {event.status === "COMPLETED" ? "Completado" : event.status === "CANCELLED" ? "Cancelado" : "Programado"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <CalendarDaysIcon className="h-16 w-16 mx-auto mb-4 text-secondary-600" />
                    <h3 className="text-lg font-medium text-white mb-2">Sin eventos programados</h3>
                    <p className="text-gray-400 mb-4">No hay eventos para esta fecha</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Crear Primer Evento
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Event Form Modal */}
        {showCreateForm && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-secondary-800 border border-secondary-700 rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Nuevo Evento</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-300 hover:text-white hover:bg-secondary-700 rounded-lg p-1.5 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Evento</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                      className="w-full bg-secondary-900 border border-secondary-700 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="REMINDER">Recordatorio</option>
                      <option value="APPOINTMENT">Cita</option>
                      <option value="BLOCK">Bloqueo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full bg-secondary-900 border border-secondary-700 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                      className="w-full bg-secondary-900 border border-secondary-700 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Fecha Inicio</label>
                      <input
                        type="date"
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                        className="w-full bg-secondary-900 border border-secondary-700 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Fecha Fin</label>
                      <input
                        type="date"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                        className="w-full bg-secondary-900 border border-secondary-700 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allDay"
                      checked={newEvent.allDay}
                      onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-700 rounded bg-secondary-900"
                    />
                    <label htmlFor="allDay" className="ml-2 text-sm text-gray-300">Todo el día</label>
                  </div>

                  {!newEvent.allDay && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Hora Inicio</label>
                        <input
                          type="time"
                          value={newEvent.startTime}
                          onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                          className="w-full bg-secondary-900 border border-secondary-700 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Hora Fin</label>
                        <input
                          type="time"
                          value={newEvent.endTime}
                          onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                          className="w-full bg-secondary-900 border border-secondary-700 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-secondary-700">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-gray-200 bg-secondary-800 border border-secondary-700 rounded-lg hover:bg-secondary-750 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Crear Evento
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    container
  );
}
