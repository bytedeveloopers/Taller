"use client";

import { OrdenTrabajo } from "@/types/tecnico";
import {
  CheckCircleIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  PrinterIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";

interface EntregaFinalProps {
  orden: OrdenTrabajo;
  onFinalizar: (datosEntrega: any) => void;
  onCancelar: () => void;
}

interface DocumentoEntrega {
  tipo: "factura" | "garantia" | "checklist" | "cotizacion";
  nombre: string;
  generado: boolean;
  url?: string;
}

interface PreparacionVehiculo {
  limpieza: {
    interior: boolean;
    exterior: boolean;
    motor: boolean;
  };
  combustible: {
    nivel: number;
    observaciones: string;
  };
  accesorios: {
    llaves: number;
    manuales: boolean;
    herramientas: boolean;
    repuestosUsados: boolean;
  };
  inspeccionFinal: {
    completada: boolean;
    observaciones: string;
    tecnicoResponsable: string;
  };
}

interface DatosEntrega {
  cliente: {
    presente: boolean;
    nombre: string;
    cedula: string;
    telefono: string;
    email: string;
    firmaConformidad: string;
  };
  vehiculo: {
    ubicacion: string;
    combustible: number;
    kilometraje: number;
    estadoGeneral: string;
  };
  pago: {
    metodoPago: "efectivo" | "tarjeta" | "transferencia" | "credito";
    monto: number;
    comprobante: string;
    pagado: boolean;
  };
  satisfaccion: {
    calificacion: number;
    comentarios: string;
  };
}

export const EntregaFinal: React.FC<EntregaFinalProps> = ({ orden, onFinalizar, onCancelar }) => {
  const [preparacion, setPreparacion] = useState<PreparacionVehiculo>({
    limpieza: {
      interior: false,
      exterior: false,
      motor: false,
    },
    combustible: {
      nivel: 0,
      observaciones: "",
    },
    accesorios: {
      llaves: 1,
      manuales: false,
      herramientas: false,
      repuestosUsados: false,
    },
    inspeccionFinal: {
      completada: false,
      observaciones: "",
      tecnicoResponsable: "Juan Pérez",
    },
  });

  const [documentos, setDocumentos] = useState<DocumentoEntrega[]>([
    { tipo: "factura", nombre: "Factura de Servicios", generado: false },
    { tipo: "garantia", nombre: "Certificado de Garantía", generado: false },
    { tipo: "checklist", nombre: "Checklist de Calidad", generado: false },
    { tipo: "cotizacion", nombre: "Cotización Aprobada", generado: true, url: "#" },
  ]);

  const [datosEntrega, setDatosEntrega] = useState<DatosEntrega>({
    cliente: {
      presente: false,
      nombre: orden.cliente.nombre,
      cedula: orden.cliente.cedula || "",
      telefono: orden.cliente.telefono,
      email: orden.cliente.email || "",
      firmaConformidad: "",
    },
    vehiculo: {
      ubicacion: "Patio Principal - Espacio A3",
      combustible: 25,
      kilometraje: orden.vehiculo.kilometraje + 15,
      estadoGeneral: "Excelente",
    },
    pago: {
      metodoPago: "efectivo",
      monto: 850000,
      comprobante: "",
      pagado: false,
    },
    satisfaccion: {
      calificacion: 0,
      comentarios: "",
    },
  });

  const [pasoActual, setPasoActual] = useState(1);
  const [mostrandoFirma, setMostrandoFirma] = useState(false);

  const validarPreparacion = () => {
    const { limpieza, accesorios, inspeccionFinal } = preparacion;
    return (
      limpieza.interior && limpieza.exterior && accesorios.llaves > 0 && inspeccionFinal.completada
    );
  };

  const validarDocumentos = () => {
    const documentosRequeridos = documentos.filter(
      (doc) => doc.tipo === "factura" || doc.tipo === "garantia" || doc.tipo === "checklist"
    );
    return documentosRequeridos.every((doc) => doc.generado);
  };

  const validarEntrega = () => {
    return (
      datosEntrega.cliente.presente &&
      datosEntrega.cliente.firmaConformidad &&
      datosEntrega.pago.pagado &&
      datosEntrega.satisfaccion.calificacion > 0
    );
  };

  const generarDocumento = async (tipo: string) => {
    // Simular generación de documento
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setDocumentos((prev) =>
      prev.map((doc) =>
        doc.tipo === tipo ? { ...doc, generado: true, url: `#${tipo}-${orden.id}` } : doc
      )
    );
  };

  const handleFinalizarEntrega = () => {
    if (!validarPreparacion() || !validarDocumentos() || !validarEntrega()) {
      alert("Debe completar todos los pasos antes de finalizar la entrega");
      return;
    }

    const datosCompletos = {
      ordenId: orden.id,
      preparacion,
      documentos,
      entrega: datosEntrega,
      fechaEntrega: new Date(),
      tecnicoEntrega: "Juan Pérez",
    };

    onFinalizar(datosCompletos);
  };

  const pasos = [
    { numero: 1, titulo: "Preparación del Vehículo", completado: validarPreparacion() },
    { numero: 2, titulo: "Documentación", completado: validarDocumentos() },
    { numero: 3, titulo: "Entrega al Cliente", completado: validarEntrega() },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div>
            <h2 className="text-xl font-bold">Entrega Final</h2>
            <p className="text-blue-100">
              {orden.vehiculo.marca} {orden.vehiculo.modelo} - {orden.vehiculo.placa}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Cliente</p>
              <p className="font-medium">{orden.cliente.nombre}</p>
            </div>
          </div>
        </div>

        {/* Indicador de pasos */}
        <div className="flex justify-center py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-8">
            {pasos.map((paso, index) => (
              <div key={paso.numero} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                    pasoActual === paso.numero
                      ? "bg-blue-500 text-white"
                      : paso.completado
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                  onClick={() => setPasoActual(paso.numero)}
                >
                  {paso.completado ? <CheckCircleIcon className="h-5 w-5" /> : paso.numero}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    pasoActual === paso.numero ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {paso.titulo}
                </span>
                {index < pasos.length - 1 && <div className="w-12 h-0.5 bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-full max-h-[calc(90vh-140px)]">
          {/* Contenido principal */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Paso 1: Preparación del Vehículo */}
            {pasoActual === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Preparación del Vehículo</h3>

                {/* Limpieza */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Limpieza</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(preparacion.limpieza).map(([tipo, completado]) => (
                      <label key={tipo} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={completado}
                          onChange={(e) =>
                            setPreparacion((prev) => ({
                              ...prev,
                              limpieza: { ...prev.limpieza, [tipo]: e.target.checked },
                            }))
                          }
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <span className="capitalize text-sm font-medium text-gray-700">{tipo}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Combustible */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Combustible</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nivel de combustible (%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={preparacion.combustible.nivel}
                        onChange={(e) =>
                          setPreparacion((prev) => ({
                            ...prev,
                            combustible: { ...prev.combustible, nivel: parseInt(e.target.value) },
                          }))
                        }
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Vacío</span>
                        <span className="font-medium">{preparacion.combustible.nivel}%</span>
                        <span>Lleno</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observaciones
                      </label>
                      <textarea
                        value={preparacion.combustible.observaciones}
                        onChange={(e) =>
                          setPreparacion((prev) => ({
                            ...prev,
                            combustible: { ...prev.combustible, observaciones: e.target.value },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md resize-none"
                        rows={2}
                        placeholder="Observaciones sobre el combustible..."
                      />
                    </div>
                  </div>
                </div>

                {/* Accesorios */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Accesorios y Elementos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de llaves
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={preparacion.accesorios.llaves}
                        onChange={(e) =>
                          setPreparacion((prev) => ({
                            ...prev,
                            accesorios: {
                              ...prev.accesorios,
                              llaves: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="space-y-3">
                      {["manuales", "herramientas", "repuestosUsados"].map((item) => (
                        <label key={item} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              preparacion.accesorios[
                                item as keyof typeof preparacion.accesorios
                              ] as boolean
                            }
                            onChange={(e) =>
                              setPreparacion((prev) => ({
                                ...prev,
                                accesorios: { ...prev.accesorios, [item]: e.target.checked },
                              }))
                            }
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {item === "manuales"
                              ? "Manuales del vehículo"
                              : item === "herramientas"
                              ? "Herramientas originales"
                              : "Repuestos usados entregados"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inspección final */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Inspección Final</h4>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preparacion.inspeccionFinal.completada}
                        onChange={(e) =>
                          setPreparacion((prev) => ({
                            ...prev,
                            inspeccionFinal: {
                              ...prev.inspeccionFinal,
                              completada: e.target.checked,
                            },
                          }))
                        }
                        className="h-4 w-4 text-green-600 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-green-700">Completada</span>
                    </label>
                  </div>

                  <textarea
                    value={preparacion.inspeccionFinal.observaciones}
                    onChange={(e) =>
                      setPreparacion((prev) => ({
                        ...prev,
                        inspeccionFinal: { ...prev.inspeccionFinal, observaciones: e.target.value },
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={3}
                    placeholder="Observaciones de la inspección final..."
                  />
                </div>
              </div>
            )}

            {/* Paso 2: Documentación */}
            {pasoActual === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Documentación de Entrega</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {documentos.map((documento) => (
                    <div key={documento.tipo} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900">{documento.nombre}</p>
                            <p className="text-sm text-gray-500">
                              {documento.generado ? "Generado" : "Pendiente"}
                            </p>
                          </div>
                        </div>

                        {documento.generado ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircleSolid className="h-6 w-6 text-green-500" />
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              <PrinterIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => generarDocumento(documento.tipo)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                          >
                            Generar
                          </button>
                        )}
                      </div>

                      {documento.generado && documento.url && (
                        <button className="w-full mt-2 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                          <DocumentArrowDownIcon className="h-4 w-4 inline mr-2" />
                          Descargar PDF
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {validarDocumentos() && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleSolid className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-green-800 font-medium">
                        Todos los documentos han sido generados correctamente
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paso 3: Entrega al Cliente */}
            {pasoActual === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Entrega al Cliente</h3>

                {/* Información del cliente */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Datos del Cliente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      <input
                        type="text"
                        value={datosEntrega.cliente.nombre}
                        onChange={(e) =>
                          setDatosEntrega((prev) => ({
                            ...prev,
                            cliente: { ...prev.cliente, nombre: e.target.value },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cédula</label>
                      <input
                        type="text"
                        value={datosEntrega.cliente.cedula}
                        onChange={(e) =>
                          setDatosEntrega((prev) => ({
                            ...prev,
                            cliente: { ...prev.cliente, cedula: e.target.value },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={datosEntrega.cliente.telefono}
                        onChange={(e) =>
                          setDatosEntrega((prev) => ({
                            ...prev,
                            cliente: { ...prev.cliente, telefono: e.target.value },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={datosEntrega.cliente.email}
                        onChange={(e) =>
                          setDatosEntrega((prev) => ({
                            ...prev,
                            cliente: { ...prev.cliente, email: e.target.value },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={datosEntrega.cliente.presente}
                        onChange={(e) =>
                          setDatosEntrega((prev) => ({
                            ...prev,
                            cliente: { ...prev.cliente, presente: e.target.checked },
                          }))
                        }
                        className="h-4 w-4 text-green-600 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Cliente presente para la entrega
                      </span>
                    </label>
                  </div>
                </div>

                {/* Información del vehículo */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Estado del Vehículo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={datosEntrega.vehiculo.ubicacion}
                        onChange={(e) =>
                          setDatosEntrega((prev) => ({
                            ...prev,
                            vehiculo: { ...prev.vehiculo, ubicacion: e.target.value },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Combustible (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={datosEntrega.vehiculo.combustible}
                        onChange={(e) =>
                          setDatosEntrega((prev) => ({
                            ...prev,
                            vehiculo: {
                              ...prev.vehiculo,
                              combustible: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kilometraje
                      </label>
                      <input
                        type="number"
                        value={datosEntrega.vehiculo.kilometraje}
                        onChange={(e) =>
                          setDatosEntrega((prev) => ({
                            ...prev,
                            vehiculo: {
                              ...prev.vehiculo,
                              kilometraje: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Pago */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Información de Pago</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Método de Pago
                      </label>
                      <select
                        value={datosEntrega.pago.metodoPago}
                        onChange={(e) =>
                          setDatosEntrega((prev) => ({
                            ...prev,
                            pago: { ...prev.pago, metodoPago: e.target.value as any },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="credito">Crédito</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto Total
                      </label>
                      <input
                        type="number"
                        value={datosEntrega.pago.monto}
                        onChange={(e) =>
                          setDatosEntrega((prev) => ({
                            ...prev,
                            pago: { ...prev.pago, monto: parseFloat(e.target.value) || 0 },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={datosEntrega.pago.pagado}
                        onChange={(e) =>
                          setDatosEntrega((prev) => ({
                            ...prev,
                            pago: { ...prev.pago, pagado: e.target.checked },
                          }))
                        }
                        className="h-4 w-4 text-green-600 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Pago confirmado</span>
                    </label>
                  </div>
                </div>

                {/* Satisfacción del cliente */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Satisfacción del Cliente</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calificación del servicio
                      </label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((estrella) => (
                          <button
                            key={estrella}
                            onClick={() =>
                              setDatosEntrega((prev) => ({
                                ...prev,
                                satisfaccion: { ...prev.satisfaccion, calificacion: estrella },
                              }))
                            }
                            className={`p-1 rounded transition-colors ${
                              estrella <= datosEntrega.satisfaccion.calificacion
                                ? "text-yellow-400"
                                : "text-gray-300 hover:text-yellow-300"
                            }`}
                          >
                            <StarIcon className="h-8 w-8 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comentarios adicionales
                      </label>
                      <textarea
                        value={datosEntrega.satisfaccion.comentarios}
                        onChange={(e) =>
                          setDatosEntrega((prev) => ({
                            ...prev,
                            satisfaccion: { ...prev.satisfaccion, comentarios: e.target.value },
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-md resize-none"
                        rows={3}
                        placeholder="Comentarios del cliente sobre el servicio..."
                      />
                    </div>
                  </div>
                </div>

                {/* Firma de conformidad */}
                {datosEntrega.cliente.presente && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Firma de Conformidad</h4>
                      {datosEntrega.cliente.firmaConformidad ? (
                        <CheckCircleSolid className="h-6 w-6 text-green-500" />
                      ) : (
                        <button
                          onClick={() => setMostrandoFirma(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Solicitar Firma
                        </button>
                      )}
                    </div>

                    {datosEntrega.cliente.firmaConformidad && (
                      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-sm text-gray-700 mb-2">Firma capturada:</p>
                        <img
                          src={datosEntrega.cliente.firmaConformidad}
                          alt="Firma del cliente"
                          className="max-w-xs border border-gray-300 rounded"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Panel de navegación */}
          <div className="w-80 border-l border-gray-200 p-6">
            <div className="space-y-6">
              {/* Resumen de progreso */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Progreso de Entrega</h4>
                <div className="space-y-3">
                  {pasos.map((paso) => (
                    <div key={paso.numero} className="flex items-center space-x-3">
                      {paso.completado ? (
                        <CheckCircleSolid className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                      <span
                        className={`text-sm ${
                          paso.completado ? "text-green-700 font-medium" : "text-gray-600"
                        }`}
                      >
                        {paso.titulo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información de la orden */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Información de la Orden</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orden:</span>
                    <span className="font-medium">{orden.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span>{new Date(orden.fechaIngreso).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Técnico:</span>
                    <span>Juan Pérez</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-green-600">
                      ${datosEntrega.pago.monto.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  {pasoActual > 1 && (
                    <button
                      onClick={() => setPasoActual(pasoActual - 1)}
                      className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                  )}

                  {pasoActual < 3 ? (
                    <button
                      onClick={() => setPasoActual(pasoActual + 1)}
                      disabled={!pasos[pasoActual - 1].completado}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                        pasos[pasoActual - 1].completado
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      onClick={handleFinalizarEntrega}
                      disabled={!validarEntrega()}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                        validarEntrega()
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Finalizar Entrega
                    </button>
                  )}
                </div>

                <button
                  onClick={onCancelar}
                  className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de firma */}
      {mostrandoFirma && (
        <FirmaModal
          onFirmar={(firma) => {
            setDatosEntrega((prev) => ({
              ...prev,
              cliente: { ...prev.cliente, firmaConformidad: firma },
            }));
            setMostrandoFirma(false);
          }}
          onCerrar={() => setMostrandoFirma(false)}
        />
      )}
    </div>
  );
};

// Componente Modal de Firma
interface FirmaModalProps {
  onFirmar: (firma: string) => void;
  onCerrar: () => void;
}

const FirmaModal: React.FC<FirmaModalProps> = ({ onFirmar, onCerrar }) => {
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
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">Firma de Conformidad</h3>
        <p className="text-sm text-gray-600 mb-4">
          Por favor, firme en el espacio a continuación para confirmar la conformidad con el
          servicio recibido.
        </p>

        <div className="border-2 border-gray-300 rounded-lg p-2 mb-4">
          <canvas
            ref={setCanvas}
            width={460}
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
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Confirmar Firma
          </button>
        </div>
      </div>
    </div>
  );
};
