"use client";

import {
  contarEvidencias360,
  Evidencia,
  generarNumeroOrden,
  LABELS_SUBTIPO,
  OrdenTrabajo,
  SubtipoEvidencia360,
  SUBTIPOS_360,
  SUBTIPOS_DETALLES,
  validarEvidencias360,
} from "@/types/ordenes";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CameraIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";

interface RecepcionWizardProps {
  orden?: OrdenTrabajo;
  onComplete: (orden: OrdenTrabajo) => void;
  onCancel: () => void;
}

interface CapturaState {
  subtipo: SubtipoEvidencia360;
  completada: boolean;
  url?: string;
  observaciones?: string;
  tieneDano: boolean;
}

interface DatosIngreso {
  vin: string;
  km: number;
  combustible: number;
  observacionesGenerales: string;
}

export default function RecepcionWizard({ orden, onComplete, onCancel }: RecepcionWizardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActiva, setCameraActiva] = useState(false);
  const [paso, setPaso] = useState(1); // 1: Fotos 360, 2: Detalles, 3: Datos, 4: Firma
  const [capturaActual, setCapturaActual] = useState<SubtipoEvidencia360>("360_FRONTAL");
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [ultimaCaptura, setUltimaCaptura] = useState<string | null>(null);

  // Estados de captura
  const [capturas360, setCapturas360] = useState<Record<SubtipoEvidencia360, CapturaState>>(() => {
    const inicial: Record<SubtipoEvidencia360, CapturaState> = {} as any;
    [...SUBTIPOS_360, ...SUBTIPOS_DETALLES].forEach((subtipo) => {
      inicial[subtipo] = {
        subtipo,
        completada: false,
        tieneDano: false,
      };
    });
    return inicial;
  });

  const [datosIngreso, setDatosIngreso] = useState<DatosIngreso>({
    vin: orden?.vin || "",
    km: orden?.km || 0,
    combustible: orden?.combustible || 0,
    observacionesGenerales: "",
  });

  const [firmaRecepcion, setFirmaRecepcion] = useState<string>("");
  const [mostrarFirma, setMostrarFirma] = useState(false);

  // Inicializar cámara
  const iniciarCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Cámara trasera en móviles
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setCameraActiva(true);
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      // TODO: Mostrar toast de error
    }
  }, []);

  // Detener cámara
  const detenerCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActiva(false);
  }, [stream]);

  // Capturar foto
  const capturarFoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Configurar canvas con dimensiones del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Capturar frame actual
    context.drawImage(video, 0, 0);

    // Convertir a WebP con compresión
    const dataUrl = canvas.toDataURL("image/webp", 0.8);

    // Actualizar estado de captura
    setCapturas360((prev) => ({
      ...prev,
      [capturaActual]: {
        ...prev[capturaActual],
        completada: true,
        url: dataUrl,
      },
    }));

    setUltimaCaptura(dataUrl);
    setMostrarVistaPrevia(true);

    // Auto-avanzar al siguiente subtipo si estamos en fotos 360
    if (paso === 1) {
      const indiceActual = SUBTIPOS_360.indexOf(capturaActual as any);
      if (indiceActual < SUBTIPOS_360.length - 1) {
        setCapturaActual(SUBTIPOS_360[indiceActual + 1]);
      }
    } else if (paso === 2) {
      const indiceActual = SUBTIPOS_DETALLES.indexOf(capturaActual as any);
      if (indiceActual < SUBTIPOS_DETALLES.length - 1) {
        setCapturaActual(SUBTIPOS_DETALLES[indiceActual + 1]);
      }
    }

    // Cerrar vista previa automáticamente después de 2 segundos
    setTimeout(() => {
      setMostrarVistaPrevia(false);
    }, 2000);
  }, [capturaActual, paso]);

  // Calcular progreso
  const progresoFotos360 = contarEvidencias360(
    Object.values(capturas360)
      .filter((c) => SUBTIPOS_360.includes(c.subtipo) && c.completada)
      .map((c) => ({ sub_tipo: c.subtipo } as Evidencia))
  );

  const progresoDetalles = SUBTIPOS_DETALLES.filter(
    (subtipo) => capturas360[subtipo]?.completada
  ).length;

  const puedeAvanzarAPaso2 = progresoFotos360 === 12;
  const puedeAvanzarAPaso3 = progresoDetalles === 4;
  const puedeAvanzarAPaso4 = datosIngreso.vin && datosIngreso.km > 0;
  const puedeCompletar = firmaRecepcion.length > 0;

  // Handlers de navegación
  const irAPaso = (numeroPaso: number) => {
    if (numeroPaso === 2 && !puedeAvanzarAPaso2) return;
    if (numeroPaso === 3 && !puedeAvanzarAPaso3) return;
    if (numeroPaso === 4 && !puedeAvanzarAPaso4) return;

    setPaso(numeroPaso);

    // Configurar captura inicial del paso
    if (numeroPaso === 1) {
      setCapturaActual("360_FRONTAL");
    } else if (numeroPaso === 2) {
      setCapturaActual("VIN");
    }
  };

  const completarRecepcion = async () => {
    if (!puedeCompletar) return;

    // Crear evidencias a partir de las capturas
    const evidencias: Evidencia[] = Object.values(capturas360)
      .filter((c) => c.completada && c.url)
      .map((c) => ({
        id: `evidencia_${c.subtipo}_${Date.now()}`,
        ordenId: orden?.id || "",
        url: c.url!,
        tipo: "FOTO",
        sub_tipo: c.subtipo,
        autorId: "tecnico_actual", // TODO: Obtener del contexto
        creadoEn: new Date().toISOString(),
        descripcion: c.observaciones,
      }));

    // Crear orden actualizada
    const ordenActualizada: OrdenTrabajo = {
      ...orden,
      id: orden?.id || `orden_${Date.now()}`,
      numero: orden?.numero || generarNumeroOrden(),
      estado: "INGRESO",
      vin: datosIngreso.vin,
      km: datosIngreso.km,
      combustible: datosIngreso.combustible,
      evidencias,
      firmaRecepcion,
      checklists: {
        ...orden?.checklists,
        INGRESO: {
          fotos360Completo: validarEvidencias360(evidencias),
          vinOk: !!datosIngreso.vin,
          odometroOk: datosIngreso.km > 0,
          combustibleOk: datosIngreso.combustible >= 0,
        },
      },
      updatedAt: new Date().toISOString(),
    };

    onComplete(ordenActualizada);
  };

  // Efectos
  useEffect(() => {
    iniciarCamera();
    return () => detenerCamera();
  }, [iniciarCamera, detenerCamera]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <button onClick={onCancel} className="p-2 hover:bg-gray-800 rounded-lg">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-lg font-semibold">Recepción 360°</h1>
          <div className="text-sm text-gray-300 mt-1">
            {paso === 1 && `Fotos 360° (${progresoFotos360}/12)`}
            {paso === 2 && `Detalles (${progresoDetalles}/4)`}
            {paso === 3 && "Datos del vehículo"}
            {paso === 4 && "Firma de recepción"}
          </div>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Indicador de progreso */}
      <div className="bg-gray-800 px-4 py-2">
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`flex-1 h-2 rounded-full ${
                num <= paso
                  ? "bg-blue-500"
                  : num === 2 && !puedeAvanzarAPaso2
                  ? "bg-gray-600"
                  : num === 3 && !puedeAvanzarAPaso3
                  ? "bg-gray-600"
                  : num === 4 && !puedeAvanzarAPaso4
                  ? "bg-gray-600"
                  : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 relative">
        {/* Video de cámara */}
        {cameraActiva && (paso === 1 || paso === 2) && (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        )}

        {/* Canvas oculto para capturas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay de guía según el paso */}
        {paso === 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-50 text-white p-4 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-2">{LABELS_SUBTIPO[capturaActual]}</h3>
              <p className="text-sm text-gray-300">
                Posiciona el vehículo según la guía y captura la foto
              </p>
              <div className="mt-2 text-xs text-blue-300">
                {progresoFotos360}/12 fotos completadas
              </div>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-50 text-white p-4 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-2">{LABELS_SUBTIPO[capturaActual]}</h3>
              <p className="text-sm text-gray-300">
                {capturaActual === "VIN" && "Captura el número VIN del vehículo"}
                {capturaActual === "ODOMETRO" && "Captura la lectura del odómetro"}
                {capturaActual === "COMBUSTIBLE" && "Captura el nivel de combustible"}
                {capturaActual === "DANIO" && "Captura cualquier daño visible"}
              </p>
            </div>
          </div>
        )}

        {/* Formulario de datos (Paso 3) */}
        {paso === 3 && (
          <div className="absolute inset-0 bg-secondary-900 p-6 overflow-y-auto">
            <div className="max-w-md mx-auto space-y-6">
              <h2 className="text-xl font-semibold text-white">Datos del Vehículo</h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Número VIN *</label>
                <input
                  type="text"
                  value={datosIngreso.vin}
                  onChange={(e) => setDatosIngreso((prev) => ({ ...prev, vin: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingresa el VIN del vehículo"
                  style={{ fontSize: "16px" }} // Evitar zoom en iOS
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kilometraje *
                </label>
                <input
                  type="number"
                  value={datosIngreso.km}
                  onChange={(e) =>
                    setDatosIngreso((prev) => ({ ...prev, km: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  style={{ fontSize: "16px" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Combustible (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={datosIngreso.combustible}
                  onChange={(e) =>
                    setDatosIngreso((prev) => ({
                      ...prev,
                      combustible: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  style={{ fontSize: "16px" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Generales
                </label>
                <textarea
                  value={datosIngreso.observacionesGenerales}
                  onChange={(e) =>
                    setDatosIngreso((prev) => ({ ...prev, observacionesGenerales: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Observaciones adicionales sobre el estado del vehículo..."
                  style={{ fontSize: "16px" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Panel de firma (Paso 4) */}
        {paso === 4 && (
          <div className="absolute inset-0 bg-secondary-900 p-6">
            <div className="max-w-md mx-auto text-center space-y-6">
              <h2 className="text-xl font-semibold text-white">Firma de Recepción</h2>

              <div className="bg-secondary-700 border-2 border-dashed border-secondary-600 rounded-lg p-8">
                <PencilIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-300 mb-4">
                  El cliente debe firmar para confirmar la recepción del vehículo
                </p>
                <button
                  onClick={() => setMostrarFirma(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Capturar Firma
                </button>
              </div>

              {firmaRecepcion && (
                <div className="mt-4">
                  <img src={firmaRecepcion} alt="Firma" className="border rounded-lg mx-auto" />
                  <button
                    onClick={() => setFirmaRecepcion("")}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Borrar firma
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controles inferiores */}
      <div className="bg-gray-900 p-4">
        {(paso === 1 || paso === 2) && (
          <div className="flex items-center justify-between">
            {/* Selector de subtipo */}
            <div className="flex space-x-2 overflow-x-auto">
              {(paso === 1 ? SUBTIPOS_360 : SUBTIPOS_DETALLES).map((subtipo) => (
                <button
                  key={subtipo}
                  onClick={() => setCapturaActual(subtipo)}
                  className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center space-x-1 ${
                    capturaActual === subtipo
                      ? "bg-blue-600 text-white"
                      : capturas360[subtipo]?.completada
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {capturas360[subtipo]?.completada && <CheckCircleIcon className="h-4 w-4" />}
                  <span>{LABELS_SUBTIPO[subtipo]}</span>
                </button>
              ))}
            </div>

            {/* Botón de captura */}
            {cameraActiva && (
              <button
                onClick={capturarFoto}
                className="ml-4 w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center"
              >
                <CameraIcon className="h-8 w-8 text-white" />
              </button>
            )}
          </div>
        )}

        {/* Navegación entre pasos */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => paso > 1 && irAPaso(paso - 1)}
            disabled={paso === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Anterior</span>
          </button>

          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => irAPaso(num)}
                disabled={
                  (num === 2 && !puedeAvanzarAPaso2) ||
                  (num === 3 && !puedeAvanzarAPaso3) ||
                  (num === 4 && !puedeAvanzarAPaso4)
                }
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  num === paso
                    ? "bg-blue-600 text-white"
                    : num < paso
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-400"
                } disabled:opacity-50`}
              >
                {num}
              </button>
            ))}
          </div>

          {paso < 4 ? (
            <button
              onClick={() => irAPaso(paso + 1)}
              disabled={
                (paso === 1 && !puedeAvanzarAPaso2) ||
                (paso === 2 && !puedeAvanzarAPaso3) ||
                (paso === 3 && !puedeAvanzarAPaso4)
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Siguiente</span>
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={completarRecepcion}
              disabled={!puedeCompletar}
              className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <DocumentCheckIcon className="h-5 w-5" />
              <span>Completar</span>
            </button>
          )}
        </div>
      </div>

      {/* Vista previa de la última captura */}
      {mostrarVistaPrevia && ultimaCaptura && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-secondary-800 rounded-lg p-4 max-w-sm">
            <img src={ultimaCaptura} alt="Captura" className="w-full rounded-lg mb-4" />
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="font-medium">Foto capturada</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
