"use client";

import { useEffect, useState } from "react";

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  vehicles: Vehicle[];
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  color?: string;
  trackingCode: string;
  customerId: string;
}

export function useCustomersAndVehicles() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setCustomers(data.customers || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Helper para obtener vehículos de un cliente específico
  const getVehiclesByCustomer = (customerId: string): Vehicle[] => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.vehicles || [];
  };

  // Helper para obtener todos los vehículos
  const getAllVehicles = (): Vehicle[] => {
    return customers.flatMap((customer) => customer.vehicles || []);
  };

  return {
    customers,
    loading,
    error,
    getVehiclesByCustomer,
    getAllVehicles,
    refetch: fetchCustomers,
  };
}
