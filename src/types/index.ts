// TypeScript types for the workshop management system

export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "TECHNICIAN";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  trackingCode: string;
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  color?: string;
  mileage?: number;
  customerId: string;
  status: VehicleStatus;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  estimatedTime?: number;
  actualTime?: number;
  vehicleId: string;
  technicianId?: string;
  createdById: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  vehicle?: Vehicle;
  technician?: User;
  createdBy?: User;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  description: string;
  subtotal: number;
  tax: number;
  total: number;
  status: QuoteStatus;
  validUntil: Date;
  vehicleId: string;
  customerId: string;
  createdById: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  vehicle?: Vehicle;
  customer?: Customer;
  createdBy?: User;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  quoteId: string;
}

export type VehicleStatus =
  | "RECEIVED"
  | "IN_PROGRESS"
  | "WAITING_PARTS"
  | "COMPLETED"
  | "DELIVERED";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type AppointmentStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "TECHNICIAN";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Search types
export interface VehicleSearchResult {
  vehicle: Vehicle;
  customer: Customer;
  currentTasks: Task[];
  status: VehicleStatus;
}

// Dashboard types
export interface DashboardStats {
  totalVehicles: number;
  vehiclesInProgress: number;
  completedToday: number;
  pendingTasks: number;
  activeTechnicians: number;
}

export interface TechnicianStats {
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  averageCompletionTime: number;
}

// Technician Management Types
export interface Technician {
  id: string;
  name: string;
  phone: string;
  email?: string;
  skills: string[];
  capacityPerDay: number;
  workHours: {
    start: string;
    end: string;
  };
  active: boolean;
  avatarUrl?: string;
  notes?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  currentLoad?: number;
  assignments?: Assignment[];
  blockedDates?: TechnicianBlock[];
}

export interface TechnicianBlock {
  id: string;
  technicianId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  type: "VACATION" | "SICK_LEAVE" | "TRAINING" | "OTHER";
  createdAt: Date;
}

export interface Assignment {
  id: string;
  workOrderId: string;
  technicianId: string;
  assignedAt: Date;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "REASSIGNED";
  notes?: string;
  workOrder?: WorkOrder;
  technician?: Technician;
}

export interface WorkOrder {
  id: string;
  trackingCode: string;
  vehicleId: string;
  customerId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELIVERED";
  priority: Priority;
  description: string;
  estimatedHours?: number;
  actualHours?: number;
  scheduledDate?: Date;
  completedDate?: Date;
  vehicle?: Vehicle;
  customer?: Customer;
  assignments?: Assignment[];
  tasks?: Task[];
}

export interface TechnicianWorkLoad {
  technicianId: string;
  currentAssignments: number;
  capacity: number;
  loadPercentage: number;
  status: "LOW" | "MEDIUM" | "HIGH" | "OVERLOADED";
}

export interface TechnicianPerformance {
  technicianId: string;
  totalCompleted: number;
  onTimeDelivery: number;
  averageCompletionTime: number;
  customerSatisfaction?: number;
  rework: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface TechnicianSchedule {
  id: string;
  technicianId: string;
  type: "APPOINTMENT" | "REMINDER" | "BLOCK";
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

// ===== MEDIA =====

export interface Media {
  id: string;
  entityType: string;
  entityId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== COTIZACIONES (QUOTES) =====

export interface Quote {
  id: string;
  workOrderId?: string;
  clientId: string;
  vehicleId: string;
  technicianId?: string;
  estado: QuoteStatus;
  moneda: "GTQ" | "USD";
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  fechaCreacion: Date;
  vencimientoAt: Date;
  publicToken?: string;
  publicExpiresAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  adjustRequestedAt?: Date;
  adjustComment?: string;
  termsVersion: string;
  acceptedIp?: string;
  acceptedUa?: string;
  sentVia: string; // "link", "whatsapp" (futuro)
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  client?: Customer;
  vehicle?: Vehicle;
  workOrder?: WorkOrder;
  technician?: User;
  items?: QuoteItem[];
  attachments?: Media[];
  timeline?: QuoteTimelineEvent[];
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  concepto: string;
  descripcion?: string;
  cantidad: number;
  precioUnitario: number;
  tipo: "MO" | "SERVICIO" | "REPUESTO"; // Mano de obra, Servicio, Repuesto
  nota?: string;
  orden: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteStats {
  totalCotizaciones: number;
  borradores: number;
  enviadas: number;
  aprobadas: number;
  rechazadas: number;
  ajusteSolicitado: number;
  vencidas: number;
  totalMontoMes: number;
  tasaAprobacion: number;
  tiempoPromedioRespuesta: number; // horas
}

export interface QuoteTimelineEvent {
  id: string;
  quoteId: string;
  tipo: QuoteEventType;
  descripcion: string;
  metadata?: any;
  ip?: string;
  userAgent?: string;
  userId?: string;
  createdAt: Date;

  // Relaciones
  user?: User;
}

export interface QuotePublicView {
  id: string;
  token: string;
  estado: QuoteStatus;
  fechaCreacion: Date;
  vencimientoAt: Date;
  moneda: string;
  total: number;
  isExpired: boolean;

  // Datos del taller
  taller: {
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
    logo?: string;
  };

  // Datos del cliente y vehículo
  cliente: {
    nombre: string;
    telefono?: string;
  };

  vehiculo: {
    marca: string;
    modelo: string;
    anio: number;
    placa?: string;
  };

  // Items y totales
  items: QuoteItem[];
  subtotal: number;
  impuestos: number;
  descuento: number;

  // Adjuntos públicos
  imagenes?: string[];

  // Términos y condiciones
  terminos: string;
}

export interface QuoteApprovalData {
  approved: boolean;
  signature?: string;
  acceptedTerms: boolean;
  clientComments?: string;
  adjustmentRequest?: string;
  contactPhone?: string;
  ip: string;
  userAgent: string;
}

// Enums para Cotizaciones
export type QuoteStatus =
  | "BORRADOR"
  | "ENVIADA"
  | "VISTA"
  | "APROBADA"
  | "RECHAZADA"
  | "AJUSTE_SOLICITADO"
  | "VENCIDA"
  | "CANCELADA";

export type QuoteEventType =
  | "CREADA"
  | "EDITADA"
  | "ENVIADA"
  | "VISTA"
  | "APROBADA"
  | "RECHAZADA"
  | "AJUSTE_SOLICITADO"
  | "ENLACE_RENOVADO"
  | "VENCIDA"
  | "CANCELADA";

// ========== CALENDAR TYPES ==========

export interface CalendarEvent {
  id: string;
  title?: string;
  type: EventType;
  scheduledAt: Date;
  startAt?: Date;
  endAt?: Date;
  estimatedDuration?: number; // en minutos
  location?: string;
  note?: string;
  notes?: string; // Campo existente de appointment
  status: AppointmentStatus;

  // Referencias opcionales
  vehicleId?: string;
  customerId?: string;
  technicianId?: string;
  taskId?: string;

  // Recordatorios
  reminder24h: boolean;
  reminder1h: boolean;
  reminder15m: boolean;

  // Bloqueos
  isBlocker: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  vehicle?: Vehicle;
  customer?: Customer;
  technician?: User;
  task?: Task;
}

export type EventType =
  | "CITA"
  | "RECOGIDA"
  | "ENTREGA"
  | "LLAMADA"
  | "MANTENIMIENTO"
  | "PRUEBA_RUTA"
  | "OTRO";

export interface EventFilter {
  technicianId?: string;
  type?: EventType;
  taskId?: string;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AppointmentStatus;
  includeBlockers?: boolean;
}

export interface CalendarViewMode {
  mode: "day" | "week" | "month";
  date: Date;
}

export interface TechnicianAgendaStats {
  eventsToday: number;
  eventsNext48h: number;
  blockedHours: number;
}

export interface EventDragData {
  eventId: string;
  newStartTime: Date;
  newEndTime?: Date;
}

export interface CalendarEventCreate {
  title?: string;
  type: EventType;
  scheduledAt: Date;
  startAt?: Date;
  endAt?: Date;
  estimatedDuration?: number;
  location?: string;
  note?: string;
  vehicleId?: string;
  customerId?: string;
  technicianId?: string;
  taskId?: string;
  reminder24h?: boolean;
  reminder1h?: boolean;
  reminder15m?: boolean;
  isBlocker?: boolean;
}

export interface CalendarEventUpdate extends Partial<CalendarEventCreate> {
  id: string;
  status?: AppointmentStatus;
}

// Colores por tipo de evento
export const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; border: string }> = {
  CITA: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500" },
  RECOGIDA: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500" },
  ENTREGA: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500" },
  LLAMADA: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500" },
  MANTENIMIENTO: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500" },
  PRUEBA_RUTA: { bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500" },
  OTRO: { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500" },
};

// Labels para los tipos de evento
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  CITA: "Cita",
  RECOGIDA: "Recogida",
  ENTREGA: "Entrega",
  LLAMADA: "Llamada",
  MANTENIMIENTO: "Mantenimiento",
  PRUEBA_RUTA: "Prueba de Ruta",
  OTRO: "Otro",
};

// ===============================
// TIPOS PARA SISTEMA DE REPORTES
// ===============================

export type ReportType =
  | "operacion-diaria"
  | "tiempos-sla"
  | "cotizaciones-embudo"
  | "productividad-tecnicos"
  | "clientes-retencion"
  | "vehiculos"
  | "agenda-cumplimiento"
  | "evidencias-auditoria";

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  startDate?: string;
  endDate?: string;
  technicianId?: string;
  customerId?: string;
  vehicleId?: string;
  status?: VehicleStatus;
  eventType?: EventType;
  preset?: "today" | "week" | "month" | "custom";
}

export interface KPI {
  label: string;
  title?: string;
  value: string | number;
  subtitle?: string;
  trend?:
    | {
        value: number;
        isPositive: boolean;
        period: string;
      }
    | number;
  color?: "green" | "yellow" | "red" | "blue" | "purple";
  icon?: string;
}

export interface ReportData {
  type: ReportType;
  title: string;
  subtitle?: string;
  kpis: KPI[];
  data: any[];
  totalRecords?: number;
  lastUpdated: Date;
  filters: ReportFilters;
}

// Reportes específicos
export interface OperacionDiariaData {
  ingresosDia: number;
  otsActivas: number;
  otsFinalizadas: number;
  otsEntregadas: number;
  atrasadasCount: number;
  atrasadasPercent: number;
  slaOnTime: number;
  slaPercentage: number;
  detalleOTs: {
    id: string;
    trackingCode: string;
    cliente: string;
    vehiculo: string;
    tecnico?: string;
    status: VehicleStatus;
    fechaIngreso: Date;
    diasEnTaller: number;
    slaDeadline?: Date;
    isAtrasada: boolean;
  }[];
}

export interface TiemposSLAData {
  kpis: KPI[];
  tiemposPorEtapa: {
    etapa: string;
    promedioHoras: number;
    p50Horas: number;
    p90Horas: number;
  }[];
  ordenes: {
    id: number;
    code: string;
    customer: string;
    vehicle: string;
    technician: string;
    tatTotalHoras?: number;
    diasEnTaller: number;
    estadoSLA: string;
    receivedAt: string;
  }[];
}

export interface CotizacionesEmbudoData {
  kpis: KPI[];
  embudo: {
    borradores: number;
    enviadas: number;
    aprobadas: number;
    rechazadas: number;
  };
  cotizaciones: {
    id: number;
    code: string;
    customer: string;
    vehicle: string;
    total: number;
    status: string;
    responseTime?: number;
    createdAt: string;
    fechaRespuesta?: Date;
    tiempoRespuesta?: number;
    razonRechazo?: string;
  }[];
}

export interface ProductividadTecnicosData {
  kpis: KPI[];
  tecnicos: {
    id: number;
    name: string;
    otsFinalizadas: number;
    onTimePercentage: number;
    utilizacion: number;
    tiempoPromedioHoras: number;
    especialidad: string;
    activo: boolean;
  }[];
}

export interface ClientesRetencionData {
  kpis: KPI[];
  clientes: {
    id: number;
    name: string;
    email: string;
    status: string;
    totalVisits: number;
    totalSpent: number;
    avgSpentPerVisit: number;
    daysSinceLastVisit: number;
    vehicleCount: number;
  }[];
  distribucionFrecuencia: Record<string, number>;
  topClientesPorValor: any[];
}

export interface VehiculosData {
  kpis: KPI[];
  marcas: {
    brand: string;
    count: number;
    avgServicesPerVehicle?: number;
  }[];
  proximasRevisiones: {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate: string;
    customer: string;
    nextReview: string;
    daysUntilReview: number;
    isOverdue: boolean;
    priority: string;
  }[];
  distribucionAnos: {
    year: number;
    count: number;
  }[];
  historialVehiculos: {
    vehicleId: string;
    trackingCode: string;
    cliente: string;
    vehiculo: string;
    totalVisitas: number;
    ultimoEstado: VehicleStatus;
    fechaUltimaVisita: Date;
    ots: {
      id: string;
      fecha: Date;
      status: VehicleStatus;
      tecnico?: string;
    }[];
  }[];
}

export interface AgendaCumplimientoData {
  kpis: KPI[];
  citas: {
    id: number;
    date: string;
    customer: string;
    vehicle: string;
    technician: string;
    complianceStatus: string;
    rescheduledCount: number;
  }[];
  distribucionDias?: {
    day: string;
    total: number;
    completionRate?: number;
  }[];
}

export interface EvidenciasAuditoriaData {
  kpis: KPI[];
  evidencias: {
    id: number;
    code: string;
    customer: string;
    vehicle: string;
    totalPhotos: number;
    porcentajeCobertura?: number;
    auditScore: number;
    nivelCumplimiento: string;
  }[];
  distribucionNiveles?: Record<string, number>;
  accionesCriticas: {
    totalAcciones: number;
    porTipo: {
      tipo: string;
      count: number;
      description: string;
    }[];
  };
  detalleAuditoria: {
    fecha: Date;
    usuario: string;
    accion: string;
    entidad: string;
    entityId: string;
    detalles: string;
    ip?: string;
  }[];
  detalleEvidencias: {
    otId: string;
    trackingCode: string;
    cliente: string;
    vehiculo: string;
    tecnico?: string;
    totalFotos: number;
    fotosPorEtapa: Record<string, number>;
    fotasFaltantes: string[];
    ultimaFoto: Date;
  }[];
}

// Utilidades para reportes
export interface ExportOptions {
  format: "csv" | "pdf";
  filename?: string;
  includeFilters?: boolean;
  includeKPIs?: boolean;
}

export interface DrillDownContext {
  entityType: "vehicle" | "customer" | "quote" | "appointment" | "task";
  entityId: string;
  source: ReportType;
  filters?: ReportFilters;
  type?: "workOrder" | string;
}
