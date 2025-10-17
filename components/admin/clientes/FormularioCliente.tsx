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
  contactPreference: "PHONE" | "WHATSAPP" | "EMAIL" | "SMS";
  labels: string[];
  notes?: string;
  pickupPoints?: string; // texto multilínea
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
  onSave: (cliente: any) => void;
  mode?: "create" | "edit";
}

const CONTACT_PREFERENCES = [
  { value: "PHONE", label: "Teléfono", icon: PhoneIcon },
  { value: "WHATSAPP", label: "WhatsApp", icon: PhoneIcon },
  { value: "EMAIL", label: "Email", icon: EnvelopeIcon },
  { value: "SMS", label: "SMS", icon: PhoneIcon },
] as const;

const ETIQUETAS_PREDEFINIDAS = ["VIP", "FLOTA", "REFERIDO", "EMPRESA", "PARTICULAR", "FRECUENTE"];

const CONSENTIMIENTOS = [
  { key: "marketing", label: "Acepta recibir comunicaciones de marketing" },
  { key: "notifications", label: "Acepta recibir SMS y notificaciones" },
  { key: "dataProcessing", label: "Acepta el procesamiento de datos personales" },
  { key: "media", label: "Acepta fotos/videos del vehículo para documentación" },
];

const onlyDigits = (s = "") => s.replace(/\D/g, "");
const normalizeEmail = (s?: string) => (s ? s.trim().toLowerCase() : undefined);

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
    consents: { marketing: false, notifications: false, dataProcessing: false, media: false },
    isActive: true,
  });


  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [duplicados, setDuplicados] = useState<DuplicadoPotencial[]>([]);
  const [showDuplicados, setShowDuplicados] = useState(false);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const duplicadosTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (cliente) {
      setFormData({
        ...cliente,
        pickupPoints: typeof cliente.pickupPoints === "string" ? cliente.pickupPoints : "",
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
        consents: { marketing: false, notifications: false, dataProcessing: false, media: false },
        isActive: true,
      });
    }
    setErrors({});
    setDuplicados([]);
    setShowDuplicados(false);
  }, [cliente, isOpen]);

  const validateAll = (fd: Cliente) => {
    const errs: Record<string, string> = {};
    if (!fd.name?.trim()) errs.name = "El nombre es requerido";
    else if (fd.name.trim().length < 2) errs.name = "Mínimo 2 caracteres";

    if (!fd.phone?.trim()) errs.phone = "El teléfono es requerido";
    else if (!/^\+?[\d\s\-\(\)]+$/.test(fd.phone)) errs.phone = "Formato inválido";

    if (fd.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.email))
      errs.email = "Formato de email inválido";

    if (fd.altPhone && !/^\+?[\d\s\-\(\)]+$/.test(fd.altPhone))
      errs.altPhone = "Formato de teléfono alternativo inválido";

    if (fd.altPhone && onlyDigits(fd.altPhone) === onlyDigits(fd.phone))
      errs.altPhone = "No puede ser igual al teléfono principal";

    return errs;
  };

  const validateField = (field: string, value: any) => {
    const newFd = { ...formData, [field]: value } as Cliente;
    setErrors((prev) => ({ ...prev, ...validateAll(newFd) }));
  };

  const buscarDuplicados = async (phone: string, email?: string) => {
    if (!phone.trim() && !email?.trim()) return;
    try {
      const q = new URLSearchParams({
        ...(phone ? { phone: onlyDigits(phone) } : {}),
        ...(email ? { email: normalizeEmail(email)! } : {}),
      }).toString();

      const url = `/api/clients/exists?${q}`; // 👈 endpoint correcto
    console.log("EXISTS URL =>", url);
    const r = await fetch(url);

    const isJson = r.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await r.json() : await r.text();

    if (!r.ok) {
      console.warn("EXISTS non-OK:", r.status, data);
      setDuplicados([]);
      setShowDuplicados(false);
      return;
    }

    if (isJson && (data as any).exists && (data as any).match) {
      setDuplicados([{
        id: data.match.id,
        name: data.match.name,
        phone: data.match.phone,
        email: data.match.email || "",
        similarity: 100,
        reason: "Mismo teléfono/email",
      }]);
      setShowDuplicados(true);
    } else {
      setDuplicados([]);
      setShowDuplicados(false);
    }
  } catch (e) {
    console.error("Error buscando duplicados:", e);
  }
};

  const handleChange = (field: keyof Cliente, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field as string, value);

if (field === "phone" || field === "email") {
  if (duplicadosTimeoutRef.current) clearTimeout(duplicadosTimeoutRef.current);
  duplicadosTimeoutRef.current = setTimeout(() => {
    const next = { ...formData, [field]: value } as Cliente;
    buscarDuplicados(next.phone, next.email); // 👈 sólo phone/email
  }, 600);
}

  const handleConsentChange = (key: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      consents: { ...(prev.consents || {}), [key]: checked },
    }));
  };

  const agregarEtiqueta = (etiqueta: string) => {
    const tag = etiqueta.trim();
    if (tag && !formData.labels.includes(tag)) {
      setFormData((prev) => ({ ...prev, labels: [...prev.labels, tag] }));
    }
    setNuevaEtiqueta("");
  };

  const quitarEtiqueta = (etiqueta: string) => {
    setFormData((prev) => ({ ...prev, labels: prev.labels.filter((l) => l !== etiqueta) }));
  };

  const toServerPayload = (fd: Cliente) => {
    const cleanedPhone = fd.phone.replace(/\D/g, "");
    const cleanedAlt = fd.altPhone?.replace(/\D/g, "");

    return {
      // 🔹 Obligatorios
      name: fd.name.trim(),
      phone: cleanedPhone,

      // 🔹 Opcionales (solo se envían si traen algo)
      email: fd.email?.trim() ? fd.email.trim().toLowerCase() : "", // acepta "" en server
      alt_phone: cleanedAlt && cleanedAlt.length ? cleanedAlt : undefined,
      address: fd.address?.trim() ? fd.address.trim() : undefined,
      contact_preference: (fd.contactPreference || "PHONE").toUpperCase(),
      labels: fd.labels?.length ? fd.labels : undefined,
      pickup_points: fd.pickupPoints?.trim() ? fd.pickupPoints : null, // este sí puede ir null
      notes: fd.notes?.trim() ? fd.notes.trim() : undefined,
      consents: {
        marketing: !!fd.consents?.marketing,
        notifications: !!fd.consents?.notifications,
        dataProcessing: !!fd.consents?.dataProcessing,
        media: !!fd.consents?.media,
      },
      is_active: fd.isActive ?? true,
    };
  };

  const handleSave = async () => {
    const localErrors = validateAll(formData);
    setErrors(localErrors);
    if (Object.keys(localErrors).length) {
      useToast().showError("Error", "Por favor corrige los errores en el formulario");
      return;
    }

    try {
      setLoading(true);
      const payload = toServerPayload(formData);
      const url = mode === "edit" && cliente?.id ? `/api/clients/${cliente.id}` : "/api/clients";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : await res.text();

      if (res.ok) {
        showSuccess("Éxito", `Cliente ${mode === "edit" ? "actualizado" : "creado"} correctamente`);
        onSave(data);
        onClose();
        return;
      }

      if (res.status === 400 && isJson && (data as any)?.details?.fieldErrors) {
        const fe = (data as any).details.fieldErrors as Record<string, string[]>;
        const map: Record<string, string> = {};
        Object.entries(fe).forEach(([k, arr]) => (map[k] = arr?.[0] ?? "Campo inválido"));
        setErrors((prev) => ({ ...prev, ...map }));
        console.warn("VALIDATION 400 fieldErrors =>", fe); // 👈 te lo imprime en consola
        showError("Validación", "Revisa los campos marcados en rojo");
        return;
      }
            if (res.status === 201 || res.status === 200) {
        const data = await res.json();
        showSuccess("Éxito", `Cliente ${mode === "edit" ? "actualizado" : "creado"} correctamente`);
        onSave(data);
        onClose();
        return;
      }

      if (res.status === 409) {
        const data = await res.json();
        if (data?.match) {
          setDuplicados([
            {
              id: data.match.id,
              name: data.match.name,
              phone: data.match.phone,
              email: data.match.email,
              similarity: 100,
              reason: "Conflicto de duplicado",
            },
          ]);
          setShowDuplicados(true);
        }
        showError("Duplicado", "Ya existe un cliente con ese teléfono o email");
        return;
      }

      const err = await res.json().catch(() => ({}));
      showError("Error", err?.error || "No se pudo guardar el cliente");
    } catch (e) {
      console.error(e);
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

        {/* Duplicados */}
        {showDuplicados && duplicados.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-400 mb-2">
                  Posibles clientes duplicados encontrados
                </h3>
                <div className="space-y-2">
                  {duplicados.map((d) => (
                    <div key={d.id} className="flex items-center justify-between bg-secondary-700 p-3 rounded">
                      <div>
                        <div className="text-sm text-white">{d.name}</div>
                        <div className="text-xs text-gray-400">
                          {d.phone} {d.email && `• ${d.email}`}
                        </div>
                        <div className="text-xs text-yellow-400">
                          Similitud: {d.similarity}% • {d.reason}
                        </div>
                      </div>
                      {/* Botón de fusión lo activaremos cuando implementemos /api/clients/merge */}
                      <button
                        disabled
                        className="px-3 py-1 bg-yellow-900/40 text-yellow-300 text-xs rounded cursor-not-allowed"
                        title="La fusión se habilitará pronto"
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

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Información Personal
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre completo *</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono principal *</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono alternativo</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Preferencia de contacto</label>
                <select
                  value={formData.contactPreference}
                  onChange={(e) => handleChange("contactPreference", e.target.value as Cliente["contactPreference"])}
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
                      <button onClick={() => quitarEtiqueta(label)} className="ml-1 text-blue-300 hover:text-blue-200">
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
                  {ETIQUETAS_PREDEFINIDAS.filter((e) => !formData.labels.includes(e)).map((etiqueta) => (
                    <button
                      key={etiqueta}
                      onClick={() => agregarEtiqueta(etiqueta)}
                      className="px-2 py-1 text-xs bg-secondary-700 text-gray-300 rounded hover:bg-secondary-600 transition-colors"
                    >
                      {etiqueta}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Puntos de recogida/entrega</label>
                <textarea
                  value={formData.pickupPoints || ""}
                  onChange={(e) => handleChange("pickupPoints", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Direcciones alternativas para recogida o entrega (una por línea)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notas adicionales</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-3">Consentimientos</label>
                <div className="space-y-2">
                  {CONSENTIMIENTOS.map((c) => (
                    <label key={c.key} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={!!formData.consents?.[c.key]}
                        onChange={(e) => handleConsentChange(c.key, e.target.checked)}
                        className="mt-0.5 h-4 w-4 text-blue-600 bg-secondary-700 border-secondary-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300 leading-5">{c.label}</span>
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
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
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
