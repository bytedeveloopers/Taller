// src/components/admin/vehiculos/ListadoVehiculos.tsx
"use client";

import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  ViewColumnsIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import React, { useMemo } from "react";

type Vehiculo = {
  id: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
  customer?: { id: string; name: string; phone: string; email?: string };
  status?: string;
  lastVisit?: string | null;
};

interface Props {
  vehiculos?: Vehiculo[];
  loading?: boolean;
  onEditarVehiculo: (v: Vehiculo) => void;
  onEliminarVehiculo: (id: string) => void;
  onVerFicha360: (v: Vehiculo) => void;
  onRecargar: () => void;
  onCrearVehiculo?: () => void; // 👈 nuevo
}

export default function ListadoVehiculos({
  vehiculos,
  loading = false,
  onEditarVehiculo,
  onEliminarVehiculo,
  onVerFicha360,
  onRecargar,
  onCrearVehiculo,
}: Props) {
  const items = useMemo<Vehiculo[]>(
    () => (Array.isArray(vehiculos) ? vehiculos : []),
    [vehiculos]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        Cargando…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-secondary-600 overflow-hidden">
      {/* Barra superior */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary-700">
        <h3 className="text-white font-semibold">Vehículos ({items.length})</h3>
        <div className="flex items-center gap-2">
          {onCrearVehiculo && (
            <button
              onClick={onCrearVehiculo}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              title="Nuevo Vehículo"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Nuevo Vehículo</span>
            </button>
          )}
          <button
            onClick={onRecargar}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary-600 text-gray-100 hover:bg-secondary-500 transition-colors"
            title="Recargar"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Recargar</span>
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary-600 text-gray-100 hover:bg-secondary-500 transition-colors"
            title="Vista Tarjetas"
          >
            <ViewColumnsIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Vista Tarjetas</span>
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="min-h-[220px] bg-secondary-800">
        <div className="grid grid-cols-12 px-4 py-2 text-gray-300 border-b border-secondary-700">
          <div className="col-span-4">Vehículo</div>
          <div className="col-span-3">Cliente</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2">Última visita</div>
          <div className="col-span-1 text-right">Acciones</div>
        </div>

        {items.length === 0 ? (
          <div className="flex items-center justify-center py-14 text-gray-400">
            No hay vehículos
          </div>
        ) : (
          <ul className="divide-y divide-secondary-700">
            {items.map((v) => (
              <li key={v.id} className="grid grid-cols-12 px-4 py-3 items-center">
                <div className="col-span-4 text-white">
                  <div className="font-medium">
                    {v.brand} {v.model} {v.year}
                  </div>
                  {v.color && (
                    <div className="text-xs text-gray-400">Color: {v.color}</div>
                  )}
                </div>

                <div className="col-span-3">
                  <div className="text-white">{v.customer?.name ?? "—"}</div>
                  <div className="text-xs text-gray-400">
                    {v.customer?.phone ?? "—"}
                    {v.customer?.email ? ` • ${v.customer.email}` : ""}
                  </div>
                </div>

                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      v.status === "ACTIVE"
                        ? "bg-green-600/20 text-green-300"
                        : "bg-secondary-600 text-gray-300"
                    }`}
                  >
                    {v.status === "ACTIVE" ? "Activo" : v.status ?? "—"}
                  </span>
                </div>

                <div className="col-span-2 text-gray-300">
                  {v.lastVisit ? new Date(v.lastVisit).toLocaleDateString() : "Sin visitas"}
                </div>

                <div className="col-span-1 flex justify-end gap-2">
                  <button
                    onClick={() => onVerFicha360(v)}
                    className="p-2 rounded-lg bg-secondary-600 text-gray-100 hover:bg-secondary-500"
                    title="Ver ficha 360"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onEditarVehiculo(v)}
                    className="p-2 rounded-lg bg-secondary-600 text-gray-100 hover:bg-secondary-500"
                    title="Editar"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onEliminarVehiculo(v.id)}
                    className="p-2 rounded-lg bg-red-600/80 text-white hover:bg-red-600"
                    title="Desactivar"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
