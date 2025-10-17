"use client";

import { EstadoOT, OrdenCardProps } from "@/types/tecnico";
import {
  ArrowRightIcon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ListBulletIcon,
  PauseIcon,
  PhotoIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function OrdenCard({
  orden,
  onCambiarEstado,
  onSubirEvidencias,
  onAgregarNota,
  onAbrirChecklist,
}: OrdenCardProps) {
  const [mostrarAcciones, setMostrarAcciones] = useState(false);
  const [cronometroActivo, setCronometroActivo] = useState(false);

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "URGENTE":
        return "bg-red-500 text-white";
      case "ALTA":
        return "bg-orange-500 text-white";
      case "MEDIA":
        return "bg-yellow-500 text-black";
      case "BAJA":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getSLAStatus = () => {
    if (!orden.slaAt) return null;

    const slaDate = new Date(orden.slaAt);
    const now = new Date();
    const diferencia = slaDate.getTime() - now.getTime();
    const horasRestantes = Math.floor(diferencia / (1000 * 60 * 60));

    if (horasRestantes < 0) {
      return {
        texto: `Vencido hace ${Math.abs(horasRestantes)}h`,
        color: "text-red-400",
        urgente: true,
      };
    } else if (horasRestantes <= 2) {
      return {
        texto: `Vence en ${horasRestantes}h`,
        color: "text-yellow-400",
        urgente: true,
      };
    } else {
      return {
        texto: `Vence en ${horasRestantes}h`,
        color: "text-gray-400",
        urgente: false,
      };
    }
  };

  const getEstadoSiguiente = (estadoActual: EstadoOT): EstadoOT | null => {
    const flujo: Record<EstadoOT, EstadoOT | null> = {
      INGRESO: "DIAGNOSTICO",
      DIAGNOSTICO: "COTIZACION_ENVIADA",
      COTIZACION_ENVIADA: "DESARME",
      DESARME: "ARMADO",
      ARMADO: "PRUEBA_CALIDAD",
      PRUEBA_CALIDAD: "LISTO_ENTREGA",
      LISTO_ENTREGA: "ENTREGADO",
      ENTREGADO: null,
      EN_ESPERA: null, // Se maneja por separado
    };

    return flujo[estadoActual];
  };

  const puedeAvanzarEstado = () => {
    // TODO: Implementar validaciones específicas por estado
    switch (orden.estado) {
      case "DESARME":
        return orden.evidencias.some((e) => e.tipo === "ANTES");
      case "LISTO_ENTREGA":
        return orden.checklists.some((c) => c.items.every((item) => item.done));
      default:
        return true;
    }
  };

  const handleCambiarEstado = () => {
    const siguienteEstado = getEstadoSiguiente(orden.estado);
    if (siguienteEstado && puedeAvanzarEstado()) {
      onCambiarEstado(orden.id, siguienteEstado);
    }
  };

  const handleEnEspera = () => {
    const motivo = prompt("Motivo para poner en espera:");
    if (motivo) {
      onCambiarEstado(orden.id, "EN_ESPERA", motivo);
    }
  };

  const handleSubirEvidencias = () => {
    // TODO: Implementar selector de archivos real
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,video/*";
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        onSubirEvidencias(orden.id, files);
      }
    };
    input.click();
  };

  const handleAgregarNota = () => {
    const nota = prompt("Agregar nota técnica:");
    if (nota?.trim()) {
      onAgregarNota(orden.id, nota.trim());
    }
  };

  const slaStatus = getSLAStatus();
  const siguienteEstado = getEstadoSiguiente(orden.estado);
  const puedeAvanzar = puedeAvanzarEstado();

  return (
    <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-4 hover:border-secondary-600 transition-all duration-200">
      {/* Header de la tarjeta */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-white font-semibold text-sm">{orden.numero}</h3>
            {orden.esNueva && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Nuevo</span>
            )}
          </div>
          <p className="text-gray-400 text-xs">
            {orden.vehiculo?.marca} {orden.vehiculo?.modelo} {orden.vehiculo?.año}
          </p>
          <p className="text-gray-400 text-xs">
            {orden.vehiculo?.placa} • {orden.cliente?.nombre}
          </p>
        </div>

        <span className={`text-xs px-2 py-1 rounded-full ${getPrioridadColor(orden.prioridad)}`}>
          {orden.prioridad}
        </span>
      </div>

      {/* Información adicional */}
      <div className="space-y-2 mb-4">
        {orden.diagnostico && (
          <p className="text-gray-300 text-xs bg-secondary-700/50 p-2 rounded">
            {orden.diagnostico}
          </p>
        )}

        {/* Progreso */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Progreso</span>
          <span className="text-white">{orden.porcentajeProgreso}%</span>
        </div>
        <div className="w-full bg-secondary-700 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${orden.porcentajeProgreso}%` }}
          ></div>
        </div>

        {/* SLA */}
        {slaStatus && (
          <div className={`flex items-center space-x-1 text-xs ${slaStatus.color}`}>
            <ClockIcon className="h-4 w-4" />
            <span>{slaStatus.texto}</span>
            {slaStatus.urgente && <ExclamationTriangleIcon className="h-4 w-4" />}
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <PhotoIcon className="h-4 w-4" />
            <span>{orden.evidencias.length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
            <span>{orden.notasTecnicas.length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ListBulletIcon className="h-4 w-4" />
            <span>{orden.checklists.length}</span>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="border-t border-secondary-700 pt-3">
        {!mostrarAcciones ? (
          <button
            onClick={() => setMostrarAcciones(true)}
            className="w-full text-center text-blue-400 hover:text-blue-300 text-xs py-1 transition-colors"
          >
            Mostrar acciones ↓
          </button>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Cronómetro */}
              <button
                onClick={() => setCronometroActivo(!cronometroActivo)}
                className={`flex items-center justify-center px-2 py-1 rounded text-xs transition-colors ${
                  cronometroActivo
                    ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    : "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                }`}
              >
                {cronometroActivo ? (
                  <>
                    <PauseIcon className="h-3 w-3 mr-1" />
                    Pausar
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-3 w-3 mr-1" />
                    Iniciar
                  </>
                )}
              </button>

              {/* Evidencias */}
              <button
                onClick={handleSubirEvidencias}
                className="flex items-center justify-center px-2 py-1 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded text-xs transition-colors"
              >
                <PhotoIcon className="h-3 w-3 mr-1" />
                Evidencias
              </button>

              {/* Notas */}
              <button
                onClick={handleAgregarNota}
                className="flex items-center justify-center px-2 py-1 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 rounded text-xs transition-colors"
              >
                <ChatBubbleLeftEllipsisIcon className="h-3 w-3 mr-1" />
                Nota
              </button>

              {/* Checklist */}
              <button
                onClick={() => onAbrirChecklist(orden.id)}
                className="flex items-center justify-center px-2 py-1 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 rounded text-xs transition-colors"
              >
                <ListBulletIcon className="h-3 w-3 mr-1" />
                Checklist
              </button>
            </div>

            {/* Cambio de estado */}
            <div className="flex space-x-2">
              {siguienteEstado && (
                <button
                  onClick={handleCambiarEstado}
                  disabled={!puedeAvanzar}
                  className={`flex-1 flex items-center justify-center px-3 py-2 rounded text-xs transition-colors ${
                    puedeAvanzar
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ArrowRightIcon className="h-3 w-3 mr-1" />
                  Avanzar
                </button>
              )}

              <button
                onClick={handleEnEspera}
                className="px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-xs transition-colors"
              >
                En Espera
              </button>
            </div>

            <button
              onClick={() => setMostrarAcciones(false)}
              className="w-full text-center text-gray-500 hover:text-gray-400 text-xs py-1 transition-colors"
            >
              Ocultar acciones ↑
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
