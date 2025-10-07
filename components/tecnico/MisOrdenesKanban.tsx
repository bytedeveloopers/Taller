"use client";

import FiltrosModal from "@/components/tecnico/FiltrosModal";
import KanbanBoard from "@/components/tecnico/KanbanBoard";
import ListaOrdenes from "@/components/tecnico/ListaOrdenes";
import { EstadoOT, OrdenTrabajo, ordenesDesarrolloMock } from "@/types/ordenes";
import {
  FunnelIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface FiltrosOrdenes {
  estado?: EstadoOT;
  prioridad?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  cliente?: string;
  marca?: string;
}

export default function MisOrdenesKanban() {
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [vistaKanban, setVistaKanban] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState<FiltrosOrdenes>({});

  // Cargar órdenes del técnico
  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        setLoading(true);
        // TODO: Implementar llamada real a API
        // const response = await fetch("/api/ordenes?asignadoA=me");
        // const data = await response.json();

        // Datos simulados
        // Usar datos mock de desarrollo
        setOrdenes(ordenesDesarrolloMock);
      } catch (error) {
        console.error("Error cargando órdenes:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarOrdenes();
  }, [filtros]);

  // Filtrar órdenes según búsqueda y filtros
  const ordenesFiltradas = ordenes.filter((orden) => {
    // Filtro de búsqueda
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      const coincide =
        orden.numero?.toLowerCase().includes(busquedaLower) ||
        orden.vehiculo?.placa.toLowerCase().includes(busquedaLower) ||
        orden.vehiculo?.vin?.toLowerCase().includes(busquedaLower) ||
        orden.cliente?.nombre.toLowerCase().includes(busquedaLower);

      if (!coincide) return false;
    }

    // Filtros adicionales
    if (filtros.estado && orden.estado !== filtros.estado) return false;
    if (filtros.prioridad && orden.prioridad !== filtros.prioridad) return false;

    return true;
  });

  const handleCambiarEstado = async (ordenId: string, nuevoEstado: EstadoOT, motivo?: string) => {
    try {
      // TODO: Implementar llamada a API
      // await fetch(`/api/ordenes/${ordenId}/estado`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ estado: nuevoEstado, motivoEnEspera: motivo })
      // });

      setOrdenes((prev) =>
        prev.map((orden) => (orden.id === ordenId ? { ...orden, estado: nuevoEstado } : orden))
      );
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  const handleSubirEvidencias = async (ordenId: string, evidencias: File[]) => {
    try {
      // TODO: Implementar subida de evidencias
      console.log(`Subiendo ${evidencias.length} evidencias para orden ${ordenId}`);
    } catch (error) {
      console.error("Error subiendo evidencias:", error);
    }
  };

  const handleAgregarNota = async (ordenId: string, nota: string) => {
    try {
      // TODO: Implementar llamada a API
      const nuevaNota = {
        id: Date.now().toString(),
        texto: nota,
        creadoEn: new Date().toISOString(),
        autorId: "tecnico1",
      };

      setOrdenes((prev) =>
        prev.map((orden) =>
          orden.id === ordenId
            ? { ...orden, notasTecnicas: [...orden.notasTecnicas, nuevaNota] }
            : orden
        )
      );
    } catch (error) {
      console.error("Error agregando nota:", error);
    }
  };

  const aplicarFiltros = (nuevosFiltros: FiltrosOrdenes) => {
    setFiltros(nuevosFiltros);
    setMostrarFiltros(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con controles */}
      <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Órdenes de Trabajo</h1>
            <p className="text-gray-400 mt-1">{ordenesFiltradas.length} órdenes encontradas</p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Búsqueda */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por placa, VIN o cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
              />
            </div>

            {/* Controles */}
            <div className="flex space-x-2">
              <button
                onClick={() => setMostrarFiltros(true)}
                className="flex items-center px-4 py-2 bg-secondary-700 hover:bg-secondary-600 border border-secondary-600 rounded-lg text-gray-300 hover:text-white transition-colors"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filtros
              </button>

              <div className="flex bg-secondary-700 rounded-lg border border-secondary-600">
                <button
                  onClick={() => setVistaKanban(true)}
                  className={`px-3 py-2 rounded-l-lg transition-colors ${
                    vistaKanban ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setVistaKanban(false)}
                  className={`px-3 py-2 rounded-r-lg transition-colors ${
                    !vistaKanban ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {vistaKanban ? (
        <KanbanBoard
          ordenes={ordenesFiltradas}
          onCambiarEstado={handleCambiarEstado}
          onSubirEvidencias={handleSubirEvidencias}
          onAgregarNota={handleAgregarNota}
        />
      ) : (
        <ListaOrdenes
          ordenes={ordenesFiltradas}
          onCambiarEstado={handleCambiarEstado}
          onSubirEvidencias={handleSubirEvidencias}
          onAgregarNota={handleAgregarNota}
        />
      )}

      {/* Modal de filtros */}
      {mostrarFiltros && (
        <FiltrosModal
          filtros={filtros}
          onAplicar={aplicarFiltros}
          onCerrar={() => setMostrarFiltros(false)}
        />
      )}
    </div>
  );
}
