"use client";

import { EstadoTimerProps } from "@/types/tecnico";
import { ClockIcon, PauseIcon, PlayIcon, StopIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function EstadoTimer({
  cronometro,
  onIniciar,
  onPausar,
  onReanudar,
}: EstadoTimerProps) {
  const [tiempoMostrado, setTiempoMostrado] = useState(0);
  const [motivoEspera, setMotivoEspera] = useState("");
  const [mostrarMotivo, setMostrarMotivo] = useState(false);

  useEffect(() => {
    if (!cronometro.activo) {
      setTiempoMostrado(cronometro.tiempoAcumulado);
      return;
    }

    const intervalo = setInterval(() => {
      const tiempoTranscurrido = cronometro.pausadoEn
        ? new Date(cronometro.pausadoEn).getTime() - new Date(cronometro.inicioEn).getTime()
        : Date.now() - new Date(cronometro.inicioEn).getTime();

      const tiempoEnMinutos = Math.floor(tiempoTranscurrido / (1000 * 60));
      setTiempoMostrado(cronometro.tiempoAcumulado + tiempoEnMinutos);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [cronometro]);

  const formatearTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const handlePausar = () => {
    if (cronometro.estadoActual !== "EN_ESPERA") {
      setMostrarMotivo(true);
      return;
    }
    onPausar(cronometro.ordenId);
  };

  const confirmarPausa = () => {
    if (!motivoEspera.trim()) {
      alert("Debe ingresar un motivo para pausar");
      return;
    }

    onPausar(cronometro.ordenId, motivoEspera);
    setMotivoEspera("");
    setMostrarMotivo(false);
  };

  const estaEnEspera = cronometro.estadoActual === "EN_ESPERA";
  const estaPausado = cronometro.pausadoEn && !cronometro.activo;

  return (
    <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-medium text-white">
            Cronómetro - {cronometro.estadoActual.replace("_", " ")}
          </span>
        </div>
        <div className="text-xl font-mono text-white">{formatearTiempo(tiempoMostrado)}</div>
      </div>

      {/* Controles del cronómetro */}
      <div className="flex space-x-2">
        {!cronometro.activo ? (
          <button
            onClick={() => onIniciar(cronometro.ordenId)}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            {estaPausado ? "Reanudar" : "Iniciar"}
          </button>
        ) : (
          <>
            <button
              onClick={handlePausar}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              <PauseIcon className="h-4 w-4 mr-2" />
              {estaEnEspera ? "Pausar" : "En Espera"}
            </button>

            <button
              onClick={() => onPausar(cronometro.ordenId)}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <StopIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Estado actual */}
      <div className="mt-3 p-2 bg-secondary-700/50 rounded text-xs text-gray-400">
        {cronometro.activo && !estaPausado && (
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Trabajando en {cronometro.estadoActual.replace("_", " ")}
          </span>
        )}
        {estaPausado && (
          <span className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            Pausado
          </span>
        )}
        {!cronometro.activo && !estaPausado && (
          <span className="text-gray-500">Cronómetro detenido</span>
        )}
      </div>

      {/* Modal para motivo de pausa */}
      {mostrarMotivo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary-800 rounded-lg border border-secondary-700 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Motivo para poner en espera</h3>

            <textarea
              value={motivoEspera}
              onChange={(e) => setMotivoEspera(e.target.value)}
              placeholder="Describa el motivo..."
              className="w-full h-24 px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />

            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  setMostrarMotivo(false);
                  setMotivoEspera("");
                }}
                className="flex-1 px-4 py-2 bg-secondary-700 hover:bg-secondary-600 text-gray-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPausa}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
