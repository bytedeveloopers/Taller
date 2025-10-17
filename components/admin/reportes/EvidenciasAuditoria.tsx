"use client";

import { CSVExporter } from "@/lib/csv-export";
import { DrillDownContext, EvidenciasAuditoriaData, KPI, ReportFilters } from "@/types";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

interface EvidenciasAuditoriaProps {
  filters: ReportFilters;
  onDrillDown: (context: DrillDownContext) => void;
}

const EvidenciasAuditoria: React.FC<EvidenciasAuditoriaProps> = ({ filters, onDrillDown }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EvidenciasAuditoriaData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.customerId) params.append("customerId", filters.customerId.toString());
      if (filters.vehicleId) params.append("vehicleId", filters.vehicleId.toString());

      const response = await fetch(`/api/reportes/evidencias-auditoria?${params}`);
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
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleExportCSV = () => {
    if (!data) return;

    const csvExporter = new CSVExporter();
    csvExporter.exportEvidenciasAuditoria(data, {
      filename: `evidencias-auditoria-${new Date().toISOString().split("T")[0]}`,
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

  const getComplianceBadge = (nivel: string) => {
    const badges = {
      excelente: "bg-green-600 text-green-200",
      bueno: "bg-blue-600 text-blue-200",
      regular: "bg-yellow-600 text-yellow-200",
      bajo: "bg-red-600 text-red-200",
    };
    return badges[nivel as keyof typeof badges] || "bg-gray-600 text-gray-200";
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
        <h2 className="text-xl font-bold text-white">Evidencias & Auditoría</h2>
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
                <p className="text-gray-400 text-sm">{kpi.title}</p>
                <p className={`text-2xl font-bold ${getKPIColor(kpi)}`}>{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Distribución de Niveles */}
      <div className="bg-secondary-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Distribución de Niveles de Cumplimiento
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.distribucionNiveles || {}).map(([nivel, cantidad]) => (
            <div key={nivel} className="bg-secondary-600 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{cantidad}</div>
              <div
                className={`text-sm font-medium mb-1 ${
                  nivel === "excelente"
                    ? "text-green-300"
                    : nivel === "bueno"
                    ? "text-blue-300"
                    : nivel === "regular"
                    ? "text-yellow-300"
                    : "text-red-300"
                }`}
              >
                {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
              </div>
              <div className="text-xs text-gray-400">OTs</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de Evidencias */}
      <div className="bg-secondary-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detalle por OT</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-600">
                <th className="text-left py-3 px-4 text-gray-400">Código</th>
                <th className="text-left py-3 px-4 text-gray-400">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400">Vehículo</th>
                <th className="text-left py-3 px-4 text-gray-400">Fotos</th>
                <th className="text-left py-3 px-4 text-gray-400">Cobertura</th>
                <th className="text-left py-3 px-4 text-gray-400">Score</th>
                <th className="text-left py-3 px-4 text-gray-400">Nivel</th>
              </tr>
            </thead>
            <tbody>
              {data.evidencias?.map((evidencia, index) => (
                <tr
                  key={index}
                  className="border-b border-secondary-600 hover:bg-secondary-600 cursor-pointer"
                  onClick={() =>
                    onDrillDown({
                      type: "workOrder",
                      id: evidencia.id,
                      title: `OT ${evidencia.code}`,
                      filters,
                    })
                  }
                >
                  <td className="py-3 px-4 text-white font-mono">{evidencia.code}</td>
                  <td className="py-3 px-4 text-white">{evidencia.customer}</td>
                  <td className="py-3 px-4 text-gray-300">{evidencia.vehicle}</td>
                  <td className="py-3 px-4 text-white">{evidencia.totalPhotos}</td>
                  <td className="py-3 px-4 text-white">
                    {evidencia.porcentajeCobertura?.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-white">{evidencia.auditScore}/100</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getComplianceBadge(
                        evidencia.nivelCumplimiento
                      )}`}
                    >
                      {evidencia.nivelCumplimiento}
                    </span>
                  </td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EvidenciasAuditoria;
