"use client";

import { useToast } from "@/components/ui/ToastNotification";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface VehiculoEnTaller {
  id: string;
  codigoSeguimiento: string;
  cliente: string;
  vehiculo: string;
  placa: string;
  fechaIngreso: string;
  horaIngreso: string;
  tecnicoAsignado: string;
  estado:
    | "recibido"
    | "diagnostico"
    | "esperando-repuestos"
    | "reparacion"
    | "control-calidad"
    | "listo-entrega";
  progreso: number; // 0-100
  tiempoEstimado: string;
  observacionesActuales: string;
  ubicacionTaller: string; // Bahía 1, Elevador 2, etc.
  prioridad: "baja" | "media" | "alta" | "urgente";
  servicios: string[];
  fechaEstimadaEntrega: string;
  horasTrabajoAcumuladas: number;
}

interface Props {
  stats: any;
  onClose?: () => void;
}

export default function VehiculosEnTallerSection({ stats, onClose }: Props) {
  const { showSuccess, showError, showWarning } = useToast();
  const [vehiculosEnTaller, setVehiculosEnTaller] = useState<VehiculoEnTaller[]>([]);
  const [selectedVehiculo, setSelectedVehiculo] = useState<VehiculoEnTaller | null>(null);
  const [showGestionModal, setShowGestionModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [gestionForm, setGestionForm] = useState({
    estado: "",
    progreso: 0,
    observaciones: "",
    tecnicoAsignado: "",
    ubicacionTaller: "",
    fechaEstimadaEntrega: "",
    tiempoEstimado: "",
  });

  // Inicializar datos de ejemplo
  useEffect(() => {
    const mockVehiculos: VehiculoEnTaller[] = [
      {
        id: "v-001",
        codigoSeguimiento: "TLR-2024-001",
        cliente: "Juan Pérez",
        vehiculo: "Honda Civic 2018",
        placa: "P123ABC",
        fechaIngreso: "2024-12-27",
        horaIngreso: "09:30",
        tecnicoAsignado: "Carlos López",
        estado: "reparacion",
        progreso: 65,
        tiempoEstimado: "2 días",
        observacionesActuales:
          "Reemplazo de frenos delanteros en progreso. Se detectó desgaste en discos.",
        ubicacionTaller: "Bahía 3",
        prioridad: "alta",
        servicios: ["Cambio de frenos", "Alineación", "Balanceo"],
        fechaEstimadaEntrega: "2024-12-29",
        horasTrabajoAcumuladas: 8.5,
      },
      {
        id: "v-002",
        codigoSeguimiento: "TLR-2024-002",
        cliente: "María García",
        vehiculo: "Toyota Corolla 2020",
        placa: "P456DEF",
        fechaIngreso: "2024-12-27",
        horaIngreso: "11:15",
        tecnicoAsignado: "Ana Rodríguez",
        estado: "diagnostico",
        progreso: 25,
        tiempoEstimado: "4 horas",
        observacionesActuales: "Diagnóstico del sistema eléctrico. Revisando alternador y batería.",
        ubicacionTaller: "Bahía 1",
        prioridad: "media",
        servicios: ["Diagnóstico eléctrico", "Mantenimiento preventivo"],
        fechaEstimadaEntrega: "2024-12-28",
        horasTrabajoAcumuladas: 2.0,
      },
      {
        id: "v-003",
        codigoSeguimiento: "TLR-2024-003",
        cliente: "Roberto Silva",
        vehiculo: "Ford Explorer 2019",
        placa: "P789GHI",
        fechaIngreso: "2024-12-26",
        horaIngreso: "14:20",
        tecnicoAsignado: "Miguel Torres",
        estado: "esperando-repuestos",
        progreso: 40,
        tiempoEstimado: "1-2 días",
        observacionesActuales: "Esperando llegada de bomba de agua. Diagnóstico completado.",
        ubicacionTaller: "Estacionamiento",
        prioridad: "media",
        servicios: ["Cambio bomba de agua", "Cambio termostato", "Flush radiador"],
        fechaEstimadaEntrega: "2024-12-30",
        horasTrabajoAcumuladas: 4.5,
      },
      {
        id: "v-004",
        codigoSeguimiento: "TLR-2024-004",
        cliente: "Carmen Jiménez",
        vehiculo: "Nissan Sentra 2021",
        placa: "P321JKL",
        fechaIngreso: "2024-12-27",
        horaIngreso: "08:00",
        tecnicoAsignado: "Luis Méndez",
        estado: "listo-entrega",
        progreso: 100,
        tiempoEstimado: "Completado",
        observacionesActuales: "Servicio de mantenimiento completado. Vehículo listo para entrega.",
        ubicacionTaller: "Área de entrega",
        prioridad: "baja",
        servicios: ["Cambio de aceite", "Filtros", "Revisión general"],
        fechaEstimadaEntrega: "2024-12-27",
        horasTrabajoAcumuladas: 3.0,
      },
      {
        id: "v-005",
        codigoSeguimiento: "TLR-2024-005",
        cliente: "Pedro Ramírez",
        vehiculo: "Chevrolet Cruze 2017",
        placa: "P654MNO",
        fechaIngreso: "2024-12-27",
        horaIngreso: "13:45",
        tecnicoAsignado: "Carlos López",
        estado: "control-calidad",
        progreso: 90,
        tiempoEstimado: "2 horas",
        observacionesActuales: "Reparación de transmisión completada. En control de calidad final.",
        ubicacionTaller: "Bahía 2",
        prioridad: "alta",
        servicios: ["Reparación transmisión", "Cambio aceite transmisión"],
        fechaEstimadaEntrega: "2024-12-27",
        horasTrabajoAcumuladas: 12.0,
      },
    ];

    setVehiculosEnTaller(mockVehiculos);
  }, []);

  const estadosConfig = {
    recibido: {
      label: "Recibido",
      color: "blue",
      icon: TruckIcon,
      descripcion: "Vehículo recién llegado al taller",
    },
    diagnostico: {
      label: "En Diagnóstico",
      color: "yellow",
      icon: MagnifyingGlassIcon,
      descripcion: "Evaluando problemas y necesidades",
    },
    "esperando-repuestos": {
      label: "Esperando Repuestos",
      color: "orange",
      icon: ClockIcon,
      descripcion: "Aguardando llegada de piezas",
    },
    reparacion: {
      label: "En Reparación",
      color: "purple",
      icon: WrenchScrewdriverIcon,
      descripcion: "Trabajo de reparación en progreso",
    },
    "control-calidad": {
      label: "Control de Calidad",
      color: "indigo",
      icon: CheckCircleIcon,
      descripcion: "Verificación final del trabajo",
    },
    "listo-entrega": {
      label: "Listo para Entrega",
      color: "green",
      icon: CheckCircleIcon,
      descripcion: "Completado y listo para el cliente",
    },
  };

  const prioridadConfig = {
    baja: { label: "Baja", color: "gray" },
    media: { label: "Media", color: "blue" },
    alta: { label: "Alta", color: "orange" },
    urgente: { label: "Urgente", color: "red" },
  };

  // Filtrar vehículos
  const vehiculosFiltrados = vehiculosEnTaller.filter((vehiculo) => {
    const matchEstado = filtroEstado === "todos" || vehiculo.estado === filtroEstado;
    const matchSearch =
      !searchTerm ||
      vehiculo.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.codigoSeguimiento.toLowerCase().includes(searchTerm.toLowerCase());

    return matchEstado && matchSearch;
  });

  // Estadísticas por estado
  const estadisticasPorEstado = Object.keys(estadosConfig).map((estado) => ({
    estado,
    cantidad: vehiculosEnTaller.filter((v) => v.estado === estado).length,
    ...estadosConfig[estado as keyof typeof estadosConfig],
  }));

  const capacidadTaller = {
    total: 8, // Bahías disponibles
    ocupadas: vehiculosEnTaller.filter((v) => !["listo-entrega"].includes(v.estado)).length,
    disponibles: 8 - vehiculosEnTaller.filter((v) => !["listo-entrega"].includes(v.estado)).length,
  };

  // Funciones de gestión
  const abrirGestionModal = (vehiculo: VehiculoEnTaller) => {
    setSelectedVehiculo(vehiculo);
    setGestionForm({
      estado: vehiculo.estado,
      progreso: vehiculo.progreso,
      observaciones: vehiculo.observacionesActuales,
      tecnicoAsignado: vehiculo.tecnicoAsignado,
      ubicacionTaller: vehiculo.ubicacionTaller,
      fechaEstimadaEntrega: vehiculo.fechaEstimadaEntrega,
      tiempoEstimado: vehiculo.tiempoEstimado,
    });
    setShowGestionModal(true);
  };

  const guardarCambios = async () => {
    if (!selectedVehiculo) return;

    setLoading(true);
    try {
      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Actualizar vehículo
      setVehiculosEnTaller((prev) =>
        prev.map((v) =>
          v.id === selectedVehiculo.id
            ? {
                ...v,
                estado: gestionForm.estado as any,
                progreso: gestionForm.progreso,
                observacionesActuales: gestionForm.observaciones,
                tecnicoAsignado: gestionForm.tecnicoAsignado,
                ubicacionTaller: gestionForm.ubicacionTaller,
                fechaEstimadaEntrega: gestionForm.fechaEstimadaEntrega,
                tiempoEstimado: gestionForm.tiempoEstimado,
              }
            : v
        )
      );

      setShowGestionModal(false);
      showSuccess("Cambios Guardados", "El vehículo ha sido actualizado exitosamente");
    } catch (error) {
      showError("Error", "No se pudieron guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  const tecnicos = ["Carlos López", "Ana Rodríguez", "Miguel Torres", "Luis Méndez", "Sandra Vega"];
  const ubicaciones = [
    "Bahía 1",
    "Bahía 2",
    "Bahía 3",
    "Elevador 1",
    "Elevador 2",
    "Estacionamiento",
    "Área de entrega",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-600/20 rounded-lg">
            <TruckIcon className="h-8 w-8 text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Vehículos en Taller</h2>
            <p className="text-gray-400">Control de inventario y estados de reparación</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary-700 hover:bg-secondary-600 text-white rounded-lg transition-colors"
          >
            Volver a Recepción
          </button>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total en Taller</p>
              <p className="text-2xl font-bold text-white">{vehiculosEnTaller.length}</p>
            </div>
            <TruckIcon className="h-10 w-10 text-primary-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Capacidad</p>
              <p className="text-2xl font-bold text-white">
                {capacidadTaller.ocupadas}/{capacidadTaller.total}
              </p>
              <p className="text-xs text-gray-500">{capacidadTaller.disponibles} bahías libres</p>
            </div>
            <MapPinIcon className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">En Reparación</p>
              <p className="text-2xl font-bold text-white">
                {vehiculosEnTaller.filter((v) => v.estado === "reparacion").length}
              </p>
            </div>
            <WrenchScrewdriverIcon className="h-10 w-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Listos Entrega</p>
              <p className="text-2xl font-bold text-white">
                {vehiculosEnTaller.filter((v) => v.estado === "listo-entrega").length}
              </p>
            </div>
            <CheckCircleIcon className="h-10 w-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Búsqueda */}
          <div className="relative flex-1 lg:max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, placa, vehículo o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filtros por estado */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroEstado("todos")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filtroEstado === "todos"
                  ? "bg-primary-600 text-white"
                  : "bg-secondary-700 text-gray-300 hover:bg-secondary-600"
              }`}
            >
              Todos ({vehiculosEnTaller.length})
            </button>
            {estadisticasPorEstado.map(({ estado, cantidad, label, color }) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filtroEstado === estado
                    ? `bg-${color}-600 text-white`
                    : "bg-secondary-700 text-gray-300 hover:bg-secondary-600"
                }`}
              >
                {label} ({cantidad})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de vehículos */}
      <div className="space-y-4">
        {vehiculosFiltrados.length === 0 ? (
          <div className="bg-secondary-800 rounded-xl p-8 border border-secondary-700 text-center">
            <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm || filtroEstado !== "todos"
                ? "No se encontraron vehículos"
                : "No hay vehículos en el taller"}
            </h3>
            <p className="text-gray-400">
              {searchTerm || filtroEstado !== "todos"
                ? "Intenta con otros términos de búsqueda o filtros"
                : "Cuando lleguen vehículos aparecerán aquí"}
            </p>
          </div>
        ) : (
          vehiculosFiltrados.map((vehiculo) => {
            const estadoInfo = estadosConfig[vehiculo.estado];
            const prioridadInfo = prioridadConfig[vehiculo.prioridad];
            const IconoEstado = estadoInfo.icon;

            return (
              <div
                key={vehiculo.id}
                className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-primary-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 bg-${estadoInfo.color}-500/20 rounded-lg`}>
                      <IconoEstado className={`h-6 w-6 text-${estadoInfo.color}-400`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{vehiculo.vehiculo}</h3>
                        <span className="text-sm text-primary-400 font-mono">
                          {vehiculo.codigoSeguimiento}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium bg-${prioridadInfo.color}-500/20 text-${prioridadInfo.color}-400`}
                        >
                          {prioridadInfo.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Cliente</p>
                          <p className="text-white font-medium">{vehiculo.cliente}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Placa</p>
                          <p className="text-white font-medium">{vehiculo.placa}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Técnico</p>
                          <p className="text-white font-medium">{vehiculo.tecnicoAsignado}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Ubicación</p>
                          <p className="text-white font-medium">{vehiculo.ubicacionTaller}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${estadoInfo.color}-500/20 text-${estadoInfo.color}-400 mb-2`}
                    >
                      {estadoInfo.label}
                    </div>
                    <p className="text-xs text-gray-400">{estadoInfo.descripcion}</p>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progreso</span>
                    <span className="text-sm text-white font-medium">{vehiculo.progreso}%</span>
                  </div>
                  <div className="w-full bg-secondary-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-${estadoInfo.color}-500 transition-all duration-300`}
                      style={{ width: `${vehiculo.progreso}%` }}
                    ></div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Ingreso</p>
                      <p className="text-white">
                        {vehiculo.fechaIngreso} - {vehiculo.horaIngreso}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Tiempo estimado</p>
                      <p className="text-white">{vehiculo.tiempoEstimado}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Entrega estimada</p>
                      <p className="text-white">{vehiculo.fechaEstimadaEntrega}</p>
                    </div>
                  </div>
                </div>

                {/* Servicios */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Servicios:</p>
                  <div className="flex flex-wrap gap-2">
                    {vehiculo.servicios.map((servicio, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary-700 text-xs text-gray-300 rounded"
                      >
                        {servicio}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Observaciones actuales */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Observaciones actuales:</p>
                  <p className="text-sm text-gray-300 bg-secondary-700/50 p-3 rounded-lg">
                    {vehiculo.observacionesActuales}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-secondary-700">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Horas acumuladas: {vehiculo.horasTrabajoAcumuladas}h</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => abrirGestionModal(vehiculo)}
                      className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm flex items-center space-x-1"
                    >
                      <CogIcon className="h-4 w-4" />
                      <span>Gestionar</span>
                    </button>

                    <button className="px-3 py-1 bg-secondary-700 hover:bg-secondary-600 text-white rounded-lg transition-colors text-sm flex items-center space-x-1">
                      <DocumentTextIcon className="h-4 w-4" />
                      <span>Historial</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Gestión */}
      {showGestionModal && selectedVehiculo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-secondary-800 rounded-xl border border-secondary-700 w-full max-w-2xl max-h-[90vh] overflow-auto">
            {/* Header del modal */}
            <div className="p-6 border-b border-secondary-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Gestionar Vehículo</h3>
                  <p className="text-gray-400 mt-1">
                    {selectedVehiculo.vehiculo} - {selectedVehiculo.placa}
                  </p>
                  <p className="text-sm text-primary-400 font-mono">
                    {selectedVehiculo.codigoSeguimiento}
                  </p>
                </div>
                <button
                  onClick={() => setShowGestionModal(false)}
                  className="p-2 hover:bg-secondary-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Formulario de gestión */}
            <div className="p-6 space-y-6">
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Estado del Vehículo
                </label>
                <select
                  value={gestionForm.estado}
                  onChange={(e) => setGestionForm({ ...gestionForm, estado: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(estadosConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Progreso */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Progreso ({gestionForm.progreso}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gestionForm.progreso}
                  onChange={(e) =>
                    setGestionForm({ ...gestionForm, progreso: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-secondary-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Técnico asignado */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Técnico Asignado
                </label>
                <select
                  value={gestionForm.tecnicoAsignado}
                  onChange={(e) =>
                    setGestionForm({ ...gestionForm, tecnicoAsignado: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {tecnicos.map((tecnico) => (
                    <option key={tecnico} value={tecnico}>
                      {tecnico}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ubicación en taller */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Ubicación en Taller
                </label>
                <select
                  value={gestionForm.ubicacionTaller}
                  onChange={(e) =>
                    setGestionForm({ ...gestionForm, ubicacionTaller: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {ubicaciones.map((ubicacion) => (
                    <option key={ubicacion} value={ubicacion}>
                      {ubicacion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha estimada de entrega */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Fecha Estimada Entrega
                  </label>
                  <input
                    type="date"
                    value={gestionForm.fechaEstimadaEntrega}
                    onChange={(e) =>
                      setGestionForm({ ...gestionForm, fechaEstimadaEntrega: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Tiempo Estimado
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 2 días, 4 horas"
                    value={gestionForm.tiempoEstimado}
                    onChange={(e) =>
                      setGestionForm({ ...gestionForm, tiempoEstimado: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Observaciones Actuales
                </label>
                <textarea
                  rows={4}
                  value={gestionForm.observaciones}
                  onChange={(e) =>
                    setGestionForm({ ...gestionForm, observaciones: e.target.value })
                  }
                  placeholder="Describa el estado actual del trabajo, problemas encontrados, etc."
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>

            {/* Footer del modal */}
            <div className="p-6 border-t border-secondary-700 flex space-x-3">
              <button
                onClick={() => setShowGestionModal(false)}
                className="flex-1 px-4 py-2 bg-secondary-700 hover:bg-secondary-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCambios}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
