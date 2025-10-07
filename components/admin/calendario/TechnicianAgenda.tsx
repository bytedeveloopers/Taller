"use client";

import {
  CalendarEvent,
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  TechnicianAgendaStats,
} from "@/types";
import {
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";

interface TechnicianAgendaProps {
  technicianId: string;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (date?: Date) => void;
  onCreateBlock: () => void;
}

const TechnicianAgenda: React.FC<TechnicianAgendaProps> = ({
  technicianId,
  events,
  onEventClick,
  onCreateEvent,
  onCreateBlock,
}) => {
  const [viewMode, setViewMode] = useState<"day" | "week">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState<TechnicianAgendaStats>({
    eventsToday: 0,
    eventsNext48h: 0,
    blockedHours: 0,
  });

  useEffect(() => {
    calculateStats();
  }, [events]);

  const calculateStats = useCallback(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const eventsToday = events.filter((event) => {
      const eventDate = new Date(event.scheduledAt);
      return eventDate.toDateString() === today.toDateString();
    }).length;

    const eventsNext48h = events.filter((event) => {
      const eventDate = new Date(event.scheduledAt);
      return eventDate >= today && eventDate <= dayAfterTomorrow;
    }).length;

    const blockedHours = events.filter((event) => event.isBlocker).length;

    setStats({ eventsToday, eventsNext48h, blockedHours });
  }, [events]);

  // Generar fechas para la vista
  const getDatesForView = useCallback(() => {
    const dates: Date[] = [];
    const baseDate = new Date(currentDate);

    if (viewMode === "day") {
      dates.push(new Date(baseDate));
    } else {
      const startOfWeek = new Date(baseDate);
      startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        dates.push(day);
      }
    }

    return dates;
  }, [viewMode, currentDate]);

  // Generar horas de trabajo
  const getWorkingHours = () => {
    const hours: Date[] = [];
    for (let i = 7; i <= 19; i++) {
      const hour = new Date();
      hour.setHours(i, 0, 0, 0);
      hours.push(hour);
    }
    return hours;
  };

  // Obtener eventos para una fecha específica
  const getEventsForDate = (targetDate: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.scheduledAt);
      return eventDate.toDateString() === targetDate.toDateString();
    });
  };

  // Obtener eventos para una hora específica
  const getEventsForDateTime = (targetDate: Date, targetHour: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.scheduledAt);
      return (
        eventDate.toDateString() === targetDate.toDateString() &&
        eventDate.getHours() === targetHour.getHours()
      );
    });
  };

  // Navegación de fechas
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    }

    setCurrentDate(newDate);
  };

  // Renderizar evento en la agenda
  const renderEvent = (event: CalendarEvent, isCompact = false) => {
    const colors = EVENT_TYPE_COLORS[event.type];
    const isBlocked = event.isBlocker;

    return (
      <div
        key={event.id}
        onClick={() => onEventClick(event)}
        className={`
          ${colors.bg} ${colors.border} border-l-4 rounded-lg p-2 mb-1 cursor-pointer
          hover:shadow-lg transition-all duration-200
          ${isBlocked ? "opacity-75 border-dashed bg-red-500/20" : ""}
          ${isCompact ? "text-xs" : "text-sm"}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {isBlocked ? (
              <div className="flex items-center space-x-1">
                <NoSymbolIcon className="h-4 w-4 text-red-400" />
                <span className="text-red-400 font-medium">{event.title || "Bloqueado"}</span>
              </div>
            ) : (
              <p className={`font-medium ${colors.text} truncate`}>
                {event.title || EVENT_TYPE_LABELS[event.type]}
              </p>
            )}

            {!isCompact && (
              <>
                <p className="text-xs text-gray-400 truncate">
                  {new Date(event.scheduledAt).toLocaleTimeString("es-GT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {event.endAt && (
                    <>
                      {" - "}
                      {new Date(event.endAt).toLocaleTimeString("es-GT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </p>
                {event.customer && (
                  <p className="text-xs text-gray-500 truncate">{event.customer.name}</p>
                )}
                {event.location && (
                  <p className="text-xs text-gray-500 truncate">{event.location}</p>
                )}
              </>
            )}
          </div>

          {event.reminder24h || event.reminder1h || event.reminder15m ? (
            <div className="flex-shrink-0 ml-2">
              <ClockIcon className="h-4 w-4 text-yellow-400" />
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  // Renderizar vista de día
  const renderDayView = () => {
    const dayDate = currentDate;
    const hours = getWorkingHours();
    const dayEvents = getEventsForDate(dayDate);
    const isToday = dayDate.toDateString() === new Date().toDateString();

    return (
      <div className="space-y-1">
        {/* Encabezado del día */}
        <div
          className={`p-4 rounded-lg text-center mb-4 ${
            isToday ? "bg-blue-500/20 border border-blue-500" : "bg-secondary-700"
          }`}
        >
          <h3 className="text-lg font-bold text-white">
            {dayDate.toLocaleDateString("es-GT", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {dayEvents.length > 0 && (
            <p className="text-gray-400 mt-1">{dayEvents.length} eventos programados</p>
          )}
        </div>

        {/* Grid de horas */}
        {hours.map((hour, index) => {
          const hourEvents = getEventsForDateTime(dayDate, hour);
          const hasBlocker = hourEvents.some((e) => e.isBlocker);

          return (
            <div
              key={index}
              className={`
                flex border border-secondary-600 rounded min-h-[80px]
                ${hasBlocker ? "bg-red-500/10" : ""}
              `}
            >
              {/* Columna de hora */}
              <div className="w-20 p-3 text-right text-sm text-gray-400 border-r border-secondary-600 bg-secondary-800">
                {hour.toLocaleTimeString("es-GT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* Contenido de eventos */}
              <div
                className={`
                  flex-1 p-3 transition-colors cursor-pointer
                  ${
                    hasBlocker
                      ? "bg-red-500/10 hover:bg-red-500/20"
                      : "bg-secondary-700/50 hover:bg-secondary-600"
                  }
                `}
                onClick={() => {
                  if (!hasBlocker) {
                    const cellDate = new Date(dayDate);
                    cellDate.setHours(hour.getHours(), hour.getMinutes());
                    onCreateEvent(cellDate);
                  }
                }}
              >
                {hasBlocker && (
                  <div className="flex items-center space-x-2 mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">Hora bloqueada</span>
                  </div>
                )}
                {hourEvents.map((event) => renderEvent(event))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar vista de semana
  const renderWeekView = () => {
    const dates = getDatesForView();
    const hours = getWorkingHours();
    const today = new Date();

    return (
      <div className="flex flex-col">
        {/* Encabezados de días */}
        <div className="grid grid-cols-8 gap-1 mb-4">
          <div className="p-2"></div> {/* Espacio para columna de horas */}
          {dates.map((dayDate, index) => {
            const isToday = dayDate.toDateString() === today.toDateString();
            const dayEvents = getEventsForDate(dayDate);
            const hasBlockers = dayEvents.some((e) => e.isBlocker);

            return (
              <div
                key={index}
                className={`p-2 text-center border border-secondary-600 rounded ${
                  isToday ? "bg-blue-500/20 border-blue-500" : "bg-secondary-700"
                } ${hasBlockers ? "border-red-500/50" : ""}`}
              >
                <div className="text-sm font-medium text-gray-400">
                  {dayDate.toLocaleDateString("es-GT", { weekday: "short" })}
                </div>
                <div className={`text-lg ${isToday ? "text-blue-400 font-bold" : "text-white"}`}>
                  {dayDate.getDate()}
                </div>
                {dayEvents.length > 0 && (
                  <div className="text-xs text-gray-400 mt-1">{dayEvents.length} eventos</div>
                )}
                {hasBlockers && (
                  <div className="flex justify-center mt-1">
                    <NoSymbolIcon className="h-4 w-4 text-red-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grid de horas y días */}
        <div className="grid grid-cols-8 gap-1 flex-1">
          {hours.map((hour, hourIndex) => (
            <React.Fragment key={hourIndex}>
              {/* Columna de horas */}
              <div className="p-2 text-right text-sm text-gray-400 border-r border-secondary-600">
                {hour.toLocaleTimeString("es-GT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* Celdas de días */}
              {dates.map((dayDate, dayIndex) => {
                const cellEvents = getEventsForDateTime(dayDate, hour);
                const hasBlocker = cellEvents.some((e) => e.isBlocker);

                return (
                  <div
                    key={`${hourIndex}-${dayIndex}`}
                    className={`
                      min-h-[60px] p-1 border border-secondary-600 cursor-pointer transition-colors
                      ${
                        hasBlocker
                          ? "bg-red-500/10 hover:bg-red-500/20"
                          : "bg-secondary-700/50 hover:bg-secondary-600"
                      }
                    `}
                    onClick={() => {
                      if (!hasBlocker) {
                        const cellDate = new Date(dayDate);
                        cellDate.setHours(hour.getHours(), hour.getMinutes());
                        onCreateEvent(cellDate);
                      }
                    }}
                  >
                    {cellEvents.map((event) => renderEvent(event, true))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const getDateRangeLabel = () => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("es-GT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      const dates = getDatesForView();
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];
      return `${startDate.toLocaleDateString("es-GT", {
        month: "short",
        day: "numeric",
      })} - ${endDate.toLocaleDateString("es-GT", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
  };

  if (!technicianId) {
    return (
      <div className="text-center py-12">
        <UserIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Seleccionar Técnico</h3>
        <p className="text-gray-400">Seleccione un técnico para ver su agenda personal</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats del técnico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-secondary-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Eventos Hoy</p>
              <p className="text-2xl font-bold text-white">{stats.eventsToday}</p>
            </div>
            <CalendarDaysIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Próximos 48h</p>
              <p className="text-2xl font-bold text-white">{stats.eventsNext48h}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-secondary-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Bloqueos</p>
              <p className="text-2xl font-bold text-white">{stats.blockedHours}</p>
            </div>
            <NoSymbolIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Controles de vista */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex bg-secondary-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "day" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "week" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Semana
            </button>
          </div>

          <h3 className="text-lg font-medium text-white">{getDateRangeLabel()}</h3>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigateDate("prev")}
            className="p-2 text-gray-400 hover:text-white hover:bg-secondary-600 rounded transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => navigateDate("next")}
            className="p-2 text-gray-400 hover:text-white hover:bg-secondary-600 rounded transition-colors"
          >
            →
          </button>
          <button
            onClick={onCreateBlock}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors flex items-center space-x-2"
          >
            <NoSymbolIcon className="h-4 w-4" />
            <span>Crear Bloqueo</span>
          </button>
          <button
            onClick={() => onCreateEvent()}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Vista de agenda */}
      <div className="bg-secondary-800 rounded-xl border border-secondary-700 p-4">
        {viewMode === "day" ? renderDayView() : renderWeekView()}
      </div>
    </div>
  );
};

export default TechnicianAgenda;
