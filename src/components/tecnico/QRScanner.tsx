"use client";

import {
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);

        // Simular detección de QR (en producción usarías una librería como jsQR)
        setTimeout(() => {
          simulateQRDetection();
        }, 2000);
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      setError("No se pudo acceder a la cámara. Verifique los permisos.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  // Simulación de detección QR (reemplazar con librería real)
  const simulateQRDetection = () => {
    // Simular códigos QR de ejemplo
    const codigosEjemplo = [
      "TLR-20241003-1430-ABC",
      "TLR-20241003-1445-DEF",
      "TLR-20241003-1500-GHI",
    ];

    // Seleccionar código aleatorio
    const codigoSimulado = codigosEjemplo[Math.floor(Math.random() * codigosEjemplo.length)];

    setTimeout(() => {
      onScan(codigoSimulado);
      stopCamera();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-lg mx-4">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCodeIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Escanear Código QR</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Scanner Area */}
          <div className="relative">
            {error ? (
              <div className="p-8 text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-2">Error de Cámara</p>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />

                {/* Overlay de escaneo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Marco de escaneo */}
                    <div className="w-48 h-48 border-4 border-blue-500 rounded-lg relative">
                      {/* Esquinas animadas */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />

                      {/* Línea de escaneo animada */}
                      {scanning && (
                        <div
                          className="absolute inset-x-0 top-0 h-1 bg-blue-400 animate-pulse"
                          style={{
                            animation: "scan 2s linear infinite",
                            background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CameraIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                {scanning ? "Buscando código QR..." : "Cámara desactivada"}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Apunte la cámara hacia el código QR del check-in
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          50% {
            top: 90%;
          }
          100% {
            top: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Componente de resultado de escaneo
interface QRResultProps {
  codigo: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const QRResult: React.FC<QRResultProps> = ({ codigo, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Código QR Detectado!</h3>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Código de seguimiento:</p>
            <p className="font-mono text-lg font-bold text-blue-600">{codigo}</p>
          </div>

          <p className="text-gray-600 text-sm mb-6">¿Desea buscar este check-in?</p>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar Check-in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
