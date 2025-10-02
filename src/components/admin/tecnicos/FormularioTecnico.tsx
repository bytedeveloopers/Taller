"use client";

import { Technician } from "@/types";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface Props {
  tecnico: Technician | null;
  onGuardar: (data: any) => void;
  onCancelar: () => void;
}

export default function FormularioTecnico({ tecnico, onGuardar, onCancelar }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    skills: [] as string[],
    capacityPerDay: 5,
    workHours: {
      start: "08:00",
      end: "17:00",
    },
    active: true,
    avatarUrl: "",
    notes: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [blockedDates, setBlockedDates] = useState<
    Array<{
      startDate: string;
      endDate: string;
      reason: string;
      type: "VACATION" | "SICK_LEAVE" | "TRAINING" | "OTHER";
    }>
  >([]);

  useEffect(() => {
    if (tecnico) {
      setFormData({
        name: tecnico.name || "",
        phone: tecnico.phone || "",
        email: tecnico.email || "",
        skills: tecnico.skills || [],
        capacityPerDay: tecnico.capacityPerDay || 5,
        workHours: tecnico.workHours || { start: "08:00", end: "17:00" },
        active: tecnico.active !== undefined ? tecnico.active : true,
        avatarUrl: tecnico.avatarUrl || "",
        notes: tecnico.notes || "",
      });

      // Cargar bloqueos si existen
      if (tecnico.blockedDates) {
        setBlockedDates(
          tecnico.blockedDates.map((block) => ({
            startDate: new Date(block.startDate).toISOString().split("T")[0],
            endDate: new Date(block.endDate).toISOString().split("T")[0],
            reason: block.reason,
            type: block.type,
          }))
        );
      }
    }
  }, [tecnico]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleAddBlock = () => {
    setBlockedDates((prev) => [
      ...prev,
      {
        startDate: "",
        endDate: "",
        reason: "",
        type: "VACATION",
      },
    ]);
  };

  const handleRemoveBlock = (index: number) => {
    setBlockedDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBlockChange = (index: number, field: string, value: any) => {
    setBlockedDates((prev) =>
      prev.map((block, i) => (i === index ? { ...block, [field]: value } : block))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Por favor completa los campos obligatorios (Nombre y Teléfono)");
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      ...formData,
      blockedDates: blockedDates
        .filter((block) => block.startDate && block.endDate && block.reason.trim())
        .map((block) => ({
          ...block,
          startDate: new Date(block.startDate),
          endDate: new Date(block.endDate),
        })),
    };

    onGuardar(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {tecnico ? "Editar Técnico" : "Nuevo Técnico"}
          </h2>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacidad Diaria
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.capacityPerDay}
                onChange={(e) => handleInputChange("capacityPerDay", parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Número máximo de trabajos simultáneos</p>
            </div>
          </div>

          {/* Horario de trabajo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horario de Trabajo
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Inicio</label>
                <input
                  type="time"
                  value={formData.workHours.start}
                  onChange={(e) => handleInputChange("workHours.start", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fin</label>
                <input
                  type="time"
                  value={formData.workHours.end}
                  onChange={(e) => handleInputChange("workHours.end", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Habilidades */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Habilidades/Especialidades
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Agregar habilidad..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
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
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL del Avatar</label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
              placeholder="https://ejemplo.com/avatar.jpg"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bloqueos de tiempo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Bloqueos de Tiempo (Vacaciones, Licencias)
              </label>
              <button
                type="button"
                onClick={handleAddBlock}
                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Agregar Bloqueo
              </button>
            </div>
            <div className="space-y-3">
              {blockedDates.map((block, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fecha Inicio</label>
                      <input
                        type="date"
                        value={block.startDate}
                        onChange={(e) => handleBlockChange(index, "startDate", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fecha Fin</label>
                      <input
                        type="date"
                        value={block.endDate}
                        onChange={(e) => handleBlockChange(index, "endDate", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                      <select
                        value={block.type}
                        onChange={(e) => handleBlockChange(index, "type", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="VACATION">Vacaciones</option>
                        <option value="SICK_LEAVE">Licencia Médica</option>
                        <option value="TRAINING">Capacitación</option>
                        <option value="OTHER">Otro</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveBlock(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={block.reason}
                      onChange={(e) => handleBlockChange(index, "reason", e.target.value)}
                      placeholder="Motivo del bloqueo..."
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas Internas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notas adicionales sobre el técnico..."
            />
          </div>

          {/* Estado activo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleInputChange("active", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Técnico activo (puede recibir asignaciones)
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancelar}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {tecnico ? "Actualizar" : "Crear"} Técnico
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
