"use client";

import {
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface CitaAgenda {
  id: string;
  hora: string;
  cliente: string;
  vehiculo: string;
  servicio: string;
  estado: "programada" | "en_curso" | "completada" | "cancelada";
  tecnico: string;
  observaciones?: string;
}

export default function AgendaReadOnly() {
  // Datos simulados - en producción vendrían de la API
  const citasHoy: CitaAgenda[] = [
    {
      id: "1",
      hora: "08:00",
      cliente: "Juan Pérez",
      vehiculo: "Toyota Corolla - ABC123",
      servicio: "Mantenimiento preventivo",
      estado: "completada",
      tecnico: "Yo",
      observaciones: "Cliente muy puntual",
    },
    {
      id: "2",
      hora: "10:30",
      cliente: "María García",
      vehiculo: "Honda Civic - XYZ789",
      servicio: "Cambio de pastillas de freno",
      estado: "en_curso",
      tecnico: "Yo",
    },
    {
      id: "3",
      hora: "14:00",
      cliente: "Carlos López",
      vehiculo: "Chevrolet Spark - DEF456",
      servicio: "Diagnóstico general",
      estado: "programada",
      tecnico: "Yo",
      observaciones: "Cliente reporta ruidos extraños",
    },
    {
      id: "4",
      hora: "16:30",
      cliente: "Ana Rodríguez",
      vehiculo: "Nissan Sentra - GHI789",
      servicio: "Cambio de aceite",
      estado: "programada",
      tecnico: "Yo",
    },
  ];

  const citasManana: CitaAgenda[] = [
    {
      id: "5",
      hora: "09:00",
      cliente: "Luis Martínez",
      vehiculo: "Ford Focus - JKL012",
      servicio: "Reparación de transmisión",
      estado: "programada",
      tecnico: "Yo",
      observaciones: "Trabajo de 4-6 horas estimadas",
    },
    {
      id: "6",
      hora: "13:00",
      cliente: "Sandra Torres",
      vehiculo: "Hyundai Elantra - MNO345",
      servicio: "Mantenimiento 20,000 km",
      estado: "programada",
      tecnico: "Yo",
    },
  ];

  const getEstadoColor = (estado: CitaAgenda["estado"]) => {
    switch (estado) {
      case "completada":
        return "bg-green-100 text-green-800 border-green-200";
      case "en_curso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "programada":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelada":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEstadoTexto = (estado: CitaAgenda["estado"]) => {
    switch (estado) {
      case "completada":
        return "Completada";
      case "en_curso":
        return "En Curso";
      case "programada":
        return "Programada";
      case "cancelada":
        return "Cancelada";
      default:
        return "Desconocido";
    }
  };

  const CitaCard = ({ cita }: { cita: CitaAgenda }) => (
    <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-900/50 rounded-lg">
            <ClockIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <div className="font-semibold text-white">{cita.hora}</div>
            <div className="text-sm text-gray-300">{cita.cliente}</div>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(
            cita.estado
          )}`}
        >
          {getEstadoTexto(cita.estado)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-300">
          <UserIcon className="h-4 w-4 mr-2" />
          {cita.vehiculo}
        </div>

        <div className="text-sm text-white font-medium">{cita.servicio}</div>

        {cita.observaciones && (
          <div className="flex items-start text-sm text-gray-300 bg-yellow-900/30 p-2 rounded">
            <InformationCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            {cita.observaciones}
          </div>
        )}
      </div>
    </div>
  );

  const horaActual = new Date().getHours();
  const citaActual = citasHoy.find((cita) => {
    const horaCita = parseInt(cita.hora.split(":")[0]);
    return cita.estado === "en_curso" || (horaCita <= horaActual && horaCita + 2 > horaActual);
  });

  const resumenDia = {
    total: citasHoy.length,
    completadas: citasHoy.filter((c) => c.estado === "completada").length,
    enCurso: citasHoy.filter((c) => c.estado === "en_curso").length,
    pendientes: citasHoy.filter((c) => c.estado === "programada").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Mi Agenda</h1>
        <div className="text-sm text-gray-300">
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Resumen del día */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Total Citas</p>
              <p className="text-2xl font-bold text-white">{resumenDia.total}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Completadas</p>
              <p className="text-2xl font-bold text-green-400">{resumenDia.completadas}</p>
            </div>
            <div className="w-8 h-8 bg-green-900/50 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">En Curso</p>
              <p className="text-2xl font-bold text-blue-400">{resumenDia.enCurso}</p>
            </div>
            <div className="w-8 h-8 bg-blue-900/50 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Pendientes</p>
              <p className="text-2xl font-bold text-gray-300">{resumenDia.pendientes}</p>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Cita actual */}
      {citaActual && (
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-4">Cita Actual</h3>
          <CitaCard cita={citaActual} />
        </div>
      )}

      {/* Citas de hoy */}
      <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Citas de Hoy</h3>

        {citasHoy.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {citasHoy.map((cita) => (
              <CitaCard key={cita.id} cita={cita} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No tienes citas programadas para hoy</p>
          </div>
        )}
      </div>

      {/* Citas de mañana */}
      <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Citas de Mañana</h3>

        {citasManana.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {citasManana.map((cita) => (
              <CitaCard key={cita.id} cita={cita} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No tienes citas programadas para mañana</p>
          </div>
        )}
      </div>

      {/* Notas importantes */}
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
          Notas Importantes
        </h3>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
            <div>
              <p className="text-yellow-300 font-medium">Cita de mañana 9:00 AM</p>
              <p className="text-yellow-400 text-sm">
                Reparación de transmisión - Asegurar disponibilidad de piezas especiales
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
            <div>
              <p className="text-yellow-300 font-medium">Recordatorio</p>
              <p className="text-yellow-400 text-sm">
                Actualizar estado de órdenes al finalizar cada servicio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Información</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-2">Horario de Trabajo</h4>
            <div className="space-y-1 text-sm text-gray-300">
              <p>Lunes - Viernes: 8:00 AM - 6:00 PM</p>
              <p>Sábados: 8:00 AM - 2:00 PM</p>
              <p>Domingos: Cerrado</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-white mb-2">Contacto de Emergencia</h4>
            <div className="space-y-1 text-sm text-gray-300">
              <p>Supervisor: +595 XXX XXX XXX</p>
              <p>Emergencias: +595 XXX XXX XXX</p>
              <p>Email: soporte@taller.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
