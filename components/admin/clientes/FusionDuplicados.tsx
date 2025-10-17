"use client";

import { useToast } from "@/components/ui/ToastNotification";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  TruckIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface Cliente {
  id: string;
  name: string;
  phone: string;
  email?: string;
  altPhone?: string;
  address?: string;
  contactPreference: string;
  labels: string[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vehicles: Array<{
    id: string;
    brand: string;
    model: string;
    year: number;
    licensePlate?: string;
    trackingCode: string;
  }>;
  appointments: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    service?: string;
  }>;
  quotes: Array<{
    id: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
}

interface DuplicadoPotencial {
  id: string;
  name: string;
  phone: string;
  email?: string;
  similarity: number;
  reason: string;
  vehiclesCount: number;
  appointmentsCount: number;
  quotesCount: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteInicial?: Cliente;
  onFusionCompleta?: () => void;
}

type Paso = "busqueda" | "seleccion" | "revision" | "confirmacion" | "completado";

interface FusionData {
  clientePrincipal: Cliente | null;
  clienteSecundario: Cliente | null;
  estrategia: "keepPrimary" | "keepSecondary" | "merge";
  transferirDatos: {
    vehiculos: boolean;
    citas: boolean;
    cotizaciones: boolean;
    notas: boolean;
  };
}

export default function FusionDuplicados({
  isOpen,
  onClose,
  clienteInicial,
  onFusionCompleta,
}: Props) {
  const { showSuccess, showError } = useToast();
  const [paso, setPaso] = useState<Paso>("busqueda");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicados, setDuplicados] = useState<DuplicadoPotencial[]>([]);
  const [clientesDetallados, setClientesDetallados] = useState<{ [id: string]: Cliente }>({});
  const [fusionData, setFusionData] = useState<FusionData>({
    clientePrincipal: null,
    clienteSecundario: null,
    estrategia: "keepPrimary",
    transferirDatos: {
      vehiculos: true,
      citas: true,
      cotizaciones: true,
      notas: true,
    },
  });

  // Inicializar con cliente inicial si se proporciona
  useEffect(() => {
    if (clienteInicial) {
      setFusionData((prev) => ({
        ...prev,
        clientePrincipal: clienteInicial,
      }));
      setPaso("seleccion");
    } else {
      setPaso("busqueda");
    }
  }, [clienteInicial, isOpen]);

  // Buscar duplicados potenciales
  const buscarDuplicados = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        detectDuplicates: "true",
        limit: "20",
      });

      const response = await fetch(`/api/clients?${params}`);
      const result = await response.json();

      if (result.success && result.duplicates) {
        setDuplicados(result.duplicates);
      } else {
        setDuplicados([]);
      }
    } catch (error) {
      console.error("Error buscando duplicados:", error);
      showError("Error", "No se pudieron buscar duplicados");
    } finally {
      setLoading(false);
    }
  };

  // Cargar detalles completos de un cliente
  const cargarDetallesCliente = async (clienteId: string) => {
    if (clientesDetallados[clienteId]) return clientesDetallados[clienteId];

    try {
      const response = await fetch(`/api/clients/${clienteId}`);
      const result = await response.json();

      if (result.success) {
        setClientesDetallados((prev) => ({
          ...prev,
          [clienteId]: result.data,
        }));
        return result.data;
      }
    } catch (error) {
      console.error("Error cargando cliente:", error);
    }
    return null;
  };

  // Seleccionar cliente para fusión
  const seleccionarCliente = async (clienteId: string, esPrincipal: boolean) => {
    const cliente = await cargarDetallesCliente(clienteId);
    if (!cliente) return;

    setFusionData((prev) => ({
      ...prev,
      [esPrincipal ? "clientePrincipal" : "clienteSecundario"]: cliente,
    }));

    if (esPrincipal && !fusionData.clienteSecundario) {
      // Si seleccionamos principal y no hay secundario, buscar automáticamente duplicados
      buscarDuplicados();
    }
  };

  // Proceder al siguiente paso
  const siguientePaso = () => {
    switch (paso) {
      case "busqueda":
        if (fusionData.clientePrincipal) setPaso("seleccion");
        break;
      case "seleccion":
        if (fusionData.clientePrincipal && fusionData.clienteSecundario) {
          setPaso("revision");
        }
        break;
      case "revision":
        setPaso("confirmacion");
        break;
      case "confirmacion":
        ejecutarFusion();
        break;
    }
  };

  // Ejecutar la fusión
  const ejecutarFusion = async () => {
    if (!fusionData.clientePrincipal || !fusionData.clienteSecundario) return;

    try {
      setLoading(true);
      setPaso("completado");

      const response = await fetch("/api/clients/fusionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryId: fusionData.clientePrincipal.id,
          secondaryId: fusionData.clienteSecundario.id,
          mergeStrategy: fusionData.estrategia,
          transferData: fusionData.transferirDatos,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess("Éxito", "Clientes fusionados correctamente");
        onFusionCompleta?.();
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        showError("Error", result.error || "No se pudo completar la fusión");
        setPaso("confirmacion");
      }
    } catch (error) {
      console.error("Error ejecutando fusión:", error);
      showError("Error", "Error de conexión al fusionar clientes");
      setPaso("confirmacion");
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setPaso("busqueda");
    setSearchTerm("");
    setDuplicados([]);
    setClientesDetallados({});
    setFusionData({
      clientePrincipal: null,
      clienteSecundario: null,
      estrategia: "keepPrimary",
      transferirDatos: {
        vehiculos: true,
        citas: true,
        cotizaciones: true,
        notas: true,
      },
    });
  };

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Renderizar tarjeta de cliente
  const renderClienteCard = (cliente: Cliente, tipo: "principal" | "secundario") => (
    <div
      className={`bg-secondary-700 rounded-lg p-6 border-2 ${
        tipo === "principal" ? "border-blue-500" : "border-yellow-500"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full ${
              tipo === "principal" ? "bg-blue-500" : "bg-yellow-500"
            } flex items-center justify-center text-white font-semibold`}
          >
            {cliente.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-medium">{cliente.name}</h3>
            <p className="text-sm text-gray-400">
              {tipo === "principal" ? "Cliente Principal" : "Cliente a Fusionar"}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            tipo === "principal"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {tipo === "principal" ? "Principal" : "Secundario"}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <PhoneIcon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-300">{cliente.phone}</span>
        </div>
        {cliente.email && (
          <div className="flex items-center space-x-2">
            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300">{cliente.email}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Registrado:</span>
          <span className="text-gray-300">{formatearFecha(cliente.createdAt)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-secondary-600">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <TruckIcon className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-lg font-semibold text-white">{cliente.vehicles?.length || 0}</div>
            <div className="text-xs text-gray-400">Vehículos</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <CalendarDaysIcon className="h-4 w-4 text-green-400" />
            </div>
            <div className="text-lg font-semibold text-white">
              {cliente.appointments?.length || 0}
            </div>
            <div className="text-xs text-gray-400">Citas</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <ClipboardDocumentListIcon className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-lg font-semibold text-white">{cliente.quotes?.length || 0}</div>
            <div className="text-xs text-gray-400">Cotizaciones</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-secondary-800 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-white">Fusionar Clientes Duplicados</h2>
              <p className="text-sm text-gray-400">
                {paso === "busqueda" && "Busca y selecciona clientes duplicados"}
                {paso === "seleccion" && "Selecciona el segundo cliente para fusionar"}
                {paso === "revision" && "Revisa los datos antes de fusionar"}
                {paso === "confirmacion" && "Confirma la fusión"}
                {paso === "completado" && "Fusión completada exitosamente"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Indicador de progreso */}
        <div className="px-6 py-4 border-b border-secondary-700">
          <div className="flex items-center justify-between">
            {["busqueda", "seleccion", "revision", "confirmacion", "completado"].map(
              (stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      paso === stepName
                        ? "bg-blue-500 text-white"
                        : index <
                          [
                            "busqueda",
                            "seleccion",
                            "revision",
                            "confirmacion",
                            "completado",
                          ].indexOf(paso)
                        ? "bg-green-500 text-white"
                        : "bg-secondary-600 text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 4 && (
                    <div
                      className={`w-full h-0.5 mx-2 ${
                        index <
                        ["busqueda", "seleccion", "revision", "confirmacion", "completado"].indexOf(
                          paso
                        )
                          ? "bg-green-500"
                          : "bg-secondary-600"
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Paso 1: Búsqueda */}
          {paso === "busqueda" && (
            <div className="space-y-6">
              <div className="text-center">
                <DocumentDuplicateIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Buscar Clientes Duplicados</h3>
                <p className="text-gray-400">
                  Busca clientes por nombre, teléfono o email para identificar duplicados
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarDuplicados()}
                    className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={buscarDuplicados}
                  disabled={!searchTerm.trim() || loading}
                  className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Buscando..." : "Buscar Duplicados"}
                </button>
              </div>

              {duplicados.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {duplicados.map((duplicado) => (
                    <div key={duplicado.id} className="bg-secondary-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{duplicado.name}</h4>
                          <p className="text-sm text-gray-400">{duplicado.phone}</p>
                          {duplicado.email && (
                            <p className="text-sm text-gray-400">{duplicado.email}</p>
                          )}
                        </div>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                          {duplicado.similarity}% similar
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span>{duplicado.vehiclesCount} vehículos</span>
                        <span>{duplicado.appointmentsCount} citas</span>
                        <span>{duplicado.quotesCount} cotizaciones</span>
                      </div>

                      <p className="text-xs text-gray-400 mb-3">{duplicado.reason}</p>

                      <button
                        onClick={() => seleccionarCliente(duplicado.id, true)}
                        className="w-full px-3 py-1 bg-blue-600 text-白 text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Seleccionar como Principal
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Paso 2: Selección */}
          {paso === "seleccion" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">
                  Seleccionar Cliente Secundario
                </h3>
                <p className="text-gray-400">Selecciona el segundo cliente que deseas fusionar</p>
              </div>

              {fusionData.clientePrincipal && (
                <div className="max-w-md mx-auto">
                  {renderClienteCard(fusionData.clientePrincipal, "principal")}
                </div>
              )}

              {duplicados.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-4">Clientes similares encontrados:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {duplicados
                      .filter((d) => d.id !== fusionData.clientePrincipal?.id)
                      .map((duplicado) => (
                        <div key={duplicado.id} className="bg-secondary-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{duplicado.name}</h4>
                              <p className="text-sm text-gray-400">{duplicado.phone}</p>
                              {duplicado.email && (
                                <p className="text-sm text-gray-400">{duplicado.email}</p>
                              )}
                            </div>
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                              {duplicado.similarity}% similar
                            </span>
                          </div>

                          <button
                            onClick={() => seleccionarCliente(duplicado.id, false)}
                            className="w-full px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                          >
                            Seleccionar como Secundario
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paso 3: Revisión */}
          {paso === "revision" && fusionData.clientePrincipal && fusionData.clienteSecundario && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">Revisar Fusión</h3>
                <p className="text-gray-400">
                  Revisa los datos que se fusionarán y configura las opciones
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderClienteCard(fusionData.clientePrincipal, "principal")}
                <div className="flex items-center justify-center">
                  <ArrowRightIcon className="h-8 w-8 text-blue-500" />
                </div>
                {renderClienteCard(fusionData.clienteSecundario, "secundario")}
              </div>

              <div className="bg-secondary-700 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4">Configuración de Fusión</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estrategia de fusión
                    </label>
                    <select
                      value={fusionData.estrategia}
                      onChange={(e) =>
                        setFusionData((prev) => ({ ...prev, estrategia: e.target.value as any }))
                      }
                      className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="keepPrimary">Mantener datos del cliente principal</option>
                      <option value="keepSecondary">Mantener datos del cliente secundario</option>
                      <option value="merge">Fusionar datos (donde sea posible)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Datos a transferir
                    </label>
                    <div className="space-y-2">
                      {Object.entries(fusionData.transferirDatos).map(([key, value]) => (
                        <label key={key} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              setFusionData((prev) => ({
                                ...prev,
                                transferirDatos: {
                                  ...prev.transferirDatos,
                                  [key]: e.target.checked,
                                },
                              }))
                            }
                            className="h-4 w-4 text-blue-600 bg-secondary-600 border-secondary-500 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-300 capitalize">{key}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {paso === "confirmacion" && (
            <div className="space-y-6">
              <div className="text-center">
                <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Confirmar Fusión</h3>
                <p className="text-gray-400">
                  Esta acción no se puede deshacer. El cliente secundario será eliminado y sus datos
                  transferidos al principal.
                </p>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium mb-1">Advertencia:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        El cliente &ldquo;{fusionData.clienteSecundario?.name}&rdquo; será eliminado
                        permanentemente
                      </li>
                      <li>Los datos seleccionados se transferirán al cliente principal</li>
                      <li>Esta operación quedará registrada en el log de auditoría</li>
                      <li>No es posible revertir esta acción una vez confirmada</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 5: Completado */}
          {paso === "completado" && (
            <div className="text-center space-y-6">
              <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
              <div>
                <h3 className="text-lg font-medium text-white mb-2">¡Fusión Completada!</h3>
                <p className="text-gray-400">
                  Los clientes han sido fusionados exitosamente. La operación ha sido registrada en
                  el log de auditoría.
                </p>
              </div>

              {loading && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  <span className="ml-2 text-gray-400">Procesando fusión...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {paso !== "completado" && (
          <div className="flex items-center justify-between p-6 border-t border-secondary-700">
            <button
              onClick={() => {
                if (paso === "seleccion") setPaso("busqueda");
                else if (paso === "revision") setPaso("seleccion");
                else if (paso === "confirmacion") setPaso("revision");
              }}
              disabled={paso === "busqueda" || loading}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={siguientePaso}
                disabled={
                  (paso === "busqueda" && !fusionData.clientePrincipal) ||
                  (paso === "seleccion" && !fusionData.clienteSecundario) ||
                  loading
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    {paso === "confirmacion" ? "Confirmar Fusión" : "Siguiente"}
                    {paso !== "confirmacion" && <ArrowRightIcon className="h-4 w-4 ml-2" />}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
