"use client";

import { BoltIcon, TruckIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface Cliente {
  id: string;
  name: string;
  email?: string;
  phone: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehiculoData: any) => void;
}

export default function AltaRapidaVehiculo({ isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    customerId: "",
    color: "",
    nickname: "",
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

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isOpen) {
        cargarClientes();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [busquedaCliente, isOpen]);

  const cargarClientes = async () => {
    try {
      const response = await fetch(`/api/clients?search=${busquedaCliente}&limit=20`);
      const result = await response.json();
      if (result.success) {
        setClientes(result.data);
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      // Prepare data for submission with defaults for quick creation
      const submitData = {
        ...formData,
        year: parseInt(formData.year.toString()),
        isActive: true,
        // Set reasonable defaults for quick creation
        fuelType: "gasolina",
        transmission: "manual",
        mileage: null,
        nextServiceAtDate: null,
        nextServiceAtKm: null,
        notes: `Vehículo creado mediante alta rápida el ${new Date().toLocaleDateString("es-GT")}`,
      };

      await onSave(submitData);

      // Reset form
      setFormData({
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        licensePlate: "",
        customerId: "",
        color: "",
        nickname: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error guardando vehículo:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      licensePlate: "",
      customerId: "",
      color: "",
      nickname: "",
    });
    setErrors({});
    setBusquedaCliente("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center">
            <BoltIcon className="h-6 w-6 text-green-400 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-white">Alta Rápida de Vehículo</h2>
              <p className="text-gray-400 text-sm">Creación rápida con información básica</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
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
              <UserIcon className="h-5 w-5 mr-2 text-green-400" />
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
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 ${
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

          {/* Información Básica del Vehículo */}
          <div className="bg-secondary-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <TruckIcon className="h-5 w-5 mr-2 text-green-400" />
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Marca *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Toyota, Honda, Ford..."
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
                  placeholder="Corolla, Civic, Focus..."
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.year ? "border-red-500" : "border-secondary-500"
                  }`}
                  required
                />
                {errors.year && <p className="text-red-400 text-sm mt-1">{errors.year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Placa</label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  placeholder="P123ABC"
                  className={`w-full px-3 py-2 bg-secondary-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.licensePlate ? "border-red-500" : "border-secondary-500"
                  }`}
                />
                {errors.licensePlate && (
                  <p className="text-red-400 text-sm mt-1">{errors.licensePlate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Blanco, Negro, Rojo..."
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Apodo/Nickname
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="El rayo, La nave..."
                  className="w-full px-3 py-2 bg-secondary-600 border border-secondary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-400 mb-2">ℹ️ Información Adicional</h4>
            <p className="text-xs text-gray-400">
              Esta es un alta rápida. Podrás completar la información detallada (VIN, kilometraje,
              tipo de combustible, etc.) editando el vehículo después de crearlo.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-secondary-700">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <BoltIcon className="h-4 w-4 mr-2" />
                  Crear Vehículo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
