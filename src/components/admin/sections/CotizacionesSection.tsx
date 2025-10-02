"use client";

import { Quote, QuoteStats } from "@/types";
import { DocumentTextIcon, LinkIcon, PlusIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import DetalleCotizacion from "../cotizaciones/DetalleCotizacion";
import EditorCotizacion from "../cotizaciones/EditorCotizacion";
import ListadoCotizaciones from "../cotizaciones/ListadoCotizaciones";

type ActiveView = "listado" | "editor" | "detalle";

const CotizacionesSection: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>("listado");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuoteStats>({
    totalCotizaciones: 0,
    borradores: 0,
    enviadas: 0,
    aprobadas: 0,
    rechazadas: 0,
    ajusteSolicitado: 0,
    vencidas: 0,
    totalMontoMes: 0,
    tasaAprobacion: 0,
    tiempoPromedioRespuesta: 0,
  });

  // Cargar estadísticas
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cotizaciones/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (view: ActiveView, quote?: Quote) => {
    setActiveView(view);
    if (quote) {
      setSelectedQuote(quote);
    }
  };

  const handleNewQuote = () => {
    setSelectedQuote(null);
    setActiveView("editor");
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setActiveView("editor");
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setActiveView("detalle");
  };

  const handleBackToList = () => {
    setActiveView("listado");
    setSelectedQuote(null);
    loadStats(); // Recargar estadísticas
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeView === "listado" && "Gestión de Cotizaciones"}
              {activeView === "editor" &&
                (selectedQuote ? "Editar Cotización" : "Nueva Cotización")}
              {activeView === "detalle" && "Detalle de Cotización"}
            </h1>
            <p className="text-gray-400">
              {activeView === "listado" && "Crear, enviar y dar seguimiento a cotizaciones"}
              {activeView === "editor" && "Complete los datos de la cotización"}
              {activeView === "detalle" && "Seguimiento y gestión de la cotización"}
            </p>
          </div>
        </div>

        {activeView === "listado" && (
          <button
            onClick={handleNewQuote}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nueva Cotización</span>
          </button>
        )}

        {(activeView === "editor" || activeView === "detalle") && (
          <button
            onClick={handleBackToList}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Volver al listado
          </button>
        )}
      </div>

      {/* Estadísticas - Solo en listado */}
      {activeView === "listado" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-secondary-700 rounded-xl p-6 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Cotizaciones</p>
                <p className="text-2xl font-bold text-white">{stats.totalCotizaciones}</p>
              </div>
              <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-secondary-700 rounded-xl p-6 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Enviadas</p>
                <p className="text-2xl font-bold text-white">{stats.enviadas}</p>
              </div>
              <div className="bg-yellow-500 bg-opacity-20 p-3 rounded-lg">
                <LinkIcon className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-secondary-700 rounded-xl p-6 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Aprobadas</p>
                <p className="text-2xl font-bold text-white">{stats.aprobadas}</p>
              </div>
              <div className="bg-green-500 bg-opacity-20 p-3 rounded-lg">
                <span className="text-green-400 text-xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary-700 rounded-xl p-6 border border-secondary-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Tasa Aprobación</p>
                <p className="text-2xl font-bold text-white">{stats.tasaAprobacion.toFixed(1)}%</p>
              </div>
              <div className="bg-purple-500 bg-opacity-20 p-3 rounded-lg">
                <span className="text-purple-400 text-xl">%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-secondary-700 rounded-xl border border-secondary-600">
        {activeView === "listado" && (
          <ListadoCotizaciones
            onEdit={handleEditQuote}
            onView={handleViewQuote}
            onNew={handleNewQuote}
            stats={stats}
          />
        )}

        {activeView === "editor" && (
          <EditorCotizacion
            quote={selectedQuote}
            onSave={handleBackToList}
            onCancel={handleBackToList}
          />
        )}

        {activeView === "detalle" && selectedQuote && (
          <DetalleCotizacion
            quote={selectedQuote}
            onEdit={() => handleEditQuote(selectedQuote)}
            onBack={handleBackToList}
          />
        )}
      </div>
    </div>
  );
};

export default CotizacionesSection;
