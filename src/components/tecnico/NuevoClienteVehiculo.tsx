"use client";

import {
  CheckCircleIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";

interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  cedula?: string;
  direccion?: string;
}

interface Vehiculo {
  id: string;
  clienteId: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  color: string;
  kilometraje: number;
  vin?: string;
  motor?: string;
  combustible?: string;
  transmision?: string;
}

interface NuevoClienteVehiculoProps {
  onGuardar: (cliente: Cliente, vehiculo: Vehiculo) => void;
  onCancelar: () => void;
  clienteExistente?: Cliente | null;
}

const marcasVehiculos = [
  "Toyota",
  "Honda",
  "Nissan",
  "Hyundai",
  "Kia",
  "Mazda",
  "Mitsubishi",
  "Chevrolet",
  "Ford",
  "Volkswagen",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Suzuki",
  "Subaru",
  "Isuzu",
  "Peugeot",
  "Renault",
  "Otro",
];

const coloresVehiculos = [
  "Blanco",
  "Negro",
  "Gris",
  "Plata",
  "Rojo",
  "Azul",
  "Verde",
  "Amarillo",
  "Beige",
  "Café",
  "Dorado",
  "Otro",
];

const tiposCombustible = ["Gasolina", "Diésel", "Híbrido", "Eléctrico", "GLP"];

const tiposTransmision = ["Manual", "Automática", "CVT", "Semiautomática"];

export const NuevoClienteVehiculo: React.FC<NuevoClienteVehiculoProps> = ({
  onGuardar,
  onCancelar,
  clienteExistente,
}) => {
  // Estados del formulario de cliente
  const [datosCliente, setDatosCliente] = useState<Partial<Cliente>>({
    nombre: clienteExistente?.nombre || "",
    telefono: clienteExistente?.telefono || "",
    email: clienteExistente?.email || "",
    cedula: clienteExistente?.cedula || "",
    direccion: clienteExistente?.direccion || "",
  });

  // Estados del formulario de vehículo
  const [datosVehiculo, setDatosVehiculo] = useState<Partial<Vehiculo>>({
    marca: "",
    modelo: "",
    ano: new Date().getFullYear(),
    placa: "",
    color: "",
    kilometraje: 0,
    vin: "",
    motor: "",
    combustible: "Gasolina",
    transmision: "Manual",
  });

  // Estados de validación
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [paso, setPaso] = useState<"cliente" | "vehiculo">("cliente");
  const [guardando, setGuardando] = useState(false);

  // Validaciones
  const validarCliente = () => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!datosCliente.nombre?.trim()) {
      nuevosErrores.nombre = "El nombre es requerido";
    }

    if (!datosCliente.telefono?.trim()) {
      nuevosErrores.telefono = "El teléfono es requerido";
    } else if (!/^\d{4}-\d{4}$/.test(datosCliente.telefono)) {
      nuevosErrores.telefono = "Formato: 8888-1234";
    }

    if (datosCliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosCliente.email)) {
      nuevosErrores.email = "Email inválido";
    }

    if (datosCliente.cedula && !/^\d-\d{4}-\d{4}$/.test(datosCliente.cedula)) {
      nuevosErrores.cedula = "Formato: 1-1234-5678";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const validarVehiculo = () => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!datosVehiculo.marca) {
      nuevosErrores.marca = "La marca es requerida";
    }

    if (!datosVehiculo.modelo?.trim()) {
      nuevosErrores.modelo = "El modelo es requerido";
    }

    if (!datosVehiculo.placa?.trim()) {
      nuevosErrores.placa = "La placa es requerida";
    } else if (!/^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{4}$/.test(datosVehiculo.placa.toUpperCase())) {
      nuevosErrores.placa = "Formato inválido (ABC123 o AB1234)";
    }

    if (!datosVehiculo.color) {
      nuevosErrores.color = "El color es requerido";
    }

    if (
      !datosVehiculo.ano ||
      datosVehiculo.ano < 1900 ||
      datosVehiculo.ano > new Date().getFullYear() + 1
    ) {
      nuevosErrores.ano = "Año inválido";
    }

    if (datosVehiculo.kilometraje === undefined || datosVehiculo.kilometraje < 0) {
      nuevosErrores.kilometraje = "Kilometraje inválido";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Handlers
  const handleClienteChange = (campo: keyof Cliente, valor: string) => {
    setDatosCliente((prev) => ({ ...prev, [campo]: valor }));

    // Limpiar error del campo
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: "" }));
    }
  };

  const handleVehiculoChange = (campo: keyof Vehiculo, valor: string | number) => {
    setDatosVehiculo((prev) => ({ ...prev, [campo]: valor }));

    // Limpiar error del campo
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: "" }));
    }
  };

  const continuarAVehiculo = () => {
    if (validarCliente()) {
      setPaso("vehiculo");
    }
  };

  const guardarClienteVehiculo = async () => {
    if (!validarVehiculo()) return;

    setGuardando(true);

    try {
      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const clienteId = clienteExistente?.id || `cliente-${Date.now()}`;

      const cliente: Cliente = {
        id: clienteId,
        nombre: datosCliente.nombre!,
        telefono: datosCliente.telefono!,
        email: datosCliente.email,
        cedula: datosCliente.cedula,
        direccion: datosCliente.direccion,
      };

      const vehiculo: Vehiculo = {
        id: `vehiculo-${Date.now()}`,
        clienteId,
        marca: datosVehiculo.marca!,
        modelo: datosVehiculo.modelo!,
        ano: datosVehiculo.ano!,
        placa: datosVehiculo.placa!.toUpperCase(),
        color: datosVehiculo.color!,
        kilometraje: datosVehiculo.kilometraje!,
        vin: datosVehiculo.vin,
        motor: datosVehiculo.motor,
        combustible: datosVehiculo.combustible,
        transmision: datosVehiculo.transmision,
      };

      onGuardar(cliente, vehiculo);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar los datos");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {paso === "cliente" ? (
                <UserIcon className="h-8 w-8 text-blue-600" />
              ) : (
                <TruckIcon className="h-8 w-8 text-green-600" />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {clienteExistente
                    ? "Registrar Nuevo Vehículo"
                    : paso === "cliente"
                    ? "Registrar Nuevo Cliente"
                    : "Datos del Vehículo"}
                </h2>
                <p className="text-gray-600">
                  {paso === "cliente"
                    ? "Información personal del cliente"
                    : "Detalles técnicos del vehículo"}
                </p>
              </div>
            </div>

            <button
              onClick={onCancelar}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Indicador de pasos */}
          {!clienteExistente && (
            <div className="flex items-center space-x-2 mt-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  paso === "cliente" ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                }`}
              >
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 h-0.5 bg-gray-300" />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  paso === "vehiculo" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                <TruckIcon className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>

        {/* Formulario Cliente */}
        {paso === "cliente" && !clienteExistente && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={datosCliente.nombre}
                  onChange={(e) => handleClienteChange("nombre", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errores.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Juan Carlos Pérez"
                />
                {errores.nombre && <p className="mt-1 text-sm text-red-600">{errores.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={datosCliente.telefono}
                    onChange={(e) => handleClienteChange("telefono", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errores.telefono ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="8888-1234"
                  />
                </div>
                {errores.telefono && (
                  <p className="mt-1 text-sm text-red-600">{errores.telefono}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cédula</label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={datosCliente.cedula}
                    onChange={(e) => handleClienteChange("cedula", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errores.cedula ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="1-1234-5678"
                  />
                </div>
                {errores.cedula && <p className="mt-1 text-sm text-red-600">{errores.cedula}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={datosCliente.email}
                    onChange={(e) => handleClienteChange("email", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errores.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="cliente@email.com"
                  />
                </div>
                {errores.email && <p className="mt-1 text-sm text-red-600">{errores.email}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    value={datosCliente.direccion}
                    onChange={(e) => handleClienteChange("direccion", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder="San José, Costa Rica"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancelar}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={continuarAVehiculo}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Formulario Vehículo */}
        {paso === "vehiculo" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                <select
                  value={datosVehiculo.marca}
                  onChange={(e) => handleVehiculoChange("marca", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errores.marca ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Seleccionar marca...</option>
                  {marcasVehiculos.map((marca) => (
                    <option key={marca} value={marca}>
                      {marca}
                    </option>
                  ))}
                </select>
                {errores.marca && <p className="mt-1 text-sm text-red-600">{errores.marca}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                <input
                  type="text"
                  value={datosVehiculo.modelo}
                  onChange={(e) => handleVehiculoChange("modelo", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errores.modelo ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Corolla, Civic, Sentra..."
                />
                {errores.modelo && <p className="mt-1 text-sm text-red-600">{errores.modelo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año *</label>
                <input
                  type="number"
                  value={datosVehiculo.ano}
                  onChange={(e) => handleVehiculoChange("ano", parseInt(e.target.value))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errores.ano ? "border-red-500" : "border-gray-300"
                  }`}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                {errores.ano && <p className="mt-1 text-sm text-red-600">{errores.ano}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placa *</label>
                <input
                  type="text"
                  value={datosVehiculo.placa}
                  onChange={(e) => handleVehiculoChange("placa", e.target.value.toUpperCase())}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono ${
                    errores.placa ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="ABC123"
                  maxLength={6}
                />
                {errores.placa && <p className="mt-1 text-sm text-red-600">{errores.placa}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                <select
                  value={datosVehiculo.color}
                  onChange={(e) => handleVehiculoChange("color", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errores.color ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Seleccionar color...</option>
                  {coloresVehiculos.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
                {errores.color && <p className="mt-1 text-sm text-red-600">{errores.color}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kilometraje *
                </label>
                <input
                  type="number"
                  value={datosVehiculo.kilometraje}
                  onChange={(e) =>
                    handleVehiculoChange("kilometraje", parseInt(e.target.value) || 0)
                  }
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errores.kilometraje ? "border-red-500" : "border-gray-300"
                  }`}
                  min="0"
                  placeholder="50000"
                />
                {errores.kilometraje && (
                  <p className="mt-1 text-sm text-red-600">{errores.kilometraje}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Combustible</label>
                <select
                  value={datosVehiculo.combustible}
                  onChange={(e) => handleVehiculoChange("combustible", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {tiposCombustible.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmisión</label>
                <select
                  value={datosVehiculo.transmision}
                  onChange={(e) => handleVehiculoChange("transmision", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {tiposTransmision.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VIN (Opcional)
                </label>
                <input
                  type="text"
                  value={datosVehiculo.vin}
                  onChange={(e) => handleVehiculoChange("vin", e.target.value.toUpperCase())}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="1HGBH41JXMN109186"
                  maxLength={17}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motor (Opcional)
                </label>
                <input
                  type="text"
                  value={datosVehiculo.motor}
                  onChange={(e) => handleVehiculoChange("motor", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1.8L DOHC, 2.0L Turbo, V6 3.5L..."
                />
              </div>
            </div>

            <div className="flex justify-between">
              {!clienteExistente && (
                <button
                  onClick={() => setPaso("cliente")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Atrás
                </button>
              )}

              <div className="flex space-x-3 ml-auto">
                <button
                  onClick={onCancelar}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarClienteVehiculo}
                  disabled={guardando}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    guardando
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {guardando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
