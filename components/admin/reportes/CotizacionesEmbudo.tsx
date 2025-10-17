"use client";

import { CSVExporter } from "@/lib/csv-export";
import { CotizacionesEmbudoData, DrillDownContext, KPI, ReportFilters } from "@/types";
import {
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";

interface CotizacionesEmbudoProps {
  filters: ReportFilters;
  onDrillDown: (context: DrillDownContext) => void;
}

const CotizacionesEmbudo: React.FC<CotizacionesEmbudoProps> = ({ filters, onDrillDown }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CotizacionesEmbudoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.customerId) params.append("customerId", filters.customerId.toString());

      const response = await fetch(`/api/reportes/cotizaciones-embudo?${params}`);
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
    csvExporter.exportCotizacionesEmbudo(data, {
      filename: `cotizaciones-embudo-${new Date().toISOString().split("T")[0]}`,
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
      DRAFT: "bg-gray-600 text-gray-200",
      SENT: "bg-blue-600 text-blue-200",
      APPROVED: "bg-green-600 text-green-200",
      REJECTED: "bg-red-600 text-red-200",
      EXPIRED: "bg-orange-600 text-orange-200",
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
        <h2 className="text-xl font-bold text-white">Cotizaciones (Embudo)</h2>
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

      {/* Embudo Visual */}
      <div className="bg-secondary-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Embudo de Conversión</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary-600 rounded">
            <div className="flex items-center gap-3">
              <DocumentArrowDownIcon className="w-6 h-6 text-gray-400" />
              <span className="text-white">Borradores</span>
            </div>
            <span className="text-2xl font-bold text-gray-300">{data.embudo?.borradores || 0}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-600/20 rounded">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-6 h-6 text-blue-400" />
              <span className="text-white">Enviadas</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-300">{data.embudo?.enviadas || 0}</span>
              <p className="text-sm text-blue-400">
                {data.embudo?.borradores > 0 && data.embudo?.enviadas
                  ? `${((data.embudo.enviadas / data.embudo.borradores) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-600/20 rounded">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
              <span className="text-white">Aprobadas</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-300">
                {data.embudo?.aprobadas || 0}
              </span>
              <p className="text-sm text-green-400">
                {data.embudo?.enviadas > 0 && data.embudo?.aprobadas
                  ? `${((data.embudo.aprobadas / data.embudo.enviadas) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-600/20 rounded">
            <div className="flex items-center gap-3">
              <XCircleIcon className="w-6 h-6 text-red-400" />
              <span className="text-white">Rechazadas</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-red-300">
                {data.embudo?.rechazadas || 0}
              </span>
              <p className="text-sm text-red-400">
                {data.embudo?.enviadas > 0 && data.embudo?.rechazadas
                  ? `${((data.embudo.rechazadas / data.embudo.enviadas) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Cotizaciones */}
      <div className="bg-secondary-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detalle de Cotizaciones</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-600">
                <th className="text-left py-3 px-4 text-gray-400">Código</th>
                <th className="text-left py-3 px-4 text-gray-400">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400">Vehículo</th>
                <th className="text-left py-3 px-4 text-gray-400">Monto</th>
                <th className="text-left py-3 px-4 text-gray-400">Estado</th>
                <th className="text-left py-3 px-4 text-gray-400">Tiempo Resp.</th>
                <th className="text-left py-3 px-4 text-gray-400">Creada</th>
              </tr>
            </thead>
            <tbody>
              {(data.cotizaciones || []).map((quote, index) => (
                <tr
                  key={index}
                  className="border-b border-secondary-600 hover:bg-secondary-600 cursor-pointer"
                  onClick={() =>
                    onDrillDown({
                      entityType: "quote",
                      entityId: quote.id.toString(),
                      source: "cotizaciones-embudo",
                      type: "quote",
                      filters,
                    })
                  }
                >
                  <td className="py-3 px-4 text-white font-mono">{quote.code}</td>
                  <td className="py-3 px-4 text-white">{quote.customer}</td>
                  <td className="py-3 px-4 text-gray-300">{quote.vehicle}</td>
                  <td className="py-3 px-4 text-white">${quote.total.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(quote.status)}`}
                    >
                      {quote.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {quote.responseTime ? `${quote.responseTime}h` : "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {new Date(quote.createdAt).toLocaleDateString()}
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

export default CotizacionesEmbudo;
