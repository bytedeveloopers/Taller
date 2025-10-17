"use client";

import { ArrowPathIcon, CameraIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";

interface CameraComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
  title?: string;
}

export default function CameraComponent({
  isOpen,
  onClose,
  onCapture,
  title = "Tomar Foto",
}: CameraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);
    setIsCapturing(true);
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setIsCapturing(false);
    onClose();
  }, [stopCamera, onClose]);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  }, [capturedImage, onCapture, handleClose]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setIsCapturing(false);
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    stopCamera();
  }, [stopCamera]);

  // Start camera when component opens
  useEffect(() => {
    if (isOpen && !stream) {
      startCamera();
    }
  }, [isOpen, stream, startCamera]);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isOpen && stream) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [facingMode, isOpen, stream, stopCamera, startCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center text-white p-6">
              <CameraIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">Error de Cámara</p>
              <p className="text-sm text-gray-400 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : isCapturing && capturedImage ? (
          // Captured image preview
          <div className="w-full h-full flex items-center justify-center bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedImage}
              alt="Foto capturada"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          // Live camera feed
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}

        {/* Overlay for camera guidelines */}
        {!isCapturing && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-white/30 rounded-lg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/50 p-4">
        {isCapturing ? (
          // Capture confirmation controls
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={retakePhoto}
              className="flex flex-col items-center space-y-2 text-white hover:text-gray-300 transition-colors"
            >
              <div className="w-16 h-16 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <ArrowPathIcon className="h-8 w-8" />
              </div>
              <span className="text-sm">Repetir</span>
            </button>

            <button
              onClick={confirmCapture}
              className="flex flex-col items-center space-y-2 text-white hover:text-green-400 transition-colors"
            >
              <div className="w-20 h-20 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors">
                <CheckIcon className="h-10 w-10" />
              </div>
              <span className="text-sm font-medium">Usar Foto</span>
            </button>
          </div>
        ) : (
          // Camera controls
          <div className="flex items-center justify-between">
            <button
              onClick={switchCamera}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              title="Cambiar cámara"
            >
              <ArrowPathIcon className="h-6 w-6" />
            </button>
            <button
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg"
              disabled={!stream}
            >
              <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center">
                <CameraIcon className="h-8 w-8 text-gray-700" />
              </div>
            </button>
            <div className="w-12"></div> {/* Spacer for centering */}
          </div>
        )}
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
