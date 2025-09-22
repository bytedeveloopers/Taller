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
export type QuoteStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";

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
