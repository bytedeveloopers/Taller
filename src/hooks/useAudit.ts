import { AuditEvent } from "@/services/MockAuditService";
import { useCallback } from "react";

interface UseAuditReturn {
  logEvent: (event: Omit<AuditEvent, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  logWorkOrderStatusChange: (
    workOrderId: string,
    fromStatus: string,
    toStatus: string
  ) => Promise<void>;
  logTechnicianAssignment: (
    workOrderId: string,
    technicianName: string,
    previousTechnician?: string
  ) => Promise<void>;
  logWorkOrderPause: (workOrderId: string, cause: string) => Promise<void>;
  logWorkOrderResume: (workOrderId: string) => Promise<void>;
  logQuoteAction: (quoteId: string, action: "approve" | "reject") => Promise<void>;
  logClientMerge: (sourceIds: string[], targetId: string) => Promise<void>;
  logAppointmentReschedule: (
    appointmentId: string,
    beforeTime: string,
    afterTime: string
  ) => Promise<void>;
  logMediaUpload: (mediaId: string, fileCount: number, fileTypes?: string[]) => Promise<void>;
}

export const useAudit = (actorId?: string, actorName?: string): UseAuditReturn => {
  const getCurrentActor = () => {
    // En un entorno real, obtendríamos esto del contexto de autenticación
    return {
      id: actorId || "current-user",
      name: actorName || "Usuario Actual",
    };
  };

  const logEvent = useCallback(
    async (event: Omit<AuditEvent, "id" | "createdAt" | "updatedAt">) => {
      try {
        // En desarrollo, solo log a consola - en producción, enviaría al servidor
        console.log("Audit Event:", event);

        // Aquí se haría la llamada real al API de auditoría
        // await fetch('/api/audit/log', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(event)
        // });
      } catch (error) {
        console.error("Error logging audit event:", error);
      }
    },
    []
  );

  const logWorkOrderStatusChange = useCallback(
    async (workOrderId: string, fromStatus: string, toStatus: string) => {
      const actor = getCurrentActor();
      await logEvent({
        actorId: actor.id,
        actorName: actor.name,
        action: "status_change",
        entityType: "work_order",
        entityId: workOrderId,
        summary: `${actor.name} cambió estado de OT #${workOrderId}: ${fromStatus} → ${toStatus}`,
        diff: {
          status: { from: fromStatus, to: toStatus },
        },
      });
    },
    [logEvent]
  );

  const logTechnicianAssignment = useCallback(
    async (workOrderId: string, technicianName: string, previousTechnician?: string) => {
      const actor = getCurrentActor();
      await logEvent({
        actorId: actor.id,
        actorName: actor.name,
        action: "assign",
        entityType: "work_order",
        entityId: workOrderId,
        summary: `${actor.name} asignó OT #${workOrderId} a ${technicianName}`,
        diff: {
          technician: { from: previousTechnician || null, to: technicianName },
        },
      });
    },
    [logEvent]
  );

  const logWorkOrderPause = useCallback(
    async (workOrderId: string, cause: string) => {
      const actor = getCurrentActor();
      await logEvent({
        actorId: actor.id,
        actorName: actor.name,
        action: "pause",
        entityType: "work_order",
        entityId: workOrderId,
        summary: `${actor.name} pausó OT #${workOrderId} (${cause})`,
        meta: { cause, pausedAt: new Date().toISOString() },
      });
    },
    [logEvent]
  );

  const logWorkOrderResume = useCallback(
    async (workOrderId: string) => {
      const actor = getCurrentActor();
      await logEvent({
        actorId: actor.id,
        actorName: actor.name,
        action: "resume",
        entityType: "work_order",
        entityId: workOrderId,
        summary: `${actor.name} reanudó OT #${workOrderId}`,
        meta: { resumedAt: new Date().toISOString() },
      });
    },
    [logEvent]
  );

  const logQuoteAction = useCallback(
    async (quoteId: string, action: "approve" | "reject") => {
      const actor = getCurrentActor();
      const actionText = action === "approve" ? "aprobó" : "rechazó";
      await logEvent({
        actorId: actor.id,
        actorName: actor.name,
        action,
        entityType: "quote",
        entityId: quoteId,
        summary: `${actor.name} ${actionText} cotización #${quoteId}`,
        diff: {
          status: { from: "pending", to: action === "approve" ? "approved" : "rejected" },
        },
      });
    },
    [logEvent]
  );

  const logClientMerge = useCallback(
    async (sourceIds: string[], targetId: string) => {
      const actor = getCurrentActor();
      await logEvent({
        actorId: actor.id,
        actorName: actor.name,
        action: "merge",
        entityType: "client",
        entityId: targetId,
        summary: `${actor.name} fusionó clientes (${sourceIds.join(", ")}) → #${targetId}`,
        meta: { sourceIds, targetId, mergedAt: new Date().toISOString() },
      });
    },
    [logEvent]
  );

  const logAppointmentReschedule = useCallback(
    async (appointmentId: string, beforeTime: string, afterTime: string) => {
      const actor = getCurrentActor();
      await logEvent({
        actorId: actor.id,
        actorName: actor.name,
        action: "reprogram",
        entityType: "appointment",
        entityId: appointmentId,
        summary: `${actor.name} reprogramó cita #${appointmentId}: ${beforeTime} → ${afterTime}`,
        diff: {
          scheduledTime: { from: beforeTime, to: afterTime },
        },
      });
    },
    [logEvent]
  );

  const logMediaUpload = useCallback(
    async (mediaId: string, fileCount: number, fileTypes?: string[]) => {
      const actor = getCurrentActor();
      await logEvent({
        actorId: actor.id,
        actorName: actor.name,
        action: "upload",
        entityType: "media",
        entityId: mediaId,
        summary: `${actor.name} subió evidencias (${fileCount} archivo${
          fileCount !== 1 ? "s" : ""
        })`,
        meta: { count: fileCount, fileTypes, uploadedAt: new Date().toISOString() },
      });
    },
    [logEvent]
  );

  return {
    logEvent,
    logWorkOrderStatusChange,
    logTechnicianAssignment,
    logWorkOrderPause,
    logWorkOrderResume,
    logQuoteAction,
    logClientMerge,
    logAppointmentReschedule,
    logMediaUpload,
  };
};

// Ejemplo de uso:
/*
const MyComponent = () => {
  const audit = useAudit('user123', 'Ana García');

  const handleStatusChange = async () => {
    await audit.logWorkOrderStatusChange('OT-001', 'diagnóstico', 'reparación');
  };

  const handleAssignment = async () => {
    await audit.logTechnicianAssignment('OT-001', 'Carlos López', 'Juan Pérez');
  };

  return (
    <div>
      <button onClick={handleStatusChange}>Cambiar Estado</button>
      <button onClick={handleAssignment}>Asignar Técnico</button>
    </div>
  );
};
*/
