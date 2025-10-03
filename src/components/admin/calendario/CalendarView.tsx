"use client";

import { CalendarEvent, CalendarViewMode, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/types";
import React, { useCallback, useRef, useState } from "react";

interface CalendarViewProps {
  events: CalendarEvent[];
  viewMode: CalendarViewMode;
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop: (eventId: string, newStartTime: Date, newEndTime?: Date) => void;
  onCreateEvent: (date?: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  viewMode,
  onEventClick,
  onEventDrop,
  onCreateEvent,
}) => {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { mode, date } = viewMode;

  // Generar fechas para la vista actual
  const getDatesForView = useCallback(() => {
    const dates: Date[] = [];
    const baseDate = new Date(date);

    switch (mode) {
      case "day":
        dates.push(new Date(baseDate));
        break;
      case "week":
        const startOfWeek = new Date(baseDate);
        startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          dates.push(day);
        }
        break;
      case "month":
        const startOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        const endOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
        const startOfCalendar = new Date(startOfMonth);
        startOfCalendar.setDate(startOfMonth.getDate() - startOfMonth.getDay());

        const endOfCalendar = new Date(endOfMonth);
        const daysToAdd = 6 - endOfMonth.getDay();
        endOfCalendar.setDate(endOfMonth.getDate() + daysToAdd);

        const currentDate = new Date(startOfCalendar);
        while (currentDate <= endOfCalendar) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;
    }

    return dates;
  }, [mode, date]);

  // Obtener eventos para una fecha específica
  const getEventsForDate = useCallback(
    (targetDate: Date) => {
      return events.filter((event) => {
        const eventDate = new Date(event.scheduledAt);
        return eventDate.toDateString() === targetDate.toDateString();
      });
    },
    [events]
  );

  // Generar horas para vista de día/semana
  const getHoursForDay = () => {
    const hours: Date[] = [];
    for (let i = 7; i <= 19; i++) {
      const hour = new Date();
      hour.setHours(i, 0, 0, 0);
      hours.push(hour);
    }
    return hours;
  };

  // Manejar drag start
  const handleDragStart = (event: React.DragEvent, calendarEvent: CalendarEvent) => {
    setDraggedEvent(calendarEvent);
    event.dataTransfer.effectAllowed = "move";
  };

  // Manejar drag over
  const handleDragOver = (event: React.DragEvent, targetDate: Date) => {
    event.preventDefault();
    setDragOverDate(targetDate);
    event.dataTransfer.dropEffect = "move";
  };

  // Manejar drop
  const handleDrop = (event: React.DragEvent, targetDate: Date, targetHour?: Date) => {
    event.preventDefault();

    if (!draggedEvent) return;

    const newStartTime = new Date(targetDate);
    if (targetHour) {
      newStartTime.setHours(targetHour.getHours(), targetHour.getMinutes());
    }

    let newEndTime: Date | undefined;
    if (draggedEvent.endAt) {
      const duration =
        new Date(draggedEvent.endAt).getTime() - new Date(draggedEvent.scheduledAt).getTime();
      newEndTime = new Date(newStartTime.getTime() + duration);
    }

    onEventDrop(draggedEvent.id, newStartTime, newEndTime);
    setDraggedEvent(null);
    setDragOverDate(null);
  };

  // Renderizar evento
  const renderEvent = (event: CalendarEvent, isCompact = false) => {
    const colors = EVENT_TYPE_COLORS[event.type];
    const isBlocked = event.isBlocker;

    return (
      <div
        key={event.id}
        draggable
        onDragStart={(e) => handleDragStart(e, event)}
        onClick={() => onEventClick(event)}
        className={`
          ${colors.bg} ${colors.border} border-l-4 rounded-lg p-2 mb-1 cursor-pointer
          hover:shadow-lg transition-all duration-200
          ${isBlocked ? "opacity-75 border-dashed" : ""}
          ${isCompact ? "text-xs" : "text-sm"}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${colors.text} truncate`}>
              {event.title || EVENT_TYPE_LABELS[event.type]}
            </p>
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
              </>
            )}
          </div>
          {event.technician && (
            <div className="flex-shrink-0 ml-2">
              <span className="inline-block w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {event.technician.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Renderizar vista de mes
  const renderMonthView = () => {
    const dates = getDatesForView();
    const today = new Date();
    const currentMonth = date.getMonth();

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Encabezados de días */}
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
            {day}
          </div>
        ))}

        {/* Días del mes */}
        {dates.map((dayDate, index) => {
          const isToday = dayDate.toDateString() === today.toDateString();
          const isCurrentMonth = dayDate.getMonth() === currentMonth;
          const dayEvents = getEventsForDate(dayDate);
          const isDragOver = dragOverDate?.toDateString() === dayDate.toDateString();

          return (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 border border-secondary-600
                ${isCurrentMonth ? "bg-secondary-700" : "bg-secondary-800/50"}
                ${isToday ? "ring-2 ring-blue-500" : ""}
                ${isDragOver ? "bg-blue-500/20" : ""}
                hover:bg-secondary-600 transition-colors cursor-pointer
              `}
              onDragOver={(e) => handleDragOver(e, dayDate)}
              onDrop={(e) => handleDrop(e, dayDate)}
              onClick={() => onCreateEvent(dayDate)}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-sm ${isCurrentMonth ? "text-white" : "text-gray-500"} ${
                    isToday ? "font-bold" : ""
                  }`}
                >
                  {dayDate.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-xs bg-blue-500 text-white px-1 rounded">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => renderEvent(event, true))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-400 text-center">
                    +{dayEvents.length - 3} más
                  </div>
                )}
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
    const hours = getHoursForDay();
    const today = new Date();

    return (
      <div className="flex flex-col">
        {/* Encabezados de días */}
        <div className="grid grid-cols-8 gap-1 mb-4">
          <div className="p-2"></div> {/* Espacio para columna de horas */}
          {dates.map((dayDate, index) => {
            const isToday = dayDate.toDateString() === today.toDateString();
            return (
              <div
                key={index}
                className={`p-2 text-center border border-secondary-600 rounded ${
                  isToday ? "bg-blue-500/20 border-blue-500" : "bg-secondary-700"
                }`}
              >
                <div className="text-sm font-medium text-gray-400">
                  {dayDate.toLocaleDateString("es-GT", { weekday: "short" })}
                </div>
                <div className={`text-lg ${isToday ? "text-blue-400 font-bold" : "text-white"}`}>
                  {dayDate.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid de horas */}
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
                const cellDate = new Date(dayDate);
                cellDate.setHours(hour.getHours(), hour.getMinutes());

                const cellEvents = getEventsForDate(dayDate).filter((event) => {
                  const eventHour = new Date(event.scheduledAt).getHours();
                  return eventHour === hour.getHours();
                });

                const isDragOver = dragOverDate?.toDateString() === dayDate.toDateString();

                return (
                  <div
                    key={`${hourIndex}-${dayIndex}`}
                    className={`
                      min-h-[60px] p-1 border border-secondary-600
                      ${isDragOver ? "bg-blue-500/20" : "bg-secondary-700/50"}
                      hover:bg-secondary-600 transition-colors cursor-pointer
                    `}
                    onDragOver={(e) => handleDragOver(e, dayDate)}
                    onDrop={(e) => handleDrop(e, dayDate, hour)}
                    onClick={() => onCreateEvent(cellDate)}
                  >
                    {cellEvents.map((event) => renderEvent(event))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar vista de día
  const renderDayView = () => {
    const dayDate = date;
    const hours = getHoursForDay();
    const dayEvents = getEventsForDate(dayDate);

    return (
      <div className="flex flex-col">
        {/* Encabezado del día */}
        <div className="mb-4 p-4 bg-secondary-700 rounded-lg text-center">
          <h2 className="text-xl font-bold text-white">
            {dayDate.toLocaleDateString("es-GT", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
          {dayEvents.length > 0 && (
            <p className="text-gray-400 mt-1">{dayEvents.length} eventos programados</p>
          )}
        </div>

        {/* Grid de horas */}
        <div className="space-y-1">
          {hours.map((hour, index) => {
            const cellDate = new Date(dayDate);
            cellDate.setHours(hour.getHours(), hour.getMinutes());

            const hourEvents = dayEvents.filter((event) => {
              const eventHour = new Date(event.scheduledAt).getHours();
              return eventHour === hour.getHours();
            });

            const isDragOver = dragOverDate?.toDateString() === dayDate.toDateString();

            return (
              <div
                key={index}
                className={`
                  flex border border-secondary-600 rounded min-h-[80px]
                  ${isDragOver ? "bg-blue-500/20" : ""}
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
                  className="flex-1 p-3 bg-secondary-700/50 hover:bg-secondary-600 transition-colors cursor-pointer"
                  onDragOver={(e) => handleDragOver(e, dayDate)}
                  onDrop={(e) => handleDrop(e, dayDate, hour)}
                  onClick={() => onCreateEvent(cellDate)}
                >
                  {hourEvents.map((event) => renderEvent(event))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div ref={gridRef} className="calendar-view">
      {mode === "month" && renderMonthView()}
      {mode === "week" && renderWeekView()}
      {mode === "day" && renderDayView()}
    </div>
  );
};

export default CalendarView;
