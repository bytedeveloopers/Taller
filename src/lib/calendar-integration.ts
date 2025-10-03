// Integration helpers for creating calendar events from other system parts

export interface CalendarIntegrationOptions {
  title?: string;
  type: "CITA" | "RECOGIDA" | "ENTREGA" | "LLAMADA" | "MANTENIMIENTO" | "PRUEBA_RUTA" | "OTRO";
  scheduledAt: Date;
  technicianId?: string;
  customerId?: string;
  vehicleId?: string;
  taskId?: string;
  location?: string;
  note?: string;
  estimatedDuration?: number;
  reminderOptions?: {
    reminder24h?: boolean;
    reminder1h?: boolean;
    reminder15m?: boolean;
  };
}

/**
 * Crear evento de calendario desde una tarea asignada
 */
export async function createEventFromTaskAssignment(
  taskId: string,
  technicianId: string,
  scheduledAt: Date,
  type: "CITA" | "RECOGIDA" | "ENTREGA" = "CITA"
): Promise<boolean> {
  try {
    // Obtener información de la tarea
    const taskResponse = await fetch(`/api/tasks/${taskId}`);
    if (!taskResponse.ok) return false;

    const task = await taskResponse.json();

    const eventData: CalendarIntegrationOptions = {
      title: `${
        type === "CITA"
          ? "Diagnóstico"
          : type === "RECOGIDA"
          ? "Recoger vehículo"
          : "Entregar vehículo"
      }: ${task.data.title}`,
      type,
      scheduledAt,
      technicianId,
      customerId: task.data.vehicle?.customerId,
      vehicleId: task.data.vehicleId,
      taskId,
      estimatedDuration: task.data.estimatedTime || 60,
      reminderOptions: {
        reminder1h: true,
      },
    };

    const response = await fetch("/api/calendario/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    return response.ok;
  } catch (error) {
    console.error("Error creando evento desde asignación de tarea:", error);
    return false;
  }
}

/**
 * Crear recordatorio de seguimiento de cotización
 */
export async function createQuoteFollowupReminder(
  quoteId: string,
  customerId: string,
  hoursFromNow: number = 24
): Promise<boolean> {
  try {
    const followupDate = new Date();
    followupDate.setHours(followupDate.getHours() + hoursFromNow);

    const eventData: CalendarIntegrationOptions = {
      title: `Seguimiento de cotización COT-${quoteId.slice(-6)}`,
      type: "LLAMADA",
      scheduledAt: followupDate,
      customerId,
      note: `Llamar al cliente para seguimiento de cotización enviada`,
      estimatedDuration: 15,
      reminderOptions: {
        reminder1h: true,
      },
    };

    const response = await fetch("/api/calendario/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    return response.ok;
  } catch (error) {
    console.error("Error creando recordatorio de seguimiento:", error);
    return false;
  }
}

/**
 * Crear recordatorio de mantenimiento para vehículo
 */
export async function createMaintenanceReminder(
  vehicleId: string,
  customerId: string,
  scheduledAt: Date,
  note?: string
): Promise<boolean> {
  try {
    // Obtener información del vehículo
    const vehicleResponse = await fetch(`/api/vehicles/${vehicleId}`);
    if (!vehicleResponse.ok) return false;

    const vehicle = await vehicleResponse.json();

    const eventData: CalendarIntegrationOptions = {
      title: `Mantenimiento: ${vehicle.data.brand} ${vehicle.data.model} - ${vehicle.data.licensePlate}`,
      type: "MANTENIMIENTO",
      scheduledAt,
      customerId,
      vehicleId,
      note: note || "Recordatorio de mantenimiento programado",
      estimatedDuration: 120,
      reminderOptions: {
        reminder24h: true,
        reminder1h: true,
      },
    };

    const response = await fetch("/api/calendario/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    return response.ok;
  } catch (error) {
    console.error("Error creando recordatorio de mantenimiento:", error);
    return false;
  }
}

/**
 * Crear evento de recogida/entrega desde recepción
 */
export async function createPickupDeliveryEvent(
  vehicleId: string,
  customerId: string,
  type: "RECOGIDA" | "ENTREGA",
  scheduledAt: Date,
  technicianId?: string,
  location?: string
): Promise<boolean> {
  try {
    const eventData: CalendarIntegrationOptions = {
      title: `${type === "RECOGIDA" ? "Recoger" : "Entregar"} vehículo`,
      type,
      scheduledAt,
      technicianId,
      customerId,
      vehicleId,
      location: location || (type === "RECOGIDA" ? "Domicilio del cliente" : "Taller"),
      estimatedDuration: 30,
      reminderOptions: {
        reminder15m: true,
      },
    };

    const response = await fetch("/api/calendario/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    return response.ok;
  } catch (error) {
    console.error("Error creando evento de recogida/entrega:", error);
    return false;
  }
}

/**
 * Crear prueba de ruta después de reparación
 */
export async function createTestDriveEvent(
  vehicleId: string,
  customerId: string,
  technicianId: string,
  scheduledAt: Date
): Promise<boolean> {
  try {
    const eventData: CalendarIntegrationOptions = {
      title: "Prueba de ruta post-reparación",
      type: "PRUEBA_RUTA",
      scheduledAt,
      technicianId,
      customerId,
      vehicleId,
      note: "Verificar funcionamiento después de la reparación",
      estimatedDuration: 45,
      reminderOptions: {
        reminder15m: true,
      },
    };

    const response = await fetch("/api/calendario/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    return response.ok;
  } catch (error) {
    console.error("Error creando evento de prueba de ruta:", error);
    return false;
  }
}

/**
 * Hook para verificar disponibilidad de técnico
 */
export async function checkTechnicianAvailability(
  technicianId: string,
  startTime: Date,
  endTime: Date
): Promise<{ available: boolean; conflicts: any[] }> {
  try {
    const response = await fetch(
      `/api/calendario/events?technicianId=${technicianId}&startDate=${startTime.toISOString()}&endDate=${endTime.toISOString()}&includeBlockers=true`
    );

    if (!response.ok) {
      return { available: false, conflicts: [] };
    }

    const data = await response.json();
    const conflicts = data.data.filter((event: any) => {
      const eventStart = new Date(event.scheduledAt);
      const eventEnd = event.endAt
        ? new Date(event.endAt)
        : new Date(eventStart.getTime() + (event.estimatedDuration || 60) * 60000);

      return (
        (eventStart <= startTime && eventEnd > startTime) ||
        (eventStart < endTime && eventEnd >= endTime) ||
        (eventStart >= startTime && eventEnd <= endTime)
      );
    });

    return {
      available: conflicts.length === 0,
      conflicts,
    };
  } catch (error) {
    console.error("Error verificando disponibilidad:", error);
    return { available: false, conflicts: [] };
  }
}
