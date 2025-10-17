"use client";

import { CSVExporter } from "@/lib/csv-export";
import { ClientesRetencionData, DrillDownContext, KPI, ReportFilters } from "@/types";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

interface ClientesRetencionProps {
  filters: ReportFilters;
  onDrillDown: (context: DrillDownContext) => void;
}

const ClientesRetencion: React.FC<ClientesRetencionProps> = ({ filters, onDrillDown }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ClientesRetencionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.customerId) params.append("customerId", filters.customerId.toString());

      const response = await fetch(`/api/reportes/clientes-retencion?${params}`);
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
    csvExporter.exportClientesRetencion(data, {
      filename: `clientes-retencion-${new Date().toISOString().split("T")[0]}`,
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

  const getStatusBadge = (status: string) => {
    const badges = {
      nuevo: "bg-blue-600 text-blue-200",
      regular: "bg-green-600 text-green-200",
      frecuente: "bg-purple-600 text-purple-200",
      inactivo: "bg-gray-600 text-gray-200",
    };
    return badges[status as keyof typeof badges] || "bg-gray-600 text-gray-200";
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
        <h2 className="text-xl font-bold text-white">Clientes & Retención</h2>
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
              <div className="flex items-center">
                {kpi.trend > 0 ? (
                  <span className="text-green-400">↗</span>
                ) : kpi.trend < 0 ? (
                  <span className="text-red-400">↘</span>
                ) : (
                  <span className="text-gray-400">→</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Distribución de Frecuencia */}
      <div className="bg-secondary-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Distribución de Frecuencia</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.distribucionFrecuencia || {}).map(([frecuencia, cantidad]) => (
            <div key={frecuencia} className="bg-secondary-600 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{cantidad}</div>
              <div className="text-gray-400 text-sm">{frecuencia}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-secondary-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detalle de Clientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-600">
                <th className="text-left py-3 px-4 text-gray-400">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400">Estado</th>
                <th className="text-left py-3 px-4 text-gray-400">Total Visitas</th>
                <th className="text-left py-3 px-4 text-gray-400">Total Gastado</th>
                <th className="text-left py-3 px-4 text-gray-400">Promedio/Visita</th>
                <th className="text-left py-3 px-4 text-gray-400">Días Última</th>
                <th className="text-left py-3 px-4 text-gray-400">Vehículos</th>
              </tr>
            </thead>
            <tbody>
              {(data.clientes || []).map((cliente, index) => (
                <tr
                  key={index}
                  className="border-b border-secondary-600 hover:bg-secondary-600 cursor-pointer"
                  onClick={() =>
                    onDrillDown({
                      type: "customer",
                      id: cliente.id,
                      title: `Cliente ${cliente.name}`,
                      filters,
                    })
                  }
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-white font-medium">{cliente.name}</div>
                      <div className="text-gray-400 text-xs">{cliente.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(cliente.status)}`}
                    >
                      {cliente.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-mono">{cliente.totalVisits}</td>
                  <td className="py-3 px-4 text-white">${cliente.totalSpent.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-300">
                    ${cliente.avgSpentPerVisit.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{cliente.daysSinceLastVisit}d</td>
                  <td className="py-3 px-4 text-gray-300">{cliente.vehicleCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientesRetencion;
