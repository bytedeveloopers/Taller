"use client";

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
  enTaller: number;
}

interface DashboardStats {
  totalVehiculos: number;
  vehiculosActivos: number;
  enTaller: number;
  // ...otros campos del dashboard (no usados aquí)
}

interface Props {
  stats: DashboardStats;
}

export default function VehiculosSection({ stats }: Props) {
  const { showSuccess, showError, showInfo, ToastContainer } = useToast();

  // --- helpers toast en refs estables
  const showErrorRef = useRef(showError);
  const showInfoRef = useRef(showInfo);
  useEffect(() => {
    showErrorRef.current = showError;
    showInfoRef.current = showInfo;
  }, [showError, showInfo]);

  // --- estado principal
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [vehiculosStats, setVehiculosStats] = useState<Stats>({
    totalVehiculos: stats.totalVehiculos,
    vehiculosActivos: stats.vehiculosActivos,
    enTaller: stats.enTaller,
  });

  // --- modales
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFicha360, setMostrarFicha360] = useState(false);

  // --- filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroUltimaVisita, setFiltroUltimaVisita] = useState("todos");

  // --- control de vida
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // --- util: timeout de promesas
  function withTimeout<T>(promise: Promise<T>, ms = 12000, label = "request"): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = setTimeout(() => {
        reject(new Error(`Timeout (${label})`));
      }, ms);
      promise
        .then((v) => {
          clearTimeout(id);
          resolve(v);
        })
        .catch((err) => {
          clearTimeout(id);
          reject(err);
        });
    });
  }

  // --- query de filtros
  const buildQuery = () => {
    const params = new URLSearchParams({
      search: busqueda,
      cliente: filtroCliente,
      estado: filtroEstado,
      ultimaVisita: filtroUltimaVisita,
    });
    return params.toString();
  };

  // --- carga robusta
  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      const qs = buildQuery();

      try {
        // 1) Vehículos (primero)
        try {
          const res = await withTimeout(
            fetch(`/api/vehiculos?${qs}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
            }),
            12000,
            "vehiculos"
          );

          if (!res.ok) throw new Error(`Vehículos: ${res.status} ${res.statusText}`);

          let data: any = null;
          try {
            data = await res.json();
          } catch {
            data = { data: [] };
          }

          if (!mountedRef.current) return;

          const list = Array.isArray(data?.data) ? data.data : [];
          setVehiculos(list);

          // aviso sutil si hay filtros y está vacío
          if (
            (busqueda || filtroCliente || filtroEstado !== "todos" || filtroUltimaVisita !== "todos") &&
            list.length === 0
          ) {
            showInfoRef.current("Sin resultados", "No se encontraron vehículos con esos filtros.", 1800);
          }
        } catch (err: any) {
          if (!mountedRef.current) return;
          setVehiculos([]);
          // sólo toast si hay filtros o no es carga silenciosa
          if (
            !silent &&
            (busqueda || filtroCliente || filtroEstado !== "todos" || filtroUltimaVisita !== "todos")
          ) {
            showErrorRef.current("Error", err?.message || "Error al cargar vehículos");
          }
        }

        // 2) Stats (independiente; no bloquea la UI si falla)
        try {
          const resS = await withTimeout(
            fetch("/api/vehiculos/stats", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
            }),
            10000,
            "vehiculos/stats"
          );

          if (!resS.ok) throw new Error(`Stats: ${resS.status} ${resS.statusText}`);

          let dataS: any = null;
          try {
            dataS = await resS.json();
          } catch {
            dataS = { data: null };
          }

          if (!mountedRef.current) return;

          const d = dataS?.data;
          setVehiculosStats(
            d
              ? {
                  totalVehiculos: Number(d.totalVehiculos) || 0,
                  vehiculosActivos: Number(d.vehiculosActivos) || 0,
                  enTaller: Number(d.enTaller) || 0,
                }
              : { totalVehiculos: 0, vehiculosActivos: 0, enTaller: 0 }
          );
        } catch (err) {
          // si falla stats, no detenemos nada
          if (!mountedRef.current) return;
          setVehiculosStats((s) => s); // mantiene lo último conocido
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [busqueda, filtroCliente, filtroEstado, filtroUltimaVisita]
  );

  // --- debounce de carga
  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      if (!alive) return;
      loadData();
    }, 400);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [loadData]);

  // --- handlers
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

      const response = await withTimeout(
        fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(vehiculoData),
        }),
        12000,
        "vehiculos/save"
      );

      const result = await response.json().catch(() => ({} as any));

      if (response.ok && result?.success !== false) {
        showSuccess(
          "Éxito",
          selectedVehiculo ? "Vehículo actualizado correctamente" : "Vehículo creado correctamente"
        );
        setMostrarFormulario(false);
        setSelectedVehiculo(null);
        await loadData(true);
      } else {
        const msg = result?.error || `${response.status} ${response.statusText}`;
        showError("Error", msg || "Error al guardar vehículo");
      }
    } catch (error: any) {
      console.error("Error guardando vehículo:", error);
      showError("Error", error?.message || "Error de conexión al guardar vehículo");
    }
  };

  const handleEliminarVehiculo = async (vehiculoId: string) => {
    if (!confirm("¿Estás seguro de que deseas desactivar este vehículo?")) return;

    try {
      const response = await withTimeout(
        fetch(`/api/vehiculos/${vehiculoId}`, { method: "DELETE" }),
        10000,
        "vehiculos/delete"
      );
      const result = await response.json().catch(() => ({} as any));

      if (response.ok && result?.success !== false) {
        showSuccess("Éxito", "Vehículo desactivado correctamente");
        await loadData(true);
      } else {
        const msg = result?.error || `${response.status} ${response.statusText}`;
        showError("Error", msg || "Error al desactivar vehículo");
      }
    } catch (error: any) {
      console.error("Error eliminando vehículo:", error);
      showError("Error", error?.message || "Error de conexión al desactivar vehículo");
    }
  };

  // --- UI
  if (loading) {
    return (
      <div className="p-6 bg-secondary-800 rounded-xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Cargando vehículos...</p>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <TruckIcon className="w-8 h-8 text-red-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">En Taller</p>
              <p className="text-2xl font-bold text-white">{vehiculosStats.enTaller}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles y lista */}
      <div className="bg-secondary-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Gestión de Vehículos</h2>
          <div className="flex gap-2">
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

      <ToastContainer />
    </div>
  );
}
