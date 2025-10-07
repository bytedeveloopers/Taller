"use client";

import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

export default function MetricasPersonales() {
  // Datos simulados - en producción vendrían de la API
  const metricas = {
    ordenesCompletadas: {
      hoy: 3,
      semana: 18,
      mes: 76,
    },
    tiempoPromedio: {
      porOrden: 4.2, // horas
      porEstado: {
        INGRESO: 25, // minutos
        DIAGNOSTICO: 35,
        PROCESO_DESARME: 120,
        PROCESO_ARMADO: 180,
        EN_PRUEBA: 45,
      },
    },
    cumplimientoSLA: {
      porcentaje: 87,
      dentroTiempo: 13,
      fuseraTiempo: 2,
    },
    retrabajos: {
      total: 2,
      porcentaje: 2.6,
      motivos: [
        { motivo: "Pieza defectuosa", cantidad: 1 },
        { motivo: "Error en diagnóstico", cantidad: 1 },
      ],
    },
    eficiencia: {
      puntuacion: 92,
      ranking: 3,
      totalTecnicos: 12,
    },
  };

  const datosGrafico = [
    { dia: "Lun", ordenes: 4, tiempo: 3.5 },
    { dia: "Mar", ordenes: 3, tiempo: 4.2 },
    { dia: "Mié", ordenes: 5, tiempo: 3.8 },
    { dia: "Jue", ordenes: 2, tiempo: 5.1 },
    { dia: "Vie", ordenes: 4, tiempo: 4.0 },
    { dia: "Sáb", ordenes: 0, tiempo: 0 },
    { dia: "Dom", ordenes: 0, tiempo: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Mis Métricas</h1>
        <div className="text-sm text-gray-300">
          Última actualización: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Resumen principal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Órdenes Hoy</p>
              <p className="text-3xl font-bold text-white">{metricas.ordenesCompletadas.hoy}</p>
            </div>
            <div className="p-3 bg-blue-900/50 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-300">+2 desde ayer</div>
        </div>

        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Tiempo Promedio</p>
              <p className="text-3xl font-bold text-white">{metricas.tiempoPromedio.porOrden}h</p>
            </div>
            <div className="p-3 bg-green-900/50 rounded-full">
              <ClockIcon className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-400">-0.3h vs promedio</div>
        </div>

        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Cumplimiento SLA</p>
              <p className="text-3xl font-bold text-white">
                {metricas.cumplimientoSLA.porcentaje}%
              </p>
            </div>
            <div className="p-3 bg-yellow-900/50 rounded-full">
              <TrophyIcon className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-300">
            {metricas.cumplimientoSLA.dentroTiempo}/
            {metricas.cumplimientoSLA.dentroTiempo + metricas.cumplimientoSLA.fuseraTiempo} órdenes
          </div>
        </div>

        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Retrabajos</p>
              <p className="text-3xl font-bold text-white">{metricas.retrabajos.porcentaje}%</p>
            </div>
            <div className="p-3 bg-red-900/50 rounded-full">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-red-400">
            {metricas.retrabajos.total} casos este mes
          </div>
        </div>
      </div>

      {/* Gráficos y detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento semanal */}
        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Rendimiento Semanal</h3>

          <div className="space-y-4">
            {datosGrafico.map((dia, index) => (
              <div key={dia.dia} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-300">{dia.dia}</div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">Órdenes: {dia.ordenes}</span>
                    <span className="text-sm text-gray-300">Tiempo: {dia.tiempo}h</span>
                  </div>

                  <div className="w-full bg-secondary-700 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(dia.ordenes / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tiempos por estado */}
        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Tiempo Promedio por Estado</h3>

          <div className="space-y-4">
            {Object.entries(metricas.tiempoPromedio.porEstado).map(([estado, tiempo]) => (
              <div key={estado} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">{estado}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-secondary-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min((tiempo / 180) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-12 text-right">
                    {tiempo < 60 ? `${tiempo}m` : `${(tiempo / 60).toFixed(1)}h`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detalles adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Eficiencia */}
        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Eficiencia</h3>

          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {metricas.eficiencia.puntuacion}
            </div>
            <div className="text-sm text-gray-300">Puntuación de eficiencia</div>
          </div>

          <div className="bg-secondary-700 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Ranking</span>
              <span className="font-medium text-white">
                #{metricas.eficiencia.ranking} de {metricas.eficiencia.totalTecnicos}
              </span>
            </div>
          </div>
        </div>

        {/* Retrabajos */}
        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Análisis de Retrabajos</h3>

          <div className="space-y-3">
            {metricas.retrabajos.motivos.map((motivo, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-300">{motivo.motivo}</span>
                <span className="bg-red-900/50 text-red-300 px-2 py-1 rounded-full text-xs">
                  {motivo.cantidad}
                </span>
              </div>
            ))}
          </div>

          {metricas.retrabajos.total === 0 && (
            <div className="text-center py-4">
              <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-green-400">Sin retrabajos este mes</p>
            </div>
          )}
        </div>

        {/* Estadísticas mensuales */}
        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Este Mes</h3>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Órdenes completadas</span>
              <span className="font-medium text-white">{metricas.ordenesCompletadas.mes}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Promedio diario</span>
              <span className="font-medium text-white">
                {(metricas.ordenesCompletadas.mes / 30).toFixed(1)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Mejor día</span>
              <span className="font-medium text-white">5 órdenes</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Total horas</span>
              <span className="font-medium text-white">
                {(metricas.ordenesCompletadas.mes * metricas.tiempoPromedio.porOrden).toFixed(0)}h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Objetivos y metas */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrophyIcon className="h-6 w-6 text-blue-400 mr-2" />
          Objetivos del Mes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Órdenes completadas</span>
              <span className="font-medium text-white">{metricas.ordenesCompletadas.mes}/80</span>
            </div>
            <div className="w-full bg-secondary-700 rounded-full h-2">
              <div
                className="bg-blue-400 h-2 rounded-full"
                style={{ width: `${(metricas.ordenesCompletadas.mes / 80) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Cumplimiento SLA</span>
              <span className="font-medium text-white">
                {metricas.cumplimientoSLA.porcentaje}%/90%
              </span>
            </div>
            <div className="w-full bg-secondary-700 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: `${(metricas.cumplimientoSLA.porcentaje / 90) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Retrabajos</span>
              <span className="font-medium text-white">{metricas.retrabajos.porcentaje}%/5%</span>
            </div>
            <div className="w-full bg-secondary-700 rounded-full h-2">
              <div
                className="bg-red-400 h-2 rounded-full"
                style={{ width: `${(metricas.retrabajos.porcentaje / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
