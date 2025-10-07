"use client";

import AltaRapidaVehiculo from "@/components/admin/vehiculos/AltaRapidaVehiculo";
import Ficha360Vehiculo from "@/components/admin/vehiculos/Ficha360Vehiculo";
import FormularioVehiculo from "@/components/admin/vehiculos/FormularioVehiculo";
import ListadoVehiculos from "@/components/admin/vehiculos/ListadoVehiculos";
import { useToast } from "@/components/ui/ToastNotification";
import { MagnifyingGlassIcon, PlusIcon, TruckIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";

interface Vehiculo {
  id: string;
  licensePlate?: string;
  vin?: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  nickname?: string;
  notes?: string;
  nextServiceAtDate?: string;
  nextServiceAtKm?: number;
  customerId: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  status: string;
  isActive: boolean;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    appointments: number;
    quotes: number;
  };
  lastVisit?: string;
}

interface Stats {
  totalVehiculos: number;
  vehiculosActivos: number;
  proximoMantenimiento: number;
  enTaller: number;
}

interface DashboardStats {
  totalCitas: number;
  citasPendientes: number;
  citasCompletadas: number;
  citasEnProceso: number;
  citasHoy: number;
  citasEstaSemana: number;
  totalClientes: number;
  totalVehiculos: number;
  vehiculosActivos: number;
  proximoMantenimiento: number;
  enTaller: number;
  totalCotizaciones: number;
  cotizacionesAprobadas: number;
  ingresos: {
    total: number;
    pendiente: number;
  };
  recentAppointments: any[];
  tasaCompletado: number;
  satisfaccionCliente: number;
}

interface Props {
  stats: DashboardStats;
}

export default function VehiculosSection({ stats }: Props) {
  const { showSuccess, showError } = useToast();

  // referencia estable del toast de error
  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  // Estados principales
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [vehiculosStats, setVehiculosStats] = useState<Stats>({
    totalVehiculos: stats.totalVehiculos,
    vehiculosActivos: stats.vehiculosActivos,
    proximoMantenimiento: stats.proximoMantenimiento,
    enTaller: stats.enTaller,
  });

  // Estados de vista
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFicha360, setMostrarFicha360] = useState(false);
  const [mostrarAltaRapida, setMostrarAltaRapida] = useState(false);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroUltimaVisita, setFiltroUltimaVisita] = useState("todos");

  // Control de concurrencia
  const isLoadingRef = useRef(false);

  // ---- builder de query
  const buildQuery = () => {
    const params = new URLSearchParams({
      search: busqueda,
      cliente: filtroCliente,
      estado: filtroEstado,
      ultimaVisita: filtroUltimaVisita,
    });
    return params.toString();
  };

  // ---- Carga reutilizable (lista + stats)
  const loadData = useCallback(
    async (silent = false) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      if (!silent) setLoading(true);

      try {
        const qs = buildQuery();

        const [vehiculosResponse, statsResponse] = await Promise.all([
          fetch(`/api/vehiculos?${qs}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }),
          fetch("/api/vehiculos/stats", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }),
        ]);

        if (!vehiculosResponse.ok || !statsResponse.ok) {
          throw new Error(
            `HTTP error! vehiculos: ${vehiculosResponse.status}, stats: ${statsResponse.status}`
          );
        }

        const vehiculosResult = await vehiculosResponse.json();
        const statsResult = await statsResponse.json();

        setVehiculos(Array.isArray(vehiculosResult?.data) ? vehiculosResult.data : []);

        setVehiculosStats(
          statsResult?.data
            ? {
                totalVehiculos: Number(statsResult.data.totalVehiculos) || 0,
                vehiculosActivos: Number(statsResult.data.vehiculosActivos) || 0,
                proximoMantenimiento: Number(statsResult.data.proximoMantenimiento) || 0,
                enTaller: Number(statsResult.data.enTaller) || 0,
              }
            : { totalVehiculos: 0, vehiculosActivos: 0, proximoMantenimiento: 0, enTaller: 0 }
        );
      } catch (error: any) {
        console.error("Error cargando datos:", error);
        setVehiculos([]);
        // Solo toasteamos si no es carga inicial y hay filtros/busqueda
        if (
          !silent &&
          (busqueda || filtroCliente || filtroEstado !== "todos" || filtroUltimaVisita !== "todos")
        ) {
          showErrorRef.current("Error", error?.message || "Error al cargar los datos");
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    },
    [busqueda, filtroCliente, filtroEstado, filtroUltimaVisita]
  );

  // ---- useEffect con debounce (sin recargar página)
  useEffect(() => {
    if (isLoadingRef.current) return;
    let alive = true;
    const t = setTimeout(() => {
      if (!alive) return;
      loadData();
    }, 500);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [loadData]);

  // Handlers
  const handleCrearVehiculo = () => {
    setSelectedVehiculo(null);
    setMostrarFormulario(true);
  };

  const handleEditarVehiculo = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setMostrarFormulario(true);
  };

  const handleVerFicha360 = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setMostrarFicha360(true);
  };

  const handleGuardarVehiculo = async (vehiculoData: any) => {
    try {
      const url = selectedVehiculo ? `/api/vehiculos/${selectedVehiculo.id}` : "/api/vehiculos";
      const method = selectedVehiculo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehiculoData),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess(
          "Éxito",
          selectedVehiculo ? "Vehículo actualizado correctamente" : "Vehículo creado correctamente"
        );
        setMostrarFormulario(false);
        setSelectedVehiculo(null);
        // refrescamos data sin recargar la página
        await loadData(true);
      } else {
        showError("Error", result.error || "Error al guardar vehículo");
      }
    } catch (error) {
      console.error("Error guardando vehículo:", error);
      showError("Error", "Error de conexión al guardar vehículo");
    }
  };

  const handleEliminarVehiculo = async (vehiculoId: string) => {
    if (!confirm("¿Estás seguro de que deseas desactivar este vehículo?")) return;

    try {
      const response = await fetch(`/api/vehiculos/${vehiculoId}`, { method: "DELETE" });
      const result = await response.json();

      if (result.success) {
        showSuccess("Éxito", "Vehículo desactivado correctamente");
        await loadData(true);
      } else {
        showError("Error", result.error || "Error al desactivar vehículo");
      }
    } catch (error) {
      console.error("Error eliminando vehículo:", error);
      showError("Error", "Error de conexión al desactivar vehículo");
    }
  };

  const handleAltaRapida = async (vehiculoData: any) => {
    try {
      const response = await fetch("/api/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehiculoData),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess("Éxito", "Vehículo creado correctamente");
        setMostrarAltaRapida(false);
        await loadData(true);
      } else {
        showError("Error", result.error || "Error al crear vehículo");
      }
    } catch (error) {
      console.error("Error en alta rápida:", error);
      showError("Error", "Error de conexión al crear vehículo");
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-secondary-800 rounded-xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Cargando vehículos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-secondary-700 p-4 rounded-xl border border-secondary-600">
          <div className="flex items-center">
            <TruckIcon className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Total Vehículos</p>
              <p className="text-2xl font-bold text-white">{vehiculosStats.totalVehiculos}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-700 p-4 rounded-xl border border-secondary-600">
          <div className="flex items-center">
            <TruckIcon className="w-8 h-8 text-green-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Activos</p>
              <p className="text-2xl font-bold text-white">{vehiculosStats.vehiculosActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-700 p-4 rounded-xl border border-secondary-600">
          <div className="flex items-center">
            <TruckIcon className="w-8 h-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Próximo Mantenimiento</p>
              <p className="text-2xl font-bold text-white">{vehiculosStats.proximoMantenimiento}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-700 p-4 rounded-xl border border-secondary-600">
          <div className="flex items-center">
            <TruckIcon className="w-8 h-8 text-red-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">En Taller</p>
              <p className="text-2xl font-bold text-white">{vehiculosStats.enTaller}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-secondary-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Gestión de Vehículos</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarAltaRapida(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Alta Rápida
            </button>
            <button
              onClick={handleCrearVehiculo}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Nuevo Vehículo
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar vehículos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los clientes</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          <select
            value={filtroUltimaVisita}
            onChange={(e) => setFiltroUltimaVisita(e.target.value)}
            className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="todos">Cualquier fecha</option>
            <option value="7">Última semana</option>
            <option value="30">Último mes</option>
            <option value="90">Últimos 3 meses</option>
          </select>
        </div>

        {/* Lista de vehículos */}
        <ListadoVehiculos
          vehiculos={vehiculos}
          loading={loading}
          onEditarVehiculo={handleEditarVehiculo}
          onEliminarVehiculo={handleEliminarVehiculo}
          onVerFicha360={handleVerFicha360}
          onRecargar={() => loadData(true)}
        />
      </div>

      {/* Modales */}
      {mostrarFormulario && (
        <FormularioVehiculo
          isOpen={mostrarFormulario}
          onClose={() => setMostrarFormulario(false)}
          vehiculo={selectedVehiculo}
          onSave={handleGuardarVehiculo}
        />
      )}

      {mostrarFicha360 && selectedVehiculo && (
        <Ficha360Vehiculo
          isOpen={mostrarFicha360}
          onClose={() => setMostrarFicha360(false)}
          vehiculoId={selectedVehiculo.id}
          onEdit={() => {
            setMostrarFicha360(false);
            setMostrarFormulario(true);
          }}
        />
      )}

      {mostrarAltaRapida && (
        <AltaRapidaVehiculo
          isOpen={mostrarAltaRapida}
          onClose={() => setMostrarAltaRapida(false)}
          onSave={handleAltaRapida}
        />
      )}
    </div>
  );
}
