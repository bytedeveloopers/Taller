import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AuditEventData {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  diff?: Record<string, { from: unknown; to: unknown }>;
  meta?: Record<string, unknown>;
}

export interface AuditFilters {
  actorId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class AuditService {
  /**
   * Registra un evento de auditoría
   */
  static async logEvent(data: AuditEventData, ip?: string, userAgent?: string): Promise<void> {
    try {
      // Obtener metadatos de la request si está disponible
      const meta = data.meta || {};

      // Agregar metadatos de contexto si están disponibles
      if (ip) meta.ip = ip;
      if (userAgent) meta.userAgent = userAgent;
      meta.origin = ip ? "web" : "system";

      // Crear el evento de auditoría
      await prisma.auditLog.create({
        data: {
          actorId: data.actorId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          summary: data.summary,
          diff: data.diff || null,
          meta,
        },
      });
    } catch (error) {
      console.error("Error logging audit event:", error);
      // No lanzar error para evitar interrumpir el flujo principal
    }
  }

  /**
   * Obtiene eventos de auditoría con filtros y paginación
   */
  static async getEvents(filters: AuditFilters = {}, page: number = 1, limit: number = 50) {
    const where: any = {};

    if (filters.actorId) where.actorId = filters.actorId;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.action) where.action = filters.action;

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const [events, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  /**
   * Obtiene un evento específico por ID
   */
  static async getEventById(id: string) {
    return await prisma.auditLog.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene eventos para una entidad específica
   */
  static async getEventsByEntity(
    entityType: string,
    entityId: string,
    page: number = 1,
    limit: number = 20
  ) {
    return await this.getEvents({ entityType, entityId }, page, limit);
  }

  /**
   * Genera un resumen legible para diferentes tipos de acciones
   */
  static generateSummary(
    action: string,
    entityType: string,
    entityId: string,
    actorName: string,
    data?: any
  ): string {
    const entityName = this.getEntityDisplayName(entityType, entityId, data);

    switch (action) {
      case "create":
        return `${actorName} creó ${entityName}`;

      case "update":
        return `${actorName} actualizó ${entityName}`;

      case "delete":
        return `${actorName} eliminó ${entityName}`;

      case "status_change":
        if (data?.from && data?.to) {
          return `${actorName} cambió estado de ${entityName}: ${data.from} → ${data.to}`;
        }
        return `${actorName} cambió estado de ${entityName}`;

      case "assign":
        if (data?.technician) {
          return `${actorName} asignó ${entityName} a ${data.technician}`;
        }
        return `${actorName} realizó asignación en ${entityName}`;

      case "merge":
        if (data?.sourceIds && data?.targetId) {
          return `${actorName} fusionó registros → ${entityName}`;
        }
        return `${actorName} fusionó registros`;

      case "pause":
        const cause = data?.cause ? ` (${data.cause})` : "";
        return `${actorName} pausó ${entityName}${cause}`;

      case "resume":
        return `${actorName} reanudó ${entityName}`;

      case "send":
        return `${actorName} envió ${entityName}`;

      case "approve":
        return `${actorName} aprobó ${entityName}`;

      case "reject":
        return `${actorName} rechazó ${entityName}`;

      case "upload":
        const count = data?.count ? ` (${data.count} archivos)` : "";
        return `${actorName} subió evidencias${count}`;

      case "reprogram":
        if (data?.before && data?.after) {
          return `${actorName} reprogramó ${entityName}: ${data.before} → ${data.after}`;
        }
        return `${actorName} reprogramó ${entityName}`;

      default:
        return `${actorName} realizó acción "${action}" en ${entityName}`;
    }
  }

  /**
   * Obtiene un nombre legible para diferentes tipos de entidades
   */
  private static getEntityDisplayName(entityType: string, entityId: string, data?: any): string {
    switch (entityType) {
      case "work_order":
        return `OT #${entityId}`;

      case "client":
        return data?.name ? `Cliente ${data.name}` : `Cliente #${entityId}`;

      case "vehicle":
        return data?.name ? `Vehículo ${data.name}` : `Vehículo #${entityId}`;

      case "quote":
        return `Cotización #${entityId}`;

      case "appointment":
        return `Cita #${entityId}`;

      case "media":
        return `Archivo #${entityId}`;

      case "notification":
        return `Notificación #${entityId}`;

      case "settings":
        return "Configuraciones";

      case "user":
        return data?.name ? `Usuario ${data.name}` : `Usuario #${entityId}`;

      default:
        return `${entityType} #${entityId}`;
    }
  }

  /**
   * Exporta eventos a CSV
   */
  static async exportToCSV(filters: AuditFilters = {}): Promise<string> {
    const { events } = await this.getEvents(filters, 1, 10000); // Max 10k eventos

    const headers = ["Fecha", "Hora", "Actor", "Acción", "Entidad", "Resumen", "IP", "User Agent"];

    const rows = events.map((event: any) => [
      event.createdAt.toLocaleDateString("es-MX"),
      event.createdAt.toLocaleTimeString("es-MX"),
      event.actor?.name || "Sistema",
      event.action,
      `${event.entityType}#${event.entityId}`,
      event.summary,
      (event.meta as any)?.ip || "N/A",
      (event.meta as any)?.userAgent || "N/A",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return csvContent;
  }
}

// Helpers específicos para diferentes tipos de eventos
export class AuditHelpers {
  /**
   * Registra cambio de estado en OT
   */
  static async logWorkOrderStatusChange(
    actorId: string,
    workOrderId: string,
    fromStatus: string,
    toStatus: string,
    actorName: string
  ) {
    await AuditService.logEvent({
      actorId,
      action: "status_change",
      entityType: "work_order",
      entityId: workOrderId,
      summary: AuditService.generateSummary("status_change", "work_order", workOrderId, actorName, {
        from: fromStatus,
        to: toStatus,
      }),
      diff: {
        status: { from: fromStatus, to: toStatus },
      },
    });
  }

  /**
   * Registra asignación de técnico
   */
  static async logTechnicianAssignment(
    actorId: string,
    workOrderId: string,
    technicianName: string,
    previousTechnician: string | null,
    actorName: string
  ) {
    await AuditService.logEvent({
      actorId,
      action: "assign",
      entityType: "work_order",
      entityId: workOrderId,
      summary: AuditService.generateSummary("assign", "work_order", workOrderId, actorName, {
        technician: technicianName,
      }),
      diff: {
        technician: { from: previousTechnician || "—", to: technicianName },
      },
    });
  }

  /**
   * Registra pausa por espera
   */
  static async logWorkOrderPause(
    actorId: string,
    workOrderId: string,
    cause: string,
    actorName: string
  ) {
    await AuditService.logEvent({
      actorId,
      action: "pause",
      entityType: "work_order",
      entityId: workOrderId,
      summary: AuditService.generateSummary("pause", "work_order", workOrderId, actorName, {
        cause,
      }),
      meta: { cause, pausedAt: new Date().toISOString() },
    });
  }

  /**
   * Registra reanudación
   */
  static async logWorkOrderResume(actorId: string, workOrderId: string, actorName: string) {
    await AuditService.logEvent({
      actorId,
      action: "resume",
      entityType: "work_order",
      entityId: workOrderId,
      summary: AuditService.generateSummary("resume", "work_order", workOrderId, actorName),
      meta: { resumedAt: new Date().toISOString() },
    });
  }

  /**
   * Registra aprobación/rechazo de cotización
   */
  static async logQuoteAction(
    actorId: string,
    quoteId: string,
    action: "approve" | "reject",
    actorName: string
  ) {
    await AuditService.logEvent({
      actorId,
      action,
      entityType: "quote",
      entityId: quoteId,
      summary: AuditService.generateSummary(action, "quote", quoteId, actorName),
      diff: {
        status: { from: "pending", to: action === "approve" ? "approved" : "rejected" },
      },
    });
  }

  /**
   * Registra fusión de clientes
   */
  static async logClientMerge(
    actorId: string,
    sourceIds: string[],
    targetId: string,
    actorName: string
  ) {
    await AuditService.logEvent({
      actorId,
      action: "merge",
      entityType: "client",
      entityId: targetId,
      summary: AuditService.generateSummary("merge", "client", targetId, actorName, {
        sourceIds,
        targetId,
      }),
      meta: { sourceIds, targetId, mergedAt: new Date().toISOString() },
    });
  }

  /**
   * Registra reprogramación de cita
   */
  static async logAppointmentReschedule(
    actorId: string,
    appointmentId: string,
    beforeTime: string,
    afterTime: string,
    actorName: string
  ) {
    await AuditService.logEvent({
      actorId,
      action: "reprogram",
      entityType: "appointment",
      entityId: appointmentId,
      summary: AuditService.generateSummary("reprogram", "appointment", appointmentId, actorName, {
        before: beforeTime,
        after: afterTime,
      }),
      diff: {
        scheduledTime: { from: beforeTime, to: afterTime },
      },
    });
  }
}
