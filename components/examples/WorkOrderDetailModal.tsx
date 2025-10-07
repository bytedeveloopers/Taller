"use client";

import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { useAudit } from "@/hooks/useAudit";
import {
  ClipboardDocumentListIcon,
  CogIcon,
  InformationCircleIcon,
  PhotoIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface Props {
  workOrderId: string;
  workOrderData?: {
    id: string;
    number: string;
    status: string;
    client: string;
    vehicle: string;
    technician?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

const WorkOrderDetailModal = ({ workOrderId, workOrderData }: Props) => {
  const [activeTab, setActiveTab] = useState("general");
  const audit = useAudit();

  // Mock data para la OT
  const mockWorkOrder = workOrderData || {
    id: workOrderId,
    number: "OT-2024-125",
    status: "Diagnóstico",
    client: "Juan Pérez",
    vehicle: "Honda Civic 2018",
    technician: "Carlos López",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 días atrás
    updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
  };

  const tabs = [
    {
      id: "general",
      name: "General",
      icon: InformationCircleIcon,
    },
    {
      id: "diagnostico",
      name: "Diagnóstico",
      icon: ClipboardDocumentListIcon,
    },
    {
      id: "trabajo",
      name: "Trabajo",
      icon: CogIcon,
    },
    {
      id: "evidencias",
      name: "Evidencias",
      icon: PhotoIcon,
    },
    {
      id: "auditoria",
      name: "Auditoría",
      icon: ShieldCheckIcon,
    },
  ];

  const handleStatusChange = async (newStatus: string) => {
    await audit.logWorkOrderStatusChange(mockWorkOrder.id, mockWorkOrder.status, newStatus);
    console.log(`Estado cambiado de ${mockWorkOrder.status} a ${newStatus}`);
  };

  const handleTechnicianAssignment = async (newTechnician: string) => {
    await audit.logTechnicianAssignment(mockWorkOrder.id, newTechnician, mockWorkOrder.technician);
    console.log(`Técnico asignado: ${newTechnician}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Número de OT</label>
                <p className="text-white font-semibold">{mockWorkOrder.number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-yellow-600 text-yellow-100 rounded-full text-sm">
                    {mockWorkOrder.status}
                  </span>
                  <button
                    onClick={() => handleStatusChange("En Proceso")}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    Cambiar a En Proceso
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cliente</label>
                <p className="text-white">{mockWorkOrder.client}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Vehículo</label>
                <p className="text-white">{mockWorkOrder.vehicle}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Técnico Asignado
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-white">{mockWorkOrder.technician || "Sin asignar"}</p>
                  <button
                    onClick={() => handleTechnicianAssignment("Ana Rodríguez")}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                  >
                    Reasignar
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de Creación
                </label>
                <p className="text-gray-400">{mockWorkOrder.createdAt.toLocaleString("es-MX")}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Última Actualización
                </label>
                <p className="text-gray-400">{mockWorkOrder.updatedAt.toLocaleString("es-MX")}</p>
              </div>
            </div>
          </div>
        );

      case "diagnostico":
        return (
          <div className="space-y-4">
            <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-600">
              <h4 className="text-white font-medium mb-2">Diagnóstico Inicial</h4>
              <p className="text-gray-300 text-sm">
                Se realizó inspección visual del vehículo. Se detectaron ruidos extraños en el motor
                y pérdida de potencia. Se recomienda revisión completa del sistema de inyección.
              </p>
            </div>
            <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-600">
              <h4 className="text-white font-medium mb-2">Problemas Identificados</h4>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Filtro de aire sucio</li>
                <li>Bujías desgastadas</li>
                <li>Posible falla en inyectores</li>
              </ul>
            </div>
          </div>
        );

      case "trabajo":
        return (
          <div className="space-y-4">
            <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-600">
              <h4 className="text-white font-medium mb-2">Trabajo Realizado</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Cambio de filtro de aire</span>
                  <span className="text-green-400 text-sm">✓ Completado</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Cambio de bujías</span>
                  <span className="text-yellow-400 text-sm">⏳ En proceso</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Limpieza de inyectores</span>
                  <span className="text-gray-400 text-sm">⏸ Pendiente</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "evidencias":
        return (
          <div className="space-y-4">
            <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-600">
              <h4 className="text-white font-medium mb-2">Fotografías de Evidencia</h4>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-secondary-700 rounded border border-secondary-600 flex items-center justify-center"
                  >
                    <PhotoIcon className="h-8 w-8 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "auditoria":
        return (
          <AuditTimeline
            entityType="work_order"
            entityId={mockWorkOrder.id}
            entityName={`OT ${mockWorkOrder.number}`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-secondary-700 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-secondary-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Orden de Trabajo {mockWorkOrder.number}
              </h2>
              <p className="text-gray-400 mt-1">
                {mockWorkOrder.client} - {mockWorkOrder.vehicle}
              </p>
            </div>
            <button
              onClick={() => console.log("Cerrar modal")}
              className="text-gray-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-secondary-600">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-400"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default WorkOrderDetailModal;
