"use client";"use client";"use client";"use client";



import { useAppointments } from "@/hooks/useAppointments";

import {

  CalendarDaysIcon,import { useAppointments } from "@/hooks/useAppointments";

  CheckIcon,

  PencilIcon,import { useCustomersAndVehicles } from "@/hooks/useCustomersAndVehicles";

  PlusIcon,

  TrashIcon,import {import { useAppointments } from "@/hooks/useAppointments";import { useAppointments } from "@/hooks/useAppointments";

  WrenchScrewdriverIcon,

  XMarkIcon,  CalendarDaysIcon,

} from "@heroicons/react/24/outline";

import { useMemo, useState } from "react";  CheckIcon,import { useCustomersAndVehicles } from "@/hooks/useCustomersAndVehicles";



type EstadoCita = "pendiente" | "en_proceso" | "completada" | "cancelada";  PencilIcon,



const statusMap = {  PlusIcon,export default function GestionDeCitasReal() {import {

  SCHEDULED: "pendiente",

  IN_PROGRESS: "en_proceso",  TrashIcon,

  COMPLETED: "completada",

  CANCELLED: "cancelada",  WrenchScrewdriverIcon,  const { appointments, loading, error, updateAppointment, deleteAppointment, createAppointment } = useAppointments();  CalendarDaysIcon,

  NO_SHOW: "cancelada",

} as const;  XMarkIcon,



function EstadoBadge({ estado }: { estado: EstadoCita }) {} from "@heroicons/react/24/outline";  CheckIcon,

  const base =

    "px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1";import { useMemo, useState } from "react";



  const icon =  if (loading) {  PencilIcon,

    estado === "pendiente" ? (

      <CalendarDaysIcon className="w-3 h-3" />type EstadoCita = "pendiente" | "en_proceso" | "completada" | "cancelada";

    ) : estado === "en_proceso" ? (

      <WrenchScrewdriverIcon className="w-3 h-3" />    return (  PlusIcon,

    ) : estado === "completada" ? (

      <CheckIcon className="w-3 h-3" />const statusMap = {

    ) : (

      <XMarkIcon className="w-3 h-3" />  SCHEDULED: "pendiente",      <div className="p-6 bg-secondary-800 rounded-xl">  TrashIcon,

    );

  IN_PROGRESS: "en_proceso",

  const colorClass =

    estado === "pendiente"  COMPLETED: "completada",        <div className="animate-pulse">  WrenchScrewdriverIcon,

      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"

      : estado === "en_proceso"  CANCELLED: "cancelada",

      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"

      : estado === "completada"  NO_SHOW: "cancelada",          <div className="h-8 bg-gray-700 rounded mb-4"></div>  XMarkIcon,

      ? "bg-green-500/20 text-green-400 border border-green-500/30"

      : "bg-red-500/20 text-red-400 border border-red-500/30";} as const;



  return (          <div className="h-32 bg-gray-700 rounded"></div>} from "@heroicons/react/24/outline";

    <span className={`${base} ${colorClass}`}>

      {icon}const reverseStatusMap = {

      {estado === "pendiente"

        ? "Pendiente"  pendiente: "SCHEDULED",        </div>import { useMemo, useState } from "react";

        : estado === "en_proceso"

        ? "En Proceso"  en_proceso: "IN_PROGRESS",

        : estado === "completada"

        ? "Completada"  completada: "COMPLETED",      </div>// import EditarCitaForm from "./EditarCitaForm";

        : "Cancelada"}

    </span>  cancelada: "CANCELLED",

  );

}} as const;    );// import NuevaCitaForm from "./NuevaCitaForm";



export default function GestionDeCitasReal() {

  const { appointments, loading, error } = useAppointments();

  const [showCreateForm, setShowCreateForm] = useState(false);function EstadoBadge({ estado }: { estado: EstadoCita }) {  }



  if (loading) {  const base =

    return (

      <div className="p-6 bg-secondary-800 rounded-xl">    "px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1";// Mapeo de estados de la BD a español

        <div className="animate-pulse">

          <div className="h-8 bg-gray-700 rounded mb-4"></div>

          <div className="h-32 bg-gray-700 rounded"></div>

        </div>  const icon =  if (error) {const statusMap = {

      </div>

    );    estado === "pendiente" ? (

  }

      <CalendarDaysIcon className="w-3 h-3" />    return (  SCHEDULED: "pendiente",

  if (error) {

    return (    ) : estado === "en_proceso" ? (

      <div className="p-6 bg-secondary-800 rounded-xl">

        <h2 className="text-2xl font-bold text-white mb-4">Gestión de Citas</h2>      <WrenchScrewdriverIcon className="w-3 h-3" />      <div className="p-6 bg-secondary-800 rounded-xl">  IN_PROGRESS: "en_proceso",

        <p className="text-red-400">Error cargando citas: {error}</p>

      </div>    ) : estado === "completada" ? (

    );

  }      <CheckIcon className="w-3 h-3" />        <h2 className="text-2xl font-bold text-white mb-4">Gestión de Citas</h2>  COMPLETED: "completada",



  return (    ) : (

    <div className="p-6 bg-secondary-800 rounded-xl">

      <div className="flex justify-between items-center mb-6">      <XMarkIcon className="w-3 h-3" />        <p className="text-red-400">Error cargando citas: {error}</p>  CANCELLED: "cancelada",

        <h2 className="text-2xl font-bold text-white">Gestión de Citas</h2>

        <button    );

          onClick={() => setShowCreateForm(true)}

          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"      </div>  NO_SHOW: "cancelada",

        >

          <PlusIcon className="w-4 h-4" />  const colorClass =

          Nueva Cita

        </button>    estado === "pendiente"    );} as const;

      </div>

      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"

      {appointments && appointments.length > 0 ? (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">      : estado === "en_proceso"  }

          {appointments.map((appointment) => (

            <div      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"

              key={appointment.id}

              className="bg-secondary-700 rounded-lg p-4 border border-secondary-600 hover:border-primary-500/50 transition-colors"      : estado === "completada"const reverseStatusMap = {

            >

              <div className="flex justify-between items-start mb-3">      ? "bg-green-500/20 text-green-400 border border-green-500/30"

                <div>

                  <h3 className="text-lg font-semibold text-white">      : "bg-red-500/20 text-red-400 border border-red-500/30";  return (  pendiente: "SCHEDULED",

                    {appointment.customer?.name || 'Cliente no especificado'}

                  </h3>

                  <p className="text-gray-400 text-sm">

                    {appointment.vehicle?.brand} {appointment.vehicle?.model}  return (    <div className="p-6 bg-secondary-800 rounded-xl">  en_proceso: "IN_PROGRESS",

                  </p>

                </div>    <span className={`${base} ${colorClass}`}>

                <EstadoBadge estado={statusMap[appointment.status as keyof typeof statusMap] || "pendiente"} />

              </div>      {icon}      <h2 className="text-2xl font-bold text-white mb-4">Gestión de Citas</h2>  completada: "COMPLETED",



              <div className="space-y-2 mb-4">      {estado === "pendiente"

                <p className="text-gray-300 text-sm">

                  <span className="font-medium">Fecha:</span>{" "}        ? "Pendiente"      <div className="space-y-4">  cancelada: "CANCELLED",

                  {new Date(appointment.scheduledAt).toLocaleDateString('es-ES', {

                    year: 'numeric',        : estado === "en_proceso"

                    month: 'long',

                    day: 'numeric',        ? "En Proceso"        {appointments && appointments.length > 0 ? (} as const;

                    hour: '2-digit',

                    minute: '2-digit'        : estado === "completada"

                  })}

                </p>        ? "Completada"          appointments.map((appointment) => (

                {appointment.services && appointment.services.length > 0 && (

                  <p className="text-gray-300 text-sm">        : "Cancelada"}

                    <span className="font-medium">Servicios:</span>{" "}

                    {appointment.services.map((s: any) => s.name).join(', ')}    </span>            <div key={appointment.id} className="p-4 bg-secondary-700 rounded-lg">type EstadoCita = keyof typeof reverseStatusMap;

                  </p>

                )}  );

                {appointment.notes && (

                  <p className="text-gray-300 text-sm">}              <div className="flex justify-between items-start">

                    <span className="font-medium">Notas:</span> {appointment.notes}

                  </p>

                )}

              </div>export default function GestionDeCitasReal() {                <div>/* ------------ Badge de estado ------------ */



              <div className="flex gap-2">  const { appointments, loading, error, updateAppointment, deleteAppointment, createAppointment } = useAppointments();

                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm inline-flex items-center justify-center gap-1 transition-colors">

                  <PencilIcon className="w-3 h-3" />  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);                  <h3 className="text-lg font-semibold text-white">function EstadoBadge({ estado }: { estado: EstadoCita }) {

                  Editar

                </button>  const [showEditForm, setShowEditForm] = useState(false);

                <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm inline-flex items-center justify-center gap-1 transition-colors">

                  <TrashIcon className="w-3 h-3" />                    {appointment.customer?.name || 'Cliente no especificado'}  const base =

                </button>

              </div>  const appointmentsByStatus = useMemo(() => {

            </div>

          ))}    if (!appointments) return {};                  </h3>    "inline-flex items-center px-3 py-2 text-sm font-bold rounded-lg border-2 transition-all";

        </div>

      ) : (

        <div className="text-center py-12">

          <CalendarDaysIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />    return appointments.reduce((acc: any, appointment: any) => {                  <p className="text-gray-400">  const styles =

          <h3 className="text-xl font-semibold text-gray-400 mb-2">

            No hay citas registradas      const estado = statusMap[appointment.status as keyof typeof statusMap] || "pendiente";

          </h3>

          <p className="text-gray-500 mb-4">      if (!acc[estado]) acc[estado] = [];                    {appointment.vehicle?.make} {appointment.vehicle?.model} - {appointment.vehicle?.licensePlate}    estado === "pendiente"

            Comienza agregando una nueva cita

          </p>      acc[estado].push(appointment);

        </div>

      )}      return acc;                  </p>      ? "bg-yellow-500 border-yellow-400 text-yellow-900"



      {showCreateForm && (    }, {});

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-secondary-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">  }, [appointments]);                  <p className="text-sm text-gray-500">      : estado === "en_proceso"

            <div className="flex justify-between items-center mb-4">

              <h3 className="text-xl font-bold text-white">Nueva Cita</h3>

              <button

                onClick={() => setShowCreateForm(false)}  if (loading) {                    {new Date(appointment.scheduledAt).toLocaleDateString('es-ES')} a las{' '}      ? "bg-blue-500 border-blue-400 text-white"

                className="text-gray-400 hover:text-white"

              >    return (

                <XMarkIcon className="w-6 h-6" />

              </button>      <div className="p-6 bg-secondary-800 rounded-xl">                    {new Date(appointment.scheduledAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}      : estado === "completada"

            </div>

                    <div className="animate-pulse">

            <div className="text-center py-8">

              <p className="text-gray-400">          <div className="h-8 bg-gray-700 rounded mb-4"></div>                  </p>      ? "bg-green-500 border-green-400 text-white"

                Formulario de creación de citas

              </p>          <div className="h-32 bg-gray-700 rounded"></div>

              <p className="text-sm text-gray-500 mt-2">

                Esta funcionalidad se implementará próximamente        </div>                </div>      : "bg-red-500 border-red-400 text-white";

              </p>

            </div>      </div>

          </div>

        </div>    );                <div className="flex items-center space-x-2">

      )}

    </div>  }

  );

}                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${  const icon =

  if (error) {

    return (                    appointment.status === 'SCHEDULED' ? 'bg-yellow-500/20 text-yellow-400' :    estado === "pendiente"

      <div className="p-6 bg-secondary-800 rounded-xl">

        <h2 className="text-2xl font-bold text-white mb-4">Gestión de Citas</h2>                    appointment.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :      ? "⏳"

        <p className="text-red-400">Error cargando citas: {error}</p>

      </div>                    appointment.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :      : estado === "en_proceso"

    );

  }                    'bg-red-500/20 text-red-400'      ? "🔧"



  return (                  }`}>      : estado === "completada"

    <div className="p-6 bg-secondary-800 rounded-xl">

      <h2 className="text-2xl font-bold text-white mb-4">Gestión de Citas</h2>                    {appointment.status === 'SCHEDULED' ? 'Programada' :      ? "✅"



      <div className="mb-6">                     appointment.status === 'IN_PROGRESS' ? 'En Proceso' :      : "❌";

        <button

          onClick={() => setShowEditForm(true)}                     appointment.status === 'COMPLETED' ? 'Completa' : 'Cancelada'}

          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"

        >                  </span>  const text =

          <PlusIcon className="w-4 h-4" />

          Nueva Cita                </div>    estado === "pendiente"

        </button>

      </div>              </div>      ? "Pendiente"



      {appointments && appointments.length > 0 ? (              {appointment.notes && (      : estado === "en_proceso"

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {appointments.map((appointment) => (                <p className="text-gray-300 text-sm mt-2">{appointment.notes}</p>      ? "En Proceso"

            <div

              key={appointment.id}              )}      : estado === "completada"

              className="bg-secondary-700 rounded-lg p-4 border border-secondary-600 hover:border-primary-500/50 transition-colors"

            >            </div>      ? "Completada"

              <div className="flex justify-between items-start mb-3">

                <div>          ))      : "Cancelada";

                  <h3 className="text-lg font-semibold text-white">

                    {appointment.customer?.name || 'Cliente no especificado'}        ) : (

                  </h3>

                  <p className="text-gray-400 text-sm">          <div className="text-center py-8">  return (

                    {appointment.vehicle?.brand} {appointment.vehicle?.model}

                  </p>            <p className="text-gray-400">No hay citas registradas</p>    <span className={`${base} ${styles}`}>

                </div>

                <EstadoBadge estado={statusMap[appointment.status as keyof typeof statusMap] || "pendiente"} />          </div>      {icon} {text}

              </div>

        )}    </span>

              <div className="space-y-2 mb-4">

                <p className="text-gray-300 text-sm">      </div>  );

                  <span className="font-medium">Fecha:</span>{" "}

                  {new Date(appointment.scheduledAt).toLocaleDateString('es-ES', {    </div>}

                    year: 'numeric',

                    month: 'long',  );

                    day: 'numeric',

                    hour: '2-digit',}export default function GestionDeCitasReal() {

                    minute: '2-digit'  return (

                  })}    <div className="p-6 bg-secondary-800 rounded-xl">

                </p>      <h2 className="text-2xl font-bold text-white mb-4">Gestión de Citas</h2>

                {appointment.services && appointment.services.length > 0 && (      <p className="text-gray-400">Componente en desarrollo - versión simplificada temporal</p>

                  <p className="text-gray-300 text-sm">    </div>

                    <span className="font-medium">Servicios:</span>{" "}  );

                    {appointment.services.map((s: any) => s.name).join(', ')}}

                  </p>

                )}function GestionDeCitasRealOriginal() {

                {appointment.notes && (  const {

                  <p className="text-gray-300 text-sm">    appointments,

                    <span className="font-medium">Notas:</span> {appointment.notes}    loading,

                  </p>    error,

                )}    updateAppointment,

              </div>    updateAppointmentStatus,

    deleteAppointment,

              <div className="flex gap-2">    createAppointment,

                <button  } = useAppointments();

                  onClick={() => {  const { customers, loading: customersLoading } = useCustomersAndVehicles();

                    setSelectedAppointment(appointment);

                    setShowEditForm(true);  // Estados locales

                  }}  const [searchTerm, setSearchTerm] = useState("");

                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm inline-flex items-center justify-center gap-1 transition-colors"  const [filterEstado, setFilterEstado] = useState<string>("todos");

                >  const [showNewCitaForm, setShowNewCitaForm] = useState(false);

                  <PencilIcon className="w-3 h-3" />  const [showEditCitaForm, setShowEditCitaForm] = useState(false);

                  Editar  const [selectedCita, setSelectedCita] = useState<any>(null);

                </button>

                <button  // Transformar appointments a formato legacy para compatibilidad

                  onClick={() => {  const citas = useMemo(() => {

                    if (confirm('¿Estás seguro de eliminar esta cita?')) {    return appointments.map((appointment) => ({

                      deleteAppointment(appointment.id);      id: appointment.id,

                    }      cliente: appointment.customer.name,

                  }}      vehiculo: `${appointment.vehicle.brand} ${appointment.vehicle.model} ${appointment.vehicle.year}`,

                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm inline-flex items-center justify-center gap-1 transition-colors"      servicio: appointment.notes || "Servicio general",

                >      fecha: new Date(appointment.scheduledAt).toLocaleDateString("es-GT", {

                  <TrashIcon className="w-3 h-3" />        day: "2-digit",

                </button>        month: "2-digit",

              </div>        year: "numeric",

            </div>      }),

          ))}      hora: new Date(appointment.scheduledAt).toLocaleTimeString("es-GT", {

        </div>        hour: "2-digit",

      ) : (        minute: "2-digit",

        <div className="text-center py-12">      }),

          <CalendarDaysIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />      estado: statusMap[appointment.status] || "pendiente",

          <h3 className="text-xl font-semibold text-gray-400 mb-2">      telefono: appointment.customer.phone,

            No hay citas registradas      total: 0, // Por ahora no tenemos precios en el modelo

          </h3>      _original: appointment, // Guardamos el appointment original

          <p className="text-gray-500 mb-4">    }));

            Comienza agregando una nueva cita  }, [appointments]);

          </p>

        </div>  // Filtros

      )}  const filteredCitas = useMemo(() => {

    return citas.filter((cita) => {

      {/* Modal para formulario de edición */}      const matchesSearch =

      {showEditForm && (        !searchTerm ||

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">        [cita.cliente, cita.vehiculo, cita.servicio, cita.telefono].some((field) =>

          <div className="bg-secondary-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">          field.toLowerCase().includes(searchTerm.toLowerCase())

            <div className="flex justify-between items-center mb-4">        );

              <h3 className="text-xl font-bold text-white">

                {selectedAppointment ? 'Editar Cita' : 'Nueva Cita'}      const matchesEstado = filterEstado === "todos" || cita.estado === filterEstado;

              </h3>

              <button      return matchesSearch && matchesEstado;

                onClick={() => {    });

                  setShowEditForm(false);  }, [citas, searchTerm, filterEstado]);

                  setSelectedAppointment(null);

                }}  // Handlers

                className="text-gray-400 hover:text-white"  const handleUpdateEstado = async (id: string, nuevoEstado: EstadoCita) => {

              >    try {

                <XMarkIcon className="w-6 h-6" />      const dbStatus = reverseStatusMap[nuevoEstado];

              </button>      await updateAppointmentStatus(id, dbStatus);

            </div>    } catch (error) {

                  console.error("Error updating appointment status:", error);

            {/* Aquí iría el formulario de edición */}      alert("Error al actualizar el estado de la cita");

            <div className="text-center py-8">    }

              <p className="text-gray-400">  };

                Formulario de {selectedAppointment ? 'edición' : 'creación'} de citas

              </p>  const handleDeleteCita = async (id: string) => {

              <p className="text-sm text-gray-500 mt-2">    if (confirm("¿Estás seguro de que quieres eliminar esta cita?")) {

                Esta funcionalidad se implementará próximamente      try {

              </p>        await deleteAppointment(id);

            </div>      } catch (error) {

          </div>        console.error("Error deleting appointment:", error);

        </div>        alert("Error al eliminar la cita");

      )}      }

    </div>    }

  );  };

}
  const handleEditCita = (cita: any) => {
    setSelectedCita(cita);
    setShowEditCitaForm(true);
  };

  const handleUpdateCita = async (citaId: string, citaData: any) => {
    try {
      await updateAppointment(citaId, citaData);
      setShowEditCitaForm(false);
      setSelectedCita(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  };

  if (loading || customersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-400">Error cargando citas: {error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-primary-400/30">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-transparent animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-1 tracking-tight">
                💼 Gestión de Citas
              </h2>
              <p className="text-primary-100 text-lg font-medium">
                Gestión y seguimiento de citas del taller
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-primary-100">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              Sistema Online • Actualización en Tiempo Real
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Citas Pendientes */}
        <div className="group bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 rounded-2xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-yellow-500/30 relative overflow-hidden border border-yellow-400/30">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-yellow-100 text-sm font-bold uppercase tracking-wider mb-2">
                Pendientes
              </p>
              <p className="text-4xl font-bold mb-1 transition-all duration-300 group-hover:scale-110">
                {citas.filter((c) => c.estado === "pendiente").length}
              </p>
              <p className="text-yellow-200 text-sm font-medium">Por atender</p>
            </div>
            <div className="relative">
              <CalendarDaysIcon className="h-14 w-14 text-yellow-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute -inset-2 bg-yellow-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* Citas En Proceso */}
        <div className="group bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-blue-500/30 relative overflow-hidden border border-blue-400/30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-2">
                En Proceso
              </p>
              <p className="text-4xl font-bold mb-1 transition-all duration-300 group-hover:scale-110">
                {citas.filter((c) => c.estado === "en_proceso").length}
              </p>
              <p className="text-blue-200 text-sm font-medium">Siendo atendidas</p>
            </div>
            <div className="relative">
              <WrenchScrewdriverIcon className="h-14 w-14 text-blue-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute -inset-2 bg-blue-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* Citas Completadas */}
        <div className="group bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-2xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-green-500/30 relative overflow-hidden border border-green-400/30">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-green-100 text-sm font-bold uppercase tracking-wider mb-2">
                Completadas
              </p>
              <p className="text-4xl font-bold mb-1 transition-all duration-300 group-hover:scale-110">
                {citas.filter((c) => c.estado === "completada").length}
              </p>
              <p className="text-green-200 text-sm font-medium">Exitosamente</p>
            </div>
            <div className="relative">
              <CheckIcon className="h-14 w-14 text-green-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute -inset-2 bg-green-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* Citas Canceladas */}
        <div className="group bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-red-500/30 relative overflow-hidden border border-red-400/30">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-red-100 text-sm font-bold uppercase tracking-wider mb-2">
                Canceladas
              </p>
              <p className="text-4xl font-bold mb-1 transition-all duration-300 group-hover:scale-110">
                {citas.filter((c) => c.estado === "cancelada").length}
              </p>
              <p className="text-red-200 text-sm font-medium">No realizadas</p>
            </div>
            <div className="relative">
              <XMarkIcon className="h-14 w-14 text-red-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute -inset-2 bg-red-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros Avanzados */}
      <div className="mb-8 bg-secondary-800 rounded-2xl p-6 border border-primary-400/20 shadow-2xl">
        <h3 className="text-xl font-semibold text-primary-400 mb-6 flex items-center">
          🔍 Filtros Avanzados
          <span className="ml-auto text-sm text-gray-400">{filteredCitas.length} resultados</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Búsqueda Global</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cliente, vehículo, servicio, teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <div className="absolute left-3 top-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-md text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="todos">📋 Todos los estados</option>
              <option value="pendiente">🟡 Pendiente</option>
              <option value="en_proceso">🔵 En Proceso</option>
              <option value="completada">🟢 Completada</option>
              <option value="cancelada">🔴 Cancelada</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowNewCitaForm(true)}
              className="group w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <PlusIcon className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90" />
              <span className="relative z-10">✨ Nueva Cita</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-400">
            📊 Mostrando {filteredCitas.length} de {citas.length} citas
          </span>
          <span className="text-primary-400 font-medium">💎 Sistema de Gestión</span>
        </div>
      </div>

      {/* Lista de Citas */}
      <div className="bg-secondary-800 rounded-2xl overflow-hidden border border-primary-400/20 shadow-2xl">
        <div className="bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-900 px-6 py-5 border-b border-primary-400/20">
          <h3 className="text-xl font-semibold text-primary-400 flex items-center">
            📋 Lista de Citas
            <span className="ml-auto text-sm text-gray-400 bg-secondary-700 px-3 py-1 rounded-full">
              {filteredCitas.length} registros
            </span>
          </h3>
        </div>

        <div className="overflow-x-hidden">
          <table className="min-w-full divide-y divide-primary-400/20">
            <thead className="bg-gradient-to-r from-secondary-900 to-secondary-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-400 uppercase tracking-wider border-r border-primary-400/10">
                  👤 Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-400 uppercase tracking-wider border-r border-primary-400/10">
                  🚗 Vehículo
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-400 uppercase tracking-wider border-r border-primary-400/10">
                  🔧 Servicio
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-400 uppercase tracking-wider border-r border-primary-400/10">
                  📅 Fecha/Hora
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-400 uppercase tracking-wider border-r border-primary-400/10">
                  📊 Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-primary-400 uppercase tracking-wider">
                  ⚡ Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-secondary-800 divide-y divide-secondary-700">
              {filteredCitas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <CalendarDaysIcon className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-lg font-medium">No se encontraron citas</p>
                      <p className="text-sm">Intenta ajustar los filtros o crear una nueva cita</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCitas.map((cita, index) => (
                  <tr
                    key={cita.id}
                    className={`hover:bg-secondary-700 transition-colors border-l-4 ${
                      cita.estado === "pendiente"
                        ? "border-l-yellow-500"
                        : cita.estado === "en_proceso"
                        ? "border-l-blue-500"
                        : cita.estado === "completada"
                        ? "border-l-green-500"
                        : "border-l-red-500"
                    } ${index % 2 === 0 ? "bg-secondary-800" : "bg-secondary-800/50"}`}
                  >
                    {/* Cliente */}
                    <td className="px-6 py-4 whitespace-normal break-words border-r border-secondary-700">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {cita.cliente.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white break-words">
                            {cita.cliente}
                          </div>
                          <div className="text-sm text-gray-400 whitespace-nowrap">
                            {cita.telefono}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vehículo */}
                    <td className="px-6 py-4 border-r border-secondary-700">
                      <div className="text-sm text-white font-medium">{cita.vehiculo}</div>
                    </td>

                    {/* Servicio */}
                    <td className="px-6 py-4 border-r border-secondary-700">
                      <div className="text-sm text-gray-300">{cita.servicio}</div>
                    </td>

                    {/* Fecha/Hora */}
                    <td className="px-6 py-4 border-r border-secondary-700">
                      <div className="text-sm text-white font-medium">{cita.fecha}</div>
                      <div className="text-sm text-gray-400">{cita.hora}</div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 border-r border-secondary-700">
                      <EstadoBadge estado={cita.estado} />
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Cambiar Estado */}
                        {cita.estado === "pendiente" && (
                          <button
                            onClick={() => handleUpdateEstado(cita.id, "en_proceso")}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors group"
                            title="Iniciar proceso"
                          >
                            <WrenchScrewdriverIcon className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                          </button>
                        )}

                        {cita.estado === "en_proceso" && (
                          <button
                            onClick={() => handleUpdateEstado(cita.id, "completada")}
                            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors group"
                            title="Completar"
                          >
                            <CheckIcon className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                          </button>
                        )}

                        {/* Editar */}
                        <button
                          onClick={() => handleEditCita(cita)}
                          className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors group"
                          title="Editar cita"
                        >
                          <PencilIcon className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => handleDeleteCita(cita.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors group"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-r from-secondary-900 to-secondary-800 px-6 py-4 border-t border-primary-400/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">💼 Sistema de Gestión de Taller</span>
            <span className="text-primary-400 font-medium">⚡ Actualización en tiempo real</span>
          </div>
        </div>
      </div>

      {/* Formulario de nueva cita */}
      {/* <NuevaCitaForm
        isOpen={showNewCitaForm}
        onClose={() => setShowNewCitaForm(false)}
        onSubmit={async (citaData) => {
          try {
            await createAppointment(citaData);
            setShowNewCitaForm(false);
          } catch (error) {
            console.error("Error creating appointment:", error);
            throw error; // El formulario manejará el error
          }
        }}
      /> */

      {/* Formulario de editar cita */}
      {/* <EditarCitaForm
        isOpen={showEditCitaForm}
        onClose={() => {
          setShowEditCitaForm(false);
          setSelectedCita(null);
        }}
        onSubmit={handleUpdateCita}
        cita={selectedCita}
      /> */}
    </div>
  );
}
