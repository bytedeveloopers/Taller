"use client";

import {
  CameraIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  PlusIcon,
  QrCodeIcon,
  TrashIcon,
  TruckIcon,
  UserIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  CameraIcon as CameraSolid,
  CheckCircleIcon as CheckCircleSolid,
} from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { NuevoClienteVehiculo } from "./NuevoClienteVehiculo";
import { QRScanner } from "./QRScanner";

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
}

interface FotoInspeccion {
  id: string;
  ubicacion: string;
  descripcion: string;
  archivo?: File;
  url?: string;
  tieneDano: boolean;
  observaciones: string;
  timestamp: Date;
}

interface CheckInData {
  id: string;
  codigoSeguimiento: string;
  cliente: Cliente;
  vehiculo: Vehiculo;
  motivoIngreso: string;
  observacionesCliente: string;
  fotosInspeccion: FotoInspeccion[];
  firmaCliente?: string;
  fechaIngreso: Date;
  tecnicoRecepcion: string;
  estado: "pendiente" | "en_proceso" | "completado";
}

const ubicacionesVehiculo = [
  "Frontal completo",
  "Trasero completo",
  "Lateral izquierdo",
  "Lateral derecho",
  "Capó",
  "Techo",
  "Puerta conductor",
  "Puerta copiloto",
  "Puertas traseras",
  "Parabrisas delantero",
  "Parabrisas trasero",
  "Llantas delanteras",
  "Llantas traseras",
  "Interior - Tablero",
  "Interior - Asientos",
  "Interior - Consola",
  "Motor - Vista general",
  "Motor - Fluidos",
  "Baúl/Cajuela",
  "Tablero instrumentos",
];

export default function RecepcionTecnico() {
  // Estados principales
  const [modo, setModo] = useState<"buscar" | "nuevo" | "inspeccion">("buscar");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null);
  const [checkInActual, setCheckInActual] = useState<CheckInData | null>(null);

  // Estados QR
  const [mostrarQRScanner, setMostrarQRScanner] = useState(false);
  const [codigoQRDetectado, setCodigoQRDetectado] = useState<string | null>(null);
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false);

  // Handler para código QR detectado
  const handleQRDetectado = (codigo: string) => {
    setCodigoQRDetectado(codigo);
    setMostrarQRScanner(false);
    setTerminoBusqueda(codigo);
    buscarPorCodigo(codigo);
  };

  // Buscar por código de seguimiento
  const buscarPorCodigo = (codigo: string) => {
    // Simular búsqueda por código
    const clienteEncontrado = clientes.find(
      (c: Cliente) =>
        c.codigoSeguimiento === codigo ||
        c.vehiculos.some((v: Vehiculo) => v.codigoSeguimiento === codigo)
    );

    if (clienteEncontrado) {
      setClienteSeleccionado(clienteEncontrado);
      const vehiculo = clienteEncontrado.vehiculos.find(
        (v: Vehiculo) => v.codigoSeguimiento === codigo
      );
      if (vehiculo) {
        setVehiculoSeleccionado(vehiculo);
      }
    }
  };

  // Handler para nuevo cliente/vehículo creado
  const handleNuevoClienteCreado = (cliente: Cliente, vehiculo: Vehiculo) => {
    setClienteSeleccionado(cliente);
    setVehiculoSeleccionado(vehiculo);
    setMostrarFormularioNuevo(false);
  };

  // Estados de búsqueda
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  // Estados de formulario
  const [nuevoCliente, setNuevoCliente] = useState<Partial<Cliente>>({});
  const [nuevoVehiculo, setNuevoVehiculo] = useState<Partial<Vehiculo>>({});
  const [motivoIngreso, setMotivoIngreso] = useState("");
  const [observacionesCliente, setObservacionesCliente] = useState("");

  // Estados de inspección
  const [fotosInspeccion, setFotosInspeccion] = useState<FotoInspeccion[]>([]);
  const [mostrarCamera, setMostrarCamera] = useState(false);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState("");
  const [fotoActual, setFotoActual] = useState<FotoInspeccion | null>(null);
  const [mostrarFirma, setMostrarFirma] = useState(false);

  // Estados UI
  const [cargando, setCargando] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cargar datos simulados
  useEffect(() => {
    const clientesSimulados: Cliente[] = [
      {
        id: "1",
        nombre: "Juan Carlos Pérez",
        telefono: "8888-1234",
        email: "juan.perez@email.com",
        cedula: "1-1234-5678",
        direccion: "San José, Costa Rica",
      },
      {
        id: "2",
        nombre: "María González",
        telefono: "7777-5678",
        email: "maria.gonzalez@email.com",
        cedula: "2-2345-6789",
      },
      {
        id: "3",
        nombre: "Carlos Rodríguez",
        telefono: "6666-9012",
        cedula: "1-3456-7890",
      },
    ];

    const vehiculosSimulados: Vehiculo[] = [
      {
        id: "1",
        clienteId: "1",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2020,
        placa: "ABC123",
        color: "Blanco",
        kilometraje: 45000,
        vin: "1HGBH41JXMN109186",
      },
      {
        id: "2",
        clienteId: "1",
        marca: "Honda",
        modelo: "CR-V",
        ano: 2019,
        placa: "DEF456",
        color: "Gris",
        kilometraje: 62000,
      },
      {
        id: "3",
        clienteId: "2",
        marca: "Nissan",
        modelo: "Sentra",
        ano: 2021,
        placa: "GHI789",
        color: "Negro",
        kilometraje: 28000,
      },
    ];

    setClientes(clientesSimulados);
    setVehiculos(vehiculosSimulados);
  }, []);

  // Funciones de búsqueda
  const buscarClientes = (termino: string) => {
    return clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        cliente.telefono.includes(termino) ||
        cliente.cedula?.includes(termino) ||
        cliente.email?.toLowerCase().includes(termino.toLowerCase())
    );
  };

  const buscarVehiculos = (termino: string) => {
    return vehiculos.filter(
      (vehiculo) =>
        vehiculo.placa.toLowerCase().includes(termino.toLowerCase()) ||
        vehiculo.marca.toLowerCase().includes(termino.toLowerCase()) ||
        vehiculo.modelo.toLowerCase().includes(termino.toLowerCase()) ||
        vehiculo.vin?.toLowerCase().includes(termino.toLowerCase())
    );
  };

  // Función para iniciar cámara
  const iniciarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setMostrarCamera(true);
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert("No se pudo acceder a la cámara. Verifique los permisos.");
    }
  };

  // Función para tomar foto
  const tomarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context?.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const archivo = new File([blob], `inspeccion-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            const url = URL.createObjectURL(blob);

            const nuevaFoto: FotoInspeccion = {
              id: `foto-${Date.now()}`,
              ubicacion: ubicacionSeleccionada,
              descripcion: "",
              archivo,
              url,
              tieneDano: false,
              observaciones: "",
              timestamp: new Date(),
            };

            setFotoActual(nuevaFoto);
            setMostrarCamera(false);

            // Detener stream
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
            }
          }
        },
        "image/jpeg",
        0.8
      );
    }
  };

  // Función para guardar foto con observaciones
  const guardarFoto = () => {
    if (fotoActual) {
      setFotosInspeccion((prev) => [...prev, fotoActual]);
      setFotoActual(null);
      setUbicacionSeleccionada("");
    }
  };

  // Función para iniciar check-in
  const iniciarCheckIn = () => {
    if (!clienteSeleccionado || !vehiculoSeleccionado) {
      alert("Debe seleccionar cliente y vehículo");
      return;
    }

    const nuevoCheckIn: CheckInData = {
      id: `checkin-${Date.now()}`,
      codigoSeguimiento: generarCodigoSeguimiento(),
      cliente: clienteSeleccionado,
      vehiculo: vehiculoSeleccionado,
      motivoIngreso,
      observacionesCliente,
      fotosInspeccion: [],
      fechaIngreso: new Date(),
      tecnicoRecepcion: "Técnico Actual",
      estado: "en_proceso",
    };

    setCheckInActual(nuevoCheckIn);
    setModo("inspeccion");
  };

  // Función para completar check-in
  const completarCheckIn = async () => {
    if (!checkInActual) return;

    if (fotosInspeccion.length < 6) {
      alert("Se requieren al menos 6 fotos de inspección");
      return;
    }

    setCargando(true);

    try {
      // Simular guardado en API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const checkInCompleto = {
        ...checkInActual,
        fotosInspeccion,
        estado: "completado" as const,
      };

      console.log("Check-in completado:", checkInCompleto);

      // Reset
      setCheckInActual(null);
      setFotosInspeccion([]);
      setClienteSeleccionado(null);
      setVehiculoSeleccionado(null);
      setMotivoIngreso("");
      setObservacionesCliente("");
      setModo("buscar");

      alert(`✅ Check-in completado exitosamente\nCódigo: ${checkInCompleto.codigoSeguimiento}`);
    } catch (error) {
      console.error("Error al completar check-in:", error);
      alert("Error al completar el check-in");
    } finally {
      setCargando(false);
    }
  };

  const generarCodigoSeguimiento = () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    const hora = String(fecha.getHours()).padStart(2, "0");
    const minuto = String(fecha.getMinutes()).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();

    return `TLR-${año}${mes}${dia}-${hora}${minuto}-${random}`;
  };

  const clientesFiltrados = terminoBusqueda
    ? buscarClientes(terminoBusqueda)
    : clientes.slice(0, 5);
  const vehiculosFiltrados = clienteSeleccionado
    ? vehiculos.filter((v) => v.clienteId === clienteSeleccionado.id)
    : terminoBusqueda
    ? buscarVehiculos(terminoBusqueda)
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500 rounded-lg">
            <UserPlusIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recepción de Vehículos</h1>
            <p className="text-gray-600">
              {modo === "buscar" && "Buscar cliente y vehículo existente"}
              {modo === "nuevo" && "Registrar nuevo cliente/vehículo"}
              {modo === "inspeccion" && `Inspección - ${checkInActual?.codigoSeguimiento}`}
            </p>
          </div>
        </div>

        {/* Indicador de progreso */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              modo === "buscar" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            1
          </div>
          <div className="w-8 h-0.5 bg-gray-300" />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              modo === "inspeccion" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            2
          </div>
        </div>
      </div>

      {/* Modo: Buscar Cliente/Vehículo */}
      {modo === "buscar" && (
        <div className="space-y-6">
          {/* Barra de búsqueda */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, teléfono, cédula, placa o VIN..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setMostrarQRScanner(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <QrCodeIcon className="h-5 w-5" />
                  <span>Escanear QR</span>
                </button>

                <button
                  onClick={() => setMostrarFormularioNuevo(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Nuevo Cliente</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de Clientes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Clientes ({clientesFiltrados.length})
                </h2>
              </div>

              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {clientesFiltrados.map((cliente) => (
                  <div
                    key={cliente.id}
                    onClick={() => setClienteSeleccionado(cliente)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      clienteSeleccionado?.id === cliente.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{cliente.nombre}</h3>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {cliente.telefono}
                          </div>
                          {cliente.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <EnvelopeIcon className="h-4 w-4 mr-1" />
                              {cliente.email}
                            </div>
                          )}
                          {cliente.cedula && (
                            <p className="text-sm text-gray-500">Cédula: {cliente.cedula}</p>
                          )}
                        </div>
                      </div>

                      {clienteSeleccionado?.id === cliente.id && (
                        <CheckCircleSolid className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}

                {clientesFiltrados.length === 0 && (
                  <div className="text-center py-8">
                    <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No se encontraron clientes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Panel de Vehículos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2 text-green-500" />
                  Vehículos
                  {clienteSeleccionado && ` de ${clienteSeleccionado.nombre}`}(
                  {vehiculosFiltrados.length})
                </h2>
              </div>

              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {vehiculosFiltrados.map((vehiculo) => (
                  <div
                    key={vehiculo.id}
                    onClick={() => setVehiculoSeleccionado(vehiculo)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      vehiculoSeleccionado?.id === vehiculo.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {vehiculo.marca} {vehiculo.modelo} {vehiculo.ano}
                        </h3>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Placa:</span>
                            <span className="ml-1 font-medium">{vehiculo.placa}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Color:</span>
                            <span className="ml-1">{vehiculo.color}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Kilometraje:</span>
                            <span className="ml-1">{vehiculo.kilometraje.toLocaleString()} km</span>
                          </div>
                          {vehiculo.vin && (
                            <div className="col-span-2">
                              <span className="text-gray-500">VIN:</span>
                              <span className="ml-1 font-mono text-xs">{vehiculo.vin}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {vehiculoSeleccionado?.id === vehiculo.id && (
                        <CheckCircleSolid className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}

                {clienteSeleccionado && vehiculosFiltrados.length === 0 && (
                  <div className="text-center py-8">
                    <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Este cliente no tiene vehículos registrados</p>
                    <button
                      onClick={() => setModo("nuevo")}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Registrar Vehículo
                    </button>
                  </div>
                )}

                {!clienteSeleccionado && (
                  <div className="text-center py-8">
                    <InformationCircleIcon className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                    <p className="text-gray-500">Seleccione un cliente primero</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información de ingreso */}
          {clienteSeleccionado && vehiculoSeleccionado && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Ingreso</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de ingreso *
                  </label>
                  <select
                    value={motivoIngreso}
                    onChange={(e) => setMotivoIngreso(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar motivo...</option>
                    <option value="mantenimiento_preventivo">Mantenimiento Preventivo</option>
                    <option value="reparacion_general">Reparación General</option>
                    <option value="diagnostico">Diagnóstico</option>
                    <option value="chapa_pintura">Chapa y Pintura</option>
                    <option value="frenos">Sistema de Frenos</option>
                    <option value="suspension">Suspensión</option>
                    <option value="motor">Reparación de Motor</option>
                    <option value="transmision">Transmisión</option>
                    <option value="aire_acondicionado">Aire Acondicionado</option>
                    <option value="electrico">Sistema Eléctrico</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones del cliente
                  </label>
                  <textarea
                    value={observacionesCliente}
                    onChange={(e) => setObservacionesCliente(e.target.value)}
                    placeholder="Describa el problema o solicitud del cliente..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={iniciarCheckIn}
                  disabled={!motivoIngreso}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    motivoIngreso
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Iniciar Inspección
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modo: Inspección Visual */}
      {modo === "inspeccion" && checkInActual && (
        <div className="space-y-6">
          {/* Información del check-in */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{checkInActual.cliente.nombre}</h2>
                <p className="text-blue-100">
                  {checkInActual.vehiculo.marca} {checkInActual.vehiculo.modelo} -{" "}
                  {checkInActual.vehiculo.placa}
                </p>
                <p className="text-sm text-blue-200 mt-1">
                  Código: {checkInActual.codigoSeguimiento}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-blue-200">Progreso de inspección</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex-1 bg-blue-400 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(fotosInspeccion.length / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{fotosInspeccion.length}/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de ubicaciones para fotografiar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspección Visual 360°</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {ubicacionesVehiculo.map((ubicacion) => {
                const fotoExistente = fotosInspeccion.find((f) => f.ubicacion === ubicacion);

                return (
                  <button
                    key={ubicacion}
                    onClick={() => {
                      setUbicacionSeleccionada(ubicacion);
                      iniciarCamera();
                    }}
                    disabled={!!fotoExistente}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      fotoExistente
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {fotoExistente ? (
                        <CheckCircleSolid className="h-8 w-8 text-green-500" />
                      ) : (
                        <CameraIcon className="h-8 w-8 text-gray-400" />
                      )}

                      <span
                        className={`text-sm font-medium ${
                          fotoExistente ? "text-green-700" : "text-gray-700"
                        }`}
                      >
                        {ubicacion}
                      </span>

                      {fotoExistente && <span className="text-xs text-green-600">✓ Capturada</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progreso y estado */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CameraSolid className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Fotos capturadas: {fotosInspeccion.length}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Con daños: {fotosInspeccion.filter((f) => f.tieneDano).length}
                    </span>
                  </div>
                </div>

                {fotosInspeccion.length >= 6 && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Inspección suficiente</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Galería de fotos tomadas */}
          {fotosInspeccion.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Fotos de Inspección ({fotosInspeccion.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fotosInspeccion.map((foto) => (
                  <div key={foto.id} className="relative group">
                    <div
                      className={`border-2 rounded-lg overflow-hidden ${
                        foto.tieneDano ? "border-red-500" : "border-green-500"
                      }`}
                    >
                      {foto.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={foto.url}
                          alt={foto.ubicacion}
                          className="w-full h-48 object-cover"
                        />
                      )}

                      <div className="p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{foto.ubicacion}</h4>
                          <div className="flex items-center space-x-1">
                            {foto.tieneDano ? (
                              <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>

                        {foto.observaciones && (
                          <p className="text-sm text-gray-600">{foto.observaciones}</p>
                        )}

                        <p className="text-xs text-gray-500 mt-1">
                          {foto.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={() => {
                        setFotosInspeccion((prev) => prev.filter((f) => f.id !== foto.id));
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón completar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Finalizar Check-in</h3>
                <p className="text-gray-600 mt-1">
                  {fotosInspeccion.length >= 6
                    ? "La inspección está completa. Puede proceder a finalizar."
                    : `Se requieren al menos 6 fotos. Faltan ${6 - fotosInspeccion.length} fotos.`}
                </p>
              </div>

              <button
                onClick={completarCheckIn}
                disabled={fotosInspeccion.length < 6 || cargando}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  fotosInspeccion.length >= 6 && !cargando
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {cargando ? "Guardando..." : "Completar Check-in"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cámara */}
      {mostrarCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl p-4">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Fotografía: {ubicacionSeleccionada}</h3>
                <button
                  onClick={() => {
                    setMostrarCamera(false);
                    if (streamRef.current) {
                      streamRef.current.getTracks().forEach((track) => track.stop());
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-96 object-cover" />

                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <button
                    onClick={tomarFoto}
                    className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <CameraIcon className="h-8 w-8" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Foto */}
      {fotoActual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Detalles de la Foto</h3>
              <p className="text-gray-600">{fotoActual.ubicacion}</p>
            </div>

            <div className="p-6 space-y-4">
              {fotoActual.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoActual.url}
                  alt={fotoActual.ubicacion}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fotoActual.tieneDano}
                    onChange={(e) =>
                      setFotoActual((prev) =>
                        prev
                          ? {
                              ...prev,
                              tieneDano: e.target.checked,
                            }
                          : null
                      )
                    }
                    className="h-4 w-4 text-red-600 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    ⚠️ Esta foto documenta un daño o problema
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={fotoActual.observaciones}
                  onChange={(e) =>
                    setFotoActual((prev) =>
                      prev
                        ? {
                            ...prev,
                            observaciones: e.target.value,
                          }
                        : null
                    )
                  }
                  placeholder={
                    fotoActual.tieneDano
                      ? "Describa el daño encontrado (ubicación, tamaño, tipo)..."
                      : "Observaciones sobre esta parte del vehículo..."
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setFotoActual(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Descartar
              </button>
              <button
                onClick={guardarFoto}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {mostrarQRScanner && (
        <QRScanner
          onClose={() => setMostrarQRScanner(false)}
          onScan={handleQRDetectado}
          isOpen={mostrarQRScanner}
        />
      )}

      {/* Formulario Nuevo Cliente/Vehículo */}
      {mostrarFormularioNuevo && (
        <NuevoClienteVehiculo
          onCancelar={() => setMostrarFormularioNuevo(false)}
          onGuardar={handleNuevoClienteCreado}
        />
      )}
    </div>
  );
}
