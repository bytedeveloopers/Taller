"use client";

import {
  BellIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  TruckIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import {
  BellIcon as BellSolid,
  CheckCircleIcon as CheckCircleSolid,
} from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";

interface EventoAgenda {
  id: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin: Date;
  tipo: "cita" | "mantenimiento" | "entrega" | "reunion" | "recordatorio";
  prioridad: "alta" | "media" | "baja";
  completado: boolean;
  cliente?: {
    nombre: string;
    telefono: string;
  };
  vehiculo?: {
    marca: string;
    modelo: string;
    placa: string;
  };
  ubicacion?: string;
  recordatorios: {
    tiempo: number; // minutos antes
    enviado: boolean;
  }[];
  notas?: string;
}

interface TecnicoAgendaProps {
  tecnicoId: string;
}

export const TecnicoAgenda: React.FC<TecnicoAgendaProps> = ({ tecnicoId }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [vistaActual, setVistaActual] = useState<"dia" | "semana" | "mes">("dia");
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [mostrarFormEvento, setMostrarFormEvento] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoAgenda | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [horaActual, setHoraActual] = useState(new Date());

  // Actualizar hora actual cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Cargar eventos simulados
  useEffect(() => {
    const eventosSimulados: EventoAgenda[] = [
      {
        id: "1",
        titulo: "Recepción de vehículo",
        descripcion: "Recepción e inspección inicial",
        fechaInicio: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas desde ahora
        fechaFin: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 horas desde ahora
        tipo: "cita",
        prioridad: "alta",
        completado: false,
        cliente: {
          nombre: "Carlos Rodríguez",
          telefono: "8888-9999",
        },
        vehiculo: {
          marca: "Toyota",
          modelo: "Corolla",
          placa: "ABC123",
        },
        recordatorios: [
          { tiempo: 30, enviado: false },
          { tiempo: 15, enviado: false },
        ],
      },
      {
        id: "2",
        titulo: "Mantenimiento preventivo",
        descripcion: "Cambio de aceite y filtros",
        fechaInicio: new Date(Date.now() + 4 * 60 * 60 * 1000),
        fechaFin: new Date(Date.now() + 6 * 60 * 60 * 1000),
        tipo: "mantenimiento",
        prioridad: "media",
        completado: false,
        cliente: {
          nombre: "Ana María Soto",
          telefono: "7777-8888",
        },
        vehiculo: {
          marca: "Honda",
          modelo: "Civic",
          placa: "DEF456",
        },
        recordatorios: [{ tiempo: 60, enviado: false }],
      },
      {
        id: "3",
        titulo: "Entrega de vehículo",
        descripcion: "Entrega final al cliente",
        fechaInicio: new Date(Date.now() + 6 * 60 * 60 * 1000),
        fechaFin: new Date(Date.now() + 7 * 60 * 60 * 1000),
        tipo: "entrega",
        prioridad: "alta",
        completado: false,
        cliente: {
          nombre: "Pedro Jiménez",
          telefono: "6666-7777",
        },
        vehiculo: {
          marca: "Nissan",
          modelo: "Sentra",
          placa: "GHI789",
        },
        ubicacion: "Patio Principal - A3",
        recordatorios: [{ tiempo: 30, enviado: false }],
      },
      {
        id: "4",
        titulo: "Reunión de equipo",
        descripcion: "Revisión semanal de casos",
        fechaInicio: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        fechaFin: new Date(Date.now() + 25 * 60 * 60 * 1000),
        tipo: "reunion",
        prioridad: "media",
        completado: false,
        recordatorios: [{ tiempo: 60, enviado: false }],
      },
    ];

    setEventos(eventosSimulados);
  }, []);

  const getEventosDelDia = (fecha: Date) => {
    return eventos
      .filter((evento) => {
        const fechaEvento = new Date(evento.fechaInicio);
        return fechaEvento.toDateString() === fecha.toDateString();
      })
      .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
  };

  const getEventosPendientes = () => {
    const ahora = new Date();
    return eventos
      .filter((evento) => !evento.completado && new Date(evento.fechaInicio) > ahora)
      .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
  };

  const getProximoEvento = () => {
    const ahora = new Date();
    return eventos
      .filter((evento) => !evento.completado && new Date(evento.fechaInicio) > ahora)
      .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())[0];
  };

  const toggleEventoCompletado = (eventoId: string) => {
    setEventos((prev) =>
      prev.map((evento) =>
        evento.id === eventoId ? { ...evento, completado: !evento.completado } : evento
      )
    );
  };

  const getTipoIcon = (tipo: EventoAgenda["tipo"]) => {
    switch (tipo) {
      case "cita":
        return <UserIcon className="h-5 w-5" />;
      case "mantenimiento":
        return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case "entrega":
        return <TruckIcon className="h-5 w-5" />;
      case "reunion":
        return <DocumentTextIcon className="h-5 w-5" />;
      case "recordatorio":
        return <BellIcon className="h-5 w-5" />;
      default:
        return <CalendarIcon className="h-5 w-5" />;
    }
  };

  const getPrioridadColor = (prioridad: EventoAgenda["prioridad"]) => {
    switch (prioridad) {
      case "alta":
        return "border-red-500 bg-red-50 text-red-700";
      case "media":
        return "border-yellow-500 bg-yellow-50 text-yellow-700";
      case "baja":
        return "border-green-500 bg-green-50 text-green-700";
      default:
        return "border-gray-500 bg-gray-50 text-gray-700";
    }
  };

  const formatearTiempo = (fecha: Date) => {
    return fecha.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTiempoRelativo = (fecha: Date) => {
    const ahora = new Date();
    const diferencia = fecha.getTime() - ahora.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (diferencia < 0) {
      return "Vencido";
    } else if (minutos < 60) {
      return `En ${minutos} min`;
    } else if (horas < 24) {
      return `En ${horas}h ${minutos % 60}min`;
    } else {
      return `En ${dias} días`;
    }
  };

  const eventosDia = getEventosDelDia(fechaSeleccionada);
  const eventosPendientes = getEventosPendientes();
  const proximoEvento = getProximoEvento();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Agenda</h1>
          <p className="text-gray-600 mt-1">
            {fechaSeleccionada.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Selector de vista */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["dia", "semana", "mes"] as const).map((vista) => (
              <button
                key={vista}
                onClick={() => setVistaActual(vista)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  vistaActual === vista
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {vista}
              </button>
            ))}
          </div>

          {/* Botón nuevo evento */}
          <button
            onClick={() => setMostrarFormEvento(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel principal - Vista de agenda */}
        <div className="lg:col-span-2 space-y-6">
          {/* Próximo evento destacado */}
          {proximoEvento && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Próximo evento</h2>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  {getTiempoRelativo(new Date(proximoEvento.fechaInicio))}
                </span>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-2 bg-white bg-opacity-20 rounded-lg">
                  {getTipoIcon(proximoEvento.tipo)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg">{proximoEvento.titulo}</h3>
                  <p className="text-blue-100 text-sm mt-1">{proximoEvento.descripcion}</p>

                  <div className="flex items-center space-x-4 mt-3 text-sm text-blue-100">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        {formatearTiempo(new Date(proximoEvento.fechaInicio))} -
                        {formatearTiempo(new Date(proximoEvento.fechaFin))}
                      </span>
                    </div>

                    {proximoEvento.cliente && (
                      <div className="flex items-center space-x-1">
                        <UserIcon className="h-4 w-4" />
                        <span>{proximoEvento.cliente.nombre}</span>
                      </div>
                    )}
                  </div>

                  {proximoEvento.vehiculo && (
                    <div className="mt-2 text-sm text-blue-100">
                      {proximoEvento.vehiculo.marca} {proximoEvento.vehiculo.modelo} -{" "}
                      {proximoEvento.vehiculo.placa}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lista de eventos del día */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Eventos de hoy ({eventosDia.length})
                </h2>

                {/* Filtro por tipo */}
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1"
                >
                  <option value="todos">Todos</option>
                  <option value="cita">Citas</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="entrega">Entregas</option>
                  <option value="reunion">Reuniones</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {eventosDia.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>No hay eventos programados para hoy</p>
                </div>
              ) : (
                eventosDia
                  .filter((evento) => filtroTipo === "todos" || evento.tipo === filtroTipo)
                  .map((evento) => (
                    <EventoCard
                      key={evento.id}
                      evento={evento}
                      onToggleCompletado={() => toggleEventoCompletado(evento.id)}
                      onSeleccionar={() => setEventoSeleccionado(evento)}
                    />
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Mini calendario */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Calendario</h3>
            <MiniCalendario
              fechaSeleccionada={fechaSeleccionada}
              onFechaChange={setFechaSeleccionada}
              eventos={eventos}
            />
          </div>

          {/* Eventos pendientes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Próximos eventos</h3>
            <div className="space-y-3">
              {eventosPendientes.slice(0, 5).map((evento) => (
                <div key={evento.id} className="flex items-center space-x-3">
                  <div
                    className={`flex-shrink-0 p-1 rounded ${getPrioridadColor(evento.prioridad)}`}
                  >
                    {getTipoIcon(evento.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{evento.titulo}</p>
                    <p className="text-xs text-gray-500">
                      {getTiempoRelativo(new Date(evento.fechaInicio))}
                    </p>
                  </div>
                </div>
              ))}

              {eventosPendientes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No hay eventos pendientes</p>
              )}
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Estadísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Eventos hoy:</span>
                <span className="font-medium text-gray-900">{eventosDia.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completados:</span>
                <span className="font-medium text-green-600">
                  {eventosDia.filter((e) => e.completado).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pendientes:</span>
                <span className="font-medium text-yellow-600">
                  {eventosDia.filter((e) => !e.completado).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Esta semana:</span>
                <span className="font-medium text-blue-600">
                  {
                    eventos.filter((e) => {
                      const fechaEvento = new Date(e.fechaInicio);
                      const inicioSemana = new Date(fechaSeleccionada);
                      inicioSemana.setDate(
                        fechaSeleccionada.getDate() - fechaSeleccionada.getDay()
                      );
                      const finSemana = new Date(inicioSemana);
                      finSemana.setDate(inicioSemana.getDate() + 6);
                      return fechaEvento >= inicioSemana && fechaEvento <= finSemana;
                    }).length
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para tarjeta de evento
interface EventoCardProps {
  evento: EventoAgenda;
  onToggleCompletado: () => void;
  onSeleccionar: () => void;
}

const EventoCard: React.FC<EventoCardProps> = ({ evento, onToggleCompletado, onSeleccionar }) => {
  const getTipoIcon = (tipo: EventoAgenda["tipo"]) => {
    switch (tipo) {
      case "cita":
        return <UserIcon className="h-5 w-5" />;
      case "mantenimiento":
        return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case "entrega":
        return <TruckIcon className="h-5 w-5" />;
      case "reunion":
        return <DocumentTextIcon className="h-5 w-5" />;
      case "recordatorio":
        return <BellIcon className="h-5 w-5" />;
      default:
        return <CalendarIcon className="h-5 w-5" />;
    }
  };

  const getPrioridadColor = (prioridad: EventoAgenda["prioridad"]) => {
    switch (prioridad) {
      case "alta":
        return "border-red-500 bg-red-50 text-red-700";
      case "media":
        return "border-yellow-500 bg-yellow-50 text-yellow-700";
      case "baja":
        return "border-green-500 bg-green-50 text-green-700";
      default:
        return "border-gray-500 bg-gray-50 text-gray-700";
    }
  };

  const formatearTiempo = (fecha: Date) => {
    return fecha.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        evento.completado ? "opacity-60" : ""
      }`}
      onClick={onSeleccionar}
    >
      <div className="flex items-start space-x-4">
        {/* Checkbox de completado */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompletado();
          }}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            evento.completado
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-500"
          }`}
        >
          {evento.completado && <CheckCircleSolid className="h-4 w-4" />}
        </button>

        {/* Información del evento */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <div
              className={`flex-shrink-0 p-1 rounded border ${getPrioridadColor(evento.prioridad)}`}
            >
              {getTipoIcon(evento.tipo)}
            </div>

            <div className="flex-1">
              <h3
                className={`text-sm font-medium ${
                  evento.completado ? "line-through text-gray-500" : "text-gray-900"
                }`}
              >
                {evento.titulo}
              </h3>

              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-3 w-3" />
                  <span>
                    {formatearTiempo(new Date(evento.fechaInicio))} -
                    {formatearTiempo(new Date(evento.fechaFin))}
                  </span>
                </div>

                {evento.prioridad === "alta" && (
                  <div className="flex items-center space-x-1">
                    <ExclamationTriangleIcon className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">Alta prioridad</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recordatorio activo */}
            {evento.recordatorios.some((r) => !r.enviado) && (
              <BellSolid className="h-4 w-4 text-blue-500" />
            )}
          </div>

          {/* Información adicional */}
          {(evento.cliente || evento.vehiculo || evento.ubicacion) && (
            <div className="mt-2 space-y-1">
              {evento.cliente && (
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <UserIcon className="h-3 w-3" />
                  <span>{evento.cliente.nombre}</span>
                  {evento.cliente.telefono && (
                    <>
                      <PhoneIcon className="h-3 w-3" />
                      <span>{evento.cliente.telefono}</span>
                    </>
                  )}
                </div>
              )}

              {evento.vehiculo && (
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <WrenchScrewdriverIcon className="h-3 w-3" />
                  <span>
                    {evento.vehiculo.marca} {evento.vehiculo.modelo} - {evento.vehiculo.placa}
                  </span>
                </div>
              )}

              {evento.ubicacion && (
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <MapPinIcon className="h-3 w-3" />
                  <span>{evento.ubicacion}</span>
                </div>
              )}
            </div>
          )}

          {evento.descripcion && (
            <p className="mt-2 text-xs text-gray-600 line-clamp-2">{evento.descripcion}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Mini calendario componente
interface MiniCalendarioProps {
  fechaSeleccionada: Date;
  onFechaChange: (fecha: Date) => void;
  eventos: EventoAgenda[];
}

const MiniCalendario: React.FC<MiniCalendarioProps> = ({
  fechaSeleccionada,
  onFechaChange,
  eventos,
}) => {
  const [mesActual, setMesActual] = useState(new Date(fechaSeleccionada));

  const primerDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
  const ultimoDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
  const primerDiaSemana = primerDiaMes.getDay();

  // Generar días del mes
  const dias = [];

  // Días del mes anterior
  for (let i = primerDiaSemana - 1; i >= 0; i--) {
    const fecha = new Date(primerDiaMes);
    fecha.setDate(fecha.getDate() - i - 1);
    dias.push({ fecha, esDelMes: false });
  }

  // Días del mes actual
  for (let dia = 1; dia <= ultimoDiaMes.getDate(); dia++) {
    const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
    dias.push({ fecha, esDelMes: true });
  }

  // Días del siguiente mes para completar la grilla
  const diasRestantes = 42 - dias.length; // 6 semanas × 7 días
  for (let dia = 1; dia <= diasRestantes; dia++) {
    const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, dia);
    dias.push({ fecha, esDelMes: false });
  }

  const cambiarMes = (direccion: number) => {
    setMesActual((prev) => new Date(prev.getFullYear(), prev.getMonth() + direccion, 1));
  };

  const tieneEventos = (fecha: Date) => {
    return eventos.some((evento) => {
      const fechaEvento = new Date(evento.fechaInicio);
      return fechaEvento.toDateString() === fecha.toDateString();
    });
  };

  const esHoy = (fecha: Date) => {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  const esFechaSeleccionada = (fecha: Date) => {
    return fecha.toDateString() === fechaSeleccionada.toDateString();
  };

  return (
    <div className="text-center">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => cambiarMes(-1)} className="p-1 hover:bg-gray-100 rounded">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h4 className="text-sm font-medium text-gray-900">
          {mesActual.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
        </h4>

        <button onClick={() => cambiarMes(1)} className="p-1 hover:bg-gray-100 rounded">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["D", "L", "M", "M", "J", "V", "S"].map((dia) => (
          <div key={dia} className="text-xs font-medium text-gray-500 text-center py-1">
            {dia}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {dias.map(({ fecha, esDelMes }, index) => (
          <button
            key={index}
            onClick={() => onFechaChange(fecha)}
            className={`
              relative p-1 text-xs rounded hover:bg-gray-100 transition-colors
              ${!esDelMes ? "text-gray-300" : "text-gray-900"}
              ${esHoy(fecha) ? "bg-blue-100 text-blue-700 font-medium" : ""}
              ${esFechaSeleccionada(fecha) ? "bg-blue-500 text-white" : ""}
            `}
          >
            {fecha.getDate()}
            {tieneEventos(fecha) && esDelMes && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
