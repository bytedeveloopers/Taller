"use client";

import { QuoteApprovalData, QuotePublicView } from "@/types";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

interface LandingCotizacionProps {
  token: string;
}

const LandingCotizacion: React.FC<LandingCotizacionProps> = ({ token }) => {
  const [quote, setQuote] = useState<QuotePublicView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Estados del formulario de respuesta
  const [decision, setDecision] = useState<"approve" | "reject" | "adjust" | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [clientComments, setClientComments] = useState("");
  const [adjustmentRequest, setAdjustmentRequest] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [signature, setSignature] = useState("");

  useEffect(() => {
    loadQuote();
  }, [token]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cotizaciones/public/${token}`);
      if (response.ok) {
        const data = await response.json();
        setQuote(data.data);
        setContactPhone(data.data.cliente.telefono || "");
      } else if (response.status === 404) {
        setError("Cotización no encontrada o enlace inválido");
      } else if (response.status === 410) {
        setError("Esta cotización ha expirado");
      } else {
        setError("Error al cargar la cotización");
      }
    } catch (error) {
      console.error("Error cargando cotización:", error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!decision) {
      alert("Debe seleccionar una opción");
      return;
    }

    if (decision === "approve" && !acceptedTerms) {
      alert("Debe aceptar los términos y condiciones para aprobar");
      return;
    }

    if (decision === "adjust" && !adjustmentRequest.trim()) {
      alert("Debe especificar los ajustes solicitados");
      return;
    }

    try {
      setSubmitting(true);

      const approvalData: QuoteApprovalData = {
        approved: decision === "approve",
        acceptedTerms,
        clientComments: clientComments.trim(),
        adjustmentRequest: decision === "adjust" ? adjustmentRequest.trim() : undefined,
        contactPhone: contactPhone.trim(),
        signature: signature.trim(),
        ip: "", // Se obtiene en el backend
        userAgent: navigator.userAgent,
      };

      const response = await fetch(`/api/cotizaciones/public/${token}/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(approvalData),
      });

      if (response.ok) {
        // Recargar para mostrar el estado actualizado
        await loadQuote();
        alert(
          decision === "approve"
            ? "¡Cotización aprobada exitosamente!"
            : decision === "reject"
            ? "Cotización rechazada. Nos pondremos en contacto con usted."
            : "Solicitud de ajuste enviada. Nos pondremos en contacto con usted."
        );
      } else {
        alert("Error al enviar respuesta. Inténtelo nuevamente.");
      }
    } catch (error) {
      console.error("Error enviando respuesta:", error);
      alert("Error de conexión. Inténtelo nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cotización...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const canRespond = ["ENVIADA", "VISTA"].includes(quote.estado) && !quote.isExpired;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del taller */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {quote.taller.logo && (
                <img
                  src={quote.taller.logo}
                  alt={quote.taller.nombre}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{quote.taller.nombre}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{quote.taller.telefono}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>{quote.taller.email}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Cotización</p>
              <p className="text-lg font-bold text-gray-900">
                COT-{new Date(quote.fechaCreacion).getFullYear()}-001
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Estado y fechas */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Estado de la Cotización</h2>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    quote.estado === "APROBADA"
                      ? "bg-green-100 text-green-800"
                      : quote.estado === "RECHAZADA"
                      ? "bg-red-100 text-red-800"
                      : quote.estado === "AJUSTE_SOLICITADO"
                      ? "bg-orange-100 text-orange-800"
                      : quote.isExpired
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {quote.isExpired ? "Expirada" : quote.estado.replace("_", " ")}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Creada: {new Date(quote.fechaCreacion).toLocaleDateString("es-GT")}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span className={quote.isExpired ? "text-red-600" : ""}>
                    Vence: {new Date(quote.vencimientoAt).toLocaleDateString("es-GT")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del cliente y vehículo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <UserIcon className="h-6 w-6 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Cliente</h3>
            </div>
            <div>
              <p className="font-medium text-gray-900">{quote.cliente.nombre}</p>
              {quote.cliente.telefono && <p className="text-gray-600">{quote.cliente.telefono}</p>}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TruckIcon className="h-6 w-6 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Vehículo</h3>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {quote.vehiculo.marca} {quote.vehiculo.modelo} {quote.vehiculo.anio}
              </p>
              {quote.vehiculo.placa && (
                <p className="text-gray-600">Placa: {quote.vehiculo.placa}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items de la cotización */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Detalle de Servicios</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                    Concepto
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Tipo</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-gray-700">
                    Cantidad
                  </th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-gray-700">
                    Precio Unit.
                  </th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-gray-700">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{item.concepto}</p>
                        {item.descripcion && (
                          <p className="text-sm text-gray-600">{item.descripcion}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                        {item.tipo}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-900">{item.cantidad}</td>
                    <td className="py-4 px-6 text-right text-gray-900">
                      {quote.moneda} {item.precioUnitario.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-gray-900">
                      {quote.moneda} {item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>
                    {quote.moneda} {quote.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>IVA (12%):</span>
                  <span>
                    {quote.moneda} {quote.impuestos.toFixed(2)}
                  </span>
                </div>
                {quote.descuento > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Descuento:</span>
                    <span>
                      -{quote.moneda} {quote.descuento.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between text-gray-900 font-bold text-lg">
                    <span>Total:</span>
                    <span>
                      {quote.moneda} {quote.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Imágenes */}
        {quote.imagenes && quote.imagenes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidencias Fotográficas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quote.imagenes.map((imagen, index) => (
                <img
                  key={index}
                  src={imagen}
                  alt={`Evidencia ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => window.open(imagen, "_blank")}
                />
              ))}
            </div>
          </div>
        )}

        {/* Formulario de respuesta */}
        {canRespond && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Su Respuesta</h3>

            {/* Opciones de decisión */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setDecision("approve")}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  decision === "approve"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="font-medium">Aprobar</p>
                <p className="text-sm text-gray-600">Acepto la cotización</p>
              </button>

              <button
                onClick={() => setDecision("reject")}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  decision === "reject"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                <XCircleIcon className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="font-medium">Rechazar</p>
                <p className="text-sm text-gray-600">No acepto la cotización</p>
              </button>

              <button
                onClick={() => setDecision("adjust")}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  decision === "adjust"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <PencilIcon className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="font-medium">Solicitar Ajuste</p>
                <p className="text-sm text-gray-600">Pedir modificaciones</p>
              </button>
            </div>

            {/* Campos adicionales según la decisión */}
            {decision === "approve" && (
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                    Acepto los términos y condiciones. Autorizo el inicio de los trabajos según la
                    cotización presentada.
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firma (opcional)
                  </label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Escriba su nombre completo como firma"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {decision === "adjust" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especifique los ajustes solicitados *
                </label>
                <textarea
                  value={adjustmentRequest}
                  onChange={(e) => setAdjustmentRequest(e.target.value)}
                  placeholder="Describa qué modificaciones necesita en la cotización..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {/* Comentarios generales */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                value={clientComments}
                onChange={(e) => setClientComments(e.target.value)}
                placeholder="Cualquier comentario o consulta adicional..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Teléfono de contacto */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono de contacto
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Número de teléfono para contacto"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Botón de envío */}
            <button
              onClick={handleSubmitResponse}
              disabled={!decision || submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {submitting ? "Enviando..." : "Enviar Respuesta"}
            </button>
          </div>
        )}

        {/* Estado final si ya fue respondida */}
        {!canRespond && !quote.isExpired && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 text-center">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                quote.estado === "APROBADA"
                  ? "bg-green-100"
                  : quote.estado === "RECHAZADA"
                  ? "bg-red-100"
                  : "bg-orange-100"
              }`}
            >
              {quote.estado === "APROBADA" ? (
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              ) : quote.estado === "RECHAZADA" ? (
                <XCircleIcon className="h-8 w-8 text-red-600" />
              ) : (
                <PencilIcon className="h-8 w-8 text-orange-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {quote.estado === "APROBADA"
                ? "¡Cotización Aprobada!"
                : quote.estado === "RECHAZADA"
                ? "Cotización Rechazada"
                : "Ajuste Solicitado"}
            </h3>
            <p className="text-gray-600">
              {quote.estado === "APROBADA"
                ? "Gracias por aprobar nuestra cotización. Nos pondremos en contacto para coordinar el inicio de los trabajos."
                : quote.estado === "RECHAZADA"
                ? "Gracias por su tiempo. Si tiene alguna consulta, no dude en contactarnos."
                : "Hemos recibido su solicitud de ajuste. Nos pondremos en contacto con una nueva propuesta."}
            </p>
          </div>
        )}

        {/* Footer con información de contacto */}
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Necesita más información?</h3>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <PhoneIcon className="h-5 w-5" />
              <span>{quote.taller.telefono}</span>
            </div>
            <div className="flex items-center space-x-2">
              <EnvelopeIcon className="h-5 w-5" />
              <span>{quote.taller.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5" />
              <span>{quote.taller.direccion}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingCotizacion;
