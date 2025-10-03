"use client";

import { useToast } from "@/components/ui/ToastNotification";
import { CSVExporter } from "@/lib/csv-export";
import { DrillDownContext, OperacionDiariaData, ReportFilters, VehicleStatus } from "@/types";
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

interface OperacionDiariaProps {
  filters: ReportFilters;
  onDrillDown: (context: DrillDownContext) => void;
}

const OperacionDiaria: React.FC<OperacionDiariaProps> = ({ filters, onDrillDown }) => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OperacionDiariaData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Cargar datos del reporte
  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.technicianId) params.append("technicianId", filters.technicianId);
      if (filters.status) params.append("status", filters.status);

      const response = await fetch(`/api/reportes/operacion-diaria?${params}`);

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        showError("Error", "No se pudieron cargar los datos del reporte");
      }
    } catch (error) {
      console.error("Error loading report data:", error);
      showError("Error", "Error de conexión al cargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  // Exportar a CSV
  const exportToCSV = () => {
    if (!data) return;

    CSVExporter.exportOperacionDiaria(data.detalleOTs, filters);
    showSuccess("Exportado", "Reporte exportado exitosamente");
  };

  // Obtener color del badge de estado
  const getStatusBadge = (status: VehicleStatus) => {
    const statusConfig = {
      RECEIVED: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Recibido" },
      IN_PROGRESS: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "En Proceso" },
      WAITING_PARTS: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Esperando Partes" },
      COMPLETED: { bg: "bg-green-500/20", text: "text-green-400", label: "Completado" },
      DELIVERED: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Entregado" },
      RECEPCION: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Recepción" },
      INGRESO: { bg: "bg-indigo-500/20", text: "text-indigo-400", label: "Ingreso" },
      DIAGNOSTICO: { bg: "bg-cyan-500/20", text: "text-cyan-400", label: "Diagnóstico" },
      COTIZACION_APROBACION: {
        bg: "bg-orange-500/20",
        text: "text-orange-400",
        label: "Cotización",
      },
      PROCESO_DESARME: { bg: "bg-red-500/20", text: "text-red-400", label: "Desarme" },
      ESPERA: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Espera" },
      PROCESO_ARMADO: { bg: "bg-green-500/20", text: "text-green-400", label: "Armado" },
      PRUEBA_CALIDAD: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Prueba" },
      ENTREGA: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Entrega" },
    };

    const config = statusConfig[status] || statusConfig.RECEIVED;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Obtener color del KPI
  const getKPIColor = (value: number, total: number, isGood: boolean = true) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    if (isGood) {
      return percentage >= 80 ? "green" : percentage >= 60 ? "yellow" : "red";
    } else {
      return percentage <= 20 ? "green" : percentage <= 40 ? "yellow" : "red";
    }
  };

  if (loading) {
    return (
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-secondary-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-secondary-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-secondary-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
        <div className="text-center text-gray-400">
          No hay datos disponibles para los filtros seleccionados
        </div>
      </div>
    );
  }

  const kpiColor = getKPIColor(data.slaOnTime, data.otsActivas + data.otsFinalizadas);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Operación Diaria</h2>
            <p className="text-gray-400">Ingresos, OTs activas, finalizadas y cumplimiento SLA</p>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Ingresos del día */}
          <div className="bg-secondary-700/50 rounded-lg p-4 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{data.ingresosDia}</div>
                <div className="text-sm text-gray-400">Ingresos Hoy</div>
              </div>
              <TruckIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          {/* OTs Activas */}
          <div className="bg-secondary-700/50 rounded-lg p-4 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{data.otsActivas}</div>
                <div className="text-sm text-gray-400">OTs Activas</div>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          {/* OTs Finalizadas */}
          <div className="bg-secondary-700/50 rounded-lg p-4 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{data.otsFinalizadas}</div>
                <div className="text-sm text-gray-400">OTs Finalizadas</div>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>

          {/* OTs Entregadas */}
          <div className="bg-secondary-700/50 rounded-lg p-4 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{data.otsEntregadas}</div>
                <div className="text-sm text-gray-400">OTs Entregadas</div>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          {/* Atrasadas */}
          <div className="bg-secondary-700/50 rounded-lg p-4 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-400">{data.atrasadasCount}</div>
                <div className="text-sm text-gray-400">
                  Atrasadas ({data.atrasadasPercent ? data.atrasadasPercent.toFixed(1) : "0.0"}%)
                </div>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
            </div>
          </div>

          {/* SLA On Time */}
          <div className={`bg-secondary-700/50 rounded-lg p-4 border border-secondary-600`}>
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={`text-2xl font-bold ${
                    kpiColor === "green"
                      ? "text-green-400"
                      : kpiColor === "yellow"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {data.slaPercentage ? data.slaPercentage.toFixed(1) : "0.0"}%
                </div>
                <div className="text-sm text-gray-400">SLA On Time</div>
              </div>
              <CheckCircleIcon
                className={`h-8 w-8 ${
                  kpiColor === "green"
                    ? "text-green-400"
                    : kpiColor === "yellow"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Toggle detalles */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 text-primary-400 hover:text-primary-300"
          >
            <EyeIcon className="h-4 w-4" />
            <span>{showDetails ? "Ocultar" : "Ver"} detalles</span>
          </button>
        </div>
      </div>

      {/* Tabla de detalles */}
      {showDetails && (
        <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
          <h3 className="text-lg font-medium text-white mb-4">Detalle de Órdenes de Trabajo</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-600">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Código</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                    Vehículo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Técnico</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                    Días en Taller
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">SLA</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-700">
                {data.detalleOTs.map((ot) => (
                  <tr key={ot.id} className="hover:bg-secondary-700/30">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-white">{ot.trackingCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-white">{ot.cliente}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-white">{ot.vehiculo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-white">{ot.tecnico || "Sin asignar"}</div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(ot.status)}</td>
                    <td className="py-3 px-4">
                      <div
                        className={`text-sm ${ot.diasEnTaller > 7 ? "text-red-400" : "text-white"}`}
                      >
                        {ot.diasEnTaller} días
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {ot.isAtrasada ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          Atrasada
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          A tiempo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          onDrillDown({
                            entityType: "vehicle",
                            entityId: ot.id,
                            source: "operacion-diaria",
                            filters,
                          })
                        }
                        className="text-primary-400 hover:text-primary-300 text-sm"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperacionDiaria;
