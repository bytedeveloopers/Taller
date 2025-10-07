"use client";

import { useToast } from "@/components/ui/ToastNotification";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface ClienteRapido {
  name: string;
  phone: string;
  email?: string;
  contactPreference: string;
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
  onClienteCreado: (cliente: any) => void;
  prefilledData?: Partial<ClienteRapido>;
}

const CONTACT_PREFERENCES = [
  { value: "PHONE", label: "Teléfono" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "Email" },
];

export default function AltaRapidaCliente({
  isOpen,
  onClose,
  onClienteCreado,
  prefilledData,
}: Props) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<ClienteRapido>({
    name: "",
    phone: "",
    email: "",
    contactPreference: "PHONE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [duplicados, setDuplicados] = useState<DuplicadoPotencial[]>([]);
  const [showDuplicados, setShowDuplicados] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  // Inicializar formulario
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: prefilledData?.name || "",
        phone: prefilledData?.phone || "",
        email: prefilledData?.email || "",
        contactPreference: prefilledData?.contactPreference || "PHONE",
      });
      setErrors({});
      setDuplicados([]);
      setShowDuplicados(false);
    }
  }, [isOpen, prefilledData]);

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
    }

    setErrors(newErrors);
  };

  // Buscar duplicados potenciales
  const buscarDuplicados = async (name: string, phone: string, email?: string) => {
    if (!name.trim() && !phone.trim()) return;

    try {
      setCheckingDuplicates(true);
      const params = new URLSearchParams({
        search: `${name} ${phone} ${email || ""}`.trim(),
        detectDuplicates: "true",
        limit: "5",
      });

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
    } finally {
      setCheckingDuplicates(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);

    // Buscar duplicados para campos clave con debounce
    if (["name", "phone"].includes(field)) {
      setTimeout(() => {
        const newFormData = { ...formData, [field]: value };
        if (newFormData.name.trim() || newFormData.phone.trim()) {
          buscarDuplicados(newFormData.name, newFormData.phone, newFormData.email);
        }
      }, 800);
    }
  };

  // Usar cliente existente en lugar de crear uno nuevo
  const usarClienteExistente = (clienteId: string) => {
    // Buscar el cliente completo en los duplicados
    const cliente = duplicados.find((d) => d.id === clienteId);
    if (cliente) {
      onClienteCreado({
        id: cliente.id,
        name: cliente.name,
        phone: cliente.phone,
        email: cliente.email,
      });
      onClose();
    }
  };

  // Guardar cliente nuevo
  const handleSave = async () => {
    // Validar todos los campos
    validateField("name", formData.name);
    validateField("phone", formData.phone);
    validateField("email", formData.email);

    if (Object.keys(errors).length > 0) {
      showError("Error", "Por favor corrige los errores en el formulario");
      return;
    }

    try {
      setLoading(true);

      const clienteData = {
        ...formData,
        labels: ["RAPIDO"], // Etiqueta especial para clientes creados rápidamente
        isActive: true,
        notes: "Cliente creado mediante alta rápida desde recepción",
      };

      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteData),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess("Éxito", "Cliente creado correctamente");
        onClienteCreado(result.data);
        onClose();
      } else {
        showError("Error", result.error || "No se pudo crear el cliente");
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
      <div className="bg-secondary-800 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold text-white">Alta Rápida de Cliente</h2>
              <p className="text-sm text-gray-400">Registro Express para Recepción</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Alerta de duplicados */}
        {showDuplicados && duplicados.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-400 mb-2">
                  Clientes similares encontrados
                </h3>
                <div className="space-y-2">
                  {duplicados.slice(0, 3).map((duplicado) => (
                    <div
                      key={duplicado.id}
                      className="flex items-center justify-between bg-secondary-700 p-2 rounded"
                    >
                      <div>
                        <div className="text-sm text-white">{duplicado.name}</div>
                        <div className="text-xs text-gray-400">{duplicado.phone}</div>
                      </div>
                      <button
                        onClick={() => usarClienteExistente(duplicado.id)}
                        className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                      >
                        Usar
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-yellow-300 mt-2">
                  ¿Es uno de estos clientes? Selecciona &ldquo;Usar&rdquo; para evitar duplicados.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="p-6 space-y-4">
          {/* Nombre */}
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

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono *</label>
            <div className="relative">
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={`w-full px-3 py-2 bg-secondary-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? "border-red-500" : "border-secondary-600"
                }`}
                placeholder="+502 1234-5678"
              />
              {checkingDuplicates && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
          </div>

          {/* Email (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email (opcional)</label>
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

          {/* Preferencia de contacto */}
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

          {/* Información adicional */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Registro Express</p>
                <p>
                  Este cliente será marcado con la etiqueta &ldquo;RÁPIDO&rdquo; y podrás completar
                  su información más tarde desde la sección de Clientes.
                </p>
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
            disabled={
              loading ||
              Object.keys(errors).length > 0 ||
              !formData.name.trim() ||
              !formData.phone.trim()
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-secondary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Crear Cliente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
