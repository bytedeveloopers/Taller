"use client";

import { Evidencia } from "@/types/tecnico";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useRef, useState } from "react";

interface EvidenciaFile extends File {
  id: string;
  preview?: string;
  tipo: "ANTES" | "DESPUES" | "GENERAL";
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
  compressed?: boolean;
}

interface UploaderEvidenciasProps {
  ordenId: string;
  evidenciasExistentes: Evidencia[];
  tipoRequerido?: "ANTES" | "DESPUES" | "GENERAL";
  onUploadComplete: (evidencias: Evidencia[]) => void;
  onClose: () => void;
  maxFiles?: number;
  maxFileSize?: number; // MB
}

const CALIDAD_COMPRESION = 0.7;
const MAX_DIMENSION = 1920;

export default function UploaderEvidencias({
  ordenId,
  evidenciasExistentes,
  tipoRequerido,
  onUploadComplete,
  onClose,
  maxFiles = 10,
  maxFileSize = 10,
}: UploaderEvidenciasProps) {
  const [archivos, setArchivos] = useState<EvidenciaFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<"ANTES" | "DESPUES" | "GENERAL">(
    tipoRequerido || "GENERAL"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Comprimir imagen
  const comprimirImagen = useCallback((file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones
        let { width, height } = img;
        if (width > height && width > MAX_DIMENSION) {
          height = (height * MAX_DIMENSION) / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = (width * MAX_DIMENSION) / height;
          height = MAX_DIMENSION;
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          CALIDAD_COMPRESION
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Procesar archivos seleccionados
  const procesarArchivos = useCallback(
    async (files: FileList) => {
      const nuevosArchivos: EvidenciaFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validaciones
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          console.warn(`Archivo ${file.name} no es imagen ni video`);
          continue;
        }

        if (file.size > maxFileSize * 1024 * 1024) {
          console.warn(`Archivo ${file.name} excede el tamaño máximo`);
          continue;
        }

        if (archivos.length + nuevosArchivos.length >= maxFiles) {
          console.warn("Límite máximo de archivos alcanzado");
          break;
        }

        // Comprimir si es imagen
        let procesedFile = file;
        let compressed = false;

        if (file.type.startsWith("image/")) {
          try {
            procesedFile = await comprimirImagen(file);
            compressed = true;
          } catch (error) {
            console.error("Error comprimiendo imagen:", error);
          }
        }

        // Crear preview
        const preview = URL.createObjectURL(procesedFile);

        const evidenciaFile: EvidenciaFile = Object.assign(procesedFile, {
          id: `${Date.now()}-${i}`,
          preview,
          tipo: tipoSeleccionado,
          compressed,
        });

        nuevosArchivos.push(evidenciaFile);
      }

      setArchivos((prev) => [...prev, ...nuevosArchivos]);
    },
    [archivos.length, maxFiles, maxFileSize, tipoSeleccionado, comprimirImagen]
  );

  // Handlers de drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files) {
        procesarArchivos(e.dataTransfer.files);
      }
    },
    [procesarArchivos]
  );

  // Selección de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      procesarArchivos(e.target.files);
    }
  };

  // Remover archivo
  const removerArchivo = (id: string) => {
    setArchivos((prev) => {
      const archivo = prev.find((a) => a.id === id);
      if (archivo?.preview) {
        URL.revokeObjectURL(archivo.preview);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  // Cambiar tipo de evidencia
  const cambiarTipo = (id: string, nuevoTipo: "ANTES" | "DESPUES" | "GENERAL") => {
    setArchivos((prev) =>
      prev.map((archivo) => (archivo.id === id ? { ...archivo, tipo: nuevoTipo } : archivo))
    );
  };

  // Subir archivos
  const subirArchivos = async () => {
    if (archivos.length === 0) return;

    setUploading(true);
    const evidenciasSubidas: Evidencia[] = [];

    try {
      for (const archivo of archivos) {
        const formData = new FormData();
        formData.append("file", archivo);
        formData.append("ordenId", ordenId);
        formData.append("tipo", archivo.tipo);

        // Actualizar estado del archivo
        setArchivos((prev) =>
          prev.map((a) => (a.id === archivo.id ? { ...a, uploading: true, error: undefined } : a))
        );

        try {
          // TODO: Implementar llamada real a API
          const response = await fetch(`/api/ordenes/${ordenId}/evidencias`, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const evidencia = await response.json();
            evidenciasSubidas.push(evidencia);

            // Marcar como subido
            setArchivos((prev) =>
              prev.map((a) =>
                a.id === archivo.id ? { ...a, uploading: false, uploaded: true } : a
              )
            );
          } else {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.error(`Error subiendo ${archivo.name}:`, error);

          // Marcar error
          setArchivos((prev) =>
            prev.map((a) =>
              a.id === archivo.id
                ? {
                    ...a,
                    uploading: false,
                    error: error instanceof Error ? error.message : "Error desconocido",
                  }
                : a
            )
          );
        }
      }

      // Notificar evidencias subidas exitosamente
      if (evidenciasSubidas.length > 0) {
        onUploadComplete(evidenciasSubidas);
      }
    } finally {
      setUploading(false);
    }
  };

  // Reintentar subida
  const reintentarSubida = (id: string) => {
    setArchivos((prev) =>
      prev.map((archivo) =>
        archivo.id === id ? { ...archivo, error: undefined, uploaded: false } : archivo
      )
    );
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "ANTES":
        return "bg-blue-500 text-white";
      case "DESPUES":
        return "bg-green-500 text-white";
      case "GENERAL":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const archivosConError = archivos.filter((a) => a.error).length;
  const archivosSubidos = archivos.filter((a) => a.uploaded).length;
  const archivosPendientes = archivos.filter((a) => !a.uploaded && !a.error).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Subir Evidencias - OT {ordenId}</h2>
            <p className="text-gray-400 text-sm mt-1">
              {evidenciasExistentes.length} evidencias existentes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Selector de tipo (si no está predefinido) */}
          {!tipoRequerido && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tipo de evidencia
              </label>
              <div className="flex space-x-3">
                {["ANTES", "DESPUES", "GENERAL"].map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setTipoSeleccionado(tipo as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      tipoSeleccionado === tipo
                        ? getTipoColor(tipo)
                        : "bg-secondary-700 text-gray-300 hover:bg-secondary-600"
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-blue-500 bg-blue-500/10"
                : "border-secondary-600 hover:border-secondary-500"
            }`}
          >
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">
              Arrastra archivos aquí o selecciona manualmente
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Soporta imágenes y videos. Máximo {maxFiles} archivos, {maxFileSize}MB cada uno.
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <PhotoIcon className="h-5 w-5 mr-2" />
                Seleccionar archivos
              </button>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <VideoCameraIcon className="h-5 w-5 mr-2" />
                Tomar foto
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Lista de archivos */}
          {archivos.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Archivos seleccionados ({archivos.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {archivos.map((archivo) => (
                  <div
                    key={archivo.id}
                    className="bg-secondary-700 rounded-lg p-4 border border-secondary-600"
                  >
                    {/* Preview */}
                    <div className="aspect-video bg-secondary-800 rounded mb-3 overflow-hidden">
                      {archivo.type.startsWith("image/") ? (
                        <img
                          src={archivo.preview}
                          alt={archivo.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={archivo.preview}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </div>

                    {/* Info del archivo */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-white text-sm font-medium truncate">{archivo.name}</p>
                        <button
                          onClick={() => removerArchivo(archivo.id)}
                          className="p-1 hover:bg-secondary-600 rounded transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          {(archivo.size / 1024 / 1024).toFixed(1)} MB
                          {archivo.compressed && " (comprimido)"}
                        </span>

                        {/* Selector de tipo */}
                        <select
                          value={archivo.tipo}
                          onChange={(e) => cambiarTipo(archivo.id, e.target.value as any)}
                          className="bg-secondary-600 text-white text-xs rounded px-2 py-1 border border-secondary-500"
                          disabled={archivo.uploading || archivo.uploaded}
                        >
                          <option value="ANTES">Antes</option>
                          <option value="DESPUES">Después</option>
                          <option value="GENERAL">General</option>
                        </select>
                      </div>

                      {/* Estado */}
                      <div className="flex items-center space-x-2">
                        {archivo.uploading && (
                          <>
                            <ArrowPathIcon className="h-4 w-4 text-blue-400 animate-spin" />
                            <span className="text-blue-400 text-xs">Subiendo...</span>
                          </>
                        )}

                        {archivo.uploaded && (
                          <>
                            <CheckCircleIcon className="h-4 w-4 text-green-400" />
                            <span className="text-green-400 text-xs">Subido</span>
                          </>
                        )}

                        {archivo.error && (
                          <>
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
                            <span className="text-red-400 text-xs">Error</span>
                            <button
                              onClick={() => reintentarSubida(archivo.id)}
                              className="text-xs text-blue-400 hover:text-blue-300 underline"
                            >
                              Reintentar
                            </button>
                          </>
                        )}
                      </div>

                      {archivo.error && (
                        <p className="text-red-400 text-xs bg-red-900/20 p-2 rounded">
                          {archivo.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-secondary-700 p-6">
          {archivos.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-400">
                {archivosSubidos > 0 && (
                  <span className="text-green-400 mr-4">✓ {archivosSubidos} subidos</span>
                )}
                {archivosPendientes > 0 && (
                  <span className="text-blue-400 mr-4">• {archivosPendientes} pendientes</span>
                )}
                {archivosConError > 0 && (
                  <span className="text-red-400">⚠ {archivosConError} con errores</span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-secondary-700 hover:bg-secondary-600 text-gray-300 rounded-lg transition-colors"
            >
              Cancelar
            </button>

            {archivos.length > 0 && (
              <button
                onClick={subirArchivos}
                disabled={uploading || archivos.every((a) => a.uploaded)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {uploading ? "Subiendo..." : "Subir evidencias"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
