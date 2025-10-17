"use client";

import type { Technician } from "@/types";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

type BlockType = "VACATION" | "SICK_LEAVE" | "TRAINING" | "OTHER";
interface BlockedDate {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
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
  avatarUrl: string;
  notes: string;
  mustChangePassword: boolean;
}

interface Props {
  tecnico: Technician | null;
  onGuardar: (data: any) => void;
  onCancelar: () => void;
}

export default function FormularioTecnico({ tecnico, onGuardar, onCancelar }: Props) {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    password: "",
    skills: [],
    capacityPerDay: 5,
    workHours: { start: "08:00", end: "17:00" },
    active: true,
    avatarUrl: "",
    notes: "",
    mustChangePassword: true,
  });

  const [newSkill, setNewSkill] = useState("");
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  // Cargar datos cuando edites un técnico
  useEffect(() => {
    if (tecnico) {
      setFormData({
        name: (tecnico as any).name ?? (tecnico as any).nombre ?? "",
        phone: (tecnico as any).phone ?? (tecnico as any).telefono ?? "",
        email: (tecnico as any).email ?? (tecnico as any).user?.email ?? "",
        password: "", // nunca rellenar al editar
        skills: (tecnico as any).skills ?? [],
        capacityPerDay: (tecnico as any).capacityPerDay ?? 5,
        workHours: (tecnico as any).workHours ?? {
          start: (tecnico as any).horario_inicio ?? "08:00",
          end: (tecnico as any).horario_fin ?? "17:00",
        },
        active: (tecnico as any).active ?? (tecnico as any).user?.is_active ?? true,
        avatarUrl: (tecnico as any).avatarUrl ?? "",
        notes: (tecnico as any).notes ?? "",
        mustChangePassword:
          (tecnico as any).mustChangePassword ??
          (tecnico as any).user?.must_change_password ??
          false,
      });

      // Cargar bloqueos si existieran en tu tipo
      const raw = (tecnico as any).blockedDates;
      if (Array.isArray(raw)) {
        setBlockedDates(
          raw.map((b: any) => ({
            startDate: new Date(b.startDate ?? b.start ?? Date.now()).toISOString().split("T")[0],
            endDate: new Date(b.endDate ?? b.end ?? Date.now()).toISOString().split("T")[0],
            reason: b.reason ?? "",
            type: (b.type as BlockType) ?? "OTHER",
          }))
        );
      } else {
        setBlockedDates([]);
      }
    } else {
      // modo creación: limpiar
      setFormData((prev) => ({
        ...prev,
        password: "",
        mustChangePassword: true,
      }));
      setBlockedDates([]);
    }
  }, [tecnico]);

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

  // Skills
  const handleAddSkill = () => {
    const s = newSkill.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData((p) => ({ ...p, skills: [...p.skills, s] }));
      setNewSkill("");
    }
  };
  const handleRemoveSkill = (skill: string) => {
    setFormData((p) => ({
      ...p,
      skills: p.skills.filter((x) => x !== skill),
    }));
  };

  // Bloqueos
  const handleAddBlock = () => {
    setBlockedDates((p) => [...p, { startDate: "", endDate: "", reason: "", type: "VACATION" }]);
  };
  const handleRemoveBlock = (index: number) => {
    setBlockedDates((p) => p.filter((_, i) => i !== index));
  };
  const handleBlockChange = (index: number, field: keyof BlockedDate, value: any) => {
    setBlockedDates((p) => p.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Por favor completa los campos obligatorios (Nombre y Email)");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Por favor ingresa un email válido");
      return;
    }

    // Mapeo al payload que espera el backend de admin (/api/admin/tecnicos)
    const payload: any = {
      nombre: formData.name,
      email: formData.email,
      telefono: formData.phone || null,
      especialidad: formData.skills[0] ?? null, // o join si manejas varias
      horario_inicio: formData.workHours.start || null,
      horario_fin: formData.workHours.end || null,
      is_active: formData.active,
      must_change_password: formData.mustChangePassword,
      // campos “UI only” (si los usas en tu sistema puedes enviarlos)
      avatar_url: formData.avatarUrl || undefined,
      notes: formData.notes || undefined,
      capacityPerDay: formData.capacityPerDay,
      skills: formData.skills,
      blockedDates: blockedDates
        .filter((b) => b.startDate && b.endDate && b.reason.trim())
        .map((b) => ({
          ...b,
          // si el backend necesita Date en ISO, envía YYYY-MM-DD como está o conviértelo aquí
        })),
    };

    // Solo enviar password en creación
    if (!tecnico && formData.password.trim()) {
      payload.password = formData.password.trim();
    }

    onGuardar(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] border border-secondary-700 flex flex-col">
        {/* Header fijo */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700 bg-secondary-800 rounded-t-lg sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-white">
            {tecnico ? "Editar Técnico" : "Nuevo Técnico"}
          </h2>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-gray-300 transition-colors"
            type="button"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                  readOnly={!!tecnico} // Solo lectura en edición
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Contraseña: solo en creación */}
              {!tecnico && (
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
                  max={24}
                  value={formData.capacityPerDay}
                  onChange={(e) =>
                    handleInputChange("capacityPerDay", parseInt(e.target.value || "0", 10))
                  }
                  className="w-full border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fin</label>
                  <input
                    type="time"
                    value={formData.workHours.end}
                    onChange={(e) => handleInputChange("workHours.end", e.target.value)}
                    className="w-full border border-secondary-600 bg-secondary-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
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
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Agregar bloqueo
                </button>
              </div>
              <div className="space-y-3">
                {blockedDates.map((b, i) => (
                  <div
                    key={i}
                    className="p-3 bg-secondary-700 rounded-lg border border-secondary-600"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Fecha inicio</label>
                        <input
                          type="date"
                          value={b.startDate}
                          onChange={(e) => handleBlockChange(i, "startDate", e.target.value)}
                          className="w-full border border-secondary-600 bg-secondary-600 text-white rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Fecha fin</label>
                        <input
                          type="date"
                          value={b.endDate}
                          onChange={(e) => handleBlockChange(i, "endDate", e.target.value)}
                          className="w-full border border-secondary-600 bg-secondary-600 text-white rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                        <select
                          value={b.type}
                          onChange={(e) =>
                            handleBlockChange(i, "type", e.target.value as BlockType)
                          }
                          className="w-full border border-secondary-600 bg-secondary-600 text-white rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
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
                />
                <label htmlFor="mustChangePassword" className="ml-2 text-sm text-gray-300">
                  Debe cambiar contraseña en el próximo login
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer fijo */}
        <div className="border-t border-secondary-700 px-6 py-4 bg-secondary-800 rounded-b-lg">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancelar}
              className="px-6 py-2 border border-secondary-600 text-gray-300 rounded-lg hover:bg-secondary-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {tecnico ? "Actualizar" : "Crear"} Técnico
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
