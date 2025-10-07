"use client";

import AsignarTecnicoModal from "@/components/ui/AsignarTecnicoModal";
import { useToast } from "@/components/ui/ToastNotification";
import WorkflowViewer from "@/components/workflow/WorkflowViewer";
import useAsignacionTecnico from "@/hooks/useAsignacionTecnico";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  EyeIcon,
  TruckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

interface OrdenTrabajo {
  id: string;
  codigoSeguimiento: string;
  cliente: {
    name: string;
    phone: string;
    email?: string;
  };
  vehiculo: {
    brand: string;
    model: string;
    year: number;
    licensePlate?: string;
    color?: string;
  };
  tecnico?: {
    id: string;
    name: string;
  };
  estado:
    | "RECEPCION"
    | "INGRESO"
    | "DIAGNOSTICO"
    | "COTIZACION_APROBACION"
    | "PROCESO_DESARME"
    | "ESPERA"
    | "PROCESO_ARMADO"
    | "PRUEBA_CALIDAD"
    | "ENTREGA";
  prioridad: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  fechaIngreso: string;
  ultimaActualizacion: string;
  tareas: {
    total: number;
    completadas: number;
    pendientes: number;
  };
  observaciones?: string;
  evidenciasFotos: number;
}

interface Props {
  stats: {
    total: number;
    recibidos: number;
    enProceso: number;
    esperandoRepuestos: number;
    completados: number;
    entregados: number;
  };
}

// Configuración de estados del flujo de trabajo
const ESTADOS_CONFIG = {
  RECEPCION: {
    label: "Recepción",
    icon: TruckIcon,
    color: "bg-blue-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-400",
  },
  INGRESO: {
    label: "Ingreso",
    icon: DocumentTextIcon,
    color: "bg-indigo-500",
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-400",
  },
  DIAGNOSTICO: {
    label: "Diagnóstico",
    icon: CogIcon,
    color: "bg-yellow-500",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-400",
  },
  COTIZACION_APROBACION: {
    label: "Cotización y Aprobación",
    icon: DocumentTextIcon,
    color: "bg-orange-500",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-400",
  },
  PROCESO_DESARME: {
    label: "Proceso de Desarme",
    icon: CogIcon,
    color: "bg-red-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-400",
  },
  ESPERA: {
    label: "Espera (Pausa SLA)",
    icon: ClockIcon,
    color: "bg-gray-500",
    bgColor: "bg-gray-500/10",
    textColor: "text-gray-400",
  },
  PROCESO_ARMADO: {
    label: "Proceso de Armado",
    icon: CogIcon,
    color: "bg-purple-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-400",
  },
  PRUEBA_CALIDAD: {
    label: "Prueba de Calidad",
    icon: CheckCircleIcon,
    color: "bg-green-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-400",
  },
  ENTREGA: {
    label: "Entrega",
    icon: TruckIcon,
    color: "bg-emerald-500",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
  },
};

// Configuración de prioridades
const PRIORIDAD_CONFIG = {
  LOW: {
    label: "Baja",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  MEDIUM: {
    label: "Media",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  HIGH: {
    label: "Alta",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  URGENT: {
    label: "Urgente",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
};

export default function OrdenesTrabajoSection({ stats }: Props) {
  const { showSuccess, showError, showWarning } = useToast();
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  // Estado para modal de workflow
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [currentWorkflowVehicle, setCurrentWorkflowVehicle] = useState<{
    id: string;
    trackingCode: string;
    technicianId?: string;
  } | null>(null);

  // Hook para manejo de asignación de técnicos
  const {
    isModalOpen: isAsignacionModalOpen,
    currentVehicle: currentVehicleForAssignment,
    openModal: openAsignacionModal,
    closeModal: closeAsignacionModal,
    handleAsignacionSuccess,
  } = useAsignacionTecnico((vehicleId, assignmentData) => {
    // Actualizar la orden con el técnico asignado
    setOrdenes((prev) => {
      const nuevasOrdenes = prev.map((orden) =>
        orden.id === vehicleId
          ? {
              ...orden,
              tecnico: {
                id: assignmentData.appointment.technicianId,
                name: assignmentData.appointment.technicianName,
              },
              ultimaActualizacion: new Date().toISOString(),
            }
          : orden
      );

      // Mostrar notificación de éxito con la orden encontrada
      const ordenAsignada = nuevasOrdenes.find((o) => o.id === vehicleId);
      setTimeout(() => {
        showSuccess(
          "Técnico Asignado",
          `${assignmentData.appointment.technicianName} ha sido asignado a la orden ${
            ordenAsignada?.codigoSeguimiento || vehicleId
          }`
        );
      }, 100);

      return nuevasOrdenes;
    });
  });

  // Funciones para modal de workflow
  const openWorkflowModal = (orden: OrdenTrabajo) => {
    setCurrentWorkflowVehicle({
      id: orden.id,
      trackingCode: orden.codigoSeguimiento,
      technicianId: orden.tecnico?.id,
    });
    setWorkflowModalOpen(true);
  };

  const closeWorkflowModal = () => {
    setWorkflowModalOpen(false);
    setCurrentWorkflowVehicle(null);
  };

  const handleWorkflowUpdate = () => {
    // Recargar datos cuando se actualiza el workflow
    cargarOrdenes();
  };

  // Cargar órdenes de trabajo
  const cargarOrdenes = async () => {
    if (loadedRef.current) {
      return; // Evitar múltiples cargas
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/recepcion/vehiculos");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data && Array.isArray(result.data)) {
        const ordenesFormateadas: OrdenTrabajo[] = result.data
          .filter((vehiculo: any) => vehiculo && vehiculo.id) // Filtrar registros válidos
          .map((vehiculo: any) => {
            // Validar datos básicos
            const vehiculoStr = vehiculo.vehiculo || "Vehículo N/A";
            const vehiculoParts = vehiculoStr.split(" ");

            return {
              id: vehiculo.id,
              codigoSeguimiento: vehiculo.codigoSeguimiento || "N/A",
              cliente: {
                name: vehiculo.cliente || "Cliente N/A",
                phone: vehiculo.telefono || "N/A",
                email: vehiculo.email || "",
              },
              vehiculo: {
                brand: vehiculoParts[0] || "Marca",
                model: vehiculoParts.slice(1).join(" ") || "Modelo",
                year: new Date().getFullYear(),
                licensePlate: vehiculo.placa || "",
                color: "N/A",
              },
              tecnico:
                vehiculo.tecnico &&
                vehiculo.tecnico !== "No asignado" &&
                vehiculo.tecnico !== "Asignación Pendiente"
                  ? { id: "unknown", name: vehiculo.tecnico }
                  : undefined,
              estado: vehiculo.estado || "RECEIVED",
              prioridad: "MEDIUM" as const,
              fechaIngreso: vehiculo.fechaIngreso || new Date().toISOString(),
              ultimaActualizacion: vehiculo.fechaIngreso || new Date().toISOString(),
              tareas: {
                total: 4,
                completadas: 2,
                pendientes: 2,
              },
              observaciones: "Orden de trabajo generada automáticamente",
              evidenciasFotos: vehiculo.evidencias || 0,
            };
          });

        console.log("Órdenes cargadas exitosamente:", ordenesFormateadas.length);
        setOrdenes(ordenesFormateadas);
        loadedRef.current = true; // Marcar como cargado
      } else {
        console.warn("No se recibieron datos válidos:", result);
        setOrdenes([]);
      }
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);
      showError("Error", "No se pudieron cargar las órdenes de trabajo: " + errorMessage);
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔄 useEffect ejecutándose, loadedRef.current:", loadedRef.current);
    cargarOrdenes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recargarOrdenes = () => {
    loadedRef.current = false; // Permitir nueva carga
    cargarOrdenes();
  };

  const handleAsignarTecnico = (orden: OrdenTrabajo) => {
    openAsignacionModal({
      id: orden.id,
      cliente: orden.cliente.name,
      vehiculo: `${orden.vehiculo.brand} ${orden.vehiculo.model} ${orden.vehiculo.year}`,
      placa: orden.vehiculo.licensePlate || "Sin placa",
      codigoSeguimiento: orden.codigoSeguimiento,
      tecnicoActual: orden.tecnico?.name || null,
    });
  };

  const cambiarEstadoOrden = async (ordenId: string, nuevoEstado: string) => {
    try {
      // Aquí iría la llamada a la API para cambiar el estado
      setOrdenes((prev) =>
        prev.map((orden) =>
          orden.id === ordenId
            ? {
                ...orden,
                estado: nuevoEstado as any,
                ultimaActualizacion: new Date().toISOString(),
              }
            : orden
        )
      );
      showSuccess("Estado Actualizado", "El estado de la orden se ha actualizado correctamente");
    } catch (error) {
      showError("Error", "No se pudo actualizar el estado");
    }
  };

  // Filtrar órdenes
  const ordenesFiltradas = ordenes.filter((orden) => {
    let matchesEstado = true;

    if (filtroEstado === "sin_tecnico") {
      matchesEstado = !orden.tecnico;
    } else if (filtroEstado !== "todos") {
      matchesEstado = orden.estado === filtroEstado;
    }

    const matchesSearch =
      !searchTerm ||
      orden.cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.codigoSeguimiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (orden.vehiculo.licensePlate &&
        orden.vehiculo.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (orden.tecnico?.name && orden.tecnico.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesEstado && matchesSearch;
  });

  // Agrupar por estado para vista Kanban
  const ordenesPorEstado = Object.keys(ESTADOS_CONFIG).reduce((acc, estado) => {
    acc[estado] = ordenesFiltradas
      ? ordenesFiltradas.filter((orden) => orden.estado === estado)
      : [];
    return acc;
  }, {} as Record<string, OrdenTrabajo[]>);

  const TarjetaOrden = ({ orden }: { orden: OrdenTrabajo }) => {
    const estadoConfig = ESTADOS_CONFIG[orden.estado];
    const prioridadConfig = PRIORIDAD_CONFIG[orden.prioridad];
    const IconoEstado = estadoConfig.icon;

    return (
      <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-4 hover:border-primary-500/50 transition-colors">
        {/* Header de la tarjeta */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${estadoConfig.bgColor}`}>
              <IconoEstado className={`h-4 w-4 ${estadoConfig.textColor}`} />
            </div>
            <div>
              <h3 className="font-medium text-white text-sm">{orden.codigoSeguimiento}</h3>
              <p className="text-xs text-gray-400">{orden.cliente.name}</p>
            </div>
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${prioridadConfig.color} ${prioridadConfig.bg}`}
          >
            {prioridadConfig.label}
          </div>
        </div>

        {/* Información del vehículo */}
        <div className="mb-3">
          <p className="text-sm text-white font-medium">
            {orden.vehiculo.brand} {orden.vehiculo.model} {orden.vehiculo.year}
          </p>
          <p className="text-xs text-gray-400">
            {orden.vehiculo.licensePlate ? `Placa: ${orden.vehiculo.licensePlate}` : "Sin placa"}
          </p>
        </div>

        {/* Técnico asignado */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">
                {orden.tecnico ? orden.tecnico.name : "Sin asignar"}
              </span>
            </div>
            {!orden.tecnico && (
              <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                Pendiente
              </span>
            )}
          </div>
          <button
            onClick={() => handleAsignarTecnico(orden)}
            className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              orden.tecnico
                ? "bg-primary-500/20 text-primary-300 hover:bg-primary-500/30 border border-primary-500/40"
                : "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/40"
            }`}
          >
            {orden.tecnico ? "🔄 REASIGNAR TÉCNICO" : "👨‍🔧 ASIGNAR TÉCNICO"}
          </button>
        </div>

        {/* Progreso de tareas */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Progreso</span>
            <span>
              {orden.tareas.completadas}/{orden.tareas.total}
            </span>
          </div>
          <div className="w-full bg-secondary-700 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{
                width: `${
                  orden.tareas.total > 0 ? (orden.tareas.completadas / orden.tareas.total) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Información adicional */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <CalendarDaysIcon className="h-3 w-3" />
            <span>{new Date(orden.fechaIngreso).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CogIcon className="h-3 w-3" />
            <span>{orden.evidenciasFotos} fotos</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-secondary-700">
          <div className="flex items-center space-x-3">
            <button className="text-xs text-gray-400 hover:text-white transition-colors flex items-center space-x-1">
              <EyeIcon className="h-3 w-3" />
              <span>Ver detalles</span>
            </button>

            <button
              onClick={() => openWorkflowModal(orden)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
            >
              <CogIcon className="h-3 w-3" />
              <span>Ver Flujo</span>
            </button>
          </div>

          <select
            value={orden.estado}
            onChange={(e) => cambiarEstadoOrden(orden.id, e.target.value)}
            className="text-xs bg-secondary-700 border border-secondary-600 rounded px-2 py-1 text-white"
            disabled
            title="El estado solo puede ser actualizado por técnicos a través del flujo de trabajo"
          >
            {Object.entries(ESTADOS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Órdenes de Trabajo</h2>
          <p className="text-gray-400">Gestión y seguimiento de trabajos en curso</p>

          {/* Acceso rápido a órdenes sin técnico */}
          {ordenes &&
            ordenes.length > 0 &&
            ordenes.filter((orden) => !orden.tecnico).length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setFiltroEstado("sin_tecnico")}
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-300 hover:bg-yellow-500/30 transition-colors text-sm font-medium"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>
                    {ordenes.filter((orden) => !orden.tecnico).length} orden
                    {ordenes.filter((orden) => !orden.tecnico).length > 1 ? "es" : ""} sin técnico
                  </span>
                  <span className="text-xs bg-yellow-500/30 px-2 py-1 rounded">Asignar</span>
                </button>
              </div>
            )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Filtros */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white text-sm"
          >
            <option value="todos">Todos los estados</option>
            <option value="sin_tecnico">🚨 Sin técnico asignado</option>
            {Object.entries(ESTADOS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>

          {/* Búsqueda */}
          <input
            type="text"
            placeholder="Buscar por cliente, código o placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-gray-400 text-sm w-64"
          />

          {/* Botón de asignación rápida */}
          {ordenes && ordenes.filter((orden) => !orden.tecnico).length > 0 && (
            <button
              onClick={() => setFiltroEstado("sin_tecnico")}
              className="px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              👨‍🔧 Asignar Técnicos ({ordenes.filter((orden) => !orden.tecnico).length})
            </button>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* Órdenes sin técnico */}
        <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-700 ring-2 ring-yellow-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <UserIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {ordenes ? ordenes.filter((orden) => !orden.tecnico).length : 0}
              </p>
              <p className="text-xs text-gray-400">Sin Técnico</p>
            </div>
          </div>
        </div>

        {Object.entries(ESTADOS_CONFIG).map(([estado, config]) => {
          const count = ordenesFiltradas
            ? ordenesFiltradas.filter((orden) => orden.estado === estado).length
            : 0;
          const IconoEstado = config.icon;

          return (
            <div
              key={estado}
              className="bg-secondary-800 rounded-lg p-4 border border-secondary-700"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <IconoEstado className={`h-5 w-5 ${config.textColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-xs text-gray-400">{config.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-400 text-lg mb-2">⚠️ Error al cargar datos</div>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={recargarOrdenes}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : ordenes.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">📋 No hay órdenes de trabajo</div>
            <p className="text-gray-500 mb-4">No se encontraron órdenes de trabajo en el sistema</p>
            <button
              onClick={recargarOrdenes}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Recargar
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-secondary-800 rounded-xl border border-secondary-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-secondary-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Código</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Cliente</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Vehículo</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Técnico</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Progreso</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradas.map((orden) => {
                  const estadoConfig = ESTADOS_CONFIG[orden.estado];

                  return (
                    <tr
                      key={orden.id}
                      className="border-b border-secondary-700/50 hover:bg-secondary-700/30"
                    >
                      <td className="p-4">
                        <span className="font-medium text-white">{orden.codigoSeguimiento}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white">{orden.cliente.name}</p>
                          <p className="text-xs text-gray-400">{orden.cliente.phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white">
                            {orden.vehiculo.brand} {orden.vehiculo.model}
                          </p>
                          <p className="text-xs text-gray-400">
                            {orden.vehiculo.licensePlate || "Sin placa"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-white text-sm">
                              {orden.tecnico ? orden.tecnico.name : "Sin asignar"}
                            </span>
                            {!orden.tecnico && (
                              <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                                Pendiente
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleAsignarTecnico(orden)}
                            className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                              orden.tecnico
                                ? "bg-primary-500/20 text-primary-300 hover:bg-primary-500/30 border border-primary-500/40"
                                : "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/40"
                            }`}
                          >
                            {orden.tecnico ? "🔄 REASIGNAR" : "👨‍🔧 ASIGNAR"}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estadoConfig.textColor} ${estadoConfig.bgColor}`}
                        >
                          {estadoConfig.label}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-secondary-700 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  orden.tareas.total > 0
                                    ? (orden.tareas.completadas / orden.tareas.total) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">
                            {orden.tareas.completadas}/{orden.tareas.total}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-white transition-colors">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openWorkflowModal(orden)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Ver flujo de trabajo"
                          >
                            <CogIcon className="h-4 w-4" />
                          </button>
                          <select
                            value={orden.estado}
                            onChange={(e) => cambiarEstadoOrden(orden.id, e.target.value)}
                            className="text-xs bg-secondary-700 border border-secondary-600 rounded px-2 py-1 text-white"
                            disabled
                            title="El estado solo puede ser actualizado por técnicos a través del flujo de trabajo"
                          >
                            {Object.entries(ESTADOS_CONFIG).map(([key, config]) => (
                              <option key={key} value={key}>
                                {config.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Asignación de Técnico */}
      {currentVehicleForAssignment && (
        <AsignarTecnicoModal
          isOpen={isAsignacionModalOpen}
          onClose={closeAsignacionModal}
          vehicleId={currentVehicleForAssignment.id}
          vehicleInfo={{
            cliente: currentVehicleForAssignment.cliente,
            vehiculo: currentVehicleForAssignment.vehiculo,
            placa: currentVehicleForAssignment.placa,
            codigoSeguimiento: currentVehicleForAssignment.codigoSeguimiento,
          }}
          tecnicoActual={currentVehicleForAssignment.tecnicoActual}
          onSuccess={handleAsignacionSuccess}
        />
      )}

      {/* Modal de Flujo de Trabajo */}
      {workflowModalOpen && currentWorkflowVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Flujo de Trabajo</h3>
                <p className="text-sm text-gray-600">
                  Vehículo: {currentWorkflowVehicle.trackingCode}
                </p>
              </div>
              <button
                onClick={closeWorkflowModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <WorkflowViewer
                vehicleId={currentWorkflowVehicle.id}
                technicianId={currentWorkflowVehicle.technicianId || ""}
                isReadOnly={!currentWorkflowVehicle.technicianId}
                onStatusUpdate={handleWorkflowUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
