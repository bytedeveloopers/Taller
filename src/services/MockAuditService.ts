// Servicio de auditoría temporal con mock data para desarrollo
export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  diff?: Record<string, { from: unknown; to: unknown }>;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditFilters {
  actorId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Mock data para desarrollo
const mockAuditEvents: AuditEvent[] = [
  {
    id: "1",
    actorId: "user1",
    actorName: "Ana García",
    action: "status_change",
    entityType: "work_order",
    entityId: "OT-124",
    summary: "Estado OT #124: diagnóstico → desarme (por Ana García)",
    diff: {
      status: { from: "diagnostico", to: "desarme" },
    },
    meta: { ip: "192.168.1.100", userAgent: "Mozilla/5.0...", origin: "web" },
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    actorId: "user2",
    actorName: "Carlos Rodríguez",
    action: "assign",
    entityType: "work_order",
    entityId: "OT-125",
    summary: "Asignado a técnico Carlos Rodríguez (antes: —)",
    diff: {
      technician: { from: null, to: "Carlos Rodríguez" },
    },
    meta: { ip: "192.168.1.101", origin: "web" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "3",
    actorId: "user1",
    actorName: "Ana García",
    action: "approve",
    entityType: "quote",
    entityId: "Q-57",
    summary: "Cotización #Q-57 aprobada por cliente",
    diff: {
      status: { from: "pending", to: "approved" },
    },
    meta: { ip: "192.168.1.100", origin: "web" },
    createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: "4",
    actorId: "user3",
    actorName: "Luis Mendoza",
    action: "merge",
    entityType: "client",
    entityId: "11",
    summary: "Cliente fusionado: (A#11, B#32) → C#11",
    meta: { sourceIds: ["11", "32"], targetId: "11", mergedAt: new Date().toISOString() },
    createdAt: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 180),
  },
  {
    id: "5",
    actorId: "user2",
    actorName: "Carlos Rodríguez",
    action: "reprogram",
    entityType: "appointment",
    entityId: "APT-15",
    summary: "Agenda reprogramada: 10:00–11:00 → 14:00–15:00",
    diff: {
      scheduledTime: { from: "10:00–11:00", to: "14:00–15:00" },
    },
    meta: { origin: "web" },
    createdAt: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 240),
  },
  {
    id: "6",
    actorId: "user1",
    actorName: "Ana García",
    action: "pause",
    entityType: "work_order",
    entityId: "OT-126",
    summary: "Espera por pieza iniciada (pausado SLA)",
    meta: { cause: "pieza", pausedAt: new Date().toISOString(), origin: "web" },
    createdAt: new Date(Date.now() - 1000 * 60 * 300), // 5 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 300),
  },
  {
    id: "7",
    actorId: "user2",
    actorName: "Carlos Rodríguez",
    action: "upload",
    entityType: "media",
    entityId: "MED-89",
    summary: "Carlos Rodríguez subió evidencias (3 archivos)",
    meta: { count: 3, fileTypes: ["jpg", "jpg", "pdf"], origin: "web" },
    createdAt: new Date(Date.now() - 1000 * 60 * 360), // 6 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 360),
  },
  {
    id: "8",
    actorId: "user1",
    actorName: "Ana García",
    action: "create",
    entityType: "work_order",
    entityId: "OT-127",
    summary: "Ana García creó OT #OT-127",
    meta: { origin: "web" },
    createdAt: new Date(Date.now() - 1000 * 60 * 420), // 7 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 420),
  },
];

export class MockAuditService {
  /**
   * Obtiene eventos de auditoría con filtros y paginación
   */
  static async getEvents(filters: AuditFilters = {}, page: number = 1, limit: number = 50) {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 100));

    let filteredEvents = [...mockAuditEvents];

    // Aplicar filtros
    if (filters.actorId) {
      filteredEvents = filteredEvents.filter((e) => e.actorId === filters.actorId);
    }
    if (filters.entityType) {
      filteredEvents = filteredEvents.filter((e) => e.entityType === filters.entityType);
    }
    if (filters.entityId) {
      filteredEvents = filteredEvents.filter((e) => e.entityId === filters.entityId);
    }
    if (filters.action) {
      filteredEvents = filteredEvents.filter((e) => e.action === filters.action);
    }
    if (filters.dateFrom) {
      filteredEvents = filteredEvents.filter((e) => e.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filteredEvents = filteredEvents.filter((e) => e.createdAt <= filters.dateTo!);
    }

    // Paginación
    const total = filteredEvents.length;
    const startIndex = (page - 1) * limit;
    const events = filteredEvents.slice(startIndex, startIndex + limit);

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
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockAuditEvents.find((e) => e.id === id) || null;
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
   * Exporta eventos a CSV
   */
  static async exportToCSV(filters: AuditFilters = {}): Promise<string> {
    const { events } = await this.getEvents(filters, 1, 10000);

    const headers = ["Fecha", "Hora", "Actor", "Acción", "Entidad", "Resumen", "IP", "User Agent"];

    const rows = events.map((event) => [
      event.createdAt.toLocaleDateString("es-MX"),
      event.createdAt.toLocaleTimeString("es-MX"),
      event.actorName,
      event.action,
      `${event.entityType}#${event.entityId}`,
      event.summary,
      (event.meta as any)?.ip || "N/A",
      (event.meta as any)?.userAgent || "N/A",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return csvContent;
  }

  /**
   * Obtiene estadísticas de auditoría
   */
  static async getStats(filters: AuditFilters = {}) {
    const { events } = await this.getEvents(filters, 1, 10000);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEvents = events.filter((e) => e.createdAt >= today);

    const actionCounts = events.reduce((acc, event) => {
      acc[event.action] = (acc[event.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const entityCounts = events.reduce((acc, event) => {
      acc[event.entityType] = (acc[event.entityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: events.length,
      today: todayEvents.length,
      actionCounts,
      entityCounts,
      recentActivity: events.slice(0, 5),
    };
  }
}
