"use client";

import OrdenCard from "@/components/tecnico/OrdenCard";
import { EstadoOT, OrdenTrabajo } from "@/types/tecnico";

interface KanbanBoardProps {
  ordenes?: OrdenTrabajo[]; // ← ahora opcional
  onCambiarEstado?: (ordenId: string, nuevoEstado: EstadoOT, motivo?: string) => void;
  onSubirEvidencias?: (ordenId: string, evidencias: File[]) => void;
  onAgregarNota?: (ordenId: string, nota: string) => void;
}

interface ColumnaKanban {
  estado: EstadoOT;
  titulo: string;
  color: string;
  bgColor: string;
}

const columnas: ColumnaKanban[] = [
  { estado: "INGRESO",           titulo: "Ingreso",             color: "text-blue-400",   bgColor: "bg-blue-600/10 border-blue-600/30" },
  { estado: "DIAGNOSTICO",       titulo: "Diagnóstico",         color: "text-yellow-400", bgColor: "bg-yellow-600/10 border-yellow-600/30" },
  { estado: "COTIZACION_ENVIADA",titulo: "Cotización Enviada",  color: "text-purple-400", bgColor: "bg-purple-600/10 border-purple-600/30" },
  { estado: "DESARME",           titulo: "Desarme",             color: "text-orange-400", bgColor: "bg-orange-600/10 border-orange-600/30" },
  { estado: "ARMADO",            titulo: "Armado",              color: "text-indigo-400", bgColor: "bg-indigo-600/10 border-indigo-600/30" },
  { estado: "PRUEBA_CALIDAD",    titulo: "Prueba de Calidad",   color: "text-cyan-400",   bgColor: "bg-cyan-600/10 border-cyan-600/30" },
  { estado: "LISTO_ENTREGA",     titulo: "Listo para Entrega",  color: "text-green-400",  bgColor: "bg-green-600/10 border-green-600/30" },
  { estado: "ENTREGADO",         titulo: "Entregado",           color: "text-gray-400",   bgColor: "bg-gray-600/10 border-gray-600/30" },
  { estado: "EN_ESPERA",         titulo: "En Espera",           color: "text-red-400",    bgColor: "bg-red-600/10 border-red-600/30" },
];

export default function KanbanBoard({
  ordenes,
  onCambiarEstado,
  onSubirEvidencias,
  onAgregarNota,
}: KanbanBoardProps) {
  // Normaliza entradas
  const items: OrdenTrabajo[] = Array.isArray(ordenes) ? ordenes : [];

  // No-ops por si no pasan handlers aún
  const _cambiar = onCambiarEstado ?? (() => {});
  const _evid = onSubirEvidencias ?? (() => {});
  const _nota = onAgregarNota ?? (() => {});

  const getOrdenesPorEstado = (estado: EstadoOT) =>
    items.filter((orden) => orden?.estado === estado);

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-6 pb-6" style={{ minWidth: "max-content" }}>
        {columnas.map((columna) => {
          const ordenesColumna = getOrdenesPorEstado(columna.estado);

          return (
            <div key={columna.estado} className="flex-shrink-0 w-80">
              {/* Header de la columna */}
              <div className={`rounded-lg border p-4 mb-4 ${columna.bgColor}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${columna.color}`}>{columna.titulo}</h3>
                  <span className={`text-sm px-2 py-1 rounded-full bg-secondary-700 ${columna.color}`}>
                    {ordenesColumna.length}
                  </span>
                </div>
              </div>

              {/* Tarjetas de órdenes */}
              <div className="space-y-4 min-h-96">
                {ordenesColumna.length === 0 ? (
                  <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6 text-center">
                    <p className="text-gray-500 text-sm">No hay órdenes en este estado</p>
                  </div>
                ) : (
                  ordenesColumna.map((orden) => (
                    <OrdenCard
                      key={orden.id}
                      orden={orden}
                      onCambiarEstado={_cambiar}
                      onSubirEvidencias={_evid}
                      onAgregarNota={_nota}
                      onAbrirChecklist={(ordenId) => {
                        console.log("Abrir checklist para orden:", ordenId);
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
