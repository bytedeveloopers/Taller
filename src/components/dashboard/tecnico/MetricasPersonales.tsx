'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  StarIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface MetricaPersonal {
  tipo: 'productividad' | 'calidad' | 'tiempo' | 'satisfaccion';
  titulo: string;
  valor: number;
  unidad: string;
  tendencia: 'positiva' | 'negativa' | 'neutral';
  cambio: number;
  periodo: string;
  detalle?: string;
}

interface DatoHistorico {
  fecha: Date;
  valor: number;
  meta?: number;
}

interface LogroTecnico {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: Date;
  tipo: 'eficiencia' | 'calidad' | 'cliente' | 'tiempo';
  icon: string;
}

interface MetricasPersonalesProps {
  tecnicoId: string;
}

export const MetricasPersonales: React.FC<MetricasPersonalesProps> = ({ tecnicoId }) => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const [metricas, setMetricas] = useState<MetricaPersonal[]>([]);
  const [datosHistoricos, setDatosHistoricos] = useState<{ [key: string]: DatoHistorico[] }>({});
  const [logros, setLogros] = useState<LogroTecnico[]>([]);
  const [comparacion, setComparacion] = useState<'equipo' | 'historico'>('equipo');

  // Cargar datos simulados
  useEffect(() => {
    const metricasSimuladas: MetricaPersonal[] = [
      {
        tipo: 'productividad',
        titulo: 'Órdenes Completadas',
        valor: 28,
        unidad: 'órdenes',
        tendencia: 'positiva',
        cambio: 12,
        periodo: 'Este mes',
        detalle: '+3 vs mes anterior'
      },
      {
        tipo: 'tiempo',
        titulo: 'Tiempo Promedio',
        valor: 4.2,
        unidad: 'horas',
        tendencia: 'positiva',
        cambio: -8,
        periodo: 'Por orden',
        detalle: '20min menos que el promedio del equipo'
      },
      {
        tipo: 'calidad',
        titulo: 'SLA Cumplimiento',
        valor: 94,
        unidad: '%',
        tendencia: 'positiva',
        cambio: 6,
        periodo: 'Este mes',
        detalle: '26/28 órdenes a tiempo'
      },
      {
        tipo: 'satisfaccion',
        titulo: 'Satisfacción Cliente',
        valor: 4.8,
        unidad: '/5.0',
        tendencia: 'neutral',
        cambio: 0,
        periodo: 'Promedio',
        detalle: 'Basado en 15 evaluaciones'
      },
      {
        tipo: 'calidad',
        titulo: 'Tasa de Retrabajo',
        valor: 3,
        unidad: '%',
        tendencia: 'positiva',
        cambio: -50,
        periodo: 'Este mes',
        detalle: '1 de 28 órdenes'
      },
      {
        tipo: 'tiempo',
        titulo: 'Eficiencia Diagnóstico',
        valor: 85,
        unidad: '%',
        tendencia: 'positiva',
        cambio: 10,
        periodo: 'Este mes',
        detalle: 'Tiempo vs estimado inicial'
      }
    ];

    const logrosSimulados: LogroTecnico[] = [
      {
        id: '1',
        titulo: 'Mes sin Retrabajos',
        descripcion: 'Completó 25 órdenes consecutivas sin retrabajos',
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tipo: 'calidad',
        icon: 'trophy'
      },
      {
        id: '2',
        titulo: 'Récord de Eficiencia',
        descripcion: 'Completó una reparación compleja en 60% del tiempo estimado',
        fecha: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        tipo: 'tiempo',
        icon: 'clock'
      },
      {
        id: '3',
        titulo: 'Cliente Satisfecho',
        descripción: 'Recibió calificación 5/5 con comentario destacado',
        fecha: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        tipo: 'cliente',
        icon: 'star'
      }
    ];

    // Datos históricos simulados para gráficos
    const historicos: { [key: string]: DatoHistorico[] } = {
      productividad: Array.from({ length: 30 }, (_, i) => ({
        fecha: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
        valor: Math.floor(Math.random() * 5) + 3,
        meta: 4
      })),
      tiempo: Array.from({ length: 30 }, (_, i) => ({
        fecha: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
        valor: Math.random() * 2 + 3.5,
        meta: 4.5
      })),
      calidad: Array.from({ length: 30 }, (_, i) => ({
        fecha: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
        valor: Math.floor(Math.random() * 20) + 80,
        meta: 90
      }))
    };

    setMetricas(metricasSimuladas);
    setLogros(logrosSimulados);
    setDatosHistoricos(historicos);
  }, []);

  const getTendenciaIcon = (tendencia: MetricaPersonal['tendencia']) => {
    switch (tendencia) {
      case 'positiva':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'negativa':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTendenciaColor = (tendencia: MetricaPersonal['tendencia']) => {
    switch (tendencia) {
      case 'positiva':
        return 'text-green-600';
      case 'negativa':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMetricaIcon = (tipo: MetricaPersonal['tipo']) => {
    switch (tipo) {
      case 'productividad':
        return <ChartBarIcon className="h-6 w-6 text-blue-500" />;
      case 'tiempo':
        return <ClockIcon className="h-6 w-6 text-purple-500" />;
      case 'calidad':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'satisfaccion':
        return <StarIcon className="h-6 w-6 text-yellow-500" />;
      default:
        return <DocumentChartBarIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getLogroIcon = (tipo: LogroTecnico['tipo']) => {
    switch (tipo) {
      case 'calidad':
        return <TrophyIcon className="h-6 w-6 text-yellow-500" />;
      case 'tiempo':
        return <ClockIcon className="h-6 w-6 text-blue-500" />;
      case 'cliente':
        return <StarSolid className="h-6 w-6 text-purple-500" />;
      case 'eficiencia':
        return <ChartBarIcon className="h-6 w-6 text-green-500" />;
      default:
        return <UserIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const calcularRanking = () => {
    // Simulación de ranking en el equipo
    return {
      posicion: 2,
      total: 8,
      puntaje: 87
    };
  };

  const ranking = calcularRanking();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Métricas</h1>
          <p className="text-gray-600 mt-1">Seguimiento de rendimiento personal</p>
        </div>

        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Selector de período */}
          <select
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="trimestre">Este trimestre</option>
            <option value="año">Este año</option>
          </select>

          {/* Selector de comparación */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['equipo', 'historico'] as const).map(tipo => (
              <button
                key={tipo}
                onClick={() => setComparacion(tipo)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  comparacion === tipo
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tipo === 'equipo' ? 'vs Equipo' : 'Histórico'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel principal - Métricas */}
        <div className="lg:col-span-3 space-y-6">
          {/* Cards de métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {metricas.map((metrica, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    {getMetricaIcon(metrica.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {metrica.titulo}
                    </h3>
                    <p className="text-xs text-gray-500">{metrica.periodo}</p>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metrica.valor}
                      <span className="text-lg font-normal text-gray-500 ml-1">
                        {metrica.unidad}
                      </span>
                    </div>

                    {metrica.cambio !== 0 && (
                      <div className={`flex items-center space-x-1 mt-1 ${getTendenciaColor(metrica.tendencia)}`}>
                        {getTendenciaIcon(metrica.tendencia)}
                        <span className="text-sm font-medium">
                          {Math.abs(metrica.cambio)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {metrica.detalle && (
                  <p className="text-xs text-gray-500 mt-2">{metrica.detalle}</p>
                )}
              </div>
            ))}
          </div>

          {/* Gráfico de tendencias */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Tendencias de Rendimiento</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                  Productividad
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
                  Tiempo
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
                  Calidad
                </button>
              </div>
            </div>

            {/* Simulación de gráfico */}
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Gráfico de tendencias</p>
                <p className="text-sm">Últimos 30 días</p>
              </div>
            </div>
          </div>

          {/* Comparativa con el equipo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {comparacion === 'equipo' ? 'Comparativa con el Equipo' : 'Evolución Histórica'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Métricas Clave</h3>

                {['Productividad', 'Calidad SLA', 'Tiempo Promedio', 'Satisfacción'].map((metrica, index) => {
                  const valores = [85, 94, 4.2, 4.8];
                  const promedios = [78, 87, 4.8, 4.5];
                  const miValor = valores[index];
                  const promedio = promedios[index];
                  const porcentaje = (miValor / (promedio * 1.2)) * 100;

                  return (
                    <div key={metrica}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{metrica}</span>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600">{miValor}</span>
                          <span className="mx-1">vs</span>
                          <span>{promedio}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(porcentaje, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Ranking del Equipo</h3>

                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    #{ranking.posicion}
                  </div>
                  <div className="text-sm text-blue-700">
                    de {ranking.total} técnicos
                  </div>
                  <div className="mt-4">
                    <div className="text-lg font-semibold text-gray-900">
                      {ranking.puntaje} puntos
                    </div>
                    <div className="text-sm text-gray-600">Puntaje total</div>
                  </div>
                </div>

                <div className="text-center">
                  <TrophyIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    ¡Excelente rendimiento este mes!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Logros recientes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-4">
              <TrophyIcon className="h-5 w-5 text-yellow-500" />
              <h3 className="font-medium text-gray-900">Logros Recientes</h3>
            </div>

            <div className="space-y-3">
              {logros.map(logro => (
                <div key={logro.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getLogroIcon(logro.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {logro.titulo}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {logro.descripcion}
                    </p>
                    <p className="text-xs text-gray-500">
                      {logro.fecha.toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metas del mes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Metas del Mes</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Órdenes completadas</span>
                  <span className="text-sm font-medium text-gray-900">28/30</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-[93%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">SLA > 90%</span>
                  <span className="text-sm font-medium text-green-600">94%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Retrabajo < 5%</span>
                  <span className="text-sm font-medium text-green-600">3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-[60%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Satisfacción > 4.5</span>
                  <span className="text-sm font-medium text-green-600">4.8</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-full" />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-800">
                  ¡3 de 4 metas alcanzadas!
                </span>
              </div>
            </div>
          </div>

          {/* Próximos hitos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Próximos Hitos</h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">30 Órdenes Completadas</p>
                  <p className="text-xs text-gray-500">Faltan 2 órdenes</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Técnico del Mes</p>
                  <p className="text-xs text-gray-500">En el top 3</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">100% SLA</p>
                  <p className="text-xs text-gray-500">2 órdenes perfectas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback reciente */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Feedback Reciente</h3>

            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-2">
                  <div className="flex text-yellow-400 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarSolid key={i} className="h-3 w-3" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800 font-medium">Cliente muy satisfecho</p>
                    <p className="text-xs text-gray-600 mt-1">
                      "Excelente trabajo, muy profesional"
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Hace 2 días</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <UserIcon className="h-4 w-4 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-800 font-medium">Supervisor</p>
                    <p className="text-xs text-gray-600 mt-1">
                      "Buen manejo del tiempo en el diagnóstico"
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Hace 5 días</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
