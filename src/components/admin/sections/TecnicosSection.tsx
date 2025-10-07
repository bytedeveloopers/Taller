"use client";

import AgendaTecnico from "@/components/admin/tecnicos/AgendaTecnico";
import Ficha360Tecnico from "@/components/admin/tecnicos/Ficha360Tecnico";
import FormularioTecnico from "@/components/admin/tecnicos/FormularioTecnico";
import ListadoTecnicos from "@/components/admin/tecnicos/ListadoTecnicos";
import { useToast } from "@/components/ui/ToastNotification";
import { Technician } from "@/types";
import { PlusIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState, useMemo } from "react";

/* ===================== Tipos para API ===================== */
type ApiTecnico = {
  id: number;
  nombre: string;
  telefono?: string | null;
  especialidad?: string | null;
  habilidades?: string | null;   // CSV (legacy)
  skills?: string[];             // JSON (si existiera la columna)
  horario_inicio?: string | null;
  horario_fin?: string | null;
  capacidad?: number | null;
  carga?: number | null;
  notas?: string | null;
  user: {
    id: number;
    email: string;
    is_active: boolean;
    must_change_password: boolean;
  } | null;
  blockedDates?: Array<{
    startDate: string;
    endDate: string;
    reason: string;
    type: "VACATION" | "SICK_LEAVE" | "TRAINING" | "OTHER";
  }>;
};

/* ===================== Helpers de carga (100% = capacidad) ===================== */
type TechLike = {
  capacidad?: number | null;
  capacityPerDay?: number | null;
  carga?: number | null;
  cargaActual?: number | null;
  jobsToday?: number | null;
};
function calcLoad(t: TechLike) {
  const capacity = Math.max(1, Number(t.capacidad ?? t.capacityPerDay ?? 1));
  const current  = Math.max(0, Number(t.carga ?? t.cargaActual ?? t.jobsToday ?? 0));
  const pct = Math.min(100, Math.round((current / capacity) * 100));

  let level: "Baja" | "Media" | "Alta" = "Baja";
  if (pct >= 70) level = "Alta";
  else if (pct >= 40) level = "Media";

  const over = current > capacity;
  return { capacity, current, pct, level, over };
}

/* ===================== Mapeo API -> UI ===================== */
type TechnicianRow = Technician & {
  // extras que pasamos a la tabla (no rompen Technician)
  capacidad?: number | null;
  carga?: number | null;
  load?: ReturnType<typeof calcLoad>;
  mustChangePassword: boolean;
};

function mapApiToTechnician(api: any): TechnicianRow {
  const skillsArr = Array.isArray(api.skills)
    ? api.skills
    : api.habilidades
    ? String(api.habilidades).split(",").map((s: string) => s.trim()).filter(Boolean)
    : (api.especialidad ? [api.especialidad] : []);

  const row: TechnicianRow = {
    id: String(api.id),
    name: api.nombre,
    email: api.user?.email ?? "",
    phone: api.telefono ?? "",
    skills: skillsArr,
    capacityPerDay: api.capacidad ?? 8,
    workHours: {
      start: api.horario_inicio ?? "08:00",
      end: api.horario_fin ?? "17:00",
    },
    active: !!api.user?.is_active,
    createdAt: new Date(),
    updatedAt: new Date(),
    mustChangePassword: !!api.user?.must_change_password,

    // extras para la vista:
    capacidad: api.capacidad ?? 8,
    carga: api.carga ?? 0,
  };

  // calcula y adjunta load normalizado
  row.load = calcLoad({
    capacidad: row.capacidad,
    capacityPerDay: row.capacityPerDay,
    carga: row.carga,
  });

  return row;
}

interface TechnicianStats {
  totalTecnicos: number;
  tecnicosActivos: number;
  cargaPromedio: number; // 0-100
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

/* ===================== Componente ===================== */
export default function TecnicosSection({ stats }: Props) {
  const { showSuccess, showError } = useToast();

  // referencia estable para notificaciones
  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  // estados principales
  const [tecnicos, setTecnicos] = useState<TechnicianRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTecnico, setSelectedTecnico] = useState<TechnicianRow | null>(null);
  const [tecnicosStats, setTecnicosStats] = useState<TechnicianStats>({
    totalTecnicos: 0,
    tecnicosActivos: 0,
    cargaPromedio: 0,
    disponibles: 0,
  });

  // estados de vista
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFicha360, setMostrarFicha360] = useState(false);
  const [mostrarAgenda, setMostrarAgenda] = useState(false);

  // filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroHabilidades, setFiltroHabilidades] = useState("");
  const [filtroCarga, setFiltroCarga] = useState("todos");

  // evitar llamadas simultáneas
  const isLoadingRef = useRef(false);

  /* ========= Helper para refrescar técnicos + estadísticas ========= */
  const fetchTecnicosYStats = async () => {
    const params = new URLSearchParams({
      search: busqueda || "",
      estado: filtroEstado || "todos",
      habilidades: filtroHabilidades || "",
      carga: filtroCarga || "todos",
    });

    try {
      // 1) Técnicos
      const tecnicosRes = await fetch(`/api/admin/tecnicos?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });

      const ct1 = tecnicosRes.headers.get("content-type") || "";
      if (tecnicosRes.ok && ct1.includes("application/json")) {
        const list = await tecnicosRes.json();
        setTecnicos((Array.isArray(list) ? list : []).map((t: ApiTecnico) => mapApiToTechnician(t)));
      } else {
        // si vino HTML o error, no truena la UI
        setTecnicos([]);
      }

      // 2) Stats
      const statsRes = await fetch("/api/admin/tecnicos/stats", {
        method: "GET",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });

      const ct2 = statsRes.headers.get("content-type") || "";
      if (statsRes.ok && ct2.includes("application/json")) {
        const raw = await statsRes.json();
        const d = raw?.data ?? raw ?? {};
        setTecnicosStats({
          totalTecnicos: d.totalTecnicos ?? d.total ?? 0,
          tecnicosActivos: d.tecnicosActivos ?? d.activos ?? 0,
          cargaPromedio:
            typeof d.cargaPromedio === "number"
              ? Math.round(d.cargaPromedio)
              : typeof d.avgLoad === "number"
              ? Math.round(d.avgLoad)
              : 0,
          disponibles:
            d.disponibles ?? d.available ?? Math.max(0, (d.total ?? 0) - (d.activos ?? 0)),
        });
      } else {
        setTecnicosStats({ totalTecnicos: 0, tecnicosActivos: 0, cargaPromedio: 0, disponibles: 0 });
      }
    } catch (err: any) {
      console.error("fetchTecnicosYStats error:", err);
      setTecnicos([]);
      setTecnicosStats({ totalTecnicos: 0, tecnicosActivos: 0, cargaPromedio: 0, disponibles: 0 });
      if (busqueda || filtroEstado !== "todos" || filtroHabilidades || filtroCarga !== "todos") {
        showErrorRef.current("Error", err?.message || "Error al cargar los datos");
      }
    }
  };

  /* ===================== Carga de datos ===================== */
  useEffect(() => {
    let isMounted = true;
    if (isLoadingRef.current) return;

    const timeoutId = setTimeout(async () => {
      if (isLoadingRef.current || !isMounted) return;
      isLoadingRef.current = true;

      try {
        setLoading(true);
        if (typeof window === "undefined") return;
        await fetchTecnicosYStats();
      } catch (error) {
        console.error("Error cargando datos:", error);
        if (isMounted) {
          setTecnicos([]);
          if (busqueda || filtroEstado !== "todos" || filtroHabilidades || filtroCarga !== "todos") {
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
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      isLoadingRef.current = false;
    };
  }, [busqueda, filtroEstado, filtroHabilidades, filtroCarga]);

  /* ===================== Handlers ===================== */
  const handleCrearTecnico = () => {
    setSelectedTecnico(null);
    setMostrarFormulario(true);
  };

  const handleEditarTecnico = (tecnico: TechnicianRow) => {
    setSelectedTecnico(tecnico);
    setMostrarFormulario(true);
  };

  const handleVerFicha360 = (tecnico: TechnicianRow) => {
    setSelectedTecnico(tecnico);
    setMostrarFicha360(true);
  };

  const handleVerAgenda = (tecnico: TechnicianRow) => {
    setSelectedTecnico(tecnico);
    setMostrarAgenda(true);
  };

  // Recibe el payload del FormularioTecnico (patrón onGuardar)
  const handleGuardarTecnico = async (tecnicoData: any) => {
    try {
      const editing = !!selectedTecnico;
      const url = editing
        ? `/api/admin/tecnicos/${selectedTecnico!.id}`
        : "/api/admin/tecnicos";
      const method = editing ? "PATCH" : "POST";

      // normaliza skills
      const skillsArr: string[] = Array.isArray(tecnicoData.skills)
        ? tecnicoData.skills
        : typeof tecnicoData.skills === "string"
        ? tecnicoData.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      // capacidad segura: solo mandamos si es válida (1–50)
      const capRaw = tecnicoData.capacityPerDay ?? tecnicoData.capacidad;
      const capNum = Number(capRaw);
      const capacidadValida =
        Number.isFinite(capNum) && capNum >= 1 && capNum <= 50
          ? Math.floor(capNum)
          : undefined;

      // bloqueos seguros (filtra vacíos)
      const blocked =
        Array.isArray(tecnicoData.blockedDates)
          ? tecnicoData.blockedDates.filter(
              (b: any) =>
                b &&
                typeof b.startDate === "string" &&
                typeof b.endDate === "string" &&
                typeof b.reason === "string" &&
                b.startDate &&
                b.endDate &&
                b.reason.trim()
            )
          : undefined;

      const base: any = {
        nombre: tecnicoData.name || tecnicoData.nombre,
        telefono: tecnicoData.phone || tecnicoData.telefono,
        especialidad: skillsArr[0] ?? tecnicoData.especialidad ?? null,
        horario_inicio: tecnicoData.workHours?.start || tecnicoData.horarioInicio,
        horario_fin: tecnicoData.workHours?.end || tecnicoData.horarioFin,
        is_active: !!tecnicoData.active,
        must_change_password: !!tecnicoData.mustChangePassword,
        notas: (tecnicoData.notes ?? tecnicoData.notas ?? "").trim() || null,

        // clave de compatibilidad con tu BD actual:
        skills: skillsArr,                 // si en el futuro tienes columna JSON
        habilidades: skillsArr.join(","),  // HOY se guarda en CSV
      };

      if (!editing) {
        base.email = tecnicoData.email;          // creación
        if (tecnicoData.password) base.password = tecnicoData.password;
      }
      if (capacidadValida !== undefined) base.capacidad = capacidadValida;
      if (blocked && blocked.length) base.blockedDates = blocked;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(base),
      });

      // manejo de errores legible
      const ct = res.headers.get("content-type") || "";
      if (!res.ok) {
        if (ct.includes("application/json")) {
          const j = await res.json().catch(() => ({} as any));
          const msg =
            j?.message ||
            j?.error?.formErrors?.[0] ||
            (j?.error?.fieldErrors
              ? Object.values(j.error.fieldErrors)[0]?.[0]
              : null) ||
            `${res.status} ${res.statusText}`;
          throw new Error(msg);
        } else {
          const t = await res.text().catch(() => "");
          throw new Error(t || `${res.status} ${res.statusText}`);
        }
      }

      await res.json().catch(() => ({}));
      showSuccess(
        "Éxito",
        editing ? "Técnico actualizado correctamente" : "Técnico creado correctamente"
      );
      setMostrarFormulario(false);
      await fetchTecnicosYStats();
    } catch (err: any) {
      console.error("Error guardando técnico:", err);
      showError("Error", err?.message || "Error de conexión al guardar técnico");
    }
  };

  const handleActivarDesactivarTecnico = async (tecnicoId: string, activo: boolean) => {
    const accion = activo ? "activar" : "desactivar";
    if (!confirm(`¿Estás seguro de que deseas ${accion} este técnico?`)) return;

    try {
      const response = await fetch(`/api/admin/tecnicos/${tecnicoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: activo }),
      });

      if (response.ok) {
        showSuccess("Éxito", `Técnico ${activo ? "activado" : "desactivado"} correctamente`);

        // actualizar local rápido
        setTecnicos((prev) => prev.map((t) => (t.id === tecnicoId ? { ...t, active: activo } : t)));

        // refrescar tarjetas (y lista por si cambió algo más)
        await fetchTecnicosYStats();
      } else {
        const errorData = await response.json().catch(() => null);
        showError("Error", errorData?.message || `Error al ${accion} técnico`);
      }
    } catch (error) {
      console.error(`Error ${accion}ndo técnico:`, error);
      showError("Error", `Error de conexión al ${accion} técnico`);
    }
  };

  // versión calculada para pasar a la lista (con load normalizado adjunto)
  const tecnicosConCarga = useMemo(
    () =>
      tecnicos.map((t) => {
        const capacidad = (t as any).capacidad ?? t.capacityPerDay ?? 1;
        const carga = (t as any).carga ?? 0;
        const load = calcLoad({ capacidad, capacityPerDay: t.capacityPerDay, carga });
        return { ...t, capacidad, carga, load } as TechnicianRow;
      }),
    [tecnicos]
  );

  /* ===================== Loading ===================== */
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

  /* ===================== UI (sin cambios visuales) ===================== */
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-secondary-800 p-4 rounded-xl border border-secondary-700">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Total Técnicos</p>
              <p className="text-2xl font-bold text-white">{tecnicosStats.totalTecnicos}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-800 p-4 rounded-xl border border-secondary-700">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-green-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Activos</p>
              <p className="text-2xl font-bold text-white">{tecnicosStats.tecnicosActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-800 p-4 rounded-xl border border-secondary-700">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Carga Promedio</p>
              <p className="text-2xl font-bold text-white">{tecnicosStats.cargaPromedio}%</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-800 p-4 rounded-xl border border-secondary-700">
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
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Gestión de Técnicos</h2>
          <div className="flex gap-2">
            <button
              onClick={handleCrearTecnico}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Nuevo Técnico
            </button>
          </div>
        </div>

        <ListadoTecnicos
          tecnicos={tecnicosConCarga as unknown as Technician[]} // pasa con extras
          loading={loading}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
          filtroHabilidades={filtroHabilidades}
          setFiltroHabilidades={setFiltroHabilidades}
          filtroCarga={filtroCarga}
          setFiltroCarga={setFiltroCarga}
          onEditar={handleEditarTecnico as any}
          onVerFicha360={handleVerFicha360 as any}
          onVerAgenda={handleVerAgenda as any}
          onToggleEstado={handleActivarDesactivarTecnico}
        />
      </div>

      {/* Modales */}
      {mostrarFormulario && (
        <FormularioTecnico
          tecnico={selectedTecnico as any}
          onGuardar={handleGuardarTecnico}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}
      {/* patrón onGuardar: el form NO hace fetch */}

      {mostrarFicha360 && selectedTecnico && (
        <Ficha360Tecnico
          tecnico={selectedTecnico as any}
          onCerrar={() => setMostrarFicha360(false)}
        />
      )}

      {mostrarAgenda && selectedTecnico && (
        <AgendaTecnico
          tecnico={selectedTecnico as any}
          onCerrar={() => setMostrarAgenda(false)}
        />
      )}
    </div>
  );
}
