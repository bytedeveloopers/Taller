"use client";

import { CSVExporter } from "@/lib/csv-export";
import { DrillDownContext, KPI, ReportFilters, VehiculosData } from "@/types";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

interface VehiculosProps {
  filters: ReportFilters;
  onDrillDown: (context: DrillDownContext) => void;
}

const Vehiculos: React.FC<VehiculosProps> = ({ filters, onDrillDown }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VehiculosData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.customerId) params.append("customerId", filters.customerId.toString());

      const response = await fetch(`/api/reportes/vehiculos?${params}`);
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
    csvExporter.exportVehiculos(data, {
      filename: `vehiculos-${new Date().toISOString().split("T")[0]}`,
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-600 text-red-200";
      case "media":
        return "bg-yellow-600 text-yellow-200";
      case "baja":
        return "bg-green-600 text-green-200";
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
        <h2 className="text-xl font-bold text-white">Vehículos</h2>
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

      {/* Top Marcas */}
      <div className="bg-secondary-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Marcas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.marcas?.slice(0, 6).map((marca, index) => (
            <div key={index} className="bg-secondary-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{marca.brand}</h4>
                <span className="text-2xl font-bold text-blue-300">{marca.count}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Servicios/Veh:</span>
                  <span className="text-gray-300">
                    {marca.avgServicesPerVehicle?.toFixed(1) || "0"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Próximas Revisiones */}
      <div className="bg-secondary-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Próximas Revisiones</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-600">
                <th className="text-left py-3 px-4 text-gray-400">Vehículo</th>
                <th className="text-left py-3 px-4 text-gray-400">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400">Placa</th>
                <th className="text-left py-3 px-4 text-gray-400">Próxima Rev.</th>
                <th className="text-left py-3 px-4 text-gray-400">Días</th>
                <th className="text-left py-3 px-4 text-gray-400">Prioridad</th>
              </tr>
            </thead>
            <tbody>
              {data.proximasRevisiones?.slice(0, 10).map((revision, index) => (
                <tr
                  key={index}
                  className="border-b border-secondary-600 hover:bg-secondary-600 cursor-pointer"
                  onClick={() =>
                    onDrillDown({
                      type: "vehicle",
                      id: revision.id,
                      title: `Vehículo ${revision.brand} ${revision.model}`,
                      filters,
                    })
                  }
                >
                  <td className="py-3 px-4">
                    <div className="text-white">
                      {revision.brand} {revision.model}
                    </div>
                    <div className="text-gray-400 text-xs">{revision.year}</div>
                  </td>
                  <td className="py-3 px-4 text-white">{revision.customer}</td>
                  <td className="py-3 px-4 text-gray-300">{revision.plate}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {new Date(revision.nextReview).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={revision.isOverdue ? "text-red-400 font-bold" : "text-white"}>
                      {revision.isOverdue
                        ? `${Math.abs(revision.daysUntilReview)}d atrasado`
                        : `${revision.daysUntilReview}d`}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getPriorityBadge(
                        revision.priority
                      )}`}
                    >
                      {revision.priority}
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

export default Vehiculos;
