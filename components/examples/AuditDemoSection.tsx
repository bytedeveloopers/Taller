"use client";

import WorkOrderDetailModal from "@/components/examples/WorkOrderDetailModal";
import { useAudit } from "@/hooks/useAudit";
import { ClipboardDocumentListIcon, DocumentTextIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const AuditDemoSection = () => {
  const [showModal, setShowModal] = useState(false);
  const audit = useAudit("demo-user", "Usuario Demo");

  const mockWorkOrders = [
    {
      id: "ot-001",
      number: "OT-2024-125",
      status: "Diagnóstico",
      client: "Juan Pérez",
      vehicle: "Honda Civic 2018",
      technician: "Carlos López",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "ot-002",
      number: "OT-2024-126",
      status: "En Proceso",
      client: "María González",
      vehicle: "Toyota Corolla 2020",
      technician: "Ana Rodríguez",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: "ot-003",
      number: "OT-2024-127",
      status: "Cotización",
      client: "Roberto Silva",
      vehicle: "Ford Focus 2019",
      technician: "Luis Mendoza",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      updatedAt: new Date(Date.now() - 1000 * 60 * 5),
    },
  ];

  const generateTestEvents = async () => {
    // Simular algunos eventos de auditoría para demostración
    await audit.logWorkOrderStatusChange("ot-001", "Recepción", "Diagnóstico");
    await audit.logTechnicianAssignment("ot-001", "Carlos López");
    await audit.logWorkOrderStatusChange("ot-002", "Diagnóstico", "En Proceso");
    await audit.logWorkOrderPause("ot-003", "Esperando piezas");

    alert(
      "Se han generado eventos de auditoría de demostración. Revisa la consola del navegador para ver los logs."
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Recepción":
        return "bg-blue-600";
      case "Diagnóstico":
        return "bg-yellow-600";
      case "En Proceso":
        return "bg-green-600";
      case "Cotización":
        return "bg-purple-600";
      case "Espera":
        return "bg-orange-600";
      case "Finalizada":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="p-6 bg-secondary-800 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Demostración del Sistema de Auditoría</h1>
          <p className="text-gray-400 mt-1">
            Ejemplo de integración de auditoría en fichas de entidades
          </p>
        </div>
        <button
          onClick={generateTestEvents}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          Generar Eventos de Prueba
        </button>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <ClipboardDocumentListIcon className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-blue-100 font-medium">Cómo probar el sistema de auditoría:</h3>
            <ol className="text-blue-200 text-sm mt-2 space-y-1 list-decimal list-inside">
              <li>Haz clic en "Ver Detalle" de cualquier OT para abrir la ficha</li>
              <li>Ve a la pestaña "Auditoría" para ver el historial de eventos</li>
              <li>
                En la pestaña "General", usa los botones para cambiar estado o reasignar técnico
              </li>
              <li>Los eventos se registrarán automáticamente en el sistema de auditoría</li>
              <li>Ve a la sección "Auditoría" del menú principal para ver todos los eventos</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Lista de Órdenes de Trabajo */}
      <div className="bg-secondary-700 rounded-lg border border-secondary-600">
        <div className="p-4 border-b border-secondary-600">
          <h2 className="text-lg font-semibold text-white">Órdenes de Trabajo de Ejemplo</h2>
          <p className="text-gray-400 text-sm">
            Cada OT incluye una pestaña de auditoría que muestra su historial completo de cambios
          </p>
        </div>

        <div className="divide-y divide-secondary-600">
          {mockWorkOrders.map((workOrder) => (
            <div key={workOrder.id} className="p-4 hover:bg-secondary-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{workOrder.number}</h3>
                    <p className="text-gray-300 text-sm">
                      {workOrder.client} - {workOrder.vehicle}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                      <span>Técnico: {workOrder.technician}</span>
                      <span>•</span>
                      <span>Actualizada: {workOrder.updatedAt.toLocaleDateString("es-MX")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 ${getStatusColor(
                      workOrder.status
                    )} text-white rounded-full text-sm font-medium`}
                  >
                    {workOrder.status}
                  </span>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>Ver Detalle</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-secondary-700 rounded-lg p-6 border border-secondary-600">
          <h3 className="text-white font-semibold mb-4">
            Características del Sistema de Auditoría
          </h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Registro inmutable de todos los eventos del sistema</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Filtros avanzados por fecha, usuario, entidad y acción</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Exportación a CSV para reportes externos</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Timeline integrado en cada ficha de entidad</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Diferencias (diffs) detalladas de cada cambio</span>
            </li>
          </ul>
        </div>

        <div className="bg-secondary-700 rounded-lg p-6 border border-secondary-600">
          <h3 className="text-white font-semibold mb-4">Eventos Auditados</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Cambios de estado en Órdenes de Trabajo</li>
            <li>• Asignaciones y reasignaciones de técnicos</li>
            <li>• Pausas y reanudaciones por espera</li>
            <li>• Creación y modificación de cotizaciones</li>
            <li>• Fusión de clientes y vehículos duplicados</li>
            <li>• Reprogramaciones de citas en agenda</li>
            <li>• Subida y eliminación de evidencias</li>
            <li>• Cambios en configuraciones del sistema</li>
          </ul>
        </div>
      </div>

      {/* Modal de detalle de OT */}
      {showModal && <WorkOrderDetailModal workOrderId="ot-001" workOrderData={mockWorkOrders[0]} />}
    </div>
  );
};

export default AuditDemoSection;
