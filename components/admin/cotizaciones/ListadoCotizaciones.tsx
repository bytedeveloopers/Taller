"use client";

import { Quote, QuoteStats } from "@/types";
import {
  ClipboardDocumentIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EyeIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";

interface ListadoCotizacionesProps {
  onEdit: (quote: Quote) => void;
  onView: (quote: Quote) => void;
  onNew: () => void;
  stats: QuoteStats;
}

const ListadoCotizaciones: React.FC<ListadoCotizacionesProps> = ({
  onEdit,
  onView,
  onNew,
  stats,
}) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  const loadQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("estado", statusFilter);
      if (clientFilter) params.append("cliente", clientFilter);
      if (dateFromFilter) params.append("fechaDesde", dateFromFilter);
      if (dateToFilter) params.append("fechaHasta", dateToFilter);

      const response = await fetch(`/api/cotizaciones?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQuotes(data.data);
      }
    } catch (error) {
      console.error("Error cargando cotizaciones:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, clientFilter, dateFromFilter, dateToFilter]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const handleGenerateLink = async (quote: Quote) => {
    try {
      const response = await fetch(`/api/cotizaciones/${quote.id}/generate-link`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        // Actualizar la cotización con el nuevo token
        loadQuotes();
        alert("Enlace generado exitosamente");
      }
    } catch (error) {
      console.error("Error generando enlace:", error);
      alert("Error al generar enlace");
    }
  };

  const handleCopyLink = async (quote: Quote) => {
    if (!quote.publicToken) {
      alert("Debe generar el enlace primero");
      return;
    }

    const publicUrl = `${window.location.origin}/cotizacion/${quote.publicToken}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      alert("Enlace copiado al portapapeles");
    } catch (error) {
      console.error("Error copiando enlace:", error);
      alert("Error al copiar enlace");
    }
  };

  const handleDuplicate = async (quote: Quote) => {
    try {
      const response = await fetch(`/api/cotizaciones/${quote.id}/duplicate`, {
        method: "POST",
      });
      if (response.ok) {
        loadQuotes();
        alert("Cotización duplicada exitosamente");
      }
    } catch (error) {
      console.error("Error duplicando cotización:", error);
      alert("Error al duplicar cotización");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      BORRADOR: { color: "bg-gray-500 bg-opacity-20 text-gray-400", icon: "📝" },
      ENVIADA: { color: "bg-blue-500 bg-opacity-20 text-blue-400", icon: "📤" },
      VISTA: { color: "bg-yellow-500 bg-opacity-20 text-yellow-400", icon: "👁️" },
      APROBADA: { color: "bg-green-500 bg-opacity-20 text-green-400", icon: "✅" },
      RECHAZADA: { color: "bg-red-500 bg-opacity-20 text-red-400", icon: "❌" },
      AJUSTE_SOLICITADO: { color: "bg-orange-500 bg-opacity-20 text-orange-400", icon: "🔄" },
      VENCIDA: { color: "bg-red-700 bg-opacity-20 text-red-300", icon: "⏰" },
      CANCELADA: { color: "bg-gray-700 bg-opacity-20 text-gray-300", icon: "🚫" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.BORRADOR;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon} {status.replace("_", " ")}
      </span>
    );
  };

  const isLinkExpired = (quote: Quote) => {
    if (!quote.publicExpiresAt) return false;
    return new Date(quote.publicExpiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filtros */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, vehículo o OT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="ENVIADA">Enviada</option>
            <option value="VISTA">Vista</option>
            <option value="APROBADA">Aprobada</option>
            <option value="RECHAZADA">Rechazada</option>
            <option value="AJUSTE_SOLICITADO">Ajuste solicitado</option>
            <option value="VENCIDA">Vencida</option>
          </select>

          {/* Filtro por fecha */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Desde"
            />
            <input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Hasta"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-600">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">#</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Cliente</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Vehículo</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">OT</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Total</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Estado</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Vencimiento</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                Últ. actualización
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote, index) => (
              <tr
                key={quote.id}
                className="border-b border-secondary-600 hover:bg-secondary-600 hover:bg-opacity-50"
              >
                <td className="py-4 px-4 text-sm text-white">
                  COT-{new Date(quote.fechaCreacion).getFullYear()}-
                  {(index + 1).toString().padStart(3, "0")}
                </td>
                <td className="py-4 px-4">
                  <div>
                    <div className="text-sm font-medium text-white">{quote.client?.name}</div>
                    <div className="text-xs text-gray-400">{quote.client?.phone}</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <div className="text-sm text-white">
                      {quote.vehicle?.brand} {quote.vehicle?.model}
                    </div>
                    <div className="text-xs text-gray-400">
                      {quote.vehicle?.year} • {quote.vehicle?.licensePlate}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-white">{quote.workOrderId || "-"}</td>
                <td className="py-4 px-4 text-sm font-medium text-white">
                  {quote.moneda} {quote.total.toLocaleString()}
                </td>
                <td className="py-4 px-4">{getStatusBadge(quote.estado)}</td>
                <td className="py-4 px-4 text-sm text-white">
                  {new Date(quote.vencimientoAt).toLocaleDateString("es-GT")}
                  {isLinkExpired(quote) && (
                    <div className="text-xs text-red-400 mt-1">Expirado</div>
                  )}
                </td>
                <td className="py-4 px-4 text-sm text-gray-400">
                  {new Date(quote.updatedAt).toLocaleDateString("es-GT")}
                </td>
                <td className="py-4 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(quote)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500 hover:bg-opacity-20 rounded transition-colors"
                      title="Ver detalle"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(quote)}
                      className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500 hover:bg-opacity-20 rounded transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {quote.estado !== "BORRADOR" && (
                      <>
                        <button
                          onClick={() => handleGenerateLink(quote)}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500 hover:bg-opacity-20 rounded transition-colors"
                          title="Generar/Renovar enlace"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </button>
                        {quote.publicToken && (
                          <button
                            onClick={() => handleCopyLink(quote)}
                            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500 hover:bg-opacity-20 rounded transition-colors"
                            title="Copiar enlace"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => handleDuplicate(quote)}
                      className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-500 hover:bg-opacity-20 rounded transition-colors"
                      title="Duplicar"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-500 hover:bg-opacity-20 rounded transition-colors"
                      title="Descargar PDF"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {quotes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <DocumentTextIcon className="h-12 w-12 mx-auto mb-2" />
              <p>No se encontraron cotizaciones</p>
            </div>
            <button
              onClick={onNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Crear primera cotización
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListadoCotizaciones;
