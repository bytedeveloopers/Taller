"use client";

import { useEffect, useState } from "react";

export interface Appointment {
  id: string;
  scheduledAt: string;
  estimatedDuration?: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes?: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    licensePlate?: string;
    trackingCode: string;
  };
  technician?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  scheduledAt: string;
  estimatedDuration?: number;
  notes?: string;
  vehicleId: string;
  customerId: string;
  technicianId?: string;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/appointments");

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: CreateAppointmentData) => {
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const newAppointment = data.appointment;

      setAppointments((prev) => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err) {
      console.error("Error creating appointment:", err);
      throw err;
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment["status"]) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const updatedAppointment = data.appointment;

      setAppointments((prev) =>
        prev.map((appointment) => (appointment.id === id ? updatedAppointment : appointment))
      );

      return updatedAppointment;
    } catch (err) {
      console.error("Error updating appointment:", err);
      throw err;
    }
  };

  const updateAppointment = async (
    id: string,
    updateData: {
      scheduledAt?: string;
      estimatedDuration?: number;
      notes?: string;
      status?: Appointment["status"];
    }
  ) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const updatedAppointment = data.appointment;

      setAppointments((prev) =>
        prev.map((appointment) => (appointment.id === id ? updatedAppointment : appointment))
      );

      return updatedAppointment;
    } catch (err) {
      console.error("Error updating appointment:", err);
      throw err;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
    } catch (err) {
      console.error("Error deleting appointment:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    refetch: fetchAppointments,
  };
}
