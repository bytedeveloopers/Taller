"use client";

import { CSVExporter } from "@/lib/csv-export";
import { DrillDownContext, KPI, ReportFilters, TiemposSLAData } from "@/types";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";

interface TiemposSLAProps {
  filters: ReportFilters;
  onDrillDown: (context: DrillDownContext) => void;
}

const TiemposSLA: React.FC<TiemposSLAProps> = ({ filters, onDrillDown }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TiemposSLAData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.technicianId) params.append("technicianId", filters.technicianId.toString());
      if (filters.vehicleId) params.append("vehicleId", filters.vehicleId.toString());

      const response = await fetch(`/api/reportes/tiempos-sla?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Error al cargar datos");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportCSV = () => {
    if (!data) return;

    const csvExporter = new CSVExporter();
    csvExporter.exportTiemposSLA(data, {
      filename: `tiempos-sla-${new Date().toISOString().split("T")[0]}`,
      includeKPIs: true,
      includeDetails: true,
    });
  };

  const getKPIColor = (kpi: KPI) => {
    switch (kpi.color) {
      case "green":
        return "text-green-400";
      case "yellow":
        return "text-yellow-400";
      case "red":
        return "text-red-400";
      case "blue":
        return "text-blue-400";
      case "purple":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  const getSLAStatusColor = (status: string) => {
    switch (status) {
      case "a-tiempo":
        return "text-green-400";
      case "atrasado":
        return "text-red-400";
      case "en-riesgo":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getSLAStatusBadge = (status: string) => {
    switch (status) {
      case "a-tiempo":
        return "bg-green-600 text-green-200";
      case "atrasado":
        return "bg-red-600 text-red-200";
      case "en-riesgo":
        return "bg-yellow-600 text-yellow-200";
      default:
        return "bg-gray-600 text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-secondary-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-secondary-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-secondary-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Tiempos & SLA</h2>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {(data.kpis || []).map((kpi, index) => (
          <div key={index} className="bg-secondary-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{kpi.title || kpi.label}</p>
                <p className={`text-2xl font-bold ${getKPIColor(kpi)}`}>{kpi.value}</p>
              </div>
              <div className="flex items-center">
                {kpi.trend && typeof kpi.trend === "number" && kpi.trend > 0 ? (
                  <span className="text-green-400">↗</span>
                ) : kpi.trend && typeof kpi.trend === "number" && kpi.trend < 0 ? (
                  <span className="text-red-400">↘</span>
                ) : kpi.trend && typeof kpi.trend === "object" && kpi.trend.isPositive ? (
                  <span className="text-green-400">↗</span>
                ) : kpi.trend && typeof kpi.trend === "object" && !kpi.trend.isPositive ? (
                  <span className="text-red-400">↘</span>
                ) : (
                  <span className="text-gray-400">→</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tiempos por Etapa */}
      <div className="bg-secondary-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tiempos Promedio por Etapa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(data.tiemposPorEtapa || []).map((etapa, index) => (
            <div key={index} className="bg-secondary-600 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">{etapa.etapa}</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Promedio:</span>
                  <span className="text-white">
                    {etapa.promedioHoras ? etapa.promedioHoras.toFixed(1) : "0.0"}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">P50:</span>
                  <span className="text-gray-300">
                    {etapa.p50Horas ? etapa.p50Horas.toFixed(1) : "0.0"}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">P90:</span>
                  <span className="text-gray-300">
                    {etapa.p90Horas ? etapa.p90Horas.toFixed(1) : "0.0"}h
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de OTs */}
      <div className="bg-secondary-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detalle por OT</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-600">
                <th className="text-left py-3 px-4 text-gray-400">Código</th>
                <th className="text-left py-3 px-4 text-gray-400">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400">Vehículo</th>
                <th className="text-left py-3 px-4 text-gray-400">TAT Total</th>
                <th className="text-left py-3 px-4 text-gray-400">Días en Taller</th>
                <th className="text-left py-3 px-4 text-gray-400">Estado SLA</th>
                <th className="text-left py-3 px-4 text-gray-400">Técnico</th>
                <th className="text-left py-3 px-4 text-gray-400">Ingreso</th>
              </tr>
            </thead>
            <tbody>
              {(data.ordenes || []).map((orden, index) => (
                <tr
                  key={index}
                  className="border-b border-secondary-600 hover:bg-secondary-600 cursor-pointer"
                  onClick={() =>
                    onDrillDown({
                      entityType: "task",
                      entityId: orden.id.toString(),
                      source: "tiempos-sla",
                      type: "workOrder",
                      filters,
                    })
                  }
                >
                  <td className="py-3 px-4 text-white font-mono">{orden.code}</td>
                  <td className="py-3 px-4 text-white">{orden.customer}</td>
                  <td className="py-3 px-4 text-gray-300">{orden.vehicle}</td>
                  <td className="py-3 px-4 text-white">
                    {orden.tatTotalHoras ? `${orden.tatTotalHoras.toFixed(1)}h` : "-"}
                  </td>
                  <td className="py-3 px-4 text-white">{orden.diasEnTaller}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getSLAStatusBadge(
                        orden.estadoSLA
                      )}`}
                    >
                      {orden.estadoSLA === "a-tiempo"
                        ? "A Tiempo"
                        : orden.estadoSLA === "atrasado"
                        ? "Atrasado"
                        : orden.estadoSLA === "en-riesgo"
                        ? "En Riesgo"
                        : orden.estadoSLA}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{orden.technician}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {new Date(orden.receivedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TiemposSLA;
