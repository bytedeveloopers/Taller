"use client";

import { Evidencia } from "@/types/tecnico";
import {
  CalendarIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  TagIcon,
  TrashIcon,
  UserIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface GaleriaEvidenciasProps {
  ordenId: string;
  evidencias: Evidencia[];
  onEliminar: (evidenciaId: string) => void;
  onActualizar: () => void;
  readonly?: boolean;
}

export default function GaleriaEvidencias({
  ordenId,
  evidencias,
  onEliminar,
  onActualizar,
  readonly = false,
}: GaleriaEvidenciasProps) {
  const [filtroTipo, setFiltroTipo] = useState<"TODAS" | "ANTES" | "DESPUES" | "GENERAL">("TODAS");
  const [busqueda, setBusqueda] = useState("");
  const [evidenciaSeleccionada, setEvidenciaSeleccionada] = useState<Evidencia | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Filtrar evidencias
  const evidenciasFiltradas = evidencias.filter((evidencia) => {
    // Filtro por tipo
    if (filtroTipo !== "TODAS" && evidencia.tipo !== filtroTipo) {
      return false;
    }

    // Filtro por búsqueda (por fecha o autor)
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      const fecha = new Date(evidencia.creadoEn).toLocaleDateString();
      return fecha.includes(busquedaLower);
    }

    return true;
  });

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "ANTES":
        return "bg-blue-500 text-white";
      case "DESPUES":
        return "bg-green-500 text-white";
      case "GENERAL":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getTipoIcon = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();
    const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi"];

    return videoExtensions.includes(extension || "") ? VideoCameraIcon : PhotoIcon;
  };

  const formatearFecha = (isoString: string) => {
    const fecha = new Date(isoString);
    return {
      fecha: fecha.toLocaleDateString("es-GT"),
      hora: fecha.toLocaleTimeString("es-GT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const handleEliminar = async (evidenciaId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta evidencia?")) {
      return;
    }

    try {
      // TODO: Implementar llamada a API
      await fetch(`/api/ordenes/${ordenId}/evidencias/${evidenciaId}`, {
        method: "DELETE",
      });

      onEliminar(evidenciaId);
    } catch (error) {
      console.error("Error eliminando evidencia:", error);
      alert("Error al eliminar la evidencia");
    }
  };

  const abrirViewer = (evidencia: Evidencia) => {
    setEvidenciaSeleccionada(evidencia);
  };

  const cerrarViewer = () => {
    setEvidenciaSeleccionada(null);
  };

  const conteosPorTipo = {
    ANTES: evidencias.filter((e) => e.tipo === "ANTES").length,
    DESPUES: evidencias.filter((e) => e.tipo === "DESPUES").length,
    GENERAL: evidencias.filter((e) => e.tipo === "GENERAL").length,
  };

  if (evidencias.length === 0) {
    return (
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-8 text-center">
        <PhotoIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No hay evidencias</h3>
        <p className="text-gray-400">
          Las evidencias se mostrarán aquí una vez que se suban archivos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-white">Evidencias de la Orden</h2>
            <p className="text-gray-400 mt-1">
              {evidenciasFiltradas.length} de {evidencias.length} evidencias
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Búsqueda */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por fecha..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
            </div>

            {/* Filtros */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center px-4 py-2 bg-secondary-700 hover:bg-secondary-600 border border-secondary-600 rounded-lg text-gray-300 hover:text-white transition-colors"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtros
            </button>
          </div>
        </div>

        {/* Filtros expandidos */}
        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-secondary-700">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroTipo("TODAS")}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filtroTipo === "TODAS"
                    ? "bg-blue-600 text-white"
                    : "bg-secondary-700 text-gray-300 hover:bg-secondary-600"
                }`}
              >
                Todas ({evidencias.length})
              </button>

              {(["ANTES", "DESPUES", "GENERAL"] as const).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFiltroTipo(tipo)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filtroTipo === tipo
                      ? getTipoColor(tipo)
                      : "bg-secondary-700 text-gray-300 hover:bg-secondary-600"
                  }`}
                >
                  {tipo} ({conteosPorTipo[tipo]})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid de evidencias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {evidenciasFiltradas.map((evidencia) => {
          const { fecha, hora } = formatearFecha(evidencia.creadoEn);
          const TipoIcon = getTipoIcon(evidencia.url);

          return (
            <div
              key={evidencia.id}
              className="bg-secondary-800 rounded-lg border border-secondary-700 overflow-hidden hover:border-secondary-600 transition-all duration-200"
            >
              {/* Preview */}
              <div className="aspect-square bg-secondary-900 relative group cursor-pointer">
                <img
                  src={evidencia.url}
                  alt="Evidencia"
                  className="w-full h-full object-cover"
                  onClick={() => abrirViewer(evidencia)}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    <button
                      onClick={() => abrirViewer(evidencia)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                    >
                      <EyeIcon className="h-5 w-5 text-white" />
                    </button>

                    {!readonly && (
                      <button
                        onClick={() => handleEliminar(evidencia.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg backdrop-blur-sm transition-colors"
                      >
                        <TrashIcon className="h-5 w-5 text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tipo de archivo */}
                <div className="absolute top-2 left-2">
                  <TipoIcon className="h-5 w-5 text-white drop-shadow-lg" />
                </div>

                {/* Tipo de evidencia */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getTipoColor(evidencia.tipo)}`}
                  >
                    {evidencia.tipo}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-center text-gray-400 text-xs">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>
                    {fecha} {hora}
                  </span>
                </div>

                <div className="flex items-center text-gray-400 text-xs">
                  <UserIcon className="h-4 w-4 mr-1" />
                  <span>Técnico</span>
                </div>

                <div className="flex items-center text-gray-400 text-xs">
                  <TagIcon className="h-4 w-4 mr-1" />
                  <span>{evidencia.tipo}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Viewer modal */}
      {evidenciaSeleccionada && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary-800 rounded-lg border border-secondary-700 max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header del viewer */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-700">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Evidencia {evidenciaSeleccionada.tipo}
                </h3>
                <p className="text-gray-400 text-sm">
                  {formatearFecha(evidenciaSeleccionada.creadoEn).fecha}{" "}
                  {formatearFecha(evidenciaSeleccionada.creadoEn).hora}
                </p>
              </div>
              <button
                onClick={cerrarViewer}
                className="p-2 hover:bg-secondary-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Contenido del viewer */}
            <div className="p-4">
              <div className="max-h-[70vh] overflow-auto">
                {evidenciaSeleccionada.url.includes(".mp4") ||
                evidenciaSeleccionada.url.includes(".webm") ||
                evidenciaSeleccionada.url.includes(".mov") ? (
                  <video
                    src={evidenciaSeleccionada.url}
                    controls
                    className="w-full h-auto max-h-[60vh] rounded-lg"
                  />
                ) : (
                  <img
                    src={evidenciaSeleccionada.url}
                    alt="Evidencia"
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
