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
