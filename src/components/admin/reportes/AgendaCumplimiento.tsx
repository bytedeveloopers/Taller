"use client";

import { CSVExporter } from "@/lib/csv-export";
import { AgendaCumplimientoData, DrillDownContext, KPI, ReportFilters } from "@/types";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

interface AgendaCumplimientoProps {
  filters: ReportFilters;
  onDrillDown: (context: DrillDownContext) => void;
}

const AgendaCumplimiento: React.FC<AgendaCumplimientoProps> = ({ filters, onDrillDown }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AgendaCumplimientoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.technicianId) params.append("technicianId", filters.technicianId.toString());

      const response = await fetch(`/api/reportes/agenda-cumplimiento?${params}`);
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
    csvExporter.exportAgendaCumplimiento(data, {
      filename: `agenda-cumplimiento-${new Date().toISOString().split("T")[0]}`,
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

  const getComplianceStatusBadge = (status: string) => {
    const badges = {
      "cumplida-puntual": "bg-green-600 text-green-200",
      "cumplida-tardia": "bg-yellow-600 text-yellow-200",
      "no-asistio": "bg-red-600 text-red-200",
      cancelada: "bg-gray-600 text-gray-200",
      reprogramada: "bg-blue-600 text-blue-200",
      pendiente: "bg-purple-600 text-purple-200",
      incumplida: "bg-red-600 text-red-200",
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
        <h2 className="text-xl font-bold text-white">Agenda & Cumplimiento</h2>
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

      {/* Distribución por Día */}
      <div className="bg-secondary-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cumplimiento por Día de la Semana</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {data.distribucionDias?.map((dia, index) => (
            <div key={index} className="bg-secondary-600 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-white mb-1">{dia.day}</div>
              <div className="text-lg font-bold text-green-300">
                {dia.completionRate?.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">{dia.total} citas</div>
            </div>
          )) || []}
        </div>
      </div>

      {/* Tabla de Citas */}
      <div className="bg-secondary-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detalle de Citas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-600">
                <th className="text-left py-3 px-4 text-gray-400">Fecha</th>
                <th className="text-left py-3 px-4 text-gray-400">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400">Vehículo</th>
                <th className="text-left py-3 px-4 text-gray-400">Técnico</th>
                <th className="text-left py-3 px-4 text-gray-400">Estado</th>
                <th className="text-left py-3 px-4 text-gray-400">Reprog.</th>
              </tr>
            </thead>
            <tbody>
              {data.citas?.map((cita, index) => (
                <tr
                  key={index}
                  className="border-b border-secondary-600 hover:bg-secondary-600 cursor-pointer"
                  onClick={() =>
                    onDrillDown({
                      type: "appointment",
                      id: cita.id,
                      title: `Cita ${cita.customer}`,
                      filters,
                    })
                  }
                >
                  <td className="py-3 px-4 text-white">
                    {new Date(cita.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-white">{cita.customer}</td>
                  <td className="py-3 px-4 text-gray-300">{cita.vehicle}</td>
                  <td className="py-3 px-4 text-gray-300">{cita.technician}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getComplianceStatusBadge(
                        cita.complianceStatus
                      )}`}
                    >
                      {cita.complianceStatus === "cumplida-puntual"
                        ? "Cumplida Puntual"
                        : cita.complianceStatus === "cumplida-tardia"
                        ? "Cumplida Tardía"
                        : cita.complianceStatus === "no-asistio"
                        ? "No Asistió"
                        : cita.complianceStatus === "cancelada"
                        ? "Cancelada"
                        : cita.complianceStatus === "reprogramada"
                        ? "Reprogramada"
                        : cita.complianceStatus === "pendiente"
                        ? "Pendiente"
                        : "Incumplida"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{cita.rescheduledCount || 0}</td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgendaCumplimiento;
