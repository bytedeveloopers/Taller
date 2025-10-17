// src/components/admin/tecnicos/FormularioTecnico.tsx
"use client";

import type { Technician } from "@/types";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type BlockType = "VACATION" | "SICK_LEAVE" | "TRAINING" | "OTHER";

interface BlockedDate {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
  type: BlockType;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  password: string; // solo creación
  skills: string[];
  capacityPerDay: number;
  workHours: { start: string; end: string };
  active: boolean;
  avatarUrl: string; // compat (no se guarda)
  notes: string;
  mustChangePassword: boolean;
}

interface Props {
  tecnico: Technician | null;
  /** El padre hace el fetch (POST/PATCH) y cierra el modal. */
  onGuardar: (data: {
    id?: number | string;
    name: string;
    email: string;
    phone?: string;
    password?: string;
    skills: string[];
    capacityPerDay: number;
    workHours: { start: string; end: string };
    active: boolean;
    notes?: string;
    mustChangePassword: boolean;
    blockedDates: BlockedDate[];
  }) => void | Promise<void>;
  onCancelar: () => void;
}

// --- Helpers ---
const API_BASE =
  typeof window === "undefined"
    ? ""
    : (window.location.port === "3000"
        ? ""
        : (process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:3000"));

function toLocalYmd(v?: any): string {
  if (!v) return "";
  const d = new Date(v);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

// Helpers para detectar si la API incluyó el campo notas/notes
const hasOwn = Object.prototype.hasOwnProperty;
function getNotesFromApi(obj: any): string | null | undefined {
  if (!obj) return undefined;
  if (hasOwn.call(obj, "notas")) return obj.notas ?? "";
  if (hasOwn.call(obj, "notes")) return obj.notes ?? "";
  return undefined; // la API no envió el campo
}

function normalizeFromApi(tecnicoApi: any) {
  const skillsArr: string[] = Array.isArray(tecnicoApi?.skills)
    ? tecnicoApi.skills
    : (tecnicoApi?.habilidades
        ? String(tecnicoApi.habilidades).split(",").map((s: string) => s.trim()).filter(Boolean)
        : []);

  const blocked: BlockedDate[] = Array.isArray(tecnicoApi?.blockedDates)
    ? tecnicoApi.blockedDates.map((b: any) => ({
        startDate: toLocalYmd(b.startDate ?? b.start),
        endDate: toLocalYmd(b.endDate ?? b.end),
        reason: b.reason ?? "",
        type: (b.type as BlockType) ?? "OTHER",
      }))
    : [];

  const workStart = tecnicoApi?.horario_inicio ?? tecnicoApi?.workHours?.start ?? "08:00";
  const workEnd   = tecnicoApi?.horario_fin ?? tecnicoApi?.workHours?.end ?? "17:00";

  const emailOut = tecnicoApi?.user?.email ?? tecnicoApi?.email ?? "";

  const rawNotes = getNotesFromApi(tecnicoApi);

  return {
    id: tecnicoApi?.id,
    form: {
      name: tecnicoApi?.nombre ?? tecnicoApi?.name ?? "",
      phone: tecnicoApi?.telefono ?? tecnicoApi?.phone ?? "",
      email: emailOut,
      password: "",
      skills: skillsArr,
      capacityPerDay: tecnicoApi?.capacidad ?? tecnicoApi?.capacityPerDay ?? 8,
      workHours: { start: workStart, end: workEnd },
      active: tecnicoApi?.user?.is_active ?? tecnicoApi?.active ?? true,
      avatarUrl: tecnicoApi?.avatarUrl ?? "",
      notes: rawNotes ?? "", // siempre string para el textarea
      mustChangePassword: tecnicoApi?.user?.must_change_password ?? tecnicoApi?.mustChangePassword ?? false,
    } as FormState,
    blockedDates: blocked,
    // payload para notificar al padre
    uiPayload: {
      id: tecnicoApi?.id,
      name: tecnicoApi?.nombre ?? tecnicoApi?.name ?? "",
      email: emailOut,
      phone: tecnicoApi?.telefono ?? tecnicoApi?.phone ?? undefined,
      password: undefined,
      skills: skillsArr,
      capacityPerDay: tecnicoApi?.capacidad ?? tecnicoApi?.capacityPerDay ?? 8,
      workHours: { start: workStart, end: workEnd },
      active: tecnicoApi?.user?.is_active ?? tecnicoApi?.active ?? true,
      notes: rawNotes ?? "", // NUNCA undefined
      mustChangePassword: tecnicoApi?.user?.must_change_password ?? tecnicoApi?.mustChangePassword ?? false,
      blockedDates: blocked,
    },
  };
}

export default function FormularioTecnico({ tecnico, onGuardar, onCancelar }: Props) {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    password: "",
    skills: [],
    capacityPerDay: 8,
    workHours: { start: "08:00", end: "17:00" },
    active: true,
    avatarUrl: "",
    notes: "",
    mustChangePassword: true,
  });

  const [newSkill, setNewSkill] = useState("");
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Montaje: bloquear scroll + ESC
  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancelar();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onCancelar]);

  // Cargar datos al cambiar el técnico (por id)
  const tecnicoId = (tecnico as any)?.id ?? null;

  useEffect(() => {
    let cancel = false;

    if (!tecnicoId) {
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        skills: [],
        capacityPerDay: 8,
        workHours: { start: "08:00", end: "17:00" },
        active: true,
        avatarUrl: "",
        notes: "",
        mustChangePassword: true,
      });
      setBlockedDates([]);
      return;
    }

    // 1) Hidratación rápida con lo que venga del padre (aunque venga sin 'notas')
    const pre = normalizeFromApi(tecnico);
    setFormData(pre.form);
    setBlockedDates(pre.blockedDates);

    // 2) Refetch al endpoint completo para traer 'notas' y fusionar
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/tecnicos/${tecnicoId}`);
        if (!res.ok) return;
        const full = await res.json();
        if (cancel) return;

        const normalized = normalizeFromApi(full?.tecnico ?? full);
        setFormData(prev => ({
          ...prev,
          ...normalized.form, // aquí ya llega notas desde la API
        }));
        setBlockedDates(normalized.blockedDates);
      } catch {
        /* noop */
      }
    })();

    return () => { cancel = true; };
  }, [tecnicoId, tecnico]);

  // Handlers
  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleAddSkill = () => {
    const s = newSkill.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData((p) => ({ ...p, skills: [...p.skills, s] }));
      setNewSkill("");
    }
  };
  const handleRemoveSkill = (skill: string) => {
    setFormData((p) => ({ ...p, skills: p.skills.filter((x) => x !== skill) }));
  };

  const handleAddBlock = () => {
    setBlockedDates((p) => [...p, { startDate: "", endDate: "", reason: "", type: "VACATION" }]);
  };
  const handleRemoveBlock = (index: number) => {
    setBlockedDates((p) => p.filter((_, i) => i !== index));
  };
  const handleBlockChange = (index: number, field: keyof BlockedDate, value: any) => {
    setBlockedDates((p) => p.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  };

  // ⬇⬇ FIX PRINCIPAL: sin fetch aquí; delega al padre.
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }

    const isEdit = Boolean(tecnicoId);
    if (!isEdit) {
      if (!formData.email.trim()) {
        alert("El email es obligatorio para crear al técnico.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert("Por favor ingrese un email válido.");
        return;
      }
    }

    const cleanBlocks = blockedDates
      .filter((b) => b.startDate && b.endDate && (b.reason || "").trim())
      .map((b) => ({ ...b }));

    const payload = {
      id: tecnicoId ?? undefined,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || undefined,
      password: isEdit ? undefined : (formData.password?.trim() || undefined),
      skills: formData.skills,
      capacityPerDay: Math.max(1, Math.min(50, Number(formData.capacityPerDay) || 8)),
      workHours: {
        start: formData.workHours.start || "08:00",
        end: formData.workHours.end || "17:00",
      },
      active: !!formData.active,
      notes: formData.notes?.trim() || "",
      mustChangePassword: !!formData.mustChangePassword,
      blockedDates: cleanBlocks,
    };

    try {
      setSaving(true);
      await Promise.resolve(onGuardar(payload));
      // El padre cierra el modal si todo sale bien
    } catch (err: any) {
      alert(err?.message || "Error al guardar técnico");
    } finally {
      setSaving(false);
    }
  };

  const container = typeof document !== "undefined" ? document.body : null;
  if (!container) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-secondary-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] border border-secondary-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700 bg-secondary-800 rounded-t-lg sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-white">
            {tecnicoId ? "Editar Técnico" : "Nuevo Técnico"}
          </h2>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-gray-300 transition-colors"
            type="button"
            aria-label="Cerrar"
            disabled={saving}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Info básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  readOnly={!!tecnicoId}
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>

              {!tecnicoId && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contraseña (opcional)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="w-full border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Si está vacía, se generará una temporal"
                    minLength={8}
                    disabled={saving}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capacidad diaria
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.capacityPerDay}
                  onChange={(e) =>
                    handleInputChange(
                      "capacityPerDay",
                      Math.max(1, Math.min(50, parseInt(e.target.value || "1", 10)))
                    )
                  }
                  className="w-full border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Horario */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Horario de trabajo
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Inicio</label>
                  <input
                    type="time"
                    value={formData.workHours.start}
                    onChange={(e) => handleInputChange("workHours.start", e.target.value)}
                    className="w-full border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fin</label>
                  <input
                    type="time"
                    value={formData.workHours.end}
                    onChange={(e) => handleInputChange("workHours.end", e.target.value)}
                    className="w-full border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Habilidades */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Habilidades / Especialidades
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Agregar habilidad..."
                  className="flex-1 border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  disabled={saving}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, idx) => (
                  <span
                    key={`${skill}-${idx}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/40 text-blue-200 text-sm rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-300 hover:text-blue-100"
                      aria-label={`Quitar ${skill}`}
                      disabled={saving}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Bloqueos de tiempo */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Bloqueos de tiempo (Vacaciones, Licencias)
                </label>
                <button
                  type="button"
                  onClick={handleAddBlock}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                  disabled={saving}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Agregar bloqueo
                </button>
              </div>
              <div className="space-y-3">
                {blockedDates.map((b, i) => (
                  <div key={i} className="p-3 bg-secondary-700 rounded-lg border border-secondary-600">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Fecha inicio</label>
                        <input
                          type="date"
                          value={b.startDate}
                          onChange={(e) => handleBlockChange(i, "startDate", e.target.value)}
                          className="w-full border border-secondary-600 bg-secondary-600 text-white rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Fecha fin</label>
                        <input
                          type="date"
                          value={b.endDate}
                          onChange={(e) => handleBlockChange(i, "endDate", e.target.value)}
                          className="w-full border border-secondary-600 bg-secondary-600 text-white rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                        <select
                          value={b.type}
                          onChange={(e) => handleBlockChange(i, "type", e.target.value as BlockType)}
                          className="w-full border border-secondary-600 bg-secondary-600 text-white rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                          disabled={saving}
                        >
                          <option value="VACATION">Vacaciones</option>
                          <option value="SICK_LEAVE">Licencia médica</option>
                          <option value="TRAINING">Capacitación</option>
                          <option value="OTHER">Otro</option>
                        </select>
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveBlock(i)}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors flex items-center text-sm"
                          disabled={saving}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="md:col-span-5">
                        <input
                          type="text"
                          value={b.reason}
                          onChange={(e) => handleBlockChange(i, "reason", e.target.value)}
                          placeholder="Motivo del bloqueo..."
                          className="w-full border border-secondary-600 bg-secondary-600 text-white rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {blockedDates.length === 0 && (
                  <div className="text-center py-2 text-gray-400 text-sm">
                    No hay bloqueos configurados
                  </div>
                )}
              </div>
            </div>

            {/* Notas + switches */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notas internas</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="w-full border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notas adicionales sobre el técnico..."
                disabled={saving}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => handleInputChange("active", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={saving}
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-300">
                  Técnico activo (puede recibir asignaciones)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mustChangePassword"
                  checked={formData.mustChangePassword}
                  onChange={(e) => handleInputChange("mustChangePassword", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={saving}
                />
                <label htmlFor="mustChangePassword" className="ml-2 text-sm text-gray-300">
                  Debe cambiar contraseña en el próximo login
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-secondary-700 pt-4 mt-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onCancelar}
                  className="px-6 py-2 border border-secondary-600 text-gray-300 rounded-lg hover:bg-secondary-700 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : (tecnicoId ? "Actualizar" : "Crear")} Técnico
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    container
  );
}
