"use client";

import AgendaTecnico from "@/components/admin/tecnicos/AgendaTecnico";
import Ficha360Tecnico from "@/components/admin/tecnicos/Ficha360Tecnico";
import FormularioTecnico from "@/components/admin/tecnicos/FormularioTecnico";
import ListadoTecnicos from "@/components/admin/tecnicos/ListadoTecnicos";
import { useToast } from "@/components/ui/ToastNotification";
import { Technician } from "@/types";
import { PlusIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

interface TechnicianStats {
  totalTecnicos: number;
  tecnicosActivos: number;
  cargaPromedio: number;
  disponibles: number;
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

export default function TecnicosSection({ stats }: Props) {
  const { showSuccess, showError } = useToast();

  // Crear referencia estable para evitar recreación en useCallback
  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  // Estados principales
  const [tecnicos, setTecnicos] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTecnico, setSelectedTecnico] = useState<Technician | null>(null);
  const [tecnicosStats, setTecnicosStats] = useState<TechnicianStats>({
    totalTecnicos: 0,
    tecnicosActivos: 0,
    cargaPromedio: 0,
    disponibles: 0,
  });

  // Estados de vista
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFicha360, setMostrarFicha360] = useState(false);
  const [mostrarAgenda, setMostrarAgenda] = useState(false);

  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroHabilidades, setFiltroHabilidades] = useState("");
  const [filtroCarga, setFiltroCarga] = useState("todos");

  // Referencia para controlar si hay una carga en progreso
  const isLoadingRef = useRef(false);

  // Effect para cargar datos con debounce y control estricto de llamadas
  useEffect(() => {
    let isMounted = true;

    // Si ya hay una carga en progreso, cancelar esta
    if (isLoadingRef.current) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      // Doble check antes de empezar la carga
      if (isLoadingRef.current || !isMounted) {
        return;
      }

      isLoadingRef.current = true;

      try {
        setLoading(true);

        const params = new URLSearchParams({
          search: busqueda,
          estado: filtroEstado,
          habilidades: filtroHabilidades,
          carga: filtroCarga,
        });

        // Check if we're in the browser before making API calls
        if (typeof window === "undefined") {
          return;
        }

        const [tecnicosResponse, statsResponse] = await Promise.all([
          fetch(`/api/tecnicos?${params}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/tecnicos/stats", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!isMounted) return;

        // Check if responses are ok
        if (!tecnicosResponse.ok || !statsResponse.ok) {
          throw new Error(
            `HTTP error! tecnicos: ${tecnicosResponse.status}, stats: ${statsResponse.status}`
          );
        }

        const tecnicosResult = await tecnicosResponse.json();
        const statsResult = await statsResponse.json();

        if (isMounted) {
          if (tecnicosResult.success) {
            setTecnicos(tecnicosResult.data || []);
          } else {
            console.error("Error en respuesta de técnicos:", tecnicosResult);
            setTecnicos([]);
          }

          if (statsResult.success) {
            setTecnicosStats(statsResult.data);
          } else {
            console.error("Error en respuesta de estadísticas:", statsResult);
          }
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        if (isMounted) {
          // Set empty state instead of showing error immediately
          setTecnicos([]);
          // Only show error for real network issues, not initial load
          if (
            busqueda ||
            filtroEstado !== "todos" ||
            filtroHabilidades ||
            filtroCarga !== "todos"
          ) {
            showErrorRef.current(
              "Error",
              error instanceof Error ? error.message : "Error al cargar los datos"
            );
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          isLoadingRef.current = false;
        }
      }
    }, 500); // Debounce de 500ms

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      isLoadingRef.current = false;
    };
  }, [busqueda, filtroEstado, filtroHabilidades, filtroCarga]);

  // Handlers
  const handleCrearTecnico = () => {
    setSelectedTecnico(null);
    setMostrarFormulario(true);
  };

  const handleEditarTecnico = (tecnico: Technician) => {
    setSelectedTecnico(tecnico);
    setMostrarFormulario(true);
  };

  const handleVerFicha360 = (tecnico: Technician) => {
    setSelectedTecnico(tecnico);
    setMostrarFicha360(true);
  };

  const handleVerAgenda = (tecnico: Technician) => {
    setSelectedTecnico(tecnico);
    setMostrarAgenda(true);
  };

  const handleGuardarTecnico = async (tecnicoData: any) => {
    try {
      const url = selectedTecnico ? `/api/tecnicos/${selectedTecnico.id}` : "/api/tecnicos";
      const method = selectedTecnico ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tecnicoData),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess(
          "Éxito",
          selectedTecnico ? "Técnico actualizado correctamente" : "Técnico creado correctamente"
        );
        setMostrarFormulario(false);
        // Recargar datos
        window.location.reload();
      } else {
        showError("Error", result.error || "Error al guardar técnico");
      }
    } catch (error) {
      console.error("Error guardando técnico:", error);
      showError("Error", "Error de conexión al guardar técnico");
    }
  };

  const handleActivarDesactivarTecnico = async (tecnicoId: string, activo: boolean) => {
    const accion = activo ? "activar" : "desactivar";

    if (!confirm(`¿Estás seguro de que deseas ${accion} este técnico?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tecnicos/${tecnicoId}/toggle-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: activo }),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess("Éxito", `Técnico ${activo ? "activado" : "desactivado"} correctamente`);
        // Recargar datos
        window.location.reload();
      } else {
        showError("Error", result.error || `Error al ${accion} técnico`);
      }
    } catch (error) {
      console.error(`Error ${accion}ndo técnico:`, error);
      showError("Error", `Error de conexión al ${accion} técnico`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary-600 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-secondary-700 p-4 rounded-xl border border-secondary-600">
                <div className="h-4 bg-secondary-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-secondary-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="bg-secondary-700 rounded-xl border border-secondary-600 p-6">
            <div className="h-64 bg-secondary-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <UserGroupIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Técnicos</h1>
            <p className="text-gray-400">Gestión del equipo técnico</p>
          </div>
        </div>
        <button
          onClick={handleCrearTecnico}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nuevo Técnico</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-secondary-700 p-4 rounded-xl border border-secondary-600">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Total Técnicos</p>
              <p className="text-2xl font-bold text-white">{tecnicosStats.totalTecnicos}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-700 p-4 rounded-xl border border-secondary-600">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-green-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Activos</p>
              <p className="text-2xl font-bold text-white">{tecnicosStats.tecnicosActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-700 p-4 rounded-xl border border-secondary-600">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Carga Promedio</p>
              <p className="text-2xl font-bold text-white">{tecnicosStats.cargaPromedio}%</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-700 p-4 rounded-xl border border-secondary-600">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Disponibles</p>
              <p className="text-2xl font-bold text-white">{tecnicosStats.disponibles}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-secondary-700 rounded-xl border border-secondary-600">
        <ListadoTecnicos
          tecnicos={tecnicos}
          loading={loading}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
          filtroHabilidades={filtroHabilidades}
          setFiltroHabilidades={setFiltroHabilidades}
          filtroCarga={filtroCarga}
          setFiltroCarga={setFiltroCarga}
          onEditar={handleEditarTecnico}
          onVerFicha360={handleVerFicha360}
          onVerAgenda={handleVerAgenda}
          onToggleEstado={handleActivarDesactivarTecnico}
        />
      </div>

      {/* Modales */}
      {mostrarFormulario && (
        <FormularioTecnico
          tecnico={selectedTecnico}
          onGuardar={handleGuardarTecnico}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {mostrarFicha360 && selectedTecnico && (
        <Ficha360Tecnico tecnico={selectedTecnico} onCerrar={() => setMostrarFicha360(false)} />
      )}

      {mostrarAgenda && selectedTecnico && (
        <AgendaTecnico tecnico={selectedTecnico} onCerrar={() => setMostrarAgenda(false)} />
      )}
    </div>
  );
}
