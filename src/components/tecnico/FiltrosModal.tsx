"use client";

import { EstadoOT, FiltrosOrdenes, PrioridadOT } from "@/types/tecnico";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface FiltrosModalProps {
  filtros: FiltrosOrdenes;
  onAplicar: (filtros: FiltrosOrdenes) => void;
  onCerrar: () => void;
}

const estados: { valor: EstadoOT; label: string }[] = [
  { valor: "INGRESO", label: "Ingreso" },
  { valor: "DIAGNOSTICO", label: "Diagnóstico" },
  { valor: "COTIZACION_ENVIADA", label: "Cotización Enviada" },
  { valor: "DESARME", label: "Desarme" },
  { valor: "ARMADO", label: "Armado" },
  { valor: "PRUEBA_CALIDAD", label: "Prueba de Calidad" },
  { valor: "LISTO_ENTREGA", label: "Listo para Entrega" },
  { valor: "ENTREGADO", label: "Entregado" },
  { valor: "EN_ESPERA", label: "En Espera" },
];

const prioridades: { valor: PrioridadOT; label: string }[] = [
  { valor: "BAJA", label: "Baja" },
  { valor: "MEDIA", label: "Media" },
  { valor: "ALTA", label: "Alta" },
  { valor: "URGENTE", label: "Urgente" },
];

export default function FiltrosModal({ filtros, onAplicar, onCerrar }: FiltrosModalProps) {
  const [filtrosTemp, setFiltrosTemp] = useState<FiltrosOrdenes>(filtros);

  const handleAplicar = () => {
    onAplicar(filtrosTemp);
  };

  const handleLimpiar = () => {
    setFiltrosTemp({});
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <h2 className="text-lg font-semibold text-white">Filtros</h2>
          <button
            onClick={onCerrar}
            className="p-2 hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Estado</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {estados.map((estado) => (
                <label key={estado.valor} className="flex items-center">
                  <input
                    type="radio"
                    name="estado"
                    value={estado.valor}
                    checked={filtrosTemp.estado === estado.valor}
                    onChange={(e) =>
                      setFiltrosTemp((prev) => ({
                        ...prev,
                        estado: e.target.value as EstadoOT,
                      }))
                    }
                    className="mr-3 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 text-sm">{estado.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Prioridad</label>
            <div className="space-y-2">
              {prioridades.map((prioridad) => (
                <label key={prioridad.valor} className="flex items-center">
                  <input
                    type="radio"
                    name="prioridad"
                    value={prioridad.valor}
                    checked={filtrosTemp.prioridad === prioridad.valor}
                    onChange={(e) =>
                      setFiltrosTemp((prev) => ({
                        ...prev,
                        prioridad: e.target.value as PrioridadOT,
                      }))
                    }
                    className="mr-3 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 text-sm">{prioridad.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Desde</label>
              <input
                type="date"
                value={filtrosTemp.fechaDesde || ""}
                onChange={(e) =>
                  setFiltrosTemp((prev) => ({ ...prev, fechaDesde: e.target.value }))
                }
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hasta</label>
              <input
                type="date"
                value={filtrosTemp.fechaHasta || ""}
                onChange={(e) =>
                  setFiltrosTemp((prev) => ({ ...prev, fechaHasta: e.target.value }))
                }
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-secondary-700">
          <button
            onClick={handleLimpiar}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Limpiar filtros
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onCerrar}
              className="px-4 py-2 bg-secondary-700 hover:bg-secondary-600 text-gray-300 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAplicar}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
