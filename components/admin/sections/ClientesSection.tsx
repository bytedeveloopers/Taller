"use client";

import {
  EnvelopeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import Ficha360Cliente from "../clientes/Ficha360Cliente";
import FormularioCliente from "../clientes/FormularioCliente";
import FusionDuplicados from "../clientes/FusionDuplicados";
import ListadoClientes from "../clientes/ListadoClientes";

interface Props {
  stats: any;
}

interface Cliente {
  id: string;
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

type Vista = "dashboard" | "listado" | "fusion";

export default function ClientesSection({ stats }: Props) {
  const [vista, setVista] = useState<Vista>("dashboard");
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [fichaAbierta, setFichaAbierta] = useState(false);
  const [fusionAbierta, setFusionAbierta] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [clienteIdFicha, setClienteIdFicha] = useState<string>("");
  const [modoFormulario, setModoFormulario] = useState<"create" | "edit">("create");

  // Handlers para el listado de clientes
  const handleCrearCliente = () => {
    setClienteSeleccionado(null);
    setModoFormulario("create");
    setFormularioAbierto(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setModoFormulario("edit");
    setFormularioAbierto(true);
  };

  const handleVerFicha = (cliente: Cliente) => {
    setClienteIdFicha(cliente.id);
    setFichaAbierta(true);
  };

  const handleGuardarCliente = (cliente: Cliente) => {
    // Aquí podrías actualizar el estado local si es necesario
    console.log("Cliente guardado:", cliente);
    // El componente ListadoClientes se actualizará automáticamente
  };

  const handleFusionCompleta = () => {
    // Recargar el listado si está visible
    if (vista === "listado") {
      // El componente ListadoClientes se actualizará automáticamente
    }
  };

  if (vista === "listado") {
    return (
      <>
        <ListadoClientes
          onCrearCliente={handleCrearCliente}
          onEditarCliente={handleEditarCliente}
          onVerFicha={handleVerFicha}
        />

        {/* Modales */}
        <FormularioCliente
          isOpen={formularioAbierto}
          onClose={() => setFormularioAbierto(false)}
          cliente={clienteSeleccionado}
          onSave={handleGuardarCliente}
          mode={modoFormulario}
        />

        <Ficha360Cliente
          isOpen={fichaAbierta}
          onClose={() => setFichaAbierta(false)}
          clienteId={clienteIdFicha}
          onEdit={() => {
            setFichaAbierta(false);
            // Buscar el cliente para editarlo
            // En una implementación real, harías una petición a la API
            // Por ahora, solo abrir el formulario en modo edición
            setModoFormulario("edit");
            setFormularioAbierto(true);
          }}
        />

        <FusionDuplicados
          isOpen={fusionAbierta}
          onClose={() => setFusionAbierta(false)}
          onFusionCompleta={handleFusionCompleta}
        />
      </>
    );
  }

  if (vista === "fusion") {
    return (
      <>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Fusión de Duplicados</h2>
              <p className="text-gray-400">Gestiona y fusiona clientes duplicados</p>
            </div>
            <button
              onClick={() => setVista("dashboard")}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>

          <FusionDuplicados
            isOpen={true}
            onClose={() => setVista("dashboard")}
            onFusionCompleta={() => setVista("listado")}
          />
        </div>
      </>
    );
  }

  // Vista por defecto: Dashboard
  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Clientes</p>
              <p className="text-3xl font-bold text-white">{stats?.totalClientes || 0}</p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Clientes Activos</p>
              <p className="text-3xl font-bold text-white">
                {Math.floor((stats?.totalClientes || 0) * 0.8)}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Nuevos Este Mes</p>
              <p className="text-3xl font-bold text-white">12</p>
            </div>
            <PlusIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Acciones principales */}
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Gestión de Clientes</h2>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setVista("listado")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <UserGroupIcon className="h-5 w-5" />
              <span>Ver Todos los Clientes</span>
            </button>

            <button
              onClick={handleCrearCliente}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Nuevo Cliente</span>
            </button>

            <button
              onClick={() => setVista("fusion")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <UserGroupIcon className="h-5 w-5" />
              <span>Fusionar Duplicados</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de funcionalidades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gestión de Clientes */}
        <div
          onClick={() => setVista("listado")}
          className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-blue-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Listado de Clientes</h3>
          </div>
          <p className="text-gray-400 mb-4">Visualiza y gestiona todos los clientes registrados</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Búsqueda y filtros avanzados</li>
            <li>• Perfiles completos con ficha 360°</li>
            <li>• Edición rápida de información</li>
          </ul>
        </div>

        {/* Nuevo Cliente */}
        <div
          onClick={handleCrearCliente}
          className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-green-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <PlusIcon className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Registro de Cliente</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Crea nuevos perfiles de clientes con información completa
          </p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Datos personales y de contacto</li>
            <li>• Preferencias de comunicación</li>
            <li>• Etiquetas y clasificaciones</li>
          </ul>
        </div>

        {/* Fusión de Duplicados */}
        <div
          onClick={() => setVista("fusion")}
          className="bg-secondary-800 rounded-xl p-6 border border-secondary-700 hover:border-purple-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Fusión de Duplicados</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Detecta y fusiona clientes duplicados de forma inteligente
          </p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Detección automática de similitudes</li>
            <li>• Proceso guiado de fusión</li>
            <li>• Transferencia segura de datos</li>
          </ul>
        </div>
      </div>

      {/* Próximamente */}
      <div className="bg-gradient-to-r from-primary-900/50 to-secondary-800 rounded-xl p-6 border border-primary-500/30">
        <h3 className="text-xl font-semibold text-white mb-4">🚀 Próximamente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-5 w-5 text-primary-400" />
            <span className="text-gray-300">Sistema de notificaciones automáticas</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPinIcon className="h-5 w-5 text-primary-400" />
            <span className="text-gray-300">Geolocalización de clientes</span>
          </div>
          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-5 w-5 text-primary-400" />
            <span className="text-gray-300">Integración con WhatsApp Business</span>
          </div>
          <div className="flex items-center space-x-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-400" />
            <span className="text-gray-300">Analytics avanzados de clientes</span>
          </div>
        </div>
      </div>

      {/* Modales */}
      <FormularioCliente
        isOpen={formularioAbierto}
        onClose={() => setFormularioAbierto(false)}
        cliente={clienteSeleccionado}
        onSave={handleGuardarCliente}
        mode={modoFormulario}
      />

      <Ficha360Cliente
        isOpen={fichaAbierta}
        onClose={() => setFichaAbierta(false)}
        clienteId={clienteIdFicha}
        onEdit={() => {
          setFichaAbierta(false);
          setModoFormulario("edit");
          setFormularioAbierto(true);
        }}
      />

      <FusionDuplicados
        isOpen={fusionAbierta}
        onClose={() => setFusionAbierta(false)}
        onFusionCompleta={handleFusionCompleta}
      />
    </div>
  );
}
