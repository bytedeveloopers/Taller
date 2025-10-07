"use client";

import { ChecklistFase, ChecklistItem } from "@/types/ordenes";
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface ChecklistFaseComponentProps {
  fase: "DESARME" | "ARMADO" | "PRUEBA";
  checklist?: ChecklistFase;
  onActualizar: (checklist: ChecklistFase) => void;
}

// Plantillas de checklist por fase
const plantillasChecklist = {
  DESARME: [
    { id: "drenar_fluidos", descripcion: "Drenar todos los fluidos", obligatorio: true },
    { id: "desconectar_bateria", descripcion: "Desconectar batería", obligatorio: true },
    { id: "remover_componentes", descripcion: "Remover componentes según plan", obligatorio: true },
    { id: "etiquetar_piezas", descripcion: "Etiquetar y organizar piezas", obligatorio: true },
    {
      id: "fotografiar_proceso",
      descripcion: "Fotografiar proceso de desarme",
      obligatorio: false,
    },
    {
      id: "verificar_herramientas",
      descripcion: "Verificar herramientas especiales necesarias",
      obligatorio: false,
    },
  ],
  ARMADO: [
    {
      id: "verificar_piezas",
      descripcion: "Verificar todas las piezas necesarias",
      obligatorio: true,
    },
    {
      id: "limpiar_componentes",
      descripcion: "Limpiar componentes antes del armado",
      obligatorio: true,
    },
    {
      id: "aplicar_torque",
      descripcion: "Aplicar torque según especificaciones",
      obligatorio: true,
    },
    {
      id: "conectar_sistemas",
      descripcion: "Conectar todos los sistemas eléctricos",
      obligatorio: true,
    },
    { id: "llenar_fluidos", descripcion: "Llenar fluidos a niveles correctos", obligatorio: true },
    { id: "conectar_bateria", descripcion: "Conectar batería", obligatorio: true },
  ],
  PRUEBA: [
    { id: "encendido_motor", descripcion: "Verificar encendido del motor", obligatorio: true },
    { id: "revisar_luces", descripcion: "Revisar funcionamiento de luces", obligatorio: true },
    { id: "probar_frenos", descripcion: "Probar sistema de frenos", obligatorio: true },
    { id: "test_drive", descripcion: "Realizar test drive de 5km", obligatorio: true },
    { id: "revisar_fugas", descripcion: "Revisar posibles fugas", obligatorio: true },
    { id: "limpieza_final", descripcion: "Limpieza final del vehículo", obligatorio: false },
  ],
};

const titulosFase = {
  DESARME: "Checklist de Desarme",
  ARMADO: "Checklist de Armado",
  PRUEBA: "Checklist de Prueba",
};

export default function ChecklistFaseComponent({
  fase,
  checklist,
  onActualizar,
}: ChecklistFaseComponentProps) {
  const [nuevoItem, setNuevoItem] = useState("");
  const [mostrarAgregar, setMostrarAgregar] = useState(false);

  // Inicializar checklist si no existe
  const checklistActual: ChecklistFase = checklist || {
    completo: false,
    items: plantillasChecklist[fase].map((template) => ({
      id: template.id,
      descripcion: template.descripcion,
      completado: false,
    })),
  };

  const actualizarItem = (itemId: string, completado: boolean, observaciones?: string) => {
    const itemsActualizados = checklistActual.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            completado,
            observaciones,
            autorId: completado ? "tecnico_actual" : undefined, // TODO: Obtener del contexto
            creadoEn: completado ? new Date().toISOString() : undefined,
          }
        : item
    );

    const todosCompletados = itemsActualizados
      .filter((item) => plantillasChecklist[fase].find((t) => t.id === item.id)?.obligatorio)
      .every((item) => item.completado);

    const checklistActualizado: ChecklistFase = {
      completo: todosCompletados,
      items: itemsActualizados,
      completadoEn: todosCompletados ? new Date().toISOString() : undefined,
      completadoPor: todosCompletados ? "tecnico_actual" : undefined, // TODO: Obtener del contexto
    };

    onActualizar(checklistActualizado);
  };

  const agregarItemPersonalizado = () => {
    if (!nuevoItem.trim()) return;

    const nuevoItemObj: ChecklistItem = {
      id: `custom_${Date.now()}`,
      descripcion: nuevoItem.trim(),
      completado: false,
    };

    const checklistActualizado: ChecklistFase = {
      ...checklistActual,
      items: [...checklistActual.items, nuevoItemObj],
    };

    onActualizar(checklistActualizado);
    setNuevoItem("");
    setMostrarAgregar(false);
  };

  const eliminarItem = (itemId: string) => {
    // Solo permitir eliminar items personalizados
    if (!itemId.startsWith("custom_")) return;

    const itemsFiltrados = checklistActual.items.filter((item) => item.id !== itemId);

    const checklistActualizado: ChecklistFase = {
      ...checklistActual,
      items: itemsFiltrados,
    };

    onActualizar(checklistActualizado);
  };

  const itemsObligatorios = checklistActual.items.filter(
    (item) => plantillasChecklist[fase].find((t) => t.id === item.id)?.obligatorio
  );
  const itemsOpcionales = checklistActual.items.filter(
    (item) => !plantillasChecklist[fase].find((t) => t.id === item.id)?.obligatorio
  );
  const itemsPersonalizados = checklistActual.items.filter((item) => item.id.startsWith("custom_"));

  const progreso = {
    completados: checklistActual.items.filter((item) => item.completado).length,
    total: checklistActual.items.length,
    obligatorios: itemsObligatorios.filter((item) => item.completado).length,
    totalObligatorios: itemsObligatorios.length,
  };

  const porcentajeProgreso =
    progreso.total > 0 ? Math.round((progreso.completados / progreso.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header con progreso */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ClipboardDocumentCheckIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{titulosFase[fase]}</h3>
          </div>

          {checklistActual.completo && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Completado</span>
            </div>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Progreso: {progreso.completados}/{progreso.total} items
            </span>
            <span className="font-medium text-gray-900">{porcentajeProgreso}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                checklistActual.completo ? "bg-green-500" : "bg-blue-600"
              }`}
              style={{ width: `${porcentajeProgreso}%` }}
            />
          </div>

          <div className="text-xs text-gray-500">
            Obligatorios: {progreso.obligatorios}/{progreso.totalObligatorios}
          </div>
        </div>
      </div>

      {/* Items obligatorios */}
      {itemsObligatorios.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <span className="text-red-500 mr-1">*</span>
            Items Obligatorios
          </h4>
          <div className="space-y-3">
            {itemsObligatorios.map((item) => (
              <ItemChecklist
                key={item.id}
                item={item}
                onActualizar={(completado, observaciones) =>
                  actualizarItem(item.id, completado, observaciones)
                }
                obligatorio
              />
            ))}
          </div>
        </div>
      )}

      {/* Items opcionales */}
      {itemsOpcionales.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Items Opcionales</h4>
          <div className="space-y-3">
            {itemsOpcionales.map((item) => (
              <ItemChecklist
                key={item.id}
                item={item}
                onActualizar={(completado, observaciones) =>
                  actualizarItem(item.id, completado, observaciones)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Items personalizados */}
      {itemsPersonalizados.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Items Personalizados</h4>
          <div className="space-y-3">
            {itemsPersonalizados.map((item) => (
              <ItemChecklist
                key={item.id}
                item={item}
                onActualizar={(completado, observaciones) =>
                  actualizarItem(item.id, completado, observaciones)
                }
                onEliminar={() => eliminarItem(item.id)}
                personalizado
              />
            ))}
          </div>
        </div>
      )}

      {/* Agregar item personalizado */}
      <div className="border-t pt-4">
        {!mostrarAgregar ? (
          <button
            onClick={() => setMostrarAgregar(true)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Agregar item personalizado</span>
          </button>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <input
              type="text"
              value={nuevoItem}
              onChange={(e) => setNuevoItem(e.target.value)}
              placeholder="Descripción del nuevo item..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && agregarItemPersonalizado()}
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => {
                  setMostrarAgregar(false);
                  setNuevoItem("");
                }}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={agregarItemPersonalizado}
                disabled={!nuevoItem.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Información de completado */}
      {checklistActual.completadoEn && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="font-medium">Checklist completado</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Completado el {new Date(checklistActual.completadoEn).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

// Componente para item individual del checklist
interface ItemChecklistProps {
  item: ChecklistItem;
  onActualizar: (completado: boolean, observaciones?: string) => void;
  onEliminar?: () => void;
  obligatorio?: boolean;
  personalizado?: boolean;
}

function ItemChecklist({
  item,
  onActualizar,
  onEliminar,
  obligatorio,
  personalizado,
}: ItemChecklistProps) {
  const [observaciones, setObservaciones] = useState(item.observaciones || "");
  const [mostrarObservaciones, setMostrarObservaciones] = useState(false);

  const handleCompletadoChange = (completado: boolean) => {
    onActualizar(completado, observaciones);
  };

  const handleObservacionesChange = (nuevasObservaciones: string) => {
    setObservaciones(nuevasObservaciones);
    onActualizar(item.completado, nuevasObservaciones);
  };

  return (
    <div
      className={`border rounded-lg p-4 ${
        item.completado
          ? "bg-green-900/20 border-green-700"
          : "bg-secondary-800 border-secondary-700"
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <button
          onClick={() => handleCompletadoChange(!item.completado)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            item.completado
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-blue-500"
          }`}
        >
          {item.completado && <CheckCircleIcon className="h-4 w-4" />}
        </button>

        {/* Contenido */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <label
              className={`font-medium cursor-pointer ${
                item.completado ? "text-green-300 line-through" : "text-white"
              }`}
            >
              {item.descripcion}
              {obligatorio && <span className="text-red-400 ml-1">*</span>}
            </label>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMostrarObservaciones(!mostrarObservaciones)}
                className="text-gray-400 hover:text-gray-300"
                title="Observaciones"
              >
                <DocumentTextIcon className="h-4 w-4" />
              </button>

              {personalizado && onEliminar && (
                <button
                  onClick={onEliminar}
                  className="text-red-400 hover:text-red-600"
                  title="Eliminar"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Información de completado */}
          {item.completado && item.creadoEn && (
            <p className="text-xs text-green-600 mt-1">
              Completado el {new Date(item.creadoEn).toLocaleString()}
            </p>
          )}

          {/* Campo de observaciones */}
          {mostrarObservaciones && (
            <div className="mt-3">
              <textarea
                value={observaciones}
                onChange={(e) => handleObservacionesChange(e.target.value)}
                placeholder="Observaciones adicionales..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
