"use client";

import { OrdenTrabajo } from "@/types/tecnico";
import OrdenCard from "./OrdenCard";

interface ListaOrdenesProps {
  ordenes: OrdenTrabajo[];
  onCambiarEstado: (ordenId: string, nuevoEstado: any, motivo?: string) => void;
  onSubirEvidencias: (ordenId: string, evidencias: File[]) => void;
  onAgregarNota: (ordenId: string, nota: string) => void;
}

export default function ListaOrdenes({
  ordenes,
  onCambiarEstado,
  onSubirEvidencias,
  onAgregarNota,
}: ListaOrdenesProps) {
  return (
    <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
      <div className="space-y-4">
        {ordenes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No se encontraron órdenes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ordenes.map((orden) => (
              <OrdenCard
                key={orden.id}
                orden={orden}
                onCambiarEstado={onCambiarEstado}
                onSubirEvidencias={onSubirEvidencias}
                onAgregarNota={onAgregarNota}
                onAbrirChecklist={(ordenId) => {
                  console.log("Abrir checklist para orden:", ordenId);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
