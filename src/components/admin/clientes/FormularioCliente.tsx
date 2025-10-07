"use client";

import { useToast } from "@/components/ui/ToastNotification";
import {
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  TagIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

interface Cliente {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  altPhone?: string;
  address?: string;
  contactPreference: string;
  labels: string[];
  notes?: string;
  pickupPoints?: string;
  consents?: Record<string, boolean>;
  isActive: boolean;
}

interface DuplicadoPotencial {
  id: string;
  name: string;
  phone: string;
  email?: string;
  similarity: number;
  reason: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cliente?: Cliente;
  onSave: (cliente: Cliente) => void;
  mode?: "create" | "edit";
}

const CONTACT_PREFERENCES = [
  { value: "PHONE", label: "Teléfono", icon: PhoneIcon },
  { value: "WHATSAPP", label: "WhatsApp", icon: PhoneIcon },
  { value: "EMAIL", label: "Email", icon: EnvelopeIcon },
];

const ETIQUETAS_PREDEFINIDAS = ["VIP", "FLOTA", "REFERIDO", "EMPRESA", "PARTICULAR", "FRECUENTE"];

const CONSENTIMIENTOS = [
  { key: "marketing", label: "Acepta recibir comunicaciones de marketing" },
  { key: "sms", label: "Acepta recibir SMS y notificaciones" },
  { key: "dataProcessing", label: "Acepta el procesamiento de datos personales" },
  { key: "photosVideo", label: "Acepta fotos/videos del vehículo para documentación" },
];

export default function FormularioCliente({
  isOpen,
  onClose,
  cliente,
  onSave,
  mode = "create",
}: Props) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<Cliente>({
    name: "",
    phone: "",
    email: "",
    altPhone: "",
    address: "",
    contactPreference: "PHONE",
    labels: [],
    notes: "",
    pickupPoints: "",
    consents: {},
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [duplicados, setDuplicados] = useState<DuplicadoPotencial[]>([]);
  const [showDuplicados, setShowDuplicados] = useState(false);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const duplicadosTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar formulario cuando cambia el cliente
  useEffect(() => {
    if (cliente) {
      setFormData({
        ...cliente,
        pickupPoints:
          typeof cliente.pickupPoints === "string"
            ? cliente.pickupPoints
            : JSON.stringify(cliente.pickupPoints || {}),
        consents: cliente.consents || {},
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        email: "",
        altPhone: "",
        address: "",
        contactPreference: "PHONE",
        labels: [],
        notes: "",
        pickupPoints: "",
        consents: {},
        isActive: true,
      });
    }
    setErrors({});
    setDuplicados([]);
    setShowDuplicados(false);
  }, [cliente, isOpen]);

  // Validar campo individual
  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "El nombre es requerido";
        } else if (value.trim().length < 2) {
          newErrors.name = "El nombre debe tener al menos 2 caracteres";
        } else {
          delete newErrors.name;
        }
        break;

      case "phone":
        if (!value.trim()) {
          newErrors.phone = "El teléfono es requerido";
        } else if (!/^\+?[\d\s\-\(\)]+$/.test(value)) {
          newErrors.phone = "Formato de teléfono inválido";
        } else {
          delete newErrors.phone;
        }
        break;

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Formato de email inválido";
        } else {
          delete newErrors.email;
        }
        break;

      case "altPhone":
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
          newErrors.altPhone = "Formato de teléfono alternativo inválido";
        } else {
          delete newErrors.altPhone;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Buscar duplicados potenciales
  const buscarDuplicados = async (name: string, phone: string, email?: string) => {
    if (!name.trim() && !phone.trim()) return;

    try {
      const params = new URLSearchParams({
        search: `${name} ${phone} ${email || ""}`.trim(),
        detectDuplicates: "true",
      });

      if (mode === "edit" && cliente?.id) {
        params.set("excludeId", cliente.id);
      }

      const response = await fetch(`/api/clients?${params}`);
      const result = await response.json();

      if (result.success && result.duplicates && result.duplicates.length > 0) {
        setDuplicados(result.duplicates);
        setShowDuplicados(true);
      } else {
        setDuplicados([]);
        setShowDuplicados(false);
      }
    } catch (error) {
      console.error("Error buscando duplicados:", error);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);

    // Buscar duplicados para campos clave
    if (["name", "phone", "email"].includes(field)) {
      if (duplicadosTimeoutRef.current) {
        clearTimeout(duplicadosTimeoutRef.current);
      }

      duplicadosTimeoutRef.current = setTimeout(() => {
        const newFormData = { ...formData, [field]: value };
        buscarDuplicados(newFormData.name, newFormData.phone, newFormData.email);
      }, 1000);
    }
  };

  // Manejar consentimientos
  const handleConsentChange = (key: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      consents: {
        ...prev.consents,
        [key]: checked,
      },
    }));
  };

  // Agregar etiqueta
  const agregarEtiqueta = (etiqueta: string) => {
    if (etiqueta && !formData.labels.includes(etiqueta)) {
      setFormData((prev) => ({
        ...prev,
        labels: [...prev.labels, etiqueta],
      }));
    }
    setNuevaEtiqueta("");
  };

  // Quitar etiqueta
  const quitarEtiqueta = (etiqueta: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.filter((l) => l !== etiqueta),
    }));
  };

  // Fusionar con duplicado
  const fusionarConDuplicado = async (duplicadoId: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/clients/fusionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryId: duplicadoId,
          secondaryData: formData,
          mergeStrategy: "keepPrimary",
        }),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess("Éxito", "Cliente fusionado correctamente");
        onClose();
        // Opcional: redirigir a la ficha del cliente fusionado
      } else {
        showError("Error", result.error || "No se pudo fusionar el cliente");
      }
    } catch (error) {
      console.error("Error fusionando cliente:", error);
      showError("Error", "Error de conexión al fusionar cliente");
    } finally {
      setLoading(false);
    }
  };

  // Guardar cliente
  const handleSave = async () => {
    // Validar todos los campos
    validateField("name", formData.name);
    validateField("phone", formData.phone);
    validateField("email", formData.email);
    validateField("altPhone", formData.altPhone);

    if (Object.keys(errors).length > 0) {
      showError("Error", "Por favor corrige los errores en el formulario");
      return;
    }

    try {
      setLoading(true);

      const clienteData = {
        ...formData,
        pickupPoints: formData.pickupPoints || null,
      };

      const url = mode === "edit" && cliente?.id ? `/api/clients/${cliente.id}` : "/api/clients";

      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteData),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess("Éxito", `Cliente ${mode === "edit" ? "actualizado" : "creado"} correctamente`);
        onSave(result.data);
        onClose();
      } else {
        showError(
          "Error",
          result.error || `No se pudo ${mode === "edit" ? "actualizar" : "crear"} el cliente`
        );
      }
    } catch (error) {
      console.error("Error guardando cliente:", error);
      showError("Error", "Error de conexión al guardar cliente");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-secondary-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <h2 className="text-xl font-semibold text-white">
            {mode === "edit" ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Alerta de duplicados */}
        {showDuplicados && duplicados.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-400 mb-2">
                  Posibles clientes duplicados encontrados
                </h3>
                <div className="space-y-2">
                  {duplicados.map((duplicado) => (
                    <div
                      key={duplicado.id}
                      className="flex items-center justify-between bg-secondary-700 p-3 rounded"
                    >
                      <div>
                        <div className="text-sm text-white">{duplicado.name}</div>
                        <div className="text-xs text-gray-400">
                          {duplicado.phone} {duplicado.email && `• ${duplicado.email}`}
                        </div>
                        <div className="text-xs text-yellow-400">
                          Similitud: {duplicado.similarity}% • {duplicado.reason}
                        </div>
                      </div>
                      <button
                        onClick={() => fusionarConDuplicado(duplicado.id)}
                        className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                      >
                        Fusionar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido del formulario */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Información Personal
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full px-3 py-2 bg-secondary-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : "border-secondary-600"
                  }`}
                  placeholder="Juan Pérez"
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Teléfono principal *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`w-full px-3 py-2 bg-secondary-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? "border-red-500" : "border-secondary-600"
                  }`}
                  placeholder="+502 1234-5678"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full px-3 py-2 bg-secondary-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : "border-secondary-600"
                  }`}
                  placeholder="juan@ejemplo.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Teléfono alternativo
                </label>
                <input
                  type="text"
                  value={formData.altPhone || ""}
                  onChange={(e) => handleChange("altPhone", e.target.value)}
                  className={`w-full px-3 py-2 bg-secondary-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.altPhone ? "border-red-500" : "border-secondary-600"
                  }`}
                  placeholder="+502 8765-4321"
                />
                {errors.altPhone && <p className="mt-1 text-sm text-red-400">{errors.altPhone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
                <textarea
                  value={formData.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dirección completa del cliente"
                />
              </div>
            </div>

            {/* Preferencias y Configuración */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                Preferencias y Configuración
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Preferencia de contacto
                </label>
                <select
                  value={formData.contactPreference}
                  onChange={(e) => handleChange("contactPreference", e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CONTACT_PREFERENCES.map((pref) => (
                    <option key={pref.value} value={pref.value}>
                      {pref.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Etiquetas</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    >
                      {label}
                      <button
                        onClick={() => quitarEtiqueta(label)}
                        className="ml-1 text-blue-300 hover:text-blue-200"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={nuevaEtiqueta}
                    onChange={(e) => setNuevaEtiqueta(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        agregarEtiqueta(nuevaEtiqueta);
                      }
                    }}
                    className="flex-1 px-3 py-1 bg-secondary-700 border border-secondary-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Nueva etiqueta..."
                  />
                  <button
                    onClick={() => agregarEtiqueta(nuevaEtiqueta)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ETIQUETAS_PREDEFINIDAS.filter((e) => !formData.labels.includes(e)).map(
                    (etiqueta) => (
                      <button
                        key={etiqueta}
                        onClick={() => agregarEtiqueta(etiqueta)}
                        className="px-2 py-1 text-xs bg-secondary-700 text-gray-300 rounded hover:bg-secondary-600 transition-colors"
                      >
                        {etiqueta}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Puntos de recogida/entrega
                </label>
                <textarea
                  value={formData.pickupPoints || ""}
                  onChange={(e) => handleChange("pickupPoints", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Direcciones alternativas para recogida o entrega"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Información adicional sobre el cliente"
                />
              </div>

              {/* Consentimientos */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Consentimientos
                </label>
                <div className="space-y-2">
                  {CONSENTIMIENTOS.map((consent) => (
                    <label key={consent.key} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.consents?.[consent.key] || false}
                        onChange={(e) => handleConsentChange(consent.key, e.target.checked)}
                        className="mt-0.5 h-4 w-4 text-blue-600 bg-secondary-700 border-secondary-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300 leading-5">{consent.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Estado activo */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="h-4 w-4 text-blue-600 bg-secondary-700 border-secondary-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-300">Cliente activo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-secondary-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-secondary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                {mode === "edit" ? "Actualizar" : "Crear"} Cliente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
