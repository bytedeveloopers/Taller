"use client";

import { Technician, TechnicianSchedule } from "@/types";
import { CalendarDaysIcon, ClockIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface Props {
  tecnico: Technician;
  onCerrar: () => void;
}

export default function AgendaTecnico({ tecnico, onCerrar }: Props) {
  const [schedule, setSchedule] = useState<TechnicianSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
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
      const response = await fetch(`/api/tecnicos/${tecnico.id}/schedule?date=${selectedDate}`);
      const data = await response.json();

      if (data.success) {
        setSchedule(data.data || []);
      }
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

  const getEventColor = (type: string) => {
    switch (type) {
      case "APPOINTMENT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "REMINDER":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "BLOCK":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  // Filtrar eventos por fecha seleccionada
  const filteredEvents = schedule.filter((event) => {
    const eventDate = new Date(event.startDate).toISOString().split("T")[0];
    return eventDate === selectedDate;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Agenda de {tecnico.name}</h2>
              <p className="text-gray-600">Gestión de horarios y eventos</p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 p-6 space-y-6">
            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Nuevo Evento</span>
              </button>

              <button
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ir a Hoy
              </button>
            </div>

            {/* Technician Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Información del Técnico</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>📞 {tecnico.phone}</div>
                {tecnico.email && <div>📧 {tecnico.email}</div>}
                <div>
                  ⏰ {tecnico.workHours.start} - {tecnico.workHours.end}
                </div>
                <div>📊 Capacidad: {tecnico.capacityPerDay} trabajos/día</div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Habilidades</h3>
              <div className="flex flex-wrap gap-1">
                {tecnico.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
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
              <h3 className="text-lg font-semibold text-gray-900">
                Eventos para{" "}
                {new Date(selectedDate).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <span className="text-sm text-gray-500">
                {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`border rounded-lg p-4 ${getEventColor(event.type)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getEventIcon(event.type)}</span>
                          <h4 className="font-medium">{event.title}</h4>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-white bg-opacity-50 rounded">
                          {getEventTypeName(event.type)}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-sm mb-2 opacity-80">{event.description}</p>
                      )}

                      <div className="flex items-center space-x-4 text-xs opacity-70">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>
                            {event.allDay
                              ? "Todo el día"
                              : `${new Date(event.startDate).toLocaleTimeString("es-ES", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })} - ${new Date(event.endDate).toLocaleTimeString("es-ES", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded ${
                            event.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : event.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {event.status === "COMPLETED"
                            ? "Completado"
                            : event.status === "CANCELLED"
                            ? "Cancelado"
                            : "Programado"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CalendarDaysIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sin eventos programados
                    </h3>
                    <p className="text-gray-500 mb-4">No hay eventos para esta fecha</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
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
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Nuevo Evento</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Evento
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="REMINDER">Recordatorio</option>
                      <option value="APPOINTMENT">Cita</option>
                      <option value="BLOCK">Bloqueo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allDay" className="ml-2 text-sm text-gray-700">
                      Todo el día
                    </label>
                  </div>

                  {!newEvent.allDay && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora Inicio
                        </label>
                        <input
                          type="time"
                          value={newEvent.startTime}
                          onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora Fin
                        </label>
                        <input
                          type="time"
                          value={newEvent.endTime}
                          onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
    </div>
  );
}
