// src/components/admin/vehiculos/FormularioVehiculo.tsx
"use client";

import { TruckIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";

interface Cliente {
  id: string;
  name: string;
  email?: string;
  phone: string;
}

interface Vehiculo {
  id: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
  customerId: string;
  isActive: boolean;
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehiculo?: Vehiculo | null;
  onSave: (vehiculoData: {
    customerId: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    mileage: number;
  }) => Promise<void> | void;
}

type FormState = {
  // opcionales visibles en UI pero NO se envían
  licensePlate: string;
  vin: string;
  fuelType: string;
  transmission: string;

  // REQUERIDOS
  brand: string;
  model: string;
  year: number | string;
  color: string;
  mileage: string;
  customerId: string;

  isActive: boolean; // compat visual
};

export default function FormularioVehiculo({ isOpen, onClose, vehiculo, onSave }: Props) {
  const [formData, setFormData] = useState<FormState>({
    licensePlate: "",
    vin: "",
    fuelType: "",
    transmission: "",

    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    mileage: "",
    customerId: "",

    isActive: true,
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [busquedaCliente, setBusquedaCliente] = useState("");

  // Autocomplete UI state
  const [isDropOpen, setIsDropOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const comboRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ===== Helpers =====
  const clientesSafe = useMemo(() => (Array.isArray(clientes) ? clientes : []), [clientes]);

  const normalizeCliente = (row: any): Cliente | null => {
    if (!row) return null;
    const id = String(row.id ?? row._id ?? row.clientId ?? row.uuid ?? "").trim();
    if (!id) return null;

    const name = (row.name ?? row.nombre ?? row.fullName ?? "").toString().trim() || "(Sin nombre)";
    const phone = (row.phone ?? row.alt_phone ?? row.altPhone ?? row.telefono ?? "")
      .toString()
      .trim();
    const email = (row.email ?? row.correo ?? "").toString().trim() || undefined;

    return { id, name, phone, email };
  };

  const extractArray = (json: any): any[] => {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.items)) return json.items;
    if (Array.isArray(json?.results)) return json.results;
    return [];
  };

  const labelCliente = (c: { name: string; phone?: string; email?: string }) =>
    `${c.name}${c.phone ? ` - ${c.phone}` : ""}${c.email ? ` • ${c.email}` : ""}`;

  // ===== Cargar clientes con fallbacks =====
  const cargarClientes = async () => {
    if (!isOpen) return;
    setLoadingClientes(true);

    const base = "/api/clients";
    const q = encodeURIComponent(busquedaCliente || "");
    const attempts = [
      `${base}?search=${q}&limit=50&select=min`,
      `${base}?search=${q}&limit=50`,
      `${base}?search=${q}`,
    ];

    let lista: Cliente[] = [];
    let lastError: any = null;

    for (const url of attempts) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          lastError = new Error(`GET ${url} → ${res.status}`);
          continue;
        }
        const json = await res.json().catch(() => null);
        const arr = extractArray(json);

        lista = arr.map(normalizeCliente).filter(Boolean) as Cliente[];

        if (!lista.length && Array.isArray(json)) {
          lista = (json as any[]).map(normalizeCliente).filter(Boolean) as Cliente[];
        }

        if (lista.length) break;
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    if (!lista.length && lastError) {
      console.error("[FormularioVehiculo] cargarClientes error:", lastError);
    }

    setClientes(lista);
    setHighlighted(0);
    setLoadingClientes(false);
  };

  // Primer load de clientes al abrir modal
  useEffect(() => {
    if (!isOpen) return;
    cargarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Debounce de búsqueda
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => cargarClientes(), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busquedaCliente, isOpen]);

  // Cerrar dropdown con clic afuera
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!isDropOpen) return;
      const target = e.target as Node;
      if (comboRef.current && !comboRef.current.contains(target)) {
        setIsDropOpen(false);
      }
    }
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [isDropOpen]);

  // ===== Popular datos si es edición (solo campos importantes) =====
  useEffect(() => {
    if (vehiculo) {
      setFormData((prev) => ({
        ...prev,
        brand: vehiculo.brand || "",
        model: vehiculo.model || "",
        year: vehiculo.year ?? new Date().getFullYear(),
        color: vehiculo.color || "",
        mileage: vehiculo.mileage?.toString() || "",
        customerId: vehiculo.customerId || "",
        // extras visuales (se dejan vacíos)
        licensePlate: "",
        vin: "",
        fuelType: "",
        transmission: "",
        isActive: vehiculo.isActive ?? true,
      }));

      const pre = clientesSafe.find((c) => c.id === vehiculo.customerId);
      if (pre) {
        setBusquedaCliente(labelCliente(pre));
      } else if (vehiculo.customer) {
        setBusquedaCliente(labelCliente(vehiculo.customer));
      } else {
        setBusquedaCliente("");
      }
    } else {
      setFormData({
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        mileage: "",
        customerId: "",
        licensePlate: "",
        vin: "",
        fuelType: "",
        transmission: "",
        isActive: true,
      });
      setBusquedaCliente("");
    }
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiculo, clientesSafe]);

  // ===== Inputs =====
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // ===== Validaciones (SOLO los 6 campos) =====
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) newErrors.customerId = "El cliente es requerido";
    if (!formData.brand.trim()) newErrors.brand = "La marca es requerida";
    if (!formData.model.trim()) newErrors.model = "El modelo es requerido";

    const yearNum = Number(formData.year);
    if (!yearNum || Number.isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 2) {
      newErrors.year = "Año inválido";
    }

    if (!formData.color.trim()) newErrors.color = "El color es requerido";

    const kmNum = Number(formData.mileage);
    if (formData.mileage === "" || Number.isNaN(kmNum) || kmNum < 0) {
      newErrors.mileage = "Kilometraje inválido";
    }

    // Validaciones opcionales de UI
    if (formData.licensePlate && !/^[A-Z0-9-]+$/i.test(formData.licensePlate)) {
      newErrors.licensePlate = "Formato de placa inválido";
    }
    if (formData.vin && formData.vin.length !== 17) newErrors.vin = "El VIN debe tener 17 caracteres";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== Submit: solo enviamos los 6 campos =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        customerId: formData.customerId,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: parseInt(String(formData.year), 10),
        color: formData.color.trim(),
        mileage: parseInt(String(formData.mileage), 10),
      };
      await onSave(payload);
    } catch (error) {
      console.error("Error guardando vehículo:", error);
    } finally {
      setLoading(false);
    }
  };

  // seleccionar cliente desde dropdown
  const selectCliente = (c: Cliente) => {
    setFormData((prev) => ({ ...prev, customerId: c.id }));
    setBusquedaCliente(labelCliente(c));
    setIsDropOpen(false);
    if (errors.customerId) setErrors((prev) => ({ ...prev, customerId: null }));
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center">
            <TruckIcon className="h-6 w-6 text-blue-400 mr-3" />
            <h2 className="text-xl font-semibold text-white">
              {vehiculo ? "Editar Vehículo" : "Nuevo Vehículo"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cliente */}
          <div className="bg-secondary-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-blue-400" />
              Cliente
            </h3>

            {/* Combobox */}
            <div className="space-y-2" ref={comboRef}>
              <label className="block text-sm font-medium text-gray-300">Buscar Cliente *</label>
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar por nombre, teléfono o email..."
                value={busquedaCliente}
                onChange={(e) => {
                  setBusquedaCliente(e.target.value);
                  setIsDropOpen(true);
                }}
                onFocus={() => setIsDropOpen(true)}
                onKeyDown={(e) => {
                  if (!isDropOpen) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlighted((h) => Math.min(h + 1, Math.max(clientesSafe.length - 1, 0)));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlighted((h) => Math.max(h - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const c = clientesSafe[highlighted];
                    if (c) selectCliente(c);
                  } else if (e.key === "Escape") {
                    setIsDropOpen(false);
                  }
                }}
                aria-autocomplete="list"
                aria-expanded={isDropOpen}
                aria-controls="clientes-listbox"
                className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customerId ? "border-red-500" : "border-secondary-500"
                }`}
              />
              {/* Dropdown */}
              {isDropOpen && (
                <div role="listbox" id="clientes-listbox" className="relative">
                  <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-secondary-600 bg-secondary-700 shadow-lg">
                    {loadingClientes && (
                      <div className="px-3 py-2 text-sm text-gray-300">Cargando…</div>
                    )}
                    {!loadingClientes && clientesSafe.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-400">Sin resultados</div>
                    )}
                    {!loadingClientes &&
                      clientesSafe.slice(0, 10).map((c, idx) => (
                        <div
                          key={c.id}
                          role="option"
                          aria-selected={idx === highlighted}
                          onMouseEnter={() => setHighlighted(idx)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectCliente(c)}
                          className={`px-3 py-2 cursor-pointer text-sm ${
                            idx === highlighted ? "bg-secondary-600 text-white" : "text-gray-200"
                          }`}
                        >
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-gray-300">
                            {c.phone || "—"} {c.email ? `• ${c.email}` : ""}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {errors.customerId && <p className="text-red-400 text-sm">{errors.customerId}</p>}
              <input type="hidden" name="customerId" value={formData.customerId} />
            </div>
          </div>

          {/* Información del Vehículo */}
          <div className="bg-secondary-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <TruckIcon className="h-5 w-5 mr-2 text-blue-400" />
              Información del Vehículo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Opcionales UI */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Placa</label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  placeholder="P123ABC"
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.licensePlate ? "border-red-500" : "border-secondary-500"
                  }`}
                />
                {errors.licensePlate && <p className="text-red-400 text-sm mt-1">{errors.licensePlate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">VIN</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  placeholder="17 caracteres"
                  maxLength={17}
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.vin ? "border-red-500" : "border-secondary-500"
                  }`}
                />
                {errors.vin && <p className="text-red-400 text-sm mt-1">{errors.vin}</p>}
              </div>

              {/* Requeridos */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Marca *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Toyota, Honda, etc."
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.brand ? "border-red-500" : "border-secondary-500"
                  }`}
                  required
                />
                {errors.brand && <p className="text-red-400 text-sm mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Modelo *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="Corolla, Civic, etc."
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.model ? "border-red-500" : "border-secondary-500"
                  }`}
                  required
                />
                {errors.model && <p className="text-red-400 text-sm mt-1">{errors.model}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Año *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min={1900}
                  max={new Date().getFullYear() + 2}
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.year ? "border-red-500" : "border-secondary-500"
                  }`}
                  required
                />
                {errors.year && <p className="text-red-400 text-sm mt-1">{errors.year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color *</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Blanco, Negro, etc."
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.color ? "border-red-500" : "border-secondary-500"
                  }`}
                  required
                />
                {errors.color && <p className="text-red-400 text-sm mt-1">{errors.color}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Kilometraje *</label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  placeholder="0"
                  min={0}
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.mileage ? "border-red-500" : "border-secondary-500"
                  }`}
                  required
                />
                {errors.mileage && <p className="text-red-400 text-sm mt-1">{errors.mileage}</p>}
              </div>

              {/* Extras visuales que NO se envían */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Combustible</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="diesel">Diésel</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="electrico">Eléctrico</option>
                  <option value="gas">Gas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Transmisión</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="manual">Manual</option>
                  <option value="automatica">Automática</option>
                  <option value="cvt">CVT</option>
                  <option value="secuencial">Secuencial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-secondary-700">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-400 hover:text-white transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Guardando..." : vehiculo ? "Actualizar" : "Crear Vehículo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
