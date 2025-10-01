"use client";

import {
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

interface Props {
  stats: any;
}

export default function TecnicosSection({ stats }: Props) {
  const tecnicos = [
    { id: 1, name: "Juan Pérez", specialty: "Motor", carga: 85, activas: 4, completadas: 28 },
    {
      id: 2,
      name: "María García",
      specialty: "Transmisión",
      carga: 92,
      activas: 5,
      completadas: 35,
    },
    {
      id: 3,
      name: "Carlos López",
      specialty: "Electricidad",
      carga: 78,
      activas: 3,
      completadas: 22,
    },
    { id: 4, name: "Ana Rodríguez", specialty: "Frenos", carga: 88, activas: 4, completadas: 31 },
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas de técnicos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Técnicos</p>
              <p className="text-3xl font-bold text-white">{tecnicos.length}</p>
            </div>
            <UserIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Activos Hoy</p>
              <p className="text-3xl font-bold text-white">{tecnicos.length}</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tareas Activas</p>
              <p className="text-3xl font-bold text-white">
                {tecnicos.reduce((sum, t) => sum + t.activas, 0)}
              </p>
            </div>
            <WrenchScrewdriverIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Eficiencia Promedio</p>
              <p className="text-3xl font-bold text-white">
                {Math.round(tecnicos.reduce((sum, t) => sum + t.carga, 0) / tecnicos.length)}%
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Lista de técnicos */}
      <div className="bg-secondary-800 rounded-xl border border-secondary-700">
        <div className="p-6 border-b border-secondary-700">
          <h3 className="text-xl font-semibold text-white">Lista de Técnicos</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tecnicos.map((tecnico) => (
              <div
                key={tecnico.id}
                className="p-6 bg-secondary-700/50 rounded-lg hover:bg-secondary-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{tecnico.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{tecnico.name}</h4>
                      <p className="text-sm text-gray-400">{tecnico.specialty}</p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tecnico.carga > 90
                        ? "bg-red-500/20 text-red-400"
                        : tecnico.carga > 80
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {tecnico.carga}% Carga
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tareas Activas</span>
                    <span className="text-white font-medium">{tecnico.activas}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Completadas</span>
                    <span className="text-white font-medium">{tecnico.completadas}</span>
                  </div>

                  {/* Barra de carga */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Carga Laboral</span>
                      <span>{tecnico.carga}%</span>
                    </div>
                    <div className="w-full bg-secondary-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          tecnico.carga > 90
                            ? "bg-red-500"
                            : tecnico.carga > 80
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${tecnico.carga}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asignación de tareas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ClipboardDocumentCheckIcon className="h-6 w-6 mr-2 text-blue-400" />
            Asignación de Tareas
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-secondary-700/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">Reparación Motor - Toyota Corolla</h4>
                <span className="text-xs text-blue-400">Asignada</span>
              </div>
              <p className="text-sm text-gray-400 mb-2">Asignado a: Juan Pérez</p>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400">Estimado: 4 horas</span>
              </div>
            </div>

            <div className="p-4 bg-secondary-700/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">Cambio Transmisión - Honda Civic</h4>
                <span className="text-xs text-yellow-400">En Proceso</span>
              </div>
              <p className="text-sm text-gray-400 mb-2">Asignado a: María García</p>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400">Progreso: 60%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rendimiento */}
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-green-400" />
            Rendimiento del Equipo
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <h4 className="font-medium text-green-300 mb-2">Productividad</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Tareas completadas hoy</span>
                <span className="text-green-400 font-bold">12</span>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h4 className="font-medium text-blue-300 mb-2">Calidad</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Satisfacción promedio</span>
                <span className="text-blue-400 font-bold">4.8/5</span>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <h4 className="font-medium text-yellow-300 mb-2">Tiempo</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Tiempo promedio/tarea</span>
                <span className="text-yellow-400 font-bold">2.5h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
