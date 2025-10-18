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
  customer: { id: string; name: string; phone: string; email?: string } | null;
  status: string;
  isActive: boolean;
  trackingCode?: string;
  createdAt: string;
  updatedAt: string;
  lastVisit?: string | null;
}

interface Stats {
  totalVehiculos: number;
  vehiculosActivos: number;
  enTaller: number;
}
interface DashboardStats extends Stats {}
interface Props { stats: DashboardStats; }

export default function VehiculosSection({ stats }: Props) {
  const { showSuccess, showError, showInfo, ToastContainer } = useToast();

  // refs estables para toasts
  const showErrorRef = useRef(showError);
  const showInfoRef  = useRef(showInfo);
  useEffect(() => { showErrorRef.current = showError; showInfoRef.current = showInfo; }, [showError, showInfo]);

  // estado principal
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [vehiculosStats, setVehiculosStats] = useState<Stats>({
    totalVehiculos: stats.totalVehiculos,
    vehiculosActivos: stats.vehiculosActivos,
    enTaller: stats.enTaller,
  });

  // modales
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFicha360, setMostrarFicha360] = useState(false);

  // filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroUltimaVisita, setFiltroUltimaVisita] = useState("todos");

  // vida del componente
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  // util: timeout + abort
  function withTimeout<T>(
    fn: (signal: AbortSignal) => Promise<T>,
    ms = 12000,
    label = "request"
  ): Promise<T> {
    const ac = new AbortController();
    const tid = setTimeout(() => ac.abort(`Timeout (${label})`), ms);
    return fn(ac.signal).finally(() => clearTimeout(tid));
  }

  // query de filtros
  const buildQuery = () => {
    const params = new URLSearchParams({
      search: busqueda,
      cliente: filtroCliente,
      estado: filtroEstado,
      ultimaVisita: filtroUltimaVisita,
    });
    return params.toString();
  };

  // carga robusta + watchdog
  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setLastError(null);
      const qs = buildQuery();

      // watchdog: nunca quedamos en loading infinito
      let wd: any = null;
      if (!silent) {
        wd = setTimeout(() => {
          if (mountedRef.current) setLoading(false);
        }, 15000); // 15s tope-duro
      }

      try {
        // Vehículos
        try {
          const res = await withTimeout(
            (signal) =>
              fetch(`/api/vehiculos?${qs}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
                signal,
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

          const list = Array.isArray(data?.data) ? data.data : [];
          if (mountedRef.current) {
            setVehiculos(list);
            if (
              (busqueda || filtroCliente || filtroEstado !== "todos" || filtroUltimaVisita !== "todos") &&
              list.length === 0
            ) {
              showInfoRef.current("Sin resultados", "No se encontraron vehículos con esos filtros.", 1800);
            }
          }
        } catch (err: any) {
          if (mountedRef.current) {
            setVehiculos([]);
            setLastError(err?.message || "Error al cargar vehículos");
            if (!silent) showErrorRef.current("Error", err?.message || "Error al cargar vehículos");
            // eslint-disable-next-line no-console
            console.error("[VehiculosSection] GET /api/vehiculos:", err);
          }
        }

        // Stats
        try {
          const resS = await withTimeout(
            (signal) =>
              fetch("/api/vehiculos/stats", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
                signal,
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

          const d = dataS?.data;
          if (mountedRef.current) {
            setVehiculosStats(
              d
                ? {
                    totalVehiculos: Number(d.totalVehiculos) || 0,
                    vehiculosActivos: Number(d.vehiculosActivos) || 0,
                    enTaller: Number(d.enTaller) || 0,
                  }
                : { totalVehiculos: 0, vehiculosActivos: 0, enTaller: 0 }
            );
          }
        } catch (err: any) {
          if (mountedRef.current) {
            // ⬇️ FIX de precedencia: paréntesis para mezclar ?? y ||
            setLastError((e) => (e ?? err?.message) || "Error al cargar estadísticas");
            if (!silent) showErrorRef.current("Error", err?.message || "Error al cargar estadísticas");
            console.error("[VehiculosSection] GET /api/vehiculos/stats:", err);
          }
        }
      } finally {
        if (wd) clearTimeout(wd);
        if (mountedRef.current) setLoading(false);
      }
    },
    [busqueda, filtroCliente, filtroEstado, filtroUltimaVisita]
  );

  // debounce de carga
  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => { if (alive) loadData(); }, 300);
    return () => { alive = false; clearTimeout(t); };
  }, [loadData]);

  // handlers
  const handleCrearVehiculo = () => { setSelectedVehiculo(null); setMostrarFormulario(true); };
  const handleEditarVehiculo = (v: Vehiculo) => { setSelectedVehiculo(v); setMostrarFormulario(true); };
  const handleVerFicha360 = (v: Vehiculo) => { setSelectedVehiculo(v); setMostrarFicha360(true); };

  const handleGuardarVehiculo = async (vehiculoData: any) => {
    try {
      const url = selectedVehiculo ? `/api/vehiculos/${selectedVehiculo.id}` : "/api/vehiculos";
      const method = selectedVehiculo ? "PUT" : "POST";

      const res = await withTimeout(
        (signal) =>
          fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(vehiculoData),
            signal,
          }),
        12000,
        "vehiculos/save"
      );

      const result = await res.json().catch(() => ({} as any));
      if (res.ok && result?.success !== false) {
        showSuccess("Éxito", selectedVehiculo ? "Vehículo actualizado correctamente" : "Vehículo creado correctamente");
        setMostrarFormulario(false);
        setSelectedVehiculo(null);
        await loadData(true);
      } else {
        const msg = result?.error || `${res.status} ${res.statusText}`;
        showError("Error", msg || "Error al guardar vehículo");
      }
    } catch (error: any) {
      console.error("Error guardando vehículo:", error);
      showError("Error", error?.message || "Error de conexión al guardar vehículo");
    }
  };

  const handleEliminarVehiculo = async (vehiculoId: string) => {
    if (!confirm("¿Está seguro de desactivar este vehículo?")) return;
    try {
      const res = await withTimeout(
        (signal) => fetch(`/api/vehiculos/${vehiculoId}`, { method: "DELETE", signal }),
        10000,
        "vehiculos/delete"
      );
      const result = await res.json().catch(() => ({} as any));
      if (res.ok && result?.success !== false) {
        showSuccess("Éxito", "Vehículo desactivado correctamente");
        await loadData(true);
      } else {
        const msg = result?.error || `${res.status} ${res.statusText}`;
        showError("Error", msg || "Error al desactivar vehículo");
      }
    } catch (error: any) {
      console.error("Error eliminando vehículo:", error);
      showError("Error", error?.message || "Error de conexión al desactivar vehículo");
    }
  };

  // UI
  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Vehículos", value: vehiculosStats.totalVehiculos, color: "text-blue-400" },
          { label: "Activos", value: vehiculosStats.vehiculosActivos, color: "text-green-400" },
          { label: "En Taller", value: vehiculosStats.enTaller, color: "text-red-400" },
        ].map((s, i) => (
          <div key={i} className="bg-secondary-700 p-4 rounded-xl border border-secondary-600">
            <div className="flex items-center">
              <TruckIcon className={`w-8 h-8 ${s.color} mr-3`} />
              <div>
                <p className="text-sm text-gray-400">{s.label}</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? <span className="animate-pulse">—</span> : s.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controles y lista */}
      <div className="bg-secondary-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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

        {/* Tarjeta de lista */}
        <div className="rounded-xl border border-secondary-600 overflow-hidden">
          {/* Header simple */}
          <div className="flex items-center justify-between px-4 py-3 bg-secondary-700">
            <h3 className="text-white font-semibold">Vehículos ({vehiculos.length})</h3>
            <button
              onClick={() => loadData(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary-600 text-gray-100 hover:bg-secondary-500 transition-colors"
              title="Recargar"
            >
              Recargar
            </button>
          </div>

          {/* Estado de error visible */}
          {lastError && (
            <div className="px-4 py-2 bg-rose-900/30 border-b border-rose-700 text-rose-200 text-sm">
              {lastError}
            </div>
          )}

          {/* Contenido */}
          {loading ? (
            <div className="min-h-[88px] flex items-center justify-center text-gray-400 bg-secondary-800">
              Cargando vehículos…
            </div>
          ) : (
            <ListadoVehiculos
              vehiculos={vehiculos}
              loading={false}
              onEditarVehiculo={handleEditarVehiculo}
              onEliminarVehiculo={(id) => handleEliminarVehiculo(id)}
              onVerFicha360={handleVerFicha360}
              onRecargar={() => loadData(true)}
              onCrearVehiculo={handleCrearVehiculo}
            />
          )}
        </div>
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
          onEdit={() => { setMostrarFicha360(false); setMostrarFormulario(true); }}
        />
      )}

      <ToastContainer />
    </div>
  );
}
