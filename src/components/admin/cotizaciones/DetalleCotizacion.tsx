"use client";

import { Quote, QuoteTimelineEvent } from "@/types";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  LinkIcon,
  PencilIcon,
  TruckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";

interface DetalleCotizacionProps {
  quote: Quote;
  onEdit: () => void;
  onBack: () => void;
}

const DetalleCotizacion: React.FC<DetalleCotizacionProps> = ({ quote, onEdit, onBack }) => {
  const [timeline, setTimeline] = useState<QuoteTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTimeline = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cotizaciones/${quote.id}/timeline`);
      if (response.ok) {
        const data = await response.json();
        setTimeline(data.data);
      }
    } catch (error) {
      console.error("Error cargando timeline:", error);
    } finally {
      setLoading(false);
    }
  }, [quote.id]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const handleGenerateLink = async () => {
    try {
      const response = await fetch(`/api/cotizaciones/${quote.id}/generate-link`, {
        method: "POST",
      });
      if (response.ok) {
        alert("Enlace generado/renovado exitosamente");
        // Recargar datos de la cotización
        window.location.reload();
      }
    } catch (error) {
      console.error("Error generando enlace:", error);
      alert("Error al generar enlace");
    }
  };

  const handleCopyLink = async () => {
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

  const handleMarkExpired = async () => {
    if (!confirm("¿Está seguro de marcar esta cotización como vencida?")) {
      return;
    }

    try {
      const response = await fetch(`/api/cotizaciones/${quote.id}/mark-expired`, {
        method: "PATCH",
      });
      if (response.ok) {
        alert("Cotización marcada como vencida");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error marcando como vencida:", error);
      alert("Error al marcar como vencida");
    }
  };

  const handleNewVersion = () => {
    if (confirm("¿Crear una nueva versión de esta cotización?")) {
      // Implementar lógica para crear nueva versión
      alert("Funcionalidad en desarrollo");
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
      <span className={`px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon} {status.replace("_", " ")}
      </span>
    );
  };

  const getTimelineIcon = (tipo: string) => {
    const icons = {
      CREADA: "📝",
      EDITADA: "✏️",
      ENVIADA: "📤",
      VISTA: "👁️",
      APROBADA: "✅",
      RECHAZADA: "❌",
      AJUSTE_SOLICITADO: "🔄",
      ENLACE_RENOVADO: "🔗",
      VENCIDA: "⏰",
      CANCELADA: "🚫",
    };

    return icons[tipo as keyof typeof icons] || "📋";
  };

  const isLinkExpired = () => {
    if (!quote.publicExpiresAt) return false;
    return new Date(quote.publicExpiresAt) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-secondary-600 pb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white hover:bg-secondary-600 rounded transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">
              Cotización COT-{new Date(quote.fechaCreacion).getFullYear()}-001
            </h2>
            <p className="text-gray-400">
              Creada el {new Date(quote.fechaCreacion).toLocaleDateString("es-GT")}
            </p>
          </div>
          <div>{getStatusBadge(quote.estado)}</div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleGenerateLink}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            <LinkIcon className="h-5 w-5 inline mr-2" />
            {quote.publicToken ? "Renovar" : "Generar"} Enlace
          </button>
          {quote.publicToken && (
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <ClipboardDocumentIcon className="h-5 w-5 inline mr-2" />
              Copiar Enlace
            </button>
          )}
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <PencilIcon className="h-5 w-5 inline mr-2" />
            Editar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos generales */}
          <div className="bg-secondary-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Cliente</p>
                  <p className="text-white font-medium">{quote.client?.name}</p>
                  <p className="text-sm text-gray-400">{quote.client?.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <TruckIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Vehículo</p>
                  <p className="text-white font-medium">
                    {quote.vehicle?.brand} {quote.vehicle?.model} {quote.vehicle?.year}
                  </p>
                  <p className="text-sm text-gray-400">{quote.vehicle?.licensePlate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Vencimiento</p>
                  <p className="text-white font-medium">
                    {new Date(quote.vencimientoAt).toLocaleDateString("es-GT")}
                  </p>
                  {isLinkExpired() && <p className="text-sm text-red-400">Expirada</p>}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-white font-bold text-lg">
                    {quote.moneda} {quote.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-secondary-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Items de la Cotización</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-500">
                    <th className="text-left py-3 text-sm font-medium text-gray-400">Concepto</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-400">Tipo</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-400">Cant.</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-400">
                      Precio Unit.
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-400">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items?.map((item) => (
                    <tr key={item.id} className="border-b border-secondary-500">
                      <td className="py-3 text-white">{item.concepto}</td>
                      <td className="py-3 text-gray-400">
                        <span className="px-2 py-1 bg-secondary-700 rounded text-xs">
                          {item.tipo}
                        </span>
                      </td>
                      <td className="py-3 text-white">{item.cantidad}</td>
                      <td className="py-3 text-white">
                        {quote.moneda} {item.precioUnitario.toFixed(2)}
                      </td>
                      <td className="py-3 text-white font-medium">
                        {quote.moneda} {item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="mt-6 pt-4 border-t border-secondary-500">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal:</span>
                    <span>
                      {quote.moneda} {quote.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>IVA (12%):</span>
                    <span>
                      {quote.moneda} {quote.impuestos.toFixed(2)}
                    </span>
                  </div>
                  {quote.descuento > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Descuento:</span>
                      <span>
                        -{quote.moneda} {quote.descuento.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-secondary-500 pt-2">
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total:</span>
                      <span>
                        {quote.moneda} {quote.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estado del enlace */}
          <div className="bg-secondary-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Enlace Público</h3>
            {quote.publicToken ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isLinkExpired() ? "bg-red-500" : "bg-green-500"
                    }`}
                  ></div>
                  <span
                    className={`text-sm ${isLinkExpired() ? "text-red-400" : "text-green-400"}`}
                  >
                    {isLinkExpired() ? "Expirado" : "Vigente"}
                  </span>
                </div>
                {quote.publicExpiresAt && (
                  <p className="text-sm text-gray-400">
                    Expira: {new Date(quote.publicExpiresAt).toLocaleString("es-GT")}
                  </p>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                  >
                    Copiar Enlace
                  </button>
                  <button
                    onClick={() => window.open(`/cotizacion/${quote.publicToken}`, "_blank")}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-3">No se ha generado enlace público</p>
            )}
            <button
              onClick={handleGenerateLink}
              className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
            >
              {quote.publicToken ? "Renovar" : "Generar"} Enlace
            </button>
          </div>

          {/* Acciones */}
          <div className="bg-secondary-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Acciones</h3>
            <div className="space-y-2">
              <button
                onClick={handleNewVersion}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center justify-center"
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                Nueva Versión
              </button>
              <button
                onClick={handleMarkExpired}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex items-center justify-center"
                disabled={quote.estado === "VENCIDA"}
              >
                <ClockIcon className="h-4 w-4 mr-2" />
                Marcar Vencida
              </button>
              <button className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors flex items-center justify-center">
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Descargar PDF
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-secondary-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Timeline de Eventos</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-secondary-700 rounded-full flex items-center justify-center">
                      <span className="text-xs">{getTimelineIcon(event.tipo)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{event.descripcion}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(event.createdAt).toLocaleString("es-GT")}
                      </p>
                      {event.user && <p className="text-xs text-gray-500">por {event.user.name}</p>}
                    </div>
                  </div>
                ))}
                {timeline.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No hay eventos registrados
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleCotizacion;
