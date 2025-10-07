"use client";

import { createQuoteFollowupReminder } from "@/lib/calendar-integration";
import { Customer, Quote, QuoteItem, Vehicle, WorkOrder } from "@/types";
import {
  CalendarIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";

interface EditorCotizacionProps {
  quote: Quote | null;
  onSave: () => void;
  onCancel: () => void;
}

const EditorCotizacion: React.FC<EditorCotizacionProps> = ({ quote, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  // Datos del formulario
  const [selectedClientId, setSelectedClientId] = useState(quote?.clientId || "");
  const [selectedVehicleId, setSelectedVehicleId] = useState(quote?.vehicleId || "");
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(quote?.workOrderId || "");
  const [fechaCreacion] = useState(quote?.fechaCreacion || new Date());
  const [vencimientoAt, setVencimientoAt] = useState(
    quote?.vencimientoAt || new Date(Date.now() + 72 * 60 * 60 * 1000)
  );
  const [moneda] = useState<"GTQ" | "USD">(quote?.moneda || "GTQ");
  const [items, setItems] = useState<QuoteItem[]>(quote?.items || []);
  const [termsVersion] = useState(quote?.termsVersion || "1.0");

  // Estados del enlace público
  const [publicToken, setPublicToken] = useState(quote?.publicToken || "");
  const [publicExpiresAt, setPublicExpiresAt] = useState(quote?.publicExpiresAt || null);

  // Estado de seguimiento de calendario
  const [crearSeguimientoCalendario, setCrearSeguimientoCalendario] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadVehicles(selectedClientId);
    }
  }, [selectedClientId]);

  useEffect(() => {
    if (selectedVehicleId) {
      loadWorkOrders(selectedVehicleId);
    }
  }, [selectedVehicleId]);

  const loadClients = useCallback(async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setClients(data.data);
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  }, []);

  const loadVehicles = useCallback(async (clientId: string) => {
    try {
      const response = await fetch(`/api/customers/${clientId}/vehicles`);
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.data);
      }
    } catch (error) {
      console.error("Error cargando vehículos:", error);
    }
  }, []);

  const loadWorkOrders = useCallback(async (vehicleId: string) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/work-orders`);
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data.data);
      }
    } catch (error) {
      console.error("Error cargando órdenes de trabajo:", error);
    }
  }, []);

  const addItem = () => {
    const newItem: QuoteItem = {
      id: `temp_${Date.now()}`,
      quoteId: quote?.id || "",
      concepto: "",
      descripcion: "",
      cantidad: 1,
      precioUnitario: 0,
      tipo: "SERVICIO",
      nota: "",
      orden: items.length + 1,
      subtotal: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Recalcular subtotal
    if (field === "cantidad" || field === "precioUnitario") {
      updatedItems[index].subtotal =
        updatedItems[index].cantidad * updatedItems[index].precioUnitario;
    }

    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const impuestos = subtotal * 0.12; // IVA 12%
    const descuento = 0; // Por ahora sin descuentos
    const total = subtotal + impuestos - descuento;

    return { subtotal, impuestos, descuento, total };
  };

  const handleSave = async () => {
    if (!selectedClientId || !selectedVehicleId || items.length === 0) {
      alert("Complete todos los campos requeridos");
      return;
    }

    try {
      setLoading(true);
      const totals = calculateTotals();

      const quoteData = {
        clientId: selectedClientId,
        vehicleId: selectedVehicleId,
        workOrderId: selectedWorkOrderId || null,
        fechaCreacion,
        vencimientoAt,
        moneda,
        subtotal: totals.subtotal,
        impuestos: totals.impuestos,
        descuento: totals.descuento,
        total: totals.total,
        items,
        termsVersion,
      };

      const url = quote ? `/api/cotizaciones/${quote.id}` : "/api/cotizaciones";
      const method = quote ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(quote ? "Cotización actualizada exitosamente" : "Cotización creada exitosamente");

        // Crear seguimiento de calendario si está habilitado
        if (crearSeguimientoCalendario && result.data?.id) {
          try {
            await createQuoteFollowupReminder(result.data.id, selectedClientId, selectedVehicleId);
            alert("Recordatorio de seguimiento programado en el calendario");
          } catch (error) {
            console.error("Error al crear seguimiento de calendario:", error);
            // No interrumpir el flujo principal por este error
          }
        }

        onSave();
      } else {
        alert("Error al guardar la cotización");
      }
    } catch (error) {
      console.error("Error guardando cotización:", error);
      alert("Error al guardar la cotización");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!quote?.id) {
      alert("Debe guardar la cotización primero");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/cotizaciones/${quote.id}/generate-link`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setPublicToken(data.data.token);
        setPublicExpiresAt(new Date(data.data.expiresAt));
        alert("Enlace generado exitosamente");
      } else {
        alert("Error al generar enlace");
      }
    } catch (error) {
      console.error("Error generando enlace:", error);
      alert("Error al generar enlace");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publicToken) {
      alert("Debe generar el enlace primero");
      return;
    }

    const publicUrl = `${window.location.origin}/cotizacion/${publicToken}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      alert("Enlace copiado al portapapeles");
    } catch (error) {
      console.error("Error copiando enlace:", error);
      alert("Error al copiar enlace");
    }
  };

  const isLinkExpired = () => {
    if (!publicExpiresAt) return false;
    return new Date(publicExpiresAt) < new Date();
  };

  const { subtotal, impuestos, descuento, total } = calculateTotals();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-secondary-600 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            {quote ? "Editar Cotización" : "Nueva Cotización"}
          </h2>
          <p className="text-gray-400">Complete los datos de la cotización</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="h-5 w-5 inline mr-2" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            <CheckIcon className="h-5 w-5 inline mr-2" />
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Cliente *</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Vehículo *</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!selectedClientId}
            >
              <option value="">Seleccionar vehículo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} {vehicle.year} - {vehicle.licensePlate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Orden de Trabajo</label>
            <select
              value={selectedWorkOrderId}
              onChange={(e) => setSelectedWorkOrderId(e.target.value)}
              className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedVehicleId}
            >
              <option value="">Sin OT asociada</option>
              {workOrders.map((wo) => (
                <option key={wo.id} value={wo.id}>
                  OT-{wo.trackingCode} - {wo.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Fecha de Creación
            </label>
            <input
              type="date"
              value={fechaCreacion.toISOString().split("T")[0]}
              className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Fecha de Vencimiento *
            </label>
            <input
              type="date"
              value={vencimientoAt.toISOString().split("T")[0]}
              onChange={(e) => setVencimientoAt(new Date(e.target.value))}
              className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Moneda</label>
            <select
              value={moneda}
              className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled
            >
              <option value="GTQ">Quetzales (GTQ)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estado del enlace público */}
      {quote && (
        <div className="bg-secondary-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Enlace Público</h3>
              {publicToken ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Estado:{" "}
                    {isLinkExpired() ? (
                      <span className="text-red-400">Expirado</span>
                    ) : (
                      <span className="text-green-400">Vigente</span>
                    )}
                  </p>
                  {publicExpiresAt && (
                    <p className="text-sm text-gray-400">
                      Expira: {new Date(publicExpiresAt).toLocaleString("es-GT")}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No se ha generado enlace público</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleGenerateLink}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                <LinkIcon className="h-5 w-5 inline mr-2" />
                {publicToken ? "Renovar" : "Generar"} Enlace
              </button>
              {publicToken && (
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <ClipboardDocumentIcon className="h-5 w-5 inline mr-2" />
                  Copiar Enlace
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Items de la Cotización</h3>
          <button
            onClick={addItem}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5 inline mr-2" />
            Agregar Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-600">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Concepto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Cant.</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  Precio Unit.
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Subtotal</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-secondary-600">
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={item.concepto}
                      onChange={(e) => updateItem(index, "concepto", e.target.value)}
                      placeholder="Descripción del servicio/repuesto"
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-500 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={item.tipo}
                      onChange={(e) => updateItem(index, "tipo", e.target.value)}
                      className="w-full px-3 py-2 bg-secondary-700 border border-secondary-500 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="SERVICIO">Servicio</option>
                      <option value="MO">Mano de Obra</option>
                      <option value="REPUESTO">Repuesto</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) =>
                        updateItem(index, "cantidad", parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="0.01"
                      className="w-20 px-3 py-2 bg-secondary-700 border border-secondary-500 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={item.precioUnitario}
                      onChange={(e) =>
                        updateItem(index, "precioUnitario", parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="0.01"
                      className="w-32 px-3 py-2 bg-secondary-700 border border-secondary-500 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {moneda} {item.subtotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-20 rounded transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No hay items en la cotización</p>
              <button
                onClick={addItem}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="h-5 w-5 inline mr-2" />
                Agregar primer item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Opciones Adicionales */}
      <div className="bg-secondary-600 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Opciones de Seguimiento</h3>

        {/* Opción de Seguimiento de Calendario */}
        <div className="flex items-center justify-between p-4 bg-secondary-700/30 rounded-lg border border-secondary-500">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Programar seguimiento automático</h4>
              <p className="text-sm text-gray-400">
                Crear recordatorio para contactar al cliente en 3 días
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={crearSeguimientoCalendario}
              onChange={(e) => setCrearSeguimientoCalendario(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-secondary-600 peer-focus:ring-2 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>

      {/* Totales */}
      <div className="bg-secondary-600 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Resumen</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal:</span>
            <span>
              {moneda} {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>IVA (12%):</span>
            <span>
              {moneda} {impuestos.toFixed(2)}
            </span>
          </div>
          {descuento > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>Descuento:</span>
              <span>
                -{moneda} {descuento.toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-secondary-500 pt-2">
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Total:</span>
              <span>
                {moneda} {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorCotizacion;
