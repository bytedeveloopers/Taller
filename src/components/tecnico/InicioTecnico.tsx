"use client";

import { AlertaTecnico, KPIsTecnico } from "@/types/tecnico";
import {
  CameraIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function InicioTecnico() {
  const [kpis, setKpis] = useState<KPIsTecnico>({
    otsActivas: 5,
    otsAtrasadas: 1,
    tareasHoy: 8,
    cumplimientoSLA: 85,
  });

  const [alertas, setAlertas] = useState<AlertaTecnico[]>([
    {
      id: "1",
      tipo: "OT_NUEVA",
      mensaje: "Nueva OT #2024-045 asignada - Toyota Camry",
      ordenId: "2024-045",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
      leida: false,
    },
    {
      id: "2",
      tipo: "OT_ATRASADA",
      mensaje: "OT #2024-040 próxima a vencer SLA en 1 hora",
      ordenId: "2024-040",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min atrás
      leida: false,
    },
    {
      id: "3",
      tipo: "FALTAN_EVIDENCIAS",
      mensaje: "OT #2024-038 requiere fotos antes del desarme",
      ordenId: "2024-038",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
      leida: true,
    },
  ]);

  const [horaActual, setHoraActual] = useState(new Date());

  // Actualizar hora cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cargar datos desde API
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // TODO: Implementar llamadas reales a API
        // const kpisResponse = await fetch("/api/tecnicos/me/kpis");
        // const alertasResponse = await fetch("/api/tecnicos/me/alertas");

        console.log("Cargando KPIs y alertas del técnico...");
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const marcarAlertaLeida = (alertaId: string) => {
    setAlertas((prev) =>
      prev.map((alerta) => (alerta.id === alertaId ? { ...alerta, leida: true } : alerta))
    );
  };

  const getAlertaIcon = (tipo: AlertaTecnico["tipo"]) => {
    switch (tipo) {
      case "OT_NUEVA":
        return <PlusIcon className="h-5 w-5 text-blue-400" />;
      case "OT_ATRASADA":
        return <ClockIcon className="h-5 w-5 text-red-400" />;
      case "FALTAN_EVIDENCIAS":
        return <PhotoIcon className="h-5 w-5 text-yellow-400" />;
      case "EN_ESPERA_MUCHO_TIEMPO":
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getAlertaColor = (tipo: AlertaTecnico["tipo"]) => {
    switch (tipo) {
      case "OT_NUEVA":
        return "border-blue-500 bg-blue-600/10";
      case "OT_ATRASADA":
        return "border-red-500 bg-red-600/10";
      case "FALTAN_EVIDENCIAS":
        return "border-yellow-500 bg-yellow-600/10";
      case "EN_ESPERA_MUCHO_TIEMPO":
        return "border-orange-500 bg-orange-600/10";
      default:
        return "border-gray-500 bg-gray-600/10";
    }
  };

  const formatearTiempo = (isoString: string) => {
    const fecha = new Date(isoString);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();

    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(minutos / 60);

    if (horas > 0) {
      return `hace ${horas}h`;
    } else {
      return `hace ${minutos}m`;
    }
  };

  const alertasNoLeidas = alertas.filter((a) => !a.leida).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header con saludo y hora */}
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">¡Buen día, Técnico! 👋</h1>
            <p className="text-gray-400 mt-2">Aquí tienes tu resumen del día de hoy</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {horaActual.toLocaleTimeString("es-GT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-gray-400">
              {horaActual.toLocaleDateString("es-GT", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">OTs Activas</p>
              <p className="text-3xl font-bold text-white">{kpis.otsActivas}</p>
            </div>
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <ClockIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">OTs Atrasadas</p>
              <p className="text-3xl font-bold text-red-400">{kpis.otsAtrasadas}</p>
            </div>
            <div className="p-3 bg-red-600/20 rounded-lg">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tareas Hoy</p>
              <p className="text-3xl font-bold text-white">{kpis.tareasHoy}</p>
            </div>
            <div className="p-3 bg-green-600/20 rounded-lg">
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Cumplimiento SLA</p>
              <p className="text-3xl font-bold text-green-400">{kpis.cumplimientoSLA}%</p>
            </div>
            <div className="p-3 bg-green-600/20 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas */}
        <div className="lg:col-span-2 bg-secondary-800 rounded-lg border border-secondary-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              Alertas
              {alertasNoLeidas > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {alertasNoLeidas}
                </span>
              )}
            </h2>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
            {alertas.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay alertas nuevas</p>
              </div>
            ) : (
              alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200 ${
                    alerta.leida ? "opacity-60 hover:opacity-80" : "hover:bg-secondary-700/30"
                  } ${getAlertaColor(alerta.tipo)}`}
                  onClick={() => marcarAlertaLeida(alerta.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getAlertaIcon(alerta.tipo)}
                    <div className="flex-1">
                      <p className={`text-sm ${alerta.leida ? "text-gray-400" : "text-white"}`}>
                        {alerta.mensaje}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatearTiempo(alerta.timestamp)}
                        {!alerta.leida && <span className="ml-2 text-blue-400">• Nueva</span>}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Atajos rápidos */}
        <div className="space-y-6">
          <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Atajos Rápidos</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg border border-blue-600/30 text-blue-400 hover:text-blue-300 transition-all duration-200">
                <CameraIcon className="h-5 w-5 mr-3" />
                <span className="font-medium">Escanear QR</span>
              </button>

              <button className="w-full flex items-center px-4 py-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg border border-green-600/30 text-green-400 hover:text-green-300 transition-all duration-200">
                <PlusIcon className="h-5 w-5 mr-3" />
                <span className="font-medium">Crear Ingreso</span>
              </button>

              <button className="w-full flex items-center px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg border border-purple-600/30 text-purple-400 hover:text-purple-300 transition-all duration-200">
                <PhotoIcon className="h-5 w-5 mr-3" />
                <span className="font-medium">Cargar Evidencias</span>
              </button>
            </div>
          </div>

          {/* Progreso del día */}
          <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Progreso del Día</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Tareas completadas</span>
                  <span className="text-white">6/8</span>
                </div>
                <div className="w-full bg-secondary-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Tiempo trabajado</span>
                  <span className="text-white">6.5/8 hrs</span>
                </div>
                <div className="w-full bg-secondary-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "81%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
