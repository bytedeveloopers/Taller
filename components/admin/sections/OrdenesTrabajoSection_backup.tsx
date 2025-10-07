"use client";

import AsignarTecnicoModal from "@/components/ui/AsignarTecnicoModal";
import { useToast } from "@/components/ui/ToastNotification";
import useAsignacionTecnico from "@/hooks/useAsignacionTecnico";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MapPinIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface OrdenTrabajo {
  id: string;
  codigoSeguimiento: string;
  cliente: {
    name: string;
    phone: string;
    email?: string;
  };
  vehiculo: {
    brand: string;
    model: string;
    year: number;
    licensePlate?: string;
    color?: string;
  };
  tecnico?: {
    id: string;
    name: string;
  };
  estado: "RECEIVED" | "IN_PROGRESS" | "WAITING_PARTS" | "COMPLETED" | "DELIVERED";
  prioridad: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  fechaIngreso: string;
  ultimaActualizacion: string;
  tareas: {
    total: number;
    completadas: number;
    pendientes: number;
  };
  observaciones?: string;
  evidenciasFotos: number;
}

interface Props {
  stats: any;
}

const ESTADOS_CONFIG = {
  RECEIVED: {
    label: "Recibido",
    color: "bg-blue-500",
    textColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    icon: TruckIcon,
  },
  IN_PROGRESS: {
    label: "En Proceso",
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    icon: CogIcon,
  },
  WAITING_PARTS: {
    label: "Esperando Repuestos",
    color: "bg-orange-500",
    textColor: "text-orange-500",
    bgColor: "bg-orange-500/10",
    icon: ExclamationTriangleIcon,
  },
  COMPLETED: {
    label: "Completado",
    color: "bg-green-500",
    textColor: "text-green-500",
    bgColor: "bg-green-500/10",
    icon: CheckCircleIcon,
  },
  DELIVERED: {
    label: "Entregado",
    color: "bg-gray-500",
    textColor: "text-gray-500",
    bgColor: "bg-gray-500/10",
    icon: CheckCircleIcon,
  },
};

const PRIORIDAD_CONFIG = {
  LOW: { label: "Baja", color: "text-green-400", bg: "bg-green-400/10" },
  MEDIUM: { label: "Media", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  HIGH: { label: "Alta", color: "text-orange-400", bg: "bg-orange-400/10" },
  URGENT: { label: "Urgente", color: "text-red-400", bg: "bg-red-400/10" },
};

export default function OrdenesTrabajoSection({ stats }: Props) {
  return (
    <div className="space-y-6">
      {/* Vista general de estados */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {estadosOrden.map((estado) => {
          const Icon = estado.icon;
          return (
            <div
              key={estado.id}
              className="bg-secondary-800 rounded-xl p-4 border border-secondary-700 hover:border-primary-500 transition-colors cursor-pointer"
            >
              <div className="text-center">
                <div
                  className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    estado.color === "blue"
                      ? "bg-blue-500/20"
                      : estado.color === "yellow"
                      ? "bg-yellow-500/20"
                      : estado.color === "orange"
                      ? "bg-orange-500/20"
                      : estado.color === "gray"
                      ? "bg-gray-500/20"
                      : estado.color === "purple"
                      ? "bg-purple-500/20"
                      : estado.color === "indigo"
                      ? "bg-indigo-500/20"
                      : estado.color === "green"
                      ? "bg-green-500/20"
                      : "bg-teal-500/20"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      estado.color === "blue"
                        ? "text-blue-400"
                        : estado.color === "yellow"
                        ? "text-yellow-400"
                        : estado.color === "orange"
                        ? "text-orange-400"
                        : estado.color === "gray"
                        ? "text-gray-400"
                        : estado.color === "purple"
                        ? "text-purple-400"
                        : estado.color === "indigo"
                        ? "text-indigo-400"
                        : estado.color === "green"
                        ? "text-green-400"
                        : "text-teal-400"
                    }`}
                  />
                </div>
                <p className="text-2xl font-bold text-white mb-1">{estado.count}</p>
                <p className="text-xs text-gray-400 font-medium">{estado.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flujo de trabajo */}
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <h3 className="text-xl font-semibold text-white mb-6">Flujo de Órdenes de Trabajo</h3>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {estadosOrden.map((estado, index) => {
            const Icon = estado.icon;
            return (
              <div key={estado.id} className="flex items-center">
                <div
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    estado.color === "blue"
                      ? "bg-blue-500/10 border border-blue-500/20"
                      : estado.color === "yellow"
                      ? "bg-yellow-500/10 border border-yellow-500/20"
                      : estado.color === "orange"
                      ? "bg-orange-500/10 border border-orange-500/20"
                      : estado.color === "gray"
                      ? "bg-gray-500/10 border border-gray-500/20"
                      : estado.color === "purple"
                      ? "bg-purple-500/10 border border-purple-500/20"
                      : estado.color === "indigo"
                      ? "bg-indigo-500/10 border border-indigo-500/20"
                      : estado.color === "green"
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-teal-500/10 border border-teal-500/20"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      estado.color === "blue"
                        ? "text-blue-400"
                        : estado.color === "yellow"
                        ? "text-yellow-400"
                        : estado.color === "orange"
                        ? "text-orange-400"
                        : estado.color === "gray"
                        ? "text-gray-400"
                        : estado.color === "purple"
                        ? "text-purple-400"
                        : estado.color === "indigo"
                        ? "text-indigo-400"
                        : estado.color === "green"
                        ? "text-green-400"
                        : "text-teal-400"
                    }`}
                  />
                  <span className="text-white font-medium text-sm">{estado.name}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      estado.color === "blue"
                        ? "bg-blue-500 text-white"
                        : estado.color === "yellow"
                        ? "bg-yellow-500 text-white"
                        : estado.color === "orange"
                        ? "bg-orange-500 text-white"
                        : estado.color === "gray"
                        ? "bg-gray-500 text-white"
                        : estado.color === "purple"
                        ? "bg-purple-500 text-white"
                        : estado.color === "indigo"
                        ? "bg-indigo-500 text-white"
                        : estado.color === "green"
                        ? "bg-green-500 text-white"
                        : "bg-teal-500 text-white"
                    }`}
                  >
                    {estado.count}
                  </span>
                </div>

                {index < estadosOrden.length - 1 && <div className="mx-2 text-gray-500">→</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Órdenes activas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En proceso */}
        <div className="bg-secondary-800 rounded-xl border border-secondary-700">
          <div className="p-6 border-b border-secondary-700">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <WrenchScrewdriverIcon className="h-6 w-6 mr-2 text-yellow-400" />
              En Proceso ({estadosOrden.slice(0, 6).reduce((sum, e) => sum + e.count, 0)})
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-4 bg-secondary-700/50 rounded-lg border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-white">OT-2024-091</h4>
                  <p className="text-sm text-gray-400">Honda Civic 2018 - Placa: P123ABC</p>
                </div>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  Diagnóstico
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-2">Cliente: María González</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Técnico: Juan Pérez</span>
                <span>Iniciado: 15/09/2024</span>
              </div>
            </div>

            <div className="p-4 bg-secondary-700/50 rounded-lg border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-white">OT-2024-090</h4>
                  <p className="text-sm text-gray-400">Toyota Corolla 2020 - Placa: P456DEF</p>
                </div>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  Ingreso
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-2">Cliente: Carlos Rodríguez</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>En espera de asignación</span>
                <span>Ingresó: 15/09/2024</span>
              </div>
            </div>

            <div className="p-4 bg-secondary-700/50 rounded-lg border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-white">OT-2024-089</h4>
                  <p className="text-sm text-gray-400">Nissan Sentra 2019 - Placa: P789GHI</p>
                </div>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                  Armado
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-2">Cliente: Ana López</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Técnico: María García</span>
                <span>Progreso: 75%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Completadas */}
        <div className="bg-secondary-800 rounded-xl border border-secondary-700">
          <div className="p-6 border-b border-secondary-700">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <CheckCircleIcon className="h-6 w-6 mr-2 text-green-400" />
              Completadas Hoy ({estadosOrden.slice(6).reduce((sum, e) => sum + e.count, 0)})
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-4 bg-secondary-700/50 rounded-lg border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-white">OT-2024-088</h4>
                  <p className="text-sm text-gray-400">Ford Focus 2017 - Placa: P321JKL</p>
                </div>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Finalizado
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-2">Cliente: Pedro Martínez</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Técnico: Carlos López</span>
                <span>Total: Q850.00</span>
              </div>
            </div>

            <div className="p-4 bg-secondary-700/50 rounded-lg border-l-4 border-teal-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-white">OT-2024-087</h4>
                  <p className="text-sm text-gray-400">Chevrolet Aveo 2016 - Placa: P654MNO</p>
                </div>
                <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                  Entregado
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-2">Cliente: Laura Hernández</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Técnico: Ana Rodríguez</span>
                <span>Total: Q1,200.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y recordatorios */}
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-yellow-400" />
          Alertas y Seguimiento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <h4 className="font-medium text-red-300 mb-2">Órdenes Retrasadas</h4>
            <p className="text-2xl font-bold text-red-400 mb-1">2</p>
            <p className="text-xs text-gray-400">Más de 5 días</p>
          </div>

          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <h4 className="font-medium text-yellow-300 mb-2">Esperando Repuestos</h4>
            <p className="text-2xl font-bold text-yellow-400 mb-1">4</p>
            <p className="text-xs text-gray-400">En proceso de pedido</p>
          </div>

          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <h4 className="font-medium text-blue-300 mb-2">Listas para Entrega</h4>
            <p className="text-2xl font-bold text-blue-400 mb-1">3</p>
            <p className="text-xs text-gray-400">Esperando al cliente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
