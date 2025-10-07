"use client";

import { DocumentTextIcon, TruckIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface Cliente {
  id: string;
  name: string;
  email?: string;
  phone: string;
}

interface Vehiculo {
  id: string;
  licensePlate?: string;
  vin?: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  nickname?: string;
  notes?: string;
  nextServiceAtDate?: string;
  nextServiceAtKm?: number;
  customerId: string;
  isActive: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehiculo?: Vehiculo | null;
  onSave: (vehiculoData: any) => void;
}

export default function FormularioVehiculo({ isOpen, onClose, vehiculo, onSave }: Props) {
  const [formData, setFormData] = useState({
    licensePlate: "",
    vin: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    nickname: "",
    notes: "",
    nextServiceAtDate: "",
    nextServiceAtKm: "",
    customerId: "",
    isActive: true,
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [busquedaCliente, setBusquedaCliente] = useState("");

  // Cargar clientes
  useEffect(() => {
    if (isOpen) {
      cargarClientes();
    }
  }, [isOpen]);

  // Cargar datos del vehículo para edición
  useEffect(() => {
    if (vehiculo) {
      setFormData({
        licensePlate: vehiculo.licensePlate || "",
        vin: vehiculo.vin || "",
        brand: vehiculo.brand,
        model: vehiculo.model,
        year: vehiculo.year,
        color: vehiculo.color || "",
        mileage: vehiculo.mileage?.toString() || "",
        fuelType: vehiculo.fuelType || "",
        transmission: vehiculo.transmission || "",
        nickname: vehiculo.nickname || "",
        notes: vehiculo.notes || "",
        nextServiceAtDate: vehiculo.nextServiceAtDate
          ? vehiculo.nextServiceAtDate.split("T")[0]
          : "",
        nextServiceAtKm: vehiculo.nextServiceAtKm?.toString() || "",
        customerId: vehiculo.customerId,
        isActive: vehiculo.isActive,
      });
    } else {
      // Reset form for new vehicle
      setFormData({
        licensePlate: "",
        vin: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        mileage: "",
        fuelType: "",
        transmission: "",
        nickname: "",
        notes: "",
        nextServiceAtDate: "",
        nextServiceAtKm: "",
        customerId: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [vehiculo]);

  const cargarClientes = async () => {
    try {
      const response = await fetch(`/api/clients?search=${busquedaCliente}&limit=50`);
      const result = await response.json();
      if (result.success) {
        setClientes(result.data);
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isOpen) {
        cargarClientes();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [busquedaCliente, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.brand.trim()) newErrors.brand = "La marca es requerida";
    if (!formData.model.trim()) newErrors.model = "El modelo es requerido";
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 2) {
      newErrors.year = "Año inválido";
    }
    if (!formData.customerId) newErrors.customerId = "El cliente es requerido";

    // Validate license plate format (optional but if provided should be valid)
    if (formData.licensePlate && !/^[A-Z0-9-]+$/i.test(formData.licensePlate)) {
      newErrors.licensePlate = "Formato de placa inválido";
    }

    // Validate VIN (optional but if provided should be 17 characters)
    if (formData.vin && formData.vin.length !== 17) {
      newErrors.vin = "El VIN debe tener 17 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        year: parseInt(formData.year.toString()),
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        nextServiceAtKm: formData.nextServiceAtKm ? parseInt(formData.nextServiceAtKm) : null,
        nextServiceAtDate: formData.nextServiceAtDate || null,
      };

      await onSave(submitData);
    } catch (error) {
      console.error("Error guardando vehículo:", error);
    } finally {
      setLoading(false);
    }
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
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Buscar Cliente *
                </label>
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.customerId ? "border-red-500" : "border-secondary-500"
                  }`}
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.name} - {cliente.phone}
                    </option>
                  ))}
                </select>
                {errors.customerId && (
                  <p className="text-red-400 text-sm mt-1">{errors.customerId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información Básica */}
          <div className="bg-secondary-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <TruckIcon className="h-5 w-5 mr-2 text-blue-400" />
              Información del Vehículo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                {errors.licensePlate && (
                  <p className="text-red-400 text-sm mt-1">{errors.licensePlate}</p>
                )}
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
                  min="1900"
                  max={new Date().getFullYear() + 2}
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.year ? "border-red-500" : "border-secondary-500"
                  }`}
                  required
                />
                {errors.year && <p className="text-red-400 text-sm mt-1">{errors.year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Blanco, Negro, etc."
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Kilometraje</label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Combustible
                </label>
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

          {/* Información Adicional */}
          <div className="bg-secondary-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-400" />
              Información Adicional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Apodo/Nickname
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="El rayo, La nave, etc."
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Próximo Servicio (Fecha)
                </label>
                <input
                  type="date"
                  name="nextServiceAtDate"
                  value={formData.nextServiceAtDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Próximo Servicio (Kilometraje)
                </label>
                <input
                  type="number"
                  name="nextServiceAtKm"
                  value={formData.nextServiceAtKm}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-secondary-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
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
