"use client";

import {
  Assignment,
  Technician,
  TechnicianPerformance,
  TechnicianSchedule,
} from "@/types";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Props {
  tecnico: Technician;
  onCerrar: () => void;
}

/* ---------- helpers de red ---------- */
async function fetchFirst<T = any>(paths: string[]): Promise<T | null> {
  for (const url of paths) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const j = await r.json().catch(() => null);
      if (!j) continue;
      // Acepta { ok/success, data } o array/objeto plano
      const data = j?.data ?? j?.result ?? j?.items ?? j;
      return data as T;
    } catch {
      /* probar el siguiente */
    }
  }
  return null;
}

export default function Ficha360Tecnico({ tecnico, onCerrar }: Props) {
  const [activeTab, setActiveTab] = useState<
    "asignaciones" | "carga" | "agenda" | "desempeno" | "documentos"
  >("asignaciones");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [performance, setPerformance] = useState<TechnicianPerformance | null>(null);
  const [schedule, setSchedule] = useState<TechnicianSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const id = useMemo(
    () => (typeof tecnico.id === "string" ? tecnico.id : String(tecnico.id)),
    [tecnico.id]
  );

  const loadTechnicianData = useCallback(async () => {
    setLoading(true);

    // Rutas alternativas (admin / público / español)
    const A = (p: string) => [
      `/api/admin/tecnicos/${id}/${p}`,
      `/api/tecnicos/${id}/${p}`,
      `/api/tecnicos/${id}/${p === "assignments" ? "asignaciones" : p}`,
    ];

    try {
      const [asg, perf, sch] = await Promise.all([
        fetchFirst<Assignment[]>(A("assignments")),
        fetchFirst<TechnicianPerformance>(A("performance")),
        fetchFirst<TechnicianSchedule[]>(A("schedule")),
      ]);

      setAssignments(Array.isArray(asg) ? asg : []);
      setSchedule(Array.isArray(sch) ? sch : []);

      if (perf) {
        setPerformance(perf);
      } else {
        // Fallback básico con asignaciones
        const total = (asg || []).length;
        const completed = (asg || []).filter((a) => a.status === "COMPLETED").length;
        setPerformance({
          totalCompleted: completed,
          onTimeDelivery: 0,
          averageCompletionTime: 0,
          rework: 0,
        } as TechnicianPerformance);
      }
    } catch (e) {
      console.error("Error loading technician data:", e);
      setAssignments([]);
      setSchedule([]);
      setPerformance(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTechnicianData();
  }, [loadTechnicianData]);

  // Lock scroll del body mientras esté abierta
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Cálculos de carga/estado visual
  const currentLoad = Number((tecnico as any).currentLoad ?? 0);
  const capacityPerDay = Number(tecnico.capacityPerDay ?? 0);
  const loadPercentage = capacityPerDay > 0 ? (currentLoad / capacityPerDay) * 100 : 0;

  const tabs = [
    { id: "asignaciones", label: "Asignaciones", icon: ClipboardDocumentListIcon },
    { id: "carga", label: "Carga & Capacidad", icon: ChartBarIcon },
    { id: "agenda", label: "Agenda", icon: CalendarDaysIcon },
    { id: "desempeno", label: "Desempeño", icon: ChartBarIcon },
    { id: "documentos", label: "Documentos", icon: DocumentTextIcon },
  ] as const;

  // Portal target
  const container = typeof document !== "undefined" ? document.body : null;
  if (!container) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-secondary-800 border border-secondary-700 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-700 bg-secondary-800/80">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {(tecnico as any).avatarUrl ? (
                <img
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-secondary-700"
                  src={(tecnico as any).avatarUrl}
                  alt={tecnico.name}
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-primary-600/40 flex items-center justify-center ring-2 ring-secondary-700">
                  <UserIcon className="h-7 w-7 text-primary-300" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{tecnico.name}</h2>
              <div className="text-sm text-gray-300">{tecnico.phone}</div>
              {tecnico.email && <div className="text-sm text-gray-400">{tecnico.email}</div>}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    tecnico.active
                      ? "bg-green-500/20 text-green-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {tecnico.active ? "Activo" : "Inactivo"}
                </span>
                {(tecnico.skills || []).slice(0, 3).map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full"
                  >
                    {s}
                  </span>
                ))}
                {(tecnico.skills || []).length > 3 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-secondary-700 text-gray-300 rounded-full">
                    +{(tecnico.skills || []).length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-gray-300 hover:text-white hover:bg-secondary-700 transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-secondary-700 bg-secondary-800/60">
          <nav className="flex gap-6 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    active
                      ? "border-primary-500 text-white"
                      : "border-transparent text-gray-400 hover:text-gray-200 hover:border-secondary-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-secondary-900/30">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : (
            <>
              {/* Asignaciones */}
              {activeTab === "asignaciones" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Órdenes de Trabajo Asignadas
                    </h3>
                    <span className="text-sm text-gray-400">
                      {assignments.length} asignaciones activas
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {assignments.length ? (
                      assignments.map((a) => (
                        <div
                          key={a.id}
                          className="border border-secondary-700 bg-secondary-800 rounded-lg p-4 hover:bg-secondary-800/70 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">
                              {a.workOrder?.trackingCode || `OT-${String(a.id).slice(-6)}`}
                            </h4>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                a.status === "IN_PROGRESS"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : a.status === "COMPLETED"
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-blue-500/20 text-blue-300"
                              }`}
                            >
                              {a.status === "IN_PROGRESS"
                                ? "En Proceso"
                                : a.status === "COMPLETED"
                                ? "Completado"
                                : "Asignado"}
                            </span>
                          </div>

                          <p className="text-sm text-gray-300 mb-2">
                            {a.workOrder?.description || "Sin descripción"}
                          </p>

                          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                            <span>Cliente: {a.workOrder?.customer?.name || "N/D"}</span>
                            <span>
                              Vehículo: {a.workOrder?.vehicle?.brand || "N/D"}{" "}
                              {a.workOrder?.vehicle?.model || ""}
                            </span>
                            {a.assignedAt && (
                              <span>Asignado: {new Date(a.assignedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-3 text-secondary-600" />
                        <p>No hay asignaciones activas</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Carga & Capacidad */}
              {activeTab === "carga" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Carga de Trabajo y Capacidad</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-white">Carga Actual</h4>
                        <span className="text-2xl">
                          {loadPercentage <= 50 ? "🟢" : loadPercentage <= 80 ? "🟡" : "🔴"}
                        </span>
                      </div>

                      <div className="text-3xl font-bold text-white mb-2">
                        {currentLoad}/{capacityPerDay}
                      </div>

                      <div className="w-full bg-secondary-700 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full ${
                            loadPercentage <= 50
                              ? "bg-green-500"
                              : loadPercentage <= 80
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                        />
                      </div>

                      <span
                        className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                          loadPercentage <= 50
                            ? "bg-green-500/20 text-green-300"
                            : loadPercentage <= 80
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {Math.round(loadPercentage)}% Ocupado
                      </span>
                    </div>

                    <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-2">Capacidad Diaria</h4>
                      <div className="text-3xl font-bold text-primary-300 mb-1">
                        {capacityPerDay}
                      </div>
                      <p className="text-sm text-gray-400">Trabajos simultáneos máximos</p>
                    </div>

                    <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-2">Horario</h4>
                      <div className="text-lg font-semibold text-white">
                        {tecnico.workHours.start} - {tecnico.workHours.end}
                      </div>
                      <p className="text-sm text-gray-400">Horario laboral</p>
                    </div>
                  </div>

                  <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
                    <h4 className="font-medium text-white mb-4">Desglose por Estado</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-300">
                          {assignments.filter((a) => a.status === "ASSIGNED").length}
                        </div>
                        <div className="text-sm text-gray-400">Asignados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-300">
                          {assignments.filter((a) => a.status === "IN_PROGRESS").length}
                        </div>
                        <div className="text-sm text-gray-400">En Proceso</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-300">
                          {assignments.filter((a) => a.status === "COMPLETED").length}
                        </div>
                        <div className="text-sm text-gray-400">Completados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-300">
                          {Math.max(0, capacityPerDay - currentLoad)}
                        </div>
                        <div className="text-sm text-gray-400">Disponibles</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Agenda */}
              {activeTab === "agenda" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Agenda del Técnico</h3>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm">
                      Agregar Evento
                    </button>
                  </div>

                  <div className="space-y-3">
                    {schedule.length ? (
                      schedule.map((e) => (
                        <div
                          key={e.id}
                          className="border border-secondary-700 bg-secondary-800 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{e.title}</h4>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                e.type === "APPOINTMENT"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : e.type === "REMINDER"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              {e.type === "APPOINTMENT"
                                ? "Cita"
                                : e.type === "REMINDER"
                                ? "Recordatorio"
                                : "Bloqueo"}
                            </span>
                          </div>
                          {e.description && (
                            <p className="text-sm text-gray-300 mb-2">{e.description}</p>
                          )}
                          <div className="text-xs text-gray-400">
                            {new Date(e.startDate).toLocaleDateString()} –{" "}
                            {new Date(e.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <CalendarDaysIcon className="h-12 w-12 mx-auto mb-3 text-secondary-600" />
                        <p>No hay eventos programados</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Desempeño */}
              {activeTab === "desempeno" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Desempeño del Técnico</h3>

                  {performance ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-green-300 mb-2">
                          {performance.totalCompleted}
                        </div>
                        <div className="text-sm text-gray-400">OTs Finalizadas</div>
                      </div>

                      <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-blue-300 mb-2">
                          {performance.onTimeDelivery}%
                        </div>
                        <div className="text-sm text-gray-400">Entregas a Tiempo</div>
                      </div>

                      <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-purple-300 mb-2">
                          {performance.averageCompletionTime}h
                        </div>
                        <div className="text-sm text-gray-400">Tiempo Promedio</div>
                      </div>

                      <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-yellow-300">
                          {performance.rework}
                        </div>
                        <div className="text-sm text-gray-400">Retrabajos</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <ChartBarIcon className="h-12 w-12 mx-auto mb-3 text-secondary-600" />
                      <p>No hay datos de desempeño disponibles</p>
                    </div>
                  )}
                </div>
              )}

              {/* Documentos */}
              {activeTab === "documentos" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Documentos y Notas</h3>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                      Subir Documento
                    </button>
                  </div>

                  <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
                    <h4 className="font-medium text-white mb-3">Notas Internas</h4>
                    <div className="bg-secondary-900 rounded-lg p-4 border border-secondary-700">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {(tecnico as any).notes || "No hay notas registradas"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
                    <h4 className="font-medium text-white mb-3">Documentos Adjuntos</h4>
                    <div className="text-center py-12 text-gray-400">
                      <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-secondary-600" />
                      <p>No hay documentos adjuntos</p>
                      <p className="text-sm">
                        Los documentos aparecerán aquí una vez que se implementen las APIs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    container
  );
}
