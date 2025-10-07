"use client";

import { NotaTecnica, OrdenTrabajo } from "@/types/ordenes";
import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  PhotoIcon,
  PlusIcon,
  WrenchScrewdriverIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import EstadoTimer from "./EstadoTimer";
import UploaderEvidencias from "./UploaderEvidencias";

interface PlantillaChecklist {
  id: string;
  nombre: string;
  descripcion: string;
  items: Array<{
    id: string;
    texto: string;
    obligatorio: boolean;
    categoria?: string;
  }>;
}

export default function DiagnosticoForm() {
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenTrabajo | null>(null);
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [plantillas, setPlantillas] = useState<PlantillaChecklist[]>([]);
  const [checklistActual, setChecklistActual] = useState<Checklist | null>(null);
  const [diagnostico, setDiagnostico] = useState("");
  const [estimacionHoras, setEstimacionHoras] = useState<number>(0);
  const [requerimientos, setRequerimientos] = useState("");
  const [nuevaNota, setNuevaNota] = useState("");
  const [mostrarUploader, setMostrarUploader] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        // TODO: Implementar llamadas reales a API
        // Órdenes en diagnóstico
        const ordenesSimuladas: OrdenTrabajo[] = [
          {
            id: "2",
            numero: "OT-2024-038",
            clienteId: "cliente2",
            vehiculoId: "vehiculo2",
            estado: "DIAGNOSTICO",
            prioridad: "MEDIA",
            asignadoA: "tecnico1",
            asignadoPor: "admin1",
            asignadoEn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            slaAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            km: 32000,
            combustible: 60,
            diagnostico: "",
            estimacionHoras: 0,
            evidencias: [],
            notasTecnicas: [],
            checklists: [],
            cliente: {
              id: "cliente2",
              nombre: "María García",
              telefono: "3009876543",
              email: "maria@email.com",
            },
            vehiculo: {
              id: "vehiculo2",
              placa: "XYZ789",
              marca: "Honda",
              modelo: "Civic",
              año: 2019,
            },
            esNueva: false,
            porcentajeProgreso: 35,
          },
        ];

        // Plantillas de checklist
        const plantillasSimuladas: PlantillaChecklist[] = [
          {
            id: "mantenimiento-preventivo",
            nombre: "Mantenimiento Preventivo",
            descripcion: "Checklist completo para mantenimiento preventivo",
            items: [
              {
                id: "1",
                texto: "Verificar nivel de aceite de motor",
                obligatorio: true,
                categoria: "Motor",
              },
              {
                id: "2",
                texto: "Inspeccionar filtro de aire",
                obligatorio: true,
                categoria: "Motor",
              },
              {
                id: "3",
                texto: "Revisar nivel de líquido de frenos",
                obligatorio: true,
                categoria: "Frenos",
              },
              {
                id: "4",
                texto: "Inspeccionar pastillas de freno",
                obligatorio: true,
                categoria: "Frenos",
              },
              {
                id: "5",
                texto: "Verificar presión de llantas",
                obligatorio: true,
                categoria: "Llantas",
              },
              {
                id: "6",
                texto: "Inspeccionar desgaste de llantas",
                obligatorio: false,
                categoria: "Llantas",
              },
              {
                id: "7",
                texto: "Revisar luces delanteras",
                obligatorio: true,
                categoria: "Eléctrico",
              },
              {
                id: "8",
                texto: "Verificar luces traseras",
                obligatorio: true,
                categoria: "Eléctrico",
              },
              {
                id: "9",
                texto: "Inspeccionar batería",
                obligatorio: false,
                categoria: "Eléctrico",
              },
              {
                id: "10",
                texto: "Revisar nivel de refrigerante",
                obligatorio: true,
                categoria: "Enfriamiento",
              },
            ],
          },
          {
            id: "revision-frenos",
            nombre: "Revisión de Frenos",
            descripcion: "Checklist específico para sistema de frenos",
            items: [
              {
                id: "1",
                texto: "Inspeccionar pastillas delanteras",
                obligatorio: true,
                categoria: "Frenos delanteros",
              },
              {
                id: "2",
                texto: "Inspeccionar discos delanteros",
                obligatorio: true,
                categoria: "Frenos delanteros",
              },
              {
                id: "3",
                texto: "Revisar pastillas traseras",
                obligatorio: true,
                categoria: "Frenos traseros",
              },
              {
                id: "4",
                texto: "Inspeccionar discos/tambores traseros",
                obligatorio: true,
                categoria: "Frenos traseros",
              },
              {
                id: "5",
                texto: "Verificar nivel de líquido de frenos",
                obligatorio: true,
                categoria: "Sistema hidráulico",
              },
              {
                id: "6",
                texto: "Probar pedal de freno",
                obligatorio: true,
                categoria: "Sistema hidráulico",
              },
              {
                id: "7",
                texto: "Inspeccionar mangueras",
                obligatorio: false,
                categoria: "Sistema hidráulico",
              },
              {
                id: "8",
                texto: "Revisar freno de mano",
                obligatorio: true,
                categoria: "Freno de estacionamiento",
              },
            ],
          },
          {
            id: "diagnostico-motor",
            nombre: "Diagnóstico de Motor",
            descripcion: "Checklist para diagnóstico completo del motor",
            items: [
              {
                id: "1",
                texto: "Escanear códigos de error",
                obligatorio: true,
                categoria: "Diagnóstico",
              },
              { id: "2", texto: "Verificar compresión", obligatorio: true, categoria: "Motor" },
              {
                id: "3",
                texto: "Inspeccionar bujías",
                obligatorio: true,
                categoria: "Sistema de ignición",
              },
              {
                id: "4",
                texto: "Revisar filtro de combustible",
                obligatorio: false,
                categoria: "Sistema de combustible",
              },
              {
                id: "5",
                texto: "Verificar inyectores",
                obligatorio: false,
                categoria: "Sistema de combustible",
              },
              {
                id: "6",
                texto: "Inspeccionar correa de distribución",
                obligatorio: true,
                categoria: "Motor",
              },
              { id: "7", texto: "Revisar tensores", obligatorio: false, categoria: "Motor" },
              {
                id: "8",
                texto: "Verificar funcionamiento del termostato",
                obligatorio: false,
                categoria: "Enfriamiento",
              },
            ],
          },
        ];

        setOrdenes(ordenesSimuladas);
        setPlantillas(plantillasSimuladas);

        if (ordenesSimuladas.length > 0) {
          const primeraOrden = ordenesSimuladas[0];
          setOrdenSeleccionada(primeraOrden);
          setDiagnostico(primeraOrden.diagnostico || "");
          setEstimacionHoras(primeraOrden.estimacionHoras || 0);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const seleccionarPlantilla = (plantillaId: string) => {
    const plantilla = plantillas.find((p) => p.id === plantillaId);
    if (!plantilla || !ordenSeleccionada) return;

    const nuevoChecklist: Checklist = {
      id: `${ordenSeleccionada.id}-${plantillaId}`,
      nombre: plantilla.nombre,
      items: plantilla.items.map((item) => ({
        texto: item.texto,
        done: false,
      })),
    };

    setChecklistActual(nuevoChecklist);
  };

  const toggleChecklistItem = (index: number) => {
    if (!checklistActual) return;

    const nuevosItems = [...checklistActual.items];
    nuevosItems[index].done = !nuevosItems[index].done;

    setChecklistActual({
      ...checklistActual,
      items: nuevosItems,
    });
  };

  const agregarNota = async () => {
    if (!nuevaNota.trim() || !ordenSeleccionada) return;

    try {
      const nota: NotaTecnica = {
        id: Date.now().toString(),
        texto: nuevaNota.trim(),
        creadoEn: new Date().toISOString(),
        autorId: "tecnico1",
      };

      // TODO: Implementar llamada a API
      console.log("Agregando nota:", nota);

      setOrdenSeleccionada((prev) =>
        prev
          ? {
              ...prev,
              notasTecnicas: [...prev.notasTecnicas, nota],
            }
          : null
      );

      setNuevaNota("");
    } catch (error) {
      console.error("Error agregando nota:", error);
    }
  };

  const guardarDiagnostico = async () => {
    if (!ordenSeleccionada) return;

    try {
      const datosActualizados = {
        diagnostico,
        estimacionHoras,
        requerimientos,
        checklist: checklistActual,
      };

      // TODO: Implementar llamada a API
      console.log("Guardando diagnóstico:", datosActualizados);

      alert("Diagnóstico guardado exitosamente");
    } catch (error) {
      console.error("Error guardando diagnóstico:", error);
      alert("Error al guardar el diagnóstico");
    }
  };

  const finalizarDiagnostico = async () => {
    if (!ordenSeleccionada) return;

    if (!diagnostico.trim()) {
      alert("Debe completar el diagnóstico antes de finalizar");
      return;
    }

    if (estimacionHoras <= 0) {
      alert("Debe ingresar una estimación de horas válida");
      return;
    }

    try {
      // Guardar primero
      await guardarDiagnostico();

      // Cambiar estado
      // TODO: Implementar llamada a API para cambio de estado
      console.log("Finalizando diagnóstico y cambiando estado a COTIZACION_ENVIADA");

      alert("Diagnóstico finalizado. La orden pasará a cotización.");
    } catch (error) {
      console.error("Error finalizando diagnóstico:", error);
      alert("Error al finalizar el diagnóstico");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando diagnóstico...</p>
        </div>
      </div>
    );
  }

  if (!ordenSeleccionada) {
    return (
      <div className="p-6">
        <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-8 text-center">
          <WrenchScrewdriverIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No hay órdenes en diagnóstico</h3>
          <p className="text-gray-400">No tienes órdenes asignadas en estado de diagnóstico.</p>
        </div>
      </div>
    );
  }

  const porcentajeChecklist = checklistActual
    ? Math.round(
        (checklistActual.items.filter((item) => item.done).length / checklistActual.items.length) *
          100
      )
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Diagnóstico Técnico</h1>
            <p className="text-gray-400 mt-1">
              {ordenSeleccionada.numero} - {ordenSeleccionada.vehiculo?.marca}{" "}
              {ordenSeleccionada.vehiculo?.modelo}
            </p>
          </div>

          {/* Info de la orden */}
          <div className="text-right">
            <p className="text-sm text-gray-400">Cliente</p>
            <p className="text-white font-medium">{ordenSeleccionada.cliente?.nombre}</p>
            <p className="text-sm text-gray-400 mt-1">Placa: {ordenSeleccionada.vehiculo?.placa}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cronómetro */}
          <EstadoTimer
            cronometro={{
              ordenId: ordenSeleccionada.id,
              estadoActual: ordenSeleccionada.estado,
              inicioEn: new Date().toISOString(),
              tiempoAcumulado: 0,
              activo: false,
            }}
            onIniciar={() => console.log("Iniciar cronómetro")}
            onPausar={() => console.log("Pausar cronómetro")}
            onReanudar={() => console.log("Reanudar cronómetro")}
          />

          {/* Selección de plantilla */}
          <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Seleccionar Checklist de Diagnóstico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plantillas.map((plantilla) => (
                <button
                  key={plantilla.id}
                  onClick={() => seleccionarPlantilla(plantilla.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    checklistActual?.nombre === plantilla.nombre
                      ? "border-blue-500 bg-blue-600/10"
                      : "border-secondary-600 hover:border-secondary-500 bg-secondary-700/50"
                  }`}
                >
                  <h4 className="text-white font-medium">{plantilla.nombre}</h4>
                  <p className="text-gray-400 text-sm mt-1">{plantilla.descripcion}</p>
                  <p className="text-gray-500 text-xs mt-2">{plantilla.items.length} elementos</p>
                </button>
              ))}
            </div>
          </div>

          {/* Checklist activo */}
          {checklistActual && (
            <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{checklistActual.nombre}</h3>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Progreso</p>
                  <p className="text-white font-bold">{porcentajeChecklist}%</p>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-secondary-700 rounded-full h-2 mb-6">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${porcentajeChecklist}%` }}
                ></div>
              </div>

              {/* Items del checklist */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {checklistActual.items.map((item, index) => (
                  <label
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleChecklistItem(index)}
                      className="mt-1 h-4 w-4 text-blue-500 focus:ring-blue-500 rounded"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        item.done ? "text-gray-400 line-through" : "text-white"
                      }`}
                    >
                      {item.texto}
                    </span>
                    {item.done ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Diagnóstico */}
          <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Diagnóstico Detallado</h3>
            <textarea
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              placeholder="Describe el diagnóstico técnico completo..."
              className="w-full h-32 px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Estimación y requerimientos */}
          <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estimación de Horas
                </label>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={estimacionHoras}
                    onChange={(e) => setEstimacionHoras(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-400 text-sm">horas</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Requerimientos Especiales
                </label>
                <textarea
                  value={requerimientos}
                  onChange={(e) => setRequerimientos(e.target.value)}
                  placeholder="Piezas, herramientas especiales, etc."
                  className="w-full h-20 px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Notas técnicas */}
          <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Notas Técnicas</h3>

            {/* Nueva nota */}
            <div className="mb-4">
              <textarea
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                placeholder="Agregar nueva nota..."
                className="w-full h-20 px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <button
                onClick={agregarNota}
                disabled={!nuevaNota.trim()}
                className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Agregar Nota
              </button>
            </div>

            {/* Lista de notas */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {ordenSeleccionada.notasTecnicas.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No hay notas técnicas</p>
              ) : (
                ordenSeleccionada.notasTecnicas.map((nota) => (
                  <div key={nota.id} className="bg-secondary-700/50 rounded-lg p-3">
                    <p className="text-white text-sm">{nota.texto}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(nota.creadoEn).toLocaleString("es-GT")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Evidencias */}
          <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Evidencias</h3>
              <span className="text-sm text-gray-400">
                {ordenSeleccionada.evidencias.length} archivos
              </span>
            </div>

            <button
              onClick={() => setMostrarUploader(true)}
              className="w-full flex items-center justify-center px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 text-purple-400 rounded-lg transition-colors"
            >
              <PhotoIcon className="h-5 w-5 mr-2" />
              Subir Evidencias
            </button>

            {ordenSeleccionada.evidencias.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {ordenSeleccionada.evidencias.slice(0, 4).map((evidencia) => (
                  <div
                    key={evidencia.id}
                    className="aspect-square bg-secondary-700 rounded-lg overflow-hidden"
                  >
                    <img
                      src={evidencia.url}
                      alt="Evidencia"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
            <div className="space-y-3">
              <button
                onClick={guardarDiagnostico}
                className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Guardar Diagnóstico
              </button>

              <button
                onClick={finalizarDiagnostico}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Finalizar Diagnóstico
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de uploader */}
      {mostrarUploader && (
        <UploaderEvidencias
          ordenId={ordenSeleccionada.id}
          evidenciasExistentes={ordenSeleccionada.evidencias}
          onUploadComplete={(nuevasEvidencias) => {
            setOrdenSeleccionada((prev) =>
              prev
                ? {
                    ...prev,
                    evidencias: [...prev.evidencias, ...nuevasEvidencias],
                  }
                : null
            );
            setMostrarUploader(false);
          }}
          onClose={() => setMostrarUploader(false)}
        />
      )}
    </div>
  );
}
