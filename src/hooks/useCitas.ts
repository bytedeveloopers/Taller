"use client";

import { useEffect, useState } from "react";

type EstadoCita = "pendiente" | "en_proceso" | "completada" | "cancelada";

interface Cita {
  id: string;
  cliente: string;
  vehiculo: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: EstadoCita;
  telefono: string;
  total?: number;
}

export function useCitas() {
  const [citas, setCitas] = useState<Cita[]>([]);

  // Cargar datos demo (reemplazar por API real)
  useEffect(() => {
    const demo: Cita[] = [
      {
        id: "1",
        cliente: "Juan Pérez",
        vehiculo: "Toyota Camry 2020",
        servicio: "Mantenimiento Preventivo",
        fecha: "2025-09-27",
        hora: "09:00",
        estado: "pendiente",
        telefono: "+502 1234-5678",
        total: 350,
      },
      {
        id: "2",
        cliente: "María González",
        vehiculo: "Honda Civic 2019",
        servicio: "Reparación de Frenos",
        fecha: "2025-09-27",
        hora: "11:30",
        estado: "en_proceso",
        telefono: "+502 9876-5432",
        total: 850,
      },
      {
        id: "3",
        cliente: "Carlos Rodríguez",
        vehiculo: "Ford F-150 2021",
        servicio: "Diagnóstico Computarizado",
        fecha: "2025-09-27",
        hora: "14:00",
        estado: "pendiente",
        telefono: "+502 5555-1234",
        total: 200,
      },
      {
        id: "4",
        cliente: "Ana López",
        vehiculo: "Nissan Sentra 2018",
        servicio: "Aire Acondicionado",
        fecha: "2025-09-26",
        hora: "16:00",
        estado: "completada",
        telefono: "+502 7777-8888",
        total: 650,
      },
    ];
    setCitas(demo);
  }, []);

  const updateCitaEstado = (citaId: string, nuevoEstado: EstadoCita) => {
    setCitas((prevCitas) =>
      prevCitas.map((cita) => (cita.id === citaId ? { ...cita, estado: nuevoEstado } : cita))
    );
  };

  const deleteCita = (citaId: string) => {
    setCitas((prevCitas) => prevCitas.filter((cita) => cita.id !== citaId));
  };

  const createCita = (nuevaCita: Omit<Cita, "id">) => {
    const cita: Cita = {
      ...nuevaCita,
      id: Date.now().toString(),
    };
    setCitas((prevCitas) => [cita, ...prevCitas]);
    return cita;
  };

  return {
    citas,
    updateCitaEstado,
    deleteCita,
    createCita,
  };
}

export type { Cita, EstadoCita };
