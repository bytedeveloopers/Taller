"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  totalCitas: number;
  citasPendientes: number;
  citasCompletadas: number;
  citasEnProceso: number;
  citasHoy: number;
  citasEstaSemana: number;
  totalClientes: number;
  totalVehiculos: number;
  totalCotizaciones: number;
  cotizacionesAprobadas: number;
  ingresos: {
    total: number;
    pendiente: number;
  };
  recentAppointments: any[];
  tasaCompletado: number;
  satisfaccionCliente: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = async () => {
    await fetchStats();
  };

  async function fetchStats() {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/stats");

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setStats(data.stats);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return { stats, loading, error, refetch };
}

export type { DashboardStats };
