"use client";

import {
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  InformationCircleIcon,
  TrashIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  BellIcon as BellSolid,
  ExclamationTriangleIcon as ExclamationSolid,
} from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: "info" | "warning" | "success" | "error" | "reminder";
  categoria: "orden" | "agenda" | "sistema" | "cliente" | "equipo";
  fechaCreacion: Date;
  leida: boolean;
  prioridad: "alta" | "media" | "baja";
  accion?: {
    texto: string;
    url?: string;
    callback?: () => void;
  };
  datos?: {
    ordenId?: string;
    clienteNombre?: string;
    vehiculoPlaca?: string;
    fechaVencimiento?: Date;
  };
}

interface NotificacionesToastProps {
  notificaciones: Notificacion[];
  onMarcarLeida: (id: string) => void;
  onEliminar: (id: string) => void;
}

interface NotificacionesPanelProps {
  tecnicoId: string;
}

export const NotificacionesPanel: React.FC<NotificacionesPanelProps> = ({ tecnicoId }) => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroLeidas, setFiltroLeidas] = useState<"todas" | "noLeidas" | "leidas">("todas");
  const [mostrarToasts, setMostrarToasts] = useState(true);

  // Cargar notificaciones simuladas
  useEffect(() => {
    const notificacionesSimuladas: Notificacion[] = [
      {
        id: "1",
        titulo: "Orden próxima a vencer SLA",
        mensaje: "La orden #OT-2024-001 vence en 2 horas. Cliente: Carlos Rodríguez",
        tipo: "warning",
        categoria: "orden",
        fechaCreacion: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
        leida: false,
        prioridad: "alta",
        accion: {
          texto: "Ver orden",
          url: "/dashboard/tecnico/ordenes/OT-2024-001",
        },
        datos: {
          ordenId: "OT-2024-001",
          clienteNombre: "Carlos Rodríguez",
          vehiculoPlaca: "ABC123",
          fechaVencimiento: new Date(Date.now() + 2 * 60 * 60 * 1000),
        },
      },
      {
        id: "2",
        titulo: "Cita programada en 30 minutos",
        mensaje: "Recepción de vehículo Honda Civic - Ana María Soto",
        tipo: "reminder",
        categoria: "agenda",
        fechaCreacion: new Date(Date.now() - 15 * 60 * 1000),
        leida: false,
        prioridad: "alta",
        accion: {
          texto: "Ver agenda",
        },
        datos: {
          clienteNombre: "Ana María Soto",
          vehiculoPlaca: "DEF456",
        },
      },
      {
        id: "3",
        titulo: "Orden completada exitosamente",
        mensaje: "La orden #OT-2024-002 ha sido completada y está lista para entrega",
        tipo: "success",
        categoria: "orden",
        fechaCreacion: new Date(Date.now() - 30 * 60 * 1000),
        leida: false,
        prioridad: "media",
        accion: {
          texto: "Preparar entrega",
        },
        datos: {
          ordenId: "OT-2024-002",
          clienteNombre: "Pedro Jiménez",
          vehiculoPlaca: "GHI789",
        },
      },
      {
        id: "4",
        titulo: "Cliente solicita actualización",
        mensaje: "María González pregunta por el estado de su reparación",
        tipo: "info",
        categoria: "cliente",
        fechaCreacion: new Date(Date.now() - 45 * 60 * 1000),
        leida: false,
        prioridad: "media",
        accion: {
          texto: "Contactar cliente",
        },
        datos: {
          clienteNombre: "María González",
          vehiculoPlaca: "JKL012",
        },
      },
      {
        id: "5",
        titulo: "Reunión de equipo mañana",
        mensaje: "Reunión semanal programada para mañana a las 9:00 AM",
        tipo: "info",
        categoria: "equipo",
        fechaCreacion: new Date(Date.now() - 60 * 60 * 1000),
        leida: true,
        prioridad: "baja",
        accion: {
          texto: "Ver calendario",
        },
      },
      {
        id: "6",
        titulo: "Nuevo mensaje del supervisor",
        mensaje: "Revisa las nuevas directrices de calidad en el portal",
        tipo: "info",
        categoria: "sistema",
        fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000),
        leida: true,
        prioridad: "media",
      },
      {
        id: "7",
        titulo: "Error en sistema de inventario",
        mensaje:
          "Problema temporal con la consulta de repuestos. IT está trabajando en una solución",
        tipo: "error",
        categoria: "sistema",
        fechaCreacion: new Date(Date.now() - 3 * 60 * 60 * 1000),
        leida: false,
        prioridad: "alta",
      },
    ];

    setNotificaciones(notificacionesSimuladas);
  }, []);

  const marcarComoLeida = (id: string) => {
    setNotificaciones((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, leida: true } : notif))
    );
  };

  const eliminarNotificacion = (id: string) => {
    setNotificaciones((prev) => prev.filter((notif) => notif.id !== id));
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones((prev) => prev.map((notif) => ({ ...notif, leida: true })));
  };

  const eliminarTodasLeidas = () => {
    setNotificaciones((prev) => prev.filter((notif) => !notif.leida));
  };

  const getTipoIcon = (tipo: Notificacion["tipo"]) => {
    switch (tipo) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <ExclamationSolid className="h-5 w-5 text-red-500" />;
      case "reminder":
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoriaIcon = (categoria: Notificacion["categoria"]) => {
    switch (categoria) {
      case "orden":
        return <WrenchScrewdriverIcon className="h-4 w-4" />;
      case "agenda":
        return <CalendarIcon className="h-4 w-4" />;
      case "cliente":
        return <UserIcon className="h-4 w-4" />;
      case "equipo":
        return <UserIcon className="h-4 w-4" />;
      default:
        return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  const getTipoColor = (tipo: Notificacion["tipo"]) => {
    switch (tipo) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "reminder":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const formatearTiempo = (fecha: Date) => {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return "Ahora";
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias} días`;
    return fecha.toLocaleDateString("es-ES");
  };

  const notificacionesFiltradas = notificaciones.filter((notif) => {
    const cumpleFiltroCategoria =
      filtroCategoria === "todas" || notif.categoria === filtroCategoria;
    const cumpleFiltroLeidas =
      filtroLeidas === "todas" ||
      (filtroLeidas === "noLeidas" && !notif.leida) ||
      (filtroLeidas === "leidas" && notif.leida);

    return cumpleFiltroCategoria && cumpleFiltroLeidas;
  });

  const contadorNoLeidas = notificaciones.filter((n) => !n.leida).length;
  const notificacionesPrioritarias = notificaciones.filter(
    (n) => !n.leida && n.prioridad === "alta"
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <BellSolid className="h-8 w-8 text-blue-600" />
            {contadorNoLeidas > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {contadorNoLeidas > 9 ? "9+" : contadorNoLeidas}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
            <p className="text-gray-600">
              {contadorNoLeidas > 0
                ? `${contadorNoLeidas} notificaciones sin leer`
                : "Todas las notificaciones están al día"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={marcarTodasComoLeidas}
            disabled={contadorNoLeidas === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              contadorNoLeidas > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Marcar todas como leídas
          </button>

          <button
            onClick={eliminarTodasLeidas}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Limpiar leídas
          </button>
        </div>
      </div>

      {/* Alertas prioritarias */}
      {notificacionesPrioritarias.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <ExclamationSolid className="h-5 w-5 text-red-500" />
            <h2 className="font-medium text-red-800">
              Notificaciones Urgentes ({notificacionesPrioritarias.length})
            </h2>
          </div>
          <div className="space-y-2">
            {notificacionesPrioritarias.map((notif) => (
              <div key={notif.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{notif.titulo}</p>
                  <p className="text-xs text-red-700">{notif.mensaje}</p>
                </div>
                {notif.accion && (
                  <button className="ml-4 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                    {notif.accion.texto}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Categoría:</label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="todas">Todas</option>
            <option value="orden">Órdenes</option>
            <option value="agenda">Agenda</option>
            <option value="cliente">Clientes</option>
            <option value="equipo">Equipo</option>
            <option value="sistema">Sistema</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Estado:</label>
          <select
            value={filtroLeidas}
            onChange={(e) => setFiltroLeidas(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="todas">Todas</option>
            <option value="noLeidas">No leídas</option>
            <option value="leidas">Leídas</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="mostrarToasts"
            checked={mostrarToasts}
            onChange={(e) => setMostrarToasts(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <label htmlFor="mostrarToasts" className="text-sm text-gray-700">
            Mostrar toasts
          </label>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-3">
        {notificacionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay notificaciones que mostrar</p>
          </div>
        ) : (
          notificacionesFiltradas.map((notif) => (
            <NotificacionCard
              key={notif.id}
              notificacion={notif}
              onMarcarLeida={() => marcarComoLeida(notif.id)}
              onEliminar={() => eliminarNotificacion(notif.id)}
            />
          ))
        )}
      </div>

      {/* Toasts flotantes */}
      {mostrarToasts && (
        <NotificacionesToast
          notificaciones={notificacionesPrioritarias.slice(0, 3)}
          onMarcarLeida={marcarComoLeida}
          onEliminar={eliminarNotificacion}
        />
      )}
    </div>
  );
};

// Componente para tarjeta de notificación
interface NotificacionCardProps {
  notificacion: Notificacion;
  onMarcarLeida: () => void;
  onEliminar: () => void;
}

const NotificacionCard: React.FC<NotificacionCardProps> = ({
  notificacion,
  onMarcarLeida,
  onEliminar,
}) => {
  const getTipoIcon = (tipo: Notificacion["tipo"]) => {
    switch (tipo) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <ExclamationSolid className="h-5 w-5 text-red-500" />;
      case "reminder":
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoriaIcon = (categoria: Notificacion["categoria"]) => {
    switch (categoria) {
      case "orden":
        return <WrenchScrewdriverIcon className="h-4 w-4" />;
      case "agenda":
        return <CalendarIcon className="h-4 w-4" />;
      case "cliente":
        return <UserIcon className="h-4 w-4" />;
      case "equipo":
        return <UserIcon className="h-4 w-4" />;
      default:
        return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  const getTipoColor = (tipo: Notificacion["tipo"]) => {
    switch (tipo) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "reminder":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const formatearTiempo = (fecha: Date) => {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(minutos / 60);

    if (minutos < 1) return "Ahora";
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    return fecha.toLocaleDateString("es-ES");
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all hover:shadow-sm ${
        notificacion.leida
          ? "bg-white border-gray-200"
          : `${getTipoColor(notificacion.tipo)} border-l-4`
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Indicador de tipo */}
        <div className="flex-shrink-0 mt-1">{getTipoIcon(notificacion.tipo)}</div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3
                  className={`text-sm font-medium ${
                    notificacion.leida ? "text-gray-600" : "text-gray-900"
                  }`}
                >
                  {notificacion.titulo}
                </h3>

                <div className="flex items-center space-x-1 text-gray-400">
                  {getCategoriaIcon(notificacion.categoria)}
                  <span className="text-xs capitalize">{notificacion.categoria}</span>
                </div>

                {notificacion.prioridad === "alta" && !notificacion.leida && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Urgente
                  </span>
                )}
              </div>

              <p className={`text-sm ${notificacion.leida ? "text-gray-500" : "text-gray-700"}`}>
                {notificacion.mensaje}
              </p>

              {/* Datos adicionales */}
              {notificacion.datos && (
                <div className="mt-2 flex flex-wrap items-center space-x-4 text-xs text-gray-500">
                  {notificacion.datos.ordenId && <span>Orden: {notificacion.datos.ordenId}</span>}
                  {notificacion.datos.clienteNombre && (
                    <span>Cliente: {notificacion.datos.clienteNombre}</span>
                  )}
                  {notificacion.datos.vehiculoPlaca && (
                    <span>Vehículo: {notificacion.datos.vehiculoPlaca}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {formatearTiempo(notificacion.fechaCreacion)}
                </span>

                {notificacion.accion && (
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    {notificacion.accion.texto}
                  </button>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center space-x-2 ml-4">
              {!notificacion.leida && (
                <button
                  onClick={onMarcarLeida}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Marcar como leída"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={onEliminar}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para toasts flotantes
const NotificacionesToast: React.FC<NotificacionesToastProps> = ({
  notificaciones,
  onMarcarLeida,
  onEliminar,
}) => {
  if (notificaciones.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notificaciones.map((notif) => (
        <div
          key={notif.id}
          className={`border rounded-lg p-4 shadow-lg bg-white animate-slide-in-right ${
            notif.tipo === "error"
              ? "border-red-200"
              : notif.tipo === "warning"
              ? "border-yellow-200"
              : "border-blue-200"
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {notif.tipo === "error" && <ExclamationSolid className="h-5 w-5 text-red-500" />}
              {notif.tipo === "warning" && (
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
              )}
              {notif.tipo === "reminder" && <ClockIcon className="h-5 w-5 text-blue-500" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">{notif.titulo}</h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.mensaje}</p>

              {notif.accion && (
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2">
                  {notif.accion.texto}
                </button>
              )}
            </div>

            <button
              onClick={() => onEliminar(notif.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
