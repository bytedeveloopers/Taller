"use client";

import { CSVExporter } from "@/lib/csv-export";
import { DrillDownContext, KPI, ProductividadTecnicosData, ReportFilters } from "@/types";
import { DocumentArrowDownIcon, UserIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";

interface ProductividadTecnicosProps {
  filters: ReportFilters;
  onDrillDown: (context: DrillDownContext) => void;
}

const ProductividadTecnicos: React.FC<ProductividadTecnicosProps> = ({ filters, onDrillDown }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProductividadTecnicosData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.technicianId) params.append("technicianId", filters.technicianId.toString());

      const response = await fetch(`/api/reportes/productividad-tecnicos?${params}`);
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
    csvExporter.exportProductividadTecnicos(data, {
      filename: `productividad-tecnicos-${new Date().toISOString().split("T")[0]}`,
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

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-400";
    if (utilization >= 75) return "text-yellow-400";
    if (utilization >= 50) return "text-green-400";
    return "text-gray-400";
  };

  const getOnTimeColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
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
        <h2 className="text-xl font-bold text-white">Productividad Técnicos</h2>
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

      {/* Tabla de Técnicos */}
      <div className="bg-secondary-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Rendimiento por Técnico</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-600">
                <th className="text-left py-3 px-4 text-gray-400">Técnico</th>
                <th className="text-left py-3 px-4 text-gray-400">OTs Finalizadas</th>
                <th className="text-left py-3 px-4 text-gray-400">On-Time %</th>
                <th className="text-left py-3 px-4 text-gray-400">Utilización %</th>
                <th className="text-left py-3 px-4 text-gray-400">Tiempo Prom.</th>
                <th className="text-left py-3 px-4 text-gray-400">Especialidad</th>
                <th className="text-left py-3 px-4 text-gray-400">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(data.tecnicos || []).map((tech, index) => (
                <tr
                  key={index}
                  className="border-b border-secondary-600 hover:bg-secondary-600 cursor-pointer"
                  onClick={() =>
                    onDrillDown({
                      type: "technician",
                      id: tech.id,
                      title: `Técnico ${tech.name}`,
                      filters,
                    })
                  }
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-white font-medium">{tech.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white font-mono">{tech.otsFinalizadas}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${getOnTimeColor(tech.onTimePercentage)}`}>
                      {tech.onTimePercentage ? tech.onTimePercentage.toFixed(1) : "0.0"}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${getUtilizationColor(tech.utilizacion)}`}>
                      {tech.utilizacion ? tech.utilizacion.toFixed(1) : "0.0"}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {tech.tiempoPromedioHoras ? tech.tiempoPromedioHoras.toFixed(1) : "0.0"}h
                  </td>
                  <td className="py-3 px-4 text-gray-300">{tech.especialidad}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        tech.activo ? "bg-green-600 text-green-200" : "bg-gray-600 text-gray-200"
                      }`}
                    >
                      {tech.activo ? "Activo" : "Inactivo"}
                    </span>
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

export default ProductividadTecnicos;
