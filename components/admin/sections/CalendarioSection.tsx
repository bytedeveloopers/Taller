"use client";

import {
  CalendarEvent,
  CalendarViewMode,
  Customer,
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  EventFilter,
  EventType,
  Task,
  User,
} from "@/types";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";
import CalendarView from "../calendario/CalendarView";
import EventEditor from "../calendario/EventEditor";
import TechnicianAgenda from "../calendario/TechnicianAgenda";

const CalendarioSection: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de vista y filtros
  const [viewMode, setViewMode] = useState<CalendarViewMode>({
    mode: "week",
    date: new Date(),
  });
  const [activeView, setActiveView] = useState<"calendar" | "technician">("calendar");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");
  const [filters, setFilters] = useState<EventFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  // Estados del editor
  const [showEditor, setShowEditor] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");

  // Estado del panel lateral
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    loadEvents();
    loadTechnicians();
    loadCustomers();
    loadTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/calendario/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Error cargando eventos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTechnicians = useCallback(async () => {
    try {
      const response = await fetch("/api/users?role=TECHNICIAN");
      if (response.ok) {
        const data = await response.json();
        setTechnicians(data.data);
      }
    } catch (error) {
      console.error("Error cargando técnicos:", error);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data);
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data.data);
      }
    } catch (error) {
      console.error("Error cargando tareas:", error);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...events];

    if (filters.technicianId) {
      filtered = filtered.filter((event) => event.technicianId === filters.technicianId);
    }

    if (filters.type) {
      filtered = filtered.filter((event) => event.type === filters.type);
    }

    if (filters.taskId) {
      filtered = filtered.filter((event) => event.taskId === filters.taskId);
    }

    if (filters.customerId) {
      filtered = filtered.filter((event) => event.customerId === filters.customerId);
    }

    if (filters.status) {
      filtered = filtered.filter((event) => event.status === filters.status);
    }

    if (!filters.includeBlockers) {
      filtered = filtered.filter((event) => !event.isBlocker);
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.scheduledAt);
        return eventDate >= filters.startDate! && eventDate <= filters.endDate!;
      });
    }

    setFilteredEvents(filtered);
  }, [events, filters]);

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setEditorMode("create");
    setShowEditor(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditorMode("edit");
    setShowEditor(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setDetailEvent(event);
    setShowEventDetail(true);
  };

  const handleEventDrop = async (eventId: string, newStartTime: Date, newEndTime?: Date) => {
    try {
      const response = await fetch(`/api/calendario/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduledAt: newStartTime,
          startAt: newStartTime,
          endAt: newEndTime,
        }),
      });

      if (response.ok) {
        await loadEvents();
      } else {
        alert("Error al reprogramar evento");
      }
    } catch (error) {
      console.error("Error reprogramando evento:", error);
      alert("Error al reprogramar evento");
    }
  };

  const handleSaveEvent = async () => {
    await loadEvents();
    setShowEditor(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("¿Está seguro de eliminar este evento?")) return;

    try {
      const response = await fetch(`/api/calendario/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadEvents();
        setShowEventDetail(false);
        setDetailEvent(null);
      } else {
        alert("Error al eliminar evento");
      }
    } catch (error) {
      console.error("Error eliminando evento:", error);
      alert("Error al eliminar evento");
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(viewMode.date);

    switch (viewMode.mode) {
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
    }

    setViewMode({ ...viewMode, date: newDate });
  };

  const getDateRangeLabel = () => {
    const { mode, date } = viewMode;
    const today = new Date(date);

    switch (mode) {
      case "day":
        return today.toLocaleDateString("es-GT", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "week":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString("es-GT", {
          month: "short",
          day: "numeric",
        })} - ${endOfWeek.toLocaleDateString("es-GT", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      case "month":
        return today.toLocaleDateString("es-GT", {
          year: "numeric",
          month: "long",
        });
    }
  };

  const getEventStats = () => {
    const today = new Date();
    const todayEvents = filteredEvents.filter((event) => {
      const eventDate = new Date(event.scheduledAt);
      return eventDate.toDateString() === today.toDateString();
    }).length;

    const upcomingEvents = filteredEvents.filter((event) => {
      const eventDate = new Date(event.scheduledAt);
      const twoDaysFromNow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
      return eventDate > today && eventDate <= twoDaysFromNow;
    }).length;

    const blockedHours = filteredEvents.filter((event) => event.isBlocker).length;

    return { todayEvents, upcomingEvents, blockedHours };
  };

  const stats = getEventStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendario & Agenda</h1>
          <p className="text-gray-400">Gestión de citas, recordatorios y agenda del taller</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              showFilters
                ? "bg-blue-600 text-white"
                : "bg-secondary-600 hover:bg-secondary-500 text-gray-400"
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filtros</span>
          </button>

          <button
            onClick={handleCreateEvent}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Eventos Hoy</p>
              <p className="text-3xl font-bold text-white">{stats.todayEvents}</p>
            </div>
            <CalendarIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Próximos 48h</p>
              <p className="text-3xl font-bold text-white">{stats.upcomingEvents}</p>
            </div>
            <ClockIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Técnicos Activos</p>
              <p className="text-3xl font-bold text-white">{technicians.length}</p>
            </div>
            <UserIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Bloqueos</p>
              <p className="text-3xl font-bold text-white">{stats.blockedHours}</p>
            </div>
            <EyeIcon className="h-12 w-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <h3 className="text-lg font-medium text-white mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Técnico</label>
              <select
                value={filters.technicianId || ""}
                onChange={(e) =>
                  setFilters({ ...filters, technicianId: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Tipo</label>
              <select
                value={filters.type || ""}
                onChange={(e) =>
                  setFilters({ ...filters, type: (e.target.value as EventType) || undefined })
                }
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Cliente</label>
              <select
                value={filters.customerId || ""}
                onChange={(e) =>
                  setFilters({ ...filters, customerId: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={filters.startDate?.toISOString().split("T")[0] || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    startDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={filters.endDate?.toISOString().split("T")[0] || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.includeBlockers || false}
                onChange={(e) => setFilters({ ...filters, includeBlockers: e.target.checked })}
                className="rounded border-secondary-500 text-blue-600 focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-gray-400">Incluir bloqueos</span>
            </label>

            <button
              onClick={() => setFilters({})}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Selector de vista */}
      <div className="bg-secondary-800 rounded-xl border border-secondary-700">
        <div className="p-6 border-b border-secondary-600">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex bg-secondary-600 rounded-lg p-1">
                <button
                  onClick={() => setActiveView("calendar")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === "calendar"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Calendario
                </button>
                <button
                  onClick={() => setActiveView("technician")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === "technician"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Agenda Técnico
                </button>
              </div>

              {activeView === "technician" && (
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar técnico</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {activeView === "calendar" && (
              <div className="flex items-center space-x-4">
                <div className="flex bg-secondary-600 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode({ ...viewMode, mode: "day" })}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode.mode === "day"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Día
                  </button>
                  <button
                    onClick={() => setViewMode({ ...viewMode, mode: "week" })}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode.mode === "week"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setViewMode({ ...viewMode, mode: "month" })}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode.mode === "month"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Mes
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateDate("prev")}
                    className="p-2 text-gray-400 hover:text-white hover:bg-secondary-600 rounded transition-colors"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <h3 className="text-lg font-medium text-white min-w-[200px] text-center">
                    {getDateRangeLabel()}
                  </h3>
                  <button
                    onClick={() => navigateDate("next")}
                    className="p-2 text-gray-400 hover:text-white hover:bg-secondary-600 rounded transition-colors"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>

                <button
                  onClick={() => setViewMode({ ...viewMode, date: new Date() })}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  Hoy
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Cargando calendario...</p>
            </div>
          ) : activeView === "calendar" ? (
            <CalendarView
              events={filteredEvents}
              viewMode={viewMode}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
              onCreateEvent={handleCreateEvent}
            />
          ) : (
            <TechnicianAgenda
              technicianId={selectedTechnician}
              events={filteredEvents.filter((e) => e.technicianId === selectedTechnician)}
              onEventClick={handleEventClick}
              onCreateEvent={handleCreateEvent}
              onCreateBlock={() => {
                // Crear bloqueo para el técnico seleccionado
                setSelectedEvent({
                  id: "",
                  type: "OTRO",
                  scheduledAt: new Date(),
                  status: "SCHEDULED",
                  reminder24h: false,
                  reminder1h: false,
                  reminder15m: false,
                  isBlocker: true,
                  technicianId: selectedTechnician,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                } as CalendarEvent);
                setEditorMode("create");
                setShowEditor(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Editor de eventos */}
      {showEditor && (
        <EventEditor
          event={selectedEvent}
          mode={editorMode}
          technicians={technicians}
          customers={customers}
          tasks={tasks}
          onSave={handleSaveEvent}
          onCancel={() => {
            setShowEditor(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Panel de detalle de evento */}
      {showEventDetail && detailEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-secondary-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Detalle del Evento</h3>
              <button
                onClick={() => setShowEventDetail(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 rounded-full ${EVENT_TYPE_COLORS[detailEvent.type].bg} ${
                    EVENT_TYPE_COLORS[detailEvent.type].border
                  } border-l-2`}
                ></div>
                <span className="text-white font-medium">
                  {detailEvent.title || EVENT_TYPE_LABELS[detailEvent.type]}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    EVENT_TYPE_COLORS[detailEvent.type].bg
                  } ${EVENT_TYPE_COLORS[detailEvent.type].text}`}
                >
                  {EVENT_TYPE_LABELS[detailEvent.type]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Fecha y Hora</p>
                  <p className="text-white">
                    {new Date(detailEvent.scheduledAt).toLocaleDateString("es-GT")} -{" "}
                    {new Date(detailEvent.scheduledAt).toLocaleTimeString("es-GT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Estado</p>
                  <p className="text-white">{detailEvent.status}</p>
                </div>

                {detailEvent.technician && (
                  <div>
                    <p className="text-sm text-gray-400">Técnico</p>
                    <p className="text-white">{detailEvent.technician.name}</p>
                  </div>
                )}

                {detailEvent.customer && (
                  <div>
                    <p className="text-sm text-gray-400">Cliente</p>
                    <p className="text-white">{detailEvent.customer.name}</p>
                  </div>
                )}

                {detailEvent.location && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">Ubicación</p>
                    <p className="text-white">{detailEvent.location}</p>
                  </div>
                )}

                {(detailEvent.note || detailEvent.notes) && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">Notas</p>
                    <p className="text-white">{detailEvent.note || detailEvent.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-secondary-600">
                <button
                  onClick={() => handleEditEvent(detailEvent)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteEvent(detailEvent.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioSection;
