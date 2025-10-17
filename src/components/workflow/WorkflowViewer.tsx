"use client";

import { useToast } from "@/components/ui/ToastNotification";
import {
  BeakerIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  HandRaisedIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

// Definición del flujo de trabajo
const WORKFLOW_STEPS = [
  {
    id: "RECEPCION",
    name: "Recepción",
    description: "Vehículo recibido en el taller",
    icon: TruckIcon,
    color: "blue",
  },
  {
    id: "INGRESO",
    name: "Ingreso",
    description: "Vehículo registrado en el sistema",
    icon: DocumentTextIcon,
    color: "indigo",
  },
  {
    id: "DIAGNOSTICO",
    name: "Diagnóstico",
    description: "Evaluación técnica del vehículo",
    icon: WrenchScrewdriverIcon,
    color: "yellow",
  },
  {
    id: "COTIZACION_APROBACION",
    name: "Cotización y Aprobación",
    description: "Presupuesto enviado y aprobado",
    icon: DocumentTextIcon,
    color: "orange",
  },
  {
    id: "PROCESO_DESARME",
    name: "Proceso de Desarme",
    description: "Desmontaje de piezas necesarias",
    icon: CogIcon,
    color: "red",
  },
  {
    id: "ESPERA",
    name: "Espera (Pausa SLA)",
    description: "Esperando repuestos o aprobaciones",
    icon: ClockIcon,
    color: "gray",
  },
  {
    id: "PROCESO_ARMADO",
    name: "Proceso de Armado",
    description: "Montaje y reparación",
    icon: WrenchScrewdriverIcon,
    color: "purple",
  },
  {
    id: "PRUEBA_CALIDAD",
    name: "Prueba de Calidad",
    description: "Verificación final del trabajo",
    icon: BeakerIcon,
    color: "green",
  },
  {
    id: "ENTREGA",
    name: "Entrega",
    description: "Vehículo listo para entregar",
    icon: HandRaisedIcon,
    color: "emerald",
  },
] as const;

interface WorkflowData {
  vehicleId: string;
  currentStatus: string;
  nextStatus: string | null;
  workflowSequence: string[];
  history: Array<{
    id: string;
    status: string;
    timestamp: string;
    notes?: string;
    technician?: {
      id: string;
      name: string;
    };
  }>;
}

interface Props {
  vehicleId: string;
  technicianId: string;
  isReadOnly?: boolean;
  onStatusUpdate?: () => void;
}

export default function WorkflowViewer({
  vehicleId,
  technicianId,
  isReadOnly = false,
  onStatusUpdate,
}: Props) {
  const { showSuccess, showError } = useToast();
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Cargar datos del workflow
  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflow?vehicleId=${vehicleId}`);
      const result = await response.json();

      if (result.success) {
        setWorkflowData(result.data);
      } else {
        showError("Error", result.error || "No se pudo cargar el workflow");
      }
    } catch (error) {
      console.error("Error cargando workflow:", error);
      showError("Error", "Error de conexión al cargar el workflow");
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado del workflow
  const updateWorkflowStatus = async (newStatus: string, notes?: string) => {
    try {
      setUpdating(true);

      const response = await fetch("/api/workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId,
          newStatus,
          technicianId,
          notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess("Estado Actualizado", `El vehículo ha avanzado a: ${getStepName(newStatus)}`);
        await loadWorkflowData(); // Recargar datos
        onStatusUpdate?.(); // Notificar al componente padre
      } else {
        showError("Error", result.error || "No se pudo actualizar el estado");
      }
    } catch (error) {
      console.error("Error actualizando workflow:", error);
      showError("Error", "Error de conexión al actualizar el estado");
    } finally {
      setUpdating(false);
    }
  };

  // Obtener información del paso
  const getStepInfo = (statusId: string) => {
    return WORKFLOW_STEPS.find((step) => step.id === statusId) || WORKFLOW_STEPS[0];
  };

  const getStepName = (statusId: string) => {
    return getStepInfo(statusId).name;
  };

  // Determinar estado visual del paso
  const getStepState = (stepId: string) => {
    if (!workflowData) return "pending";

    const currentIndex = WORKFLOW_STEPS.findIndex((step) => step.id === workflowData.currentStatus);
    const stepIndex = WORKFLOW_STEPS.findIndex((step) => step.id === stepId);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  // Efectos
  useEffect(() => {
    loadWorkflowData();
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando flujo de trabajo...</span>
      </div>
    );
  }

  if (!workflowData) {
    return (
      <div className="text-center p-8 text-gray-500">
        No se pudo cargar la información del flujo de trabajo
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Flujo de Trabajo</h3>
        <p className="text-sm text-gray-600">
          Estado actual:{" "}
          <span className="font-medium text-blue-600">
            {getStepName(workflowData.currentStatus)}
          </span>
        </p>
      </div>

      {/* Flujo visual */}
      <div className="space-y-4">
        {WORKFLOW_STEPS.map((step, index) => {
          const stepState = getStepState(step.id);
          const Icon = step.icon;
          const isNext = step.id === workflowData.nextStatus;

          return (
            <div key={step.id} className="relative">
              {/* Línea conectora */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-8 ${
                    stepState === "completed" ? "bg-green-400" : "bg-gray-300"
                  }`}
                />
              )}

              {/* Paso */}
              <div
                className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all ${
                  stepState === "current"
                    ? "border-blue-500 bg-blue-50"
                    : stepState === "completed"
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {/* Icono */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    stepState === "current"
                      ? "bg-blue-500 text-white"
                      : stepState === "completed"
                      ? "bg-green-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {stepState === "completed" ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`font-medium ${
                          stepState === "current" ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {step.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>

                    {/* Botón de acción para técnicos */}
                    {!isReadOnly && isNext && stepState === "pending" && (
                      <button
                        onClick={() => updateWorkflowStatus(step.id)}
                        disabled={updating}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updating ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Actualizando...
                          </div>
                        ) : (
                          `Avanzar a ${step.name}`
                        )}
                      </button>
                    )}
                  </div>

                  {/* Información de historial para este paso */}
                  {workflowData.history
                    .filter((record) => record.status === step.id)
                    .map((record) => (
                      <div key={record.id} className="mt-2 text-xs text-gray-500">
                        <p>
                          {new Date(record.timestamp).toLocaleString()} • {record.technician?.name}
                        </p>
                        {record.notes && <p className="mt-1 text-gray-600">{record.notes}</p>}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Información del Flujo</h4>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">Pasos completados:</span> {workflowData.history.length} de{" "}
            {WORKFLOW_STEPS.length}
          </div>
          <div>
            <span className="font-medium">Próximo paso:</span>{" "}
            {workflowData.nextStatus ? getStepName(workflowData.nextStatus) : "Completado"}
          </div>
        </div>
      </div>
    </div>
  );
}
