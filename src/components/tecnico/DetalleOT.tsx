"use client";

import {
  ChecklistFase,
  COLORES_ESTADO,
  EstadoOT,
  ESTADOS_ORDEN,
  gates,
  LABEL_ESTADO,
  NotaTecnica,
  OrdenTrabajo,
} from "@/types/ordenes";
import {
  ArrowRightIcon,
  CameraIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  PauseIcon,
  PlayIcon,
  TruckIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import ChecklistFaseComponent from "./ChecklistFase";
import EstadoTimer from "./EstadoTimer";
import UploaderEvidencias from "./UploaderEvidencias";

interface DetalleOTProps {
  orden: OrdenTrabajo;
  onClose: () => void;
  onActualizar: (orden: OrdenTrabajo) => void;
}

type TabActivo = "resumen" | "checklist" | "evidencias" | "temporizador" | "entrega";

export default function DetalleOT({ orden, onClose, onActualizar }: DetalleOTProps) {
  const [tabActivo, setTabActivo] = useState<TabActivo>("resumen");
  const [nuevaNota, setNuevaNota] = useState("");
  const [enEspera, setEnEspera] = useState(orden.enEspera || false);
  const [motivoEspera, setMotivoEspera] = useState("");
  const [mostrarModalEspera, setMostrarModalEspera] = useState(false);
  const [tiempoIniciado, setTiempoIniciado] = useState(false);

  // Determinar el paso actual del stepper basado en el estado
  const pasoActual = ESTADOS_ORDEN.indexOf(orden.estado);

  // Determinar qué checklist mostrar según el estado
  const getFaseChecklist = (): "DESARME" | "ARMADO" | "PRUEBA" | null => {
    switch (orden.estado) {
      case "PROCESO_DESARME":
        return "DESARME";
      case "PROCESO_ARMADO":
        return "ARMADO";
      case "EN_PRUEBA":
        return "PRUEBA";
      default:
        return null;
    }
  };

  const faseChecklistActual = getFaseChecklist();

  // Handlers
  const handleAgregarNota = async () => {
    if (!nuevaNota.trim()) return;

    const nota: NotaTecnica = {
      id: `nota_${Date.now()}`,
      ordenId: orden.id,
      texto: nuevaNota.trim(),
      autorId: "tecnico_actual", // TODO: Obtener del contexto
      creadoEn: new Date().toISOString(),
      fase: orden.estado,
    };

    const ordenActualizada = {
      ...orden,
      notasTecnicas: [...orden.notasTecnicas, nota],
      updatedAt: new Date().toISOString(),
    };

    onActualizar(ordenActualizada);
    setNuevaNota("");
  };

  const handleCambiarEstado = async (nuevoEstado: EstadoOT) => {
    // Validar transición
    if (!validarTransicion(orden, nuevoEstado)) {
      // TODO: Mostrar toast con error específico
      return;
    }

    const ordenActualizada = {
      ...orden,
      estado: nuevoEstado,
      updatedAt: new Date().toISOString(),
    };

    onActualizar(ordenActualizada);
  };

  const handlePonerEnEspera = () => {
    if (enEspera) {
      // Salir de espera
      const ordenActualizada = {
        ...orden,
        enEspera: false,
        motivoEspera: undefined,
        updatedAt: new Date().toISOString(),
      };
      onActualizar(ordenActualizada);
      setEnEspera(false);
    } else {
      // Poner en espera
      setMostrarModalEspera(true);
    }
  };

  const confirmarEspera = () => {
    if (!motivoEspera.trim()) return;

    const ordenActualizada = {
      ...orden,
      enEspera: true,
      motivoEspera: motivoEspera.trim(),
      updatedAt: new Date().toISOString(),
    };

    onActualizar(ordenActualizada);
    setEnEspera(true);
    setMostrarModalEspera(false);
    setMotivoEspera("");
  };

  const validarTransicion = (ordenActual: OrdenTrabajo, nuevoEstado: EstadoOT): boolean => {
    switch (nuevoEstado) {
      case "DIAGNOSTICO":
        return gates.puedeIrADiagnostico(ordenActual);
      case "PROCESO_DESARME":
        return gates.puedeIrADesarme(ordenActual);
      case "PROCESO_ARMADO":
        return gates.puedeIrAArmado(ordenActual);
      case "EN_PRUEBA":
        return gates.puedeIrAPrueba(ordenActual);
      case "FINALIZADO":
        return gates.puedeFinalizar(ordenActual);
      default:
        return true;
    }
  };

  const handleActualizarChecklist = (nuevaFase: ChecklistFase) => {
    const ordenActualizada = {
      ...orden,
      checklists: {
        ...orden.checklists,
        [faseChecklistActual!]: nuevaFase,
      },
      updatedAt: new Date().toISOString(),
    };

    onActualizar(ordenActualizada);
  };

  // Calcular si puede avanzar al siguiente estado
  const puedeAvanzar = () => {
    const siguienteEstado = ESTADOS_ORDEN[pasoActual + 1];
    if (!siguienteEstado) return false;
    return validarTransicion(orden, siguienteEstado);
  };

  const avanzarEstado = () => {
    const siguienteEstado = ESTADOS_ORDEN[pasoActual + 1];
    if (siguienteEstado && puedeAvanzar()) {
      handleCambiarEstado(siguienteEstado);
    }
  };

  const tabs = [
    { id: "resumen", label: "Resumen", icon: DocumentTextIcon },
    { id: "checklist", label: "Checklist", icon: ClipboardDocumentCheckIcon },
    { id: "evidencias", label: "Evidencias", icon: CameraIcon },
    { id: "temporizador", label: "Temporizador", icon: ClockIcon },
    { id: "entrega", label: "Entrega", icon: TruckIcon },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-white">{orden.numero || orden.id}</h2>
              <p className="text-sm text-gray-300">
                {orden.vehiculo?.placa} - {orden.vehiculo?.marca} {orden.vehiculo?.modelo}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                COLORES_ESTADO[orden.estado]
              }`}
            >
              {LABEL_ESTADO[orden.estado]}
            </span>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {ESTADOS_ORDEN.map((estado, index) => (
              <div key={estado} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= pasoActual ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {index < pasoActual ? <CheckCircleIcon className="h-5 w-5" /> : index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      index === pasoActual ? "font-medium text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {LABEL_ESTADO[estado]}
                  </span>
                </div>

                {index < ESTADOS_ORDEN.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      index < pasoActual ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTabActivo(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    tabActivo === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido de las tabs */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab Resumen */}
          {tabActivo === "resumen" && (
            <div className="space-y-6">
              {/* Info del cliente y vehículo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Cliente
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Nombre:</span> {orden.cliente?.nombre}
                    </p>
                    <p>
                      <span className="text-gray-600">Teléfono:</span> {orden.cliente?.telefono}
                    </p>
                    {orden.cliente?.email && (
                      <p>
                        <span className="text-gray-600">Email:</span> {orden.cliente.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <TruckIcon className="h-5 w-5 mr-2" />
                    Vehículo
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Placa:</span> {orden.vehiculo?.placa}
                    </p>
                    <p>
                      <span className="text-gray-600">Marca/Modelo:</span> {orden.vehiculo?.marca}{" "}
                      {orden.vehiculo?.modelo}
                    </p>
                    <p>
                      <span className="text-gray-600">Año:</span> {orden.vehiculo?.ano}
                    </p>
                    {orden.km && (
                      <p>
                        <span className="text-gray-600">Kilometraje:</span>{" "}
                        {orden.km.toLocaleString()}
                      </p>
                    )}
                    {orden.combustible !== undefined && (
                      <p>
                        <span className="text-gray-600">Combustible:</span> {orden.combustible}%
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Diagnóstico */}
              {orden.diagnostico && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Diagnóstico</h3>
                  <p className="text-gray-700">{orden.diagnostico}</p>
                  {orden.estimacionHoras && (
                    <p className="text-sm text-gray-600 mt-2">
                      Estimado: {orden.estimacionHoras} horas
                    </p>
                  )}
                </div>
              )}

              {/* Notas técnicas */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Notas Técnicas</h3>

                {/* Agregar nueva nota */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <textarea
                    value={nuevaNota}
                    onChange={(e) => setNuevaNota(e.target.value)}
                    placeholder="Agregar nota técnica..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleAgregarNota}
                      disabled={!nuevaNota.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Agregar Nota
                    </button>
                  </div>
                </div>

                {/* Lista de notas */}
                <div className="space-y-3">
                  {orden.notasTecnicas.map((nota) => (
                    <div key={nota.id} className="bg-secondary-700 border border-secondary-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {nota.fase && LABEL_ESTADO[nota.fase]}
                        </span>
                        <span className="text-sm text-gray-300">
                          {new Date(nota.creadoEn).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{nota.texto}</p>
                    </div>
                  ))}

                  {orden.notasTecnicas.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No hay notas técnicas aún</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab Checklist */}
          {tabActivo === "checklist" && (
            <div>
              {faseChecklistActual ? (
                <ChecklistFaseComponent
                  fase={faseChecklistActual}
                  checklist={orden.checklists?.[faseChecklistActual]}
                  onActualizar={handleActualizarChecklist}
                />
              ) : (
                <div className="text-center py-8">
                  <ClipboardDocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay checklist disponible para este estado</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Evidencias */}
          {tabActivo === "evidencias" && (
            <UploaderEvidencias orden={orden} onActualizar={onActualizar} />
          )}

          {/* Tab Temporizador */}
          {tabActivo === "temporizador" && (
            <EstadoTimer orden={orden} onPonerEnEspera={handlePonerEnEspera} enEspera={enEspera} />
          )}

          {/* Tab Entrega */}
          {tabActivo === "entrega" && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Proceso de Entrega</h3>
                <p className="text-gray-600">Funcionalidad de entrega con firmas y fotos finales</p>
                <p className="text-sm text-gray-500 mt-2">
                  {/* TODO: Implementar proceso de entrega */}
                  Próximamente: proceso de entrega
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Botón de espera */}
            <button
              onClick={handlePonerEnEspera}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                enEspera
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
              }`}
            >
              {enEspera ? (
                <>
                  <PlayIcon className="h-5 w-5" />
                  <span>Reanudar</span>
                </>
              ) : (
                <>
                  <PauseIcon className="h-5 w-5" />
                  <span>Pausar</span>
                </>
              )}
            </button>

            {enEspera && orden.motivoEspera && (
              <span className="text-sm text-gray-600">En espera: {orden.motivoEspera}</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:text-gray-900">
              Cerrar
            </button>

            {puedeAvanzar() && !enEspera && (
              <button
                onClick={avanzarEstado}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>Avanzar a {LABEL_ESTADO[ESTADOS_ORDEN[pasoActual + 1]]}</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal para motivo de espera */}
      {mostrarModalEspera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-secondary-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Poner en Espera</h3>
            <p className="text-gray-300 mb-4">
              Indica el motivo por el cual se pausará esta orden:
            </p>
            <textarea
              value={motivoEspera}
              onChange={(e) => setMotivoEspera(e.target.value)}
              placeholder="Motivo de la espera..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setMostrarModalEspera(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEspera}
                disabled={!motivoEspera.trim()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Espera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
