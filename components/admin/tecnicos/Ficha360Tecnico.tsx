"use client";

import { Assignment, Technician, TechnicianPerformance, TechnicianSchedule } from "@/types";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface Props {
  tecnico: Technician;
  onCerrar: () => void;
}

export default function Ficha360Tecnico({ tecnico, onCerrar }: Props) {
  const [activeTab, setActiveTab] = useState("asignaciones");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [performance, setPerformance] = useState<TechnicianPerformance | null>(null);
  const [schedule, setSchedule] = useState<TechnicianSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTechnicianData();
  }, [tecnico.id]);

  const loadTechnicianData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, performanceRes, scheduleRes] = await Promise.all([
        fetch(`/api/tecnicos/${tecnico.id}/assignments`),
        fetch(`/api/tecnicos/${tecnico.id}/performance`),
        fetch(`/api/tecnicos/${tecnico.id}/schedule`),
      ]);

      const [assignmentsData, performanceData, scheduleData] = await Promise.all([
        assignmentsRes.json(),
        performanceRes.json(),
        scheduleRes.json(),
      ]);

      if (assignmentsData.success) setAssignments(assignmentsData.data || []);
      if (performanceData.success) setPerformance(performanceData.data);
      if (scheduleData.success) setSchedule(scheduleData.data || []);
    } catch (error) {
      console.error("Error loading technician data:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentLoad = tecnico.currentLoad || 0;
  const loadPercentage =
    tecnico.capacityPerDay > 0 ? (currentLoad / tecnico.capacityPerDay) * 100 : 0;

  const getLoadColor = (percentage: number) => {
    if (percentage <= 50) return "text-green-600 bg-green-100";
    if (percentage <= 80) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getLoadIcon = (percentage: number) => {
    if (percentage <= 50) return "🟢";
    if (percentage <= 80) return "🟡";
    return "🔴";
  };

  const tabs = [
    { id: "asignaciones", label: "Asignaciones", icon: ClipboardDocumentListIcon },
    { id: "carga", label: "Carga & Capacidad", icon: ChartBarIcon },
    { id: "agenda", label: "Agenda", icon: CalendarDaysIcon },
    { id: "desempeno", label: "Desempeño", icon: ChartBarIcon },
    { id: "documentos", label: "Documentos", icon: DocumentTextIcon },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {tecnico.avatarUrl ? (
                <img
                  className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg"
                  src={tecnico.avatarUrl}
                  alt={tecnico.name}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center border-4 border-white shadow-lg">
                  <UserIcon className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tecnico.name}</h2>
              <p className="text-gray-600">{tecnico.phone}</p>
              {tecnico.email && <p className="text-gray-600">{tecnico.email}</p>}
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    tecnico.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {tecnico.active ? "Activo" : "Inactivo"}
                </span>
                {tecnico.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {tecnico.skills.length > 3 && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    +{tecnico.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Asignaciones Tab */}
              {activeTab === "asignaciones" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Órdenes de Trabajo Asignadas
                    </h3>
                    <span className="text-sm text-gray-500">
                      {assignments.length} asignaciones activas
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {assignments.length > 0 ? (
                      assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {assignment.workOrder?.trackingCode ||
                                "OT-" + assignment.id.slice(-6)}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                assignment.status === "IN_PROGRESS"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : assignment.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {assignment.status === "IN_PROGRESS"
                                ? "En Proceso"
                                : assignment.status === "COMPLETED"
                                ? "Completado"
                                : "Asignado"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {assignment.workOrder?.description || "Sin descripción"}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Cliente: {assignment.workOrder?.customer?.name || "N/A"}</span>
                            <span>
                              Vehículo: {assignment.workOrder?.vehicle?.brand}{" "}
                              {assignment.workOrder?.vehicle?.model}
                            </span>
                            <span>
                              Asignado: {new Date(assignment.assignedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No hay asignaciones activas</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Carga & Capacidad Tab */}
              {activeTab === "carga" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Carga de Trabajo y Capacidad
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Carga Actual</h4>
                        <span className="text-2xl">{getLoadIcon(loadPercentage)}</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {currentLoad}/{tecnico.capacityPerDay}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full ${
                            loadPercentage <= 50
                              ? "bg-green-500"
                              : loadPercentage <= 80
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded-full ${getLoadColor(
                          loadPercentage
                        )}`}
                      >
                        {Math.round(loadPercentage)}% Ocupado
                      </span>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Capacidad Diaria</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {tecnico.capacityPerDay}
                      </div>
                      <p className="text-sm text-gray-600">Trabajos simultáneos máximos</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Horario</h4>
                      <div className="text-lg font-semibold text-gray-900">
                        {tecnico.workHours.start} - {tecnico.workHours.end}
                      </div>
                      <p className="text-sm text-gray-600">Horario laboral</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Desglose por Estado</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {assignments.filter((a) => a.status === "ASSIGNED").length}
                        </div>
                        <div className="text-sm text-gray-600">Asignados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {assignments.filter((a) => a.status === "IN_PROGRESS").length}
                        </div>
                        <div className="text-sm text-gray-600">En Proceso</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {assignments.filter((a) => a.status === "COMPLETED").length}
                        </div>
                        <div className="text-sm text-gray-600">Completados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">
                          {tecnico.capacityPerDay - currentLoad}
                        </div>
                        <div className="text-sm text-gray-600">Disponibles</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Agenda Tab */}
              {activeTab === "agenda" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Agenda del Técnico</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Agregar Evento
                    </button>
                  </div>

                  <div className="space-y-3">
                    {schedule.length > 0 ? (
                      schedule.map((event) => (
                        <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                event.type === "APPOINTMENT"
                                  ? "bg-blue-100 text-blue-800"
                                  : event.type === "REMINDER"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {event.type === "APPOINTMENT"
                                ? "Cita"
                                : event.type === "REMINDER"
                                ? "Recordatorio"
                                : "Bloqueo"}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          )}
                          <div className="text-xs text-gray-500">
                            {new Date(event.startDate).toLocaleDateString()} -{" "}
                            {new Date(event.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarDaysIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No hay eventos programados</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Desempeño Tab */}
              {activeTab === "desempeno" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Desempeño del Técnico</h3>

                  {performance ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {performance.totalCompleted}
                        </div>
                        <div className="text-sm text-gray-600">OTs Finalizadas</div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {performance.onTimeDelivery}%
                        </div>
                        <div className="text-sm text-gray-600">Entregas a Tiempo</div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {performance.averageCompletionTime}h
                        </div>
                        <div className="text-sm text-gray-600">Tiempo Promedio</div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">
                          {performance.rework}
                        </div>
                        <div className="text-sm text-gray-600">Retrabajos</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay datos de desempeño disponibles</p>
                    </div>
                  )}
                </div>
              )}

              {/* Documentos Tab */}
              {activeTab === "documentos" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Documentos y Notas</h3>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                      Subir Documento
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-3">Notas Internas</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {tecnico.notes || "No hay notas registradas"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-3">Documentos Adjuntos</h4>
                    <div className="text-center py-8 text-gray-500">
                      <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay documentos adjuntos</p>
                      <p className="text-sm">
                        Los documentos aparecerán aquí una vez que se implementen las APIs
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
