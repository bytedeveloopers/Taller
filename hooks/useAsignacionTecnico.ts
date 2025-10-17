"use client";

import { useCallback, useState } from "react";

interface VehicleInfo {
  id: string;
  cliente: string;
  vehiculo: string;
  placa: string;
  codigoSeguimiento: string;
  tecnicoActual?: string | null;
}

interface UseAsignacionTecnicoReturn {
  // Estado del modal
  isModalOpen: boolean;
  currentVehicle: VehicleInfo | null;

  // Funciones para controlar el modal
  openModal: (vehicleInfo: VehicleInfo) => void;
  closeModal: () => void;

  // Función para manejar el éxito de la asignación
  handleAsignacionSuccess: (data: any) => void;

  // Estado de carga
  isProcessing: boolean;
}

export default function useAsignacionTecnico(
  onSuccess?: (vehicleId: string, assignmentData: any) => void
): UseAsignacionTecnicoReturn {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<VehicleInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const openModal = useCallback((vehicleInfo: VehicleInfo) => {
    setCurrentVehicle(vehicleInfo);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentVehicle(null);
    setIsProcessing(false);
  }, []);

  const handleAsignacionSuccess = useCallback(
    (data: any) => {
      setIsProcessing(true);

      // Llamar al callback de éxito si se proporciona
      if (onSuccess && currentVehicle) {
        onSuccess(currentVehicle.id, data);
      }

      // Simular un pequeño delay para mostrar el estado de procesamiento
      setTimeout(() => {
        setIsProcessing(false);
        closeModal();
      }, 500);
    },
    [onSuccess, currentVehicle, closeModal]
  );

  return {
    isModalOpen,
    currentVehicle,
    openModal,
    closeModal,
    handleAsignacionSuccess,
    isProcessing,
  };
}
