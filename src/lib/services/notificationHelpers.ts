import { prisma } from "@/lib/prisma";
import { notificationService } from "./notificationService";

/**
 * Helpers para disparar notificaciones específicas del negocio
 */

// ===== NOTIFICACIONES DE TAREAS =====

export async function notifyTaskAssigned({
  taskId,
  technicianId,
  assignedById,
  taskTitle,
}: {
  taskId: string;
  technicianId: string;
  assignedById: string;
  taskTitle: string;
}) {
  await notificationService.createNotification({
    userId: technicianId,
    type: "TASK_ASSIGNED",
    title: "Nueva tarea asignada",
    body: `Se te ha asignado la tarea: ${taskTitle}`,
    priority: "MEDIUM",
    taskId,
    groupKey: `task-assigned-${taskId}`,
  });
}

export async function notifyTaskCompleted({
  taskId,
  supervisorIds,
  customerUserId,
  taskTitle,
  technicianName,
}: {
  taskId: string;
  supervisorIds: string[];
  customerUserId?: string;
  taskTitle: string;
  technicianName: string;
}) {
  // Notificar a supervisores
  await notificationService.createBulkNotifications(supervisorIds, {
    type: "TASK_COMPLETED",
    title: "Tarea completada",
    body: `${technicianName} ha completado la tarea: ${taskTitle}`,
    priority: "MEDIUM",
    taskId,
    groupKey: `task-completed-${taskId}`,
  });

  // Notificar al cliente si tiene cuenta
  if (customerUserId) {
    await notificationService.createNotification({
      userId: customerUserId,
      type: "TASK_COMPLETED",
      title: "Trabajo completado en su vehículo",
      body: `Se ha completado el trabajo: ${taskTitle}`,
      priority: "HIGH",
      taskId,
      groupKey: `task-completed-customer-${taskId}`,
    });
  }
}

export async function notifyTaskOverdue({
  taskId,
  technicianId,
  supervisorIds,
  taskTitle,
  hoursOverdue,
}: {
  taskId: string;
  technicianId: string;
  supervisorIds: string[];
  taskTitle: string;
  hoursOverdue: number;
}) {
  // Notificar al técnico
  await notificationService.createNotification({
    userId: technicianId,
    type: "TASK_OVERDUE",
    title: "Tarea vencida",
    body: `La tarea "${taskTitle}" está vencida por ${hoursOverdue} horas`,
    priority: "HIGH",
    taskId,
    groupKey: `task-overdue-${taskId}`,
  });

  // Notificar a supervisores
  await notificationService.createBulkNotifications(supervisorIds, {
    type: "TASK_OVERDUE",
    title: "Tarea vencida",
    body: `La tarea "${taskTitle}" está vencida por ${hoursOverdue} horas`,
    priority: "HIGH",
    taskId,
    groupKey: `task-overdue-supervisor-${taskId}`,
  });
}

// ===== NOTIFICACIONES DE CITAS =====

export async function notifyAppointmentReminder({
  appointmentId,
  customerUserId,
  technicianId,
  appointmentTitle,
  scheduledTime,
  hoursBeforeAppointment,
}: {
  appointmentId: string;
  customerUserId?: string;
  technicianId?: string;
  appointmentTitle: string;
  scheduledTime: Date;
  hoursBeforeAppointment: number;
}) {
  const reminderText = `Recordatorio: ${appointmentTitle} programada para ${scheduledTime.toLocaleString()}`;

  // Notificar al cliente
  if (customerUserId) {
    await notificationService.createNotification({
      userId: customerUserId,
      type: "APPOINTMENT_REMINDER",
      title: `Recordatorio de cita (${hoursBeforeAppointment}h)`,
      body: reminderText,
      priority: "MEDIUM",
      appointmentId,
      groupKey: `appointment-reminder-${appointmentId}-${hoursBeforeAppointment}h`,
    });
  }

  // Notificar al técnico
  if (technicianId) {
    await notificationService.createNotification({
      userId: technicianId,
      type: "APPOINTMENT_REMINDER",
      title: `Recordatorio de cita (${hoursBeforeAppointment}h)`,
      body: reminderText,
      priority: "MEDIUM",
      appointmentId,
      groupKey: `appointment-reminder-tech-${appointmentId}-${hoursBeforeAppointment}h`,
    });
  }
}

export async function notifyAppointmentCancelled({
  appointmentId,
  customerUserId,
  technicianId,
  appointmentTitle,
  reason,
}: {
  appointmentId: string;
  customerUserId?: string;
  technicianId?: string;
  appointmentTitle: string;
  reason?: string;
}) {
  const message = `La cita "${appointmentTitle}" ha sido cancelada${reason ? `: ${reason}` : ""}`;

  const userIds = [customerUserId, technicianId].filter(Boolean) as string[];

  await notificationService.createBulkNotifications(userIds, {
    type: "APPOINTMENT_CANCELLED",
    title: "Cita cancelada",
    body: message,
    priority: "HIGH",
    appointmentId,
    groupKey: `appointment-cancelled-${appointmentId}`,
  });
}

// ===== NOTIFICACIONES DE COTIZACIONES =====

export async function notifyQuoteSent({
  quoteId,
  customerUserId,
  salesPersonId,
  quoteNumber,
  total,
}: {
  quoteId: string;
  customerUserId?: string;
  salesPersonId: string;
  quoteNumber: string;
  total: number;
}) {
  // Notificar al cliente
  if (customerUserId) {
    await notificationService.createNotification({
      userId: customerUserId,
      type: "QUOTE_SENT",
      title: "Nueva cotización disponible",
      body: `Se ha enviado la cotización ${quoteNumber} por $${total.toFixed(2)}`,
      priority: "MEDIUM",
      quoteId,
      groupKey: `quote-sent-${quoteId}`,
    });
  }

  // Confirmar al vendedor
  await notificationService.createNotification({
    userId: salesPersonId,
    type: "QUOTE_SENT",
    title: "Cotización enviada",
    body: `Se ha enviado la cotización ${quoteNumber} al cliente`,
    priority: "LOW",
    quoteId,
    groupKey: `quote-sent-sales-${quoteId}`,
  });
}

export async function notifyQuoteApproved({
  quoteId,
  salesPersonId,
  supervisorIds,
  quoteNumber,
  customerName,
  total,
}: {
  quoteId: string;
  salesPersonId: string;
  supervisorIds: string[];
  quoteNumber: string;
  customerName: string;
  total: number;
}) {
  const allUserIds = [salesPersonId, ...supervisorIds];

  await notificationService.createBulkNotifications(allUserIds, {
    type: "QUOTE_APPROVED",
    title: "¡Cotización aprobada!",
    body: `${customerName} ha aprobado la cotización ${quoteNumber} por $${total.toFixed(2)}`,
    priority: "HIGH",
    quoteId,
    groupKey: `quote-approved-${quoteId}`,
  });
}

export async function notifyQuoteRejected({
  quoteId,
  salesPersonId,
  supervisorIds,
  quoteNumber,
  customerName,
  reason,
}: {
  quoteId: string;
  salesPersonId: string;
  supervisorIds: string[];
  quoteNumber: string;
  customerName: string;
  reason?: string;
}) {
  const message = `${customerName} ha rechazado la cotización ${quoteNumber}${
    reason ? `: ${reason}` : ""
  }`;
  const allUserIds = [salesPersonId, ...supervisorIds];

  await notificationService.createBulkNotifications(allUserIds, {
    type: "QUOTE_REJECTED",
    title: "Cotización rechazada",
    body: message,
    priority: "MEDIUM",
    quoteId,
    groupKey: `quote-rejected-${quoteId}`,
  });
}

// ===== NOTIFICACIONES DE SISTEMA =====

export async function notifySystemMaintenance({
  maintenanceWindow,
  description,
  allUserIds,
}: {
  maintenanceWindow: string;
  description: string;
  allUserIds: string[];
}) {
  await notificationService.createBulkNotifications(allUserIds, {
    type: "SYSTEM_MAINTENANCE",
    title: "Mantenimiento programado",
    body: `Mantenimiento del sistema programado para ${maintenanceWindow}. ${description}`,
    priority: "MEDIUM",
    groupKey: `system-maintenance-${Date.now()}`,
  });
}

export async function notifySystemError({
  errorType,
  errorMessage,
  adminUserIds,
}: {
  errorType: string;
  errorMessage: string;
  adminUserIds: string[];
}) {
  await notificationService.createBulkNotifications(adminUserIds, {
    type: "SYSTEM_ERROR",
    title: `Error del sistema: ${errorType}`,
    body: errorMessage,
    priority: "HIGH",
    groupKey: `system-error-${errorType}-${Date.now()}`,
  });
}

// ===== NOTIFICACIONES DE VEHÍCULOS =====

export async function notifyVehicleStatusChange({
  vehicleId,
  customerUserId,
  trackingCode,
  newStatus,
  vehicleInfo,
}: {
  vehicleId: string;
  customerUserId?: string;
  trackingCode: string;
  newStatus: string;
  vehicleInfo: string;
}) {
  if (!customerUserId) return;

  const statusMessages: Record<string, string> = {
    IN_PROGRESS: "está siendo trabajado",
    WAITING_PARTS: "está esperando repuestos",
    QUALITY_CHECK: "está en revisión de calidad",
    READY: "está listo para recoger",
    DELIVERED: "ha sido entregado",
  };

  const message = statusMessages[newStatus] || `ha cambiado su estado a ${newStatus}`;

  await notificationService.createNotification({
    userId: customerUserId,
    type: "VEHICLE_STATUS_CHANGED",
    title: "Actualización de su vehículo",
    body: `Su vehículo ${vehicleInfo} (${trackingCode}) ${message}`,
    priority: newStatus === "READY" ? "HIGH" : "MEDIUM",
    vehicleId,
    groupKey: `vehicle-status-${vehicleId}-${newStatus}`,
  });
}

// ===== UTILIDADES =====

/**
 * Obtener IDs de usuarios supervisores/administradores
 */
export async function getSupervisorIds(): Promise<string[]> {
  const supervisors = await prisma.user.findMany({
    where: {
      role: {
        in: ["SUPERVISOR", "ADMIN", "MANAGER"],
      },
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  return supervisors.map((u) => u.id);
}

/**
 * Obtener todos los IDs de usuarios activos
 */
export async function getAllActiveUserIds(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  return users.map((u) => u.id);
}

/**
 * Obtener ID de usuario del cliente por ID de customer
 */
export async function getCustomerUserId(customerId: string): Promise<string | undefined> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { email: true },
  });

  if (!customer?.email) return undefined;

  const user = await prisma.user.findUnique({
    where: { email: customer.email },
    select: { id: true },
  });

  return user?.id;
}
