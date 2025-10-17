"use client";

import { EvidenciaArchivo } from "@/types/tecnico";
import {
  CameraIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";
import { EstadoTimer } from "./EstadoTimer";
import { UploaderEvidencias } from "./UploaderEvidencias";

interface ChecklistItem {
  id: string;
  categoria: string;
  descripcion: string;
  criticidad: "alta" | "media" | "baja";
  completado: boolean;
  observaciones?: string;
  evidenciaRequerida: boolean;
  evidencias: EvidenciaArchivo[];
}

interface FirmaDigital {
  tecnico: {
    nombre: string;
    id: string;
    firma: string;
    fecha: Date;
  };
  cliente?: {
    nombre: string;
    cedula: string;
    firma: string;
    fecha: Date;
  };
  supervisor?: {
    nombre: string;
    id: string;
    firma: string;
    fecha: Date;
  };
}

interface CalidadFormProps {
  ordenId: string;
  onSubmit: (datos: any) => void;
  onClose: () => void;
}

export const CalidadForm: React.FC<CalidadFormProps> = ({ ordenId, onSubmit, onClose }) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [firmas, setFirmas] = useState<FirmaDigital>({
    tecnico: {
      nombre: "Juan Pérez",
      id: "T001",
      firma: "",
      fecha: new Date(),
    },
  });
  const [observacionesGenerales, setObservacionesGenerales] = useState("");
  const [garantia, setGarantia] = useState({
    tipo: "30_dias",
    descripcion: "",
    limitaciones: "",
  });
  const [tiempoIniciado, setTiempoIniciado] = useState(false);
  const [mostrarFirmaModal, setMostrarFirmaModal] = useState(false);
  const [tipoFirmaActual, setTipoFirmaActual] = useState<"tecnico" | "supervisor" | "cliente">(
    "tecnico"
  );

  // Cargar checklist de calidad predeterminado
  useEffect(() => {
    const checklistDefault: ChecklistItem[] = [
      // Motor
      {
        id: "motor-1",
        categoria: "Motor",
        descripcion: "Nivel y estado del aceite",
        criticidad: "alta",
        completado: false,
        evidenciaRequerida: true,
        evidencias: [],
      },
      {
        id: "motor-2",
        categoria: "Motor",
        descripcion: "Funcionamiento suave en ralentí",
        criticidad: "alta",
        completado: false,
        evidenciaRequerida: false,
        evidencias: [],
      },
      {
        id: "motor-3",
        categoria: "Motor",
        descripcion: "No hay fugas de fluidos",
        criticidad: "media",
        completado: false,
        evidenciaRequerida: true,
        evidencias: [],
      },

      // Sistema eléctrico
      {
        id: "electrico-1",
        categoria: "Sistema Eléctrico",
        descripcion: "Batería con carga adecuada",
        criticidad: "alta",
        completado: false,
        evidenciaRequerida: false,
        evidencias: [],
      },
      {
        id: "electrico-2",
        categoria: "Sistema Eléctrico",
        descripcion: "Luces funcionales (todas)",
        criticidad: "media",
        completado: false,
        evidenciaRequerida: false,
        evidencias: [],
      },
      {
        id: "electrico-3",
        categoria: "Sistema Eléctrico",
        descripcion: "Sistema de encendido correcto",
        criticidad: "alta",
        completado: false,
        evidenciaRequerida: false,
        evidencias: [],
      },

      // Frenos
      {
        id: "frenos-1",
        categoria: "Sistema de Frenos",
        descripcion: "Frenado efectivo sin vibraciones",
        criticidad: "alta",
        completado: false,
        evidenciaRequerida: true,
        evidencias: [],
      },
      {
        id: "frenos-2",
        categoria: "Sistema de Frenos",
        descripcion: "Nivel de líquido de frenos",
        criticidad: "alta",
        completado: false,
        evidenciaRequerida: false,
        evidencias: [],
      },

      // Suspensión
      {
        id: "suspension-1",
        categoria: "Suspensión",
        descripcion: "Amortiguadores funcionando correctamente",
        criticidad: "media",
        completado: false,
        evidenciaRequerida: false,
        evidencias: [],
      },
      {
        id: "suspension-2",
        categoria: "Suspensión",
        descripcion: "Dirección sin holguras",
        criticidad: "alta",
        completado: false,
        evidenciaRequerida: false,
        evidencias: [],
      },

      // Carrocería
      {
        id: "carroceria-1",
        categoria: "Carrocería",
        descripcion: "Trabajos de pintura uniformes",
        criticidad: "media",
        completado: false,
        evidenciaRequerida: true,
        evidencias: [],
      },
      {
        id: "carroceria-2",
        categoria: "Carrocería",
        descripcion: "Paneles correctamente alineados",
        criticidad: "media",
        completado: false,
        evidenciaRequerida: true,
        evidencias: [],
      },

      // Prueba de ruta
      {
        id: "prueba-1",
        categoria: "Prueba de Ruta",
        descripcion: "Vehículo conduce suavemente",
        criticidad: "alta",
        completado: false,
        evidenciaRequerida: false,
        evidencias: [],
      },
      {
        id: "prueba-2",
        categoria: "Prueba de Ruta",
        descripcion: "Cambios de velocidad correctos",
        criticidad: "alta",
        completado: false,
        evidenciaRequerida: false,
        evidencias: [],
      },

      // Limpieza final
      {
        id: "limpieza-1",
        categoria: "Limpieza Final",
        descripcion: "Interior limpio y aspirado",
        criticidad: "baja",
        completado: false,
        evidenciaRequerida: true,
        evidencias: [],
      },
      {
        id: "limpieza-2",
        categoria: "Limpieza Final",
        descripcion: "Exterior lavado y encerado",
        criticidad: "baja",
        completado: false,
        evidenciaRequerida: true,
        evidencias: [],
      },
    ];

    setChecklistItems(checklistDefault);
  }, []);

  const toggleChecklistItem = (itemId: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, completado: !item.completado } : item))
    );
  };

  const updateObservacion = (itemId: string, observacion: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, observaciones: observacion } : item))
    );
  };

  const updateEvidencias = (itemId: string, evidencias: EvidenciaArchivo[]) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, evidencias } : item))
    );
  };

  const getProgresoCategoria = (categoria: string) => {
    const itemsCategoria = checklistItems.filter((item) => item.categoria === categoria);
    const itemsCompletados = itemsCategoria.filter((item) => item.completado);
    return {
      completados: itemsCompletados.length,
      total: itemsCategoria.length,
      porcentaje:
        itemsCategoria.length > 0 ? (itemsCompletados.length / itemsCategoria.length) * 100 : 0,
    };
  };

  const getProgresoTotal = () => {
    const completados = checklistItems.filter((item) => item.completado).length;
    const total = checklistItems.length;
    return {
      completados,
      total,
      porcentaje: total > 0 ? (completados / total) * 100 : 0,
    };
  };

  const validarCompletitud = () => {
    const itemsCriticosIncompletos = checklistItems.filter(
      (item) => item.criticidad === "alta" && !item.completado
    );

    const itemsConEvidenciaFaltante = checklistItems.filter(
      (item) => item.evidenciaRequerida && item.completado && item.evidencias.length === 0
    );

    return {
      valido: itemsCriticosIncompletos.length === 0 && itemsConEvidenciaFaltante.length === 0,
      itemsCriticos: itemsCriticosIncompletos,
      evidenciasFaltantes: itemsConEvidenciaFaltante,
    };
  };

  const categorias = [...new Set(checklistItems.map((item) => item.categoria))];
  const progresoTotal = getProgresoTotal();
  const validacion = validarCompletitud();

  const handleSubmit = () => {
    if (!validacion.valido) {
      alert("Debe completar todos los items críticos y proporcionar evidencias requeridas");
      return;
    }

    if (!firmas.tecnico.firma) {
      alert("Debe firmar como técnico responsable");
      return;
    }

    const datosCalidad = {
      ordenId,
      checklist: checklistItems,
      firmas,
      observacionesGenerales,
      garantia,
      fechaRevision: new Date(),
      progreso: progresoTotal,
    };

    onSubmit(datosCalidad);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div>
            <h2 className="text-xl font-bold">Control de Calidad Final</h2>
            <p className="text-green-100">Orden: {ordenId}</p>
          </div>

          <div className="flex items-center space-x-4">
            <EstadoTimer
              estado="Prueba de calidad"
              iniciado={tiempoIniciado}
              onIniciar={() => setTiempoIniciado(true)}
              onPausar={() => setTiempoIniciado(false)}
              onFinalizar={() => setTiempoIniciado(false)}
            />

            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-full max-h-[calc(90vh-80px)]">
          {/* Panel izquierdo - Checklist */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Progreso general */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progreso Total: {progresoTotal.completados}/{progresoTotal.total}
                </span>
                <span className="text-sm text-gray-600">
                  {progresoTotal.porcentaje.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progresoTotal.porcentaje}%` }}
                />
              </div>

              {!validacion.valido && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                    <div className="text-sm">
                      <p className="text-yellow-800 font-medium">Revisión pendiente:</p>
                      {validacion.itemsCriticos.length > 0 && (
                        <p className="text-yellow-700">
                          • Items críticos incompletos: {validacion.itemsCriticos.length}
                        </p>
                      )}
                      {validacion.evidenciasFaltantes.length > 0 && (
                        <p className="text-yellow-700">
                          • Evidencias faltantes: {validacion.evidenciasFaltantes.length}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Checklist por categorías */}
            <div className="space-y-6">
              {categorias.map((categoria) => {
                const progreso = getProgresoCategoria(categoria);
                const itemsCategoria = checklistItems.filter(
                  (item) => item.categoria === categoria
                );

                return (
                  <div key={categoria} className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">{categoria}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {progreso.completados}/{progreso.total}
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progreso.porcentaje}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {itemsCategoria.map((item) => (
                        <div key={item.id} className="p-4">
                          <div className="flex items-start space-x-3">
                            <button
                              onClick={() => toggleChecklistItem(item.id)}
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                item.completado
                                  ? "bg-green-500 border-green-500 text-white"
                                  : "border-gray-300 hover:border-green-500"
                              }`}
                            >
                              {item.completado && <CheckIcon className="h-4 w-4" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <p
                                  className={`text-sm font-medium ${
                                    item.completado ? "text-gray-500 line-through" : "text-gray-900"
                                  }`}
                                >
                                  {item.descripcion}
                                </p>

                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    item.criticidad === "alta"
                                      ? "bg-red-100 text-red-800"
                                      : item.criticidad === "media"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {item.criticidad}
                                </span>

                                {item.evidenciaRequerida && (
                                  <CameraIcon className="h-4 w-4 text-blue-500" />
                                )}
                              </div>

                              {/* Observaciones */}
                              <textarea
                                value={item.observaciones || ""}
                                onChange={(e) => updateObservacion(item.id, e.target.value)}
                                placeholder="Observaciones adicionales..."
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm resize-none"
                                rows={2}
                              />

                              {/* Evidencias si son requeridas */}
                              {item.evidenciaRequerida && (
                                <div className="mt-3">
                                  <UploaderEvidencias
                                    onUpload={(archivos) => updateEvidencias(item.id, archivos)}
                                    maxArchivos={3}
                                    tiposPermitidos={["image/*"]}
                                    compact={true}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel derecho - Firmas y finalización */}
          <div className="w-80 border-l border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Observaciones generales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Generales
                </label>
                <textarea
                  value={observacionesGenerales}
                  onChange={(e) => setObservacionesGenerales(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={4}
                  placeholder="Observaciones sobre el trabajo realizado..."
                />
              </div>

              {/* Garantía */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Garantía</label>
                <select
                  value={garantia.tipo}
                  onChange={(e) => setGarantia((prev) => ({ ...prev, tipo: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md mb-2"
                >
                  <option value="30_dias">30 días</option>
                  <option value="60_dias">60 días</option>
                  <option value="90_dias">90 días</option>
                  <option value="6_meses">6 meses</option>
                  <option value="1_ano">1 año</option>
                </select>

                <textarea
                  value={garantia.descripcion}
                  onChange={(e) =>
                    setGarantia((prev) => ({ ...prev, descripcion: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md mb-2 resize-none"
                  rows={2}
                  placeholder="Descripción de la garantía..."
                />

                <textarea
                  value={garantia.limitaciones}
                  onChange={(e) =>
                    setGarantia((prev) => ({ ...prev, limitaciones: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md resize-none"
                  rows={2}
                  placeholder="Limitaciones de la garantía..."
                />
              </div>

              {/* Firmas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Firmas Digitales</h3>

                {/* Firma del técnico */}
                <div className="mb-4 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium">Técnico</span>
                    </div>
                    {firmas.tecnico.firma ? (
                      <CheckCircleSolid className="h-5 w-5 text-green-500" />
                    ) : (
                      <button
                        onClick={() => {
                          setTipoFirmaActual("tecnico");
                          setMostrarFirmaModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Firmar
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{firmas.tecnico.nombre}</p>
                  {firmas.tecnico.firma && (
                    <p className="text-xs text-gray-500 mt-1">
                      Firmado: {firmas.tecnico.fecha.toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Firma del supervisor (opcional) */}
                <div className="mb-4 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium">Supervisor</span>
                    </div>
                    {firmas.supervisor?.firma ? (
                      <CheckCircleSolid className="h-5 w-5 text-green-500" />
                    ) : (
                      <button
                        onClick={() => {
                          setTipoFirmaActual("supervisor");
                          setMostrarFirmaModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Firmar
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {firmas.supervisor?.nombre || "No asignado"}
                  </p>
                  {firmas.supervisor?.firma && (
                    <p className="text-xs text-gray-500 mt-1">
                      Firmado: {firmas.supervisor.fecha.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={!validacion.valido || !firmas.tecnico.firma}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    validacion.valido && firmas.tecnico.firma
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Aprobar y Finalizar
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de firma digital */}
      {mostrarFirmaModal && (
        <FirmaDigitalModal
          tipo={tipoFirmaActual}
          onFirmar={(firma) => {
            if (tipoFirmaActual === "tecnico") {
              setFirmas((prev) => ({
                ...prev,
                tecnico: { ...prev.tecnico, firma, fecha: new Date() },
              }));
            } else if (tipoFirmaActual === "supervisor") {
              setFirmas((prev) => ({
                ...prev,
                supervisor: {
                  nombre: "María González",
                  id: "S001",
                  firma,
                  fecha: new Date(),
                },
              }));
            }
            setMostrarFirmaModal(false);
          }}
          onCerrar={() => setMostrarFirmaModal(false)}
        />
      )}
    </div>
  );
};

// Componente Modal de Firma Digital
interface FirmaDigitalModalProps {
  tipo: "tecnico" | "supervisor" | "cliente";
  onFirmar: (firma: string) => void;
  onCerrar: () => void;
}

const FirmaDigitalModal: React.FC<FirmaDigitalModalProps> = ({ tipo, onFirmar, onCerrar }) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
      }
    }
  }, [canvas]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvas) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveFirma = () => {
    if (canvas) {
      const firmaDataUrl = canvas.toDataURL();
      onFirmar(firmaDataUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 capitalize">Firma {tipo}</h3>

        <div className="border-2 border-gray-300 rounded-lg p-2 mb-4">
          <canvas
            ref={setCanvas}
            width={400}
            height={200}
            className="w-full h-32 cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={clearCanvas}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Limpiar
          </button>
          <button
            onClick={onCerrar}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={saveFirma}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Firmar
          </button>
        </div>
      </div>
    </div>
  );
};
