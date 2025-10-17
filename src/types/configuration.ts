// ====== CONFIGURATION SYSTEM TYPES ======

// Settings System
export interface Setting {
  id: string;
  namespace: string;
  key: string;
  value: any;
  description?: string;
  type: "string" | "number" | "boolean" | "json" | "array";
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingInput {
  namespace: string;
  key: string;
  value: any;
  description?: string;
  type?: "string" | "number" | "boolean" | "json" | "array";
}

// RBAC System
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: RolePermission[];
  userRoles?: UserRole[];
}

export interface Permission {
  id: string;
  key: string;
  displayName: string;
  description?: string;
  category: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  granted: boolean;
  createdAt: Date;
  updatedAt: Date;
  role?: Role;
  permission?: Permission;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  role?: Role;
}

// Terms and Templates
export interface TermsVersion {
  id: string;
  type: string;
  version: string;
  title: string;
  content: string;
  isActive: boolean;
  publishedAt?: Date;
  publishedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentTemplate {
  id: string;
  type: string;
  name: string;
  content: string;
  variables?: any;
  isActive: boolean;
  isSystem: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WaitCause {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Configuration Sections
export interface WorkshopConfig {
  // Basic Info
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  altPhone?: string;
  email: string;
  address: string;
  hours: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };

  // Branding for landing pages
  landingLogo?: string;
  landingMessage: string;
  landingColors: {
    primary: string;
    secondary: string;
  };
}

export interface WorkflowConfig {
  stages: WorkflowStage[];
  rules: {
    blockDisassemblyWithoutApprovedQuote: boolean;
    autoTransitions: boolean;
    requirePhotosForInspection: boolean;
  };
}

export interface WorkflowStage {
  id: string;
  name: string;
  displayName: string;
  order: number;
  slaHours: number;
  warningThresholdHours: number;
  criticalThresholdHours: number;
  color: string;
  isActive: boolean;
  allowedTransitions: string[];
}

export interface NotificationConfig {
  globalEnabled: boolean;
  types: {
    [key: string]: {
      enabled: boolean;
      channels: ("IN_APP" | "WHATSAPP" | "PUSH")[];
      priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
    };
  };
  deduplication: {
    enabled: boolean;
    windowMinutes: number;
  };
  defaultIntensity: "NORMAL" | "CRITICAL_ONLY";
}

export interface AgendaConfig {
  eventTypes: EventTypeConfig[];
  defaults: {
    duration: number; // minutes
    reminders: {
      reminder24h: boolean;
      reminder1h: boolean;
      reminder15m: boolean;
    };
  };
  workingHours: {
    start: string; // "08:00"
    end: string; // "18:00"
    workingDays: number[]; // [1,2,3,4,5] = Mon-Fri
  };
}

export interface EventTypeConfig {
  type: string;
  displayName: string;
  defaultDuration: number;
  color: string;
  requiresVehicle: boolean;
  requiresCustomer: boolean;
  isActive: boolean;
}

export interface EvidenceConfig {
  minPhotosPerStage: {
    [stage: string]: number;
  };
  fileSize: {
    maxSizeMB: number;
    allowedTypes: string[];
  };
  retention: {
    deletePermanentlyAfterDays: number;
    moveToTrashAfterDays: number;
  };
  storage: {
    provider: "local" | "s3" | "cloudinary";
    path: string;
  };
}

export interface UIPreferences {
  defaultPage: "dashboard" | "kanban" | "agenda" | "clients" | "vehicles";
  density: "compact" | "normal" | "comfortable";
  language: string;
  currency: string;
  timezone: string;
  visibleColumns: {
    clients: string[];
    vehicles: string[];
    workOrders: string[];
    quotes: string[];
  };
}

export interface IntegrationConfig {
  features: {
    whatsapp: boolean;
    push: boolean;
    email: boolean;
  };
  whatsapp: {
    apiKey?: string;
    phoneNumber?: string;
    templates: {
      [key: string]: string;
    };
  };
  push: {
    vapidKey?: string;
    serviceAccount?: string;
  };
}

export interface BackupConfig {
  automated: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
    time: string; // "02:00"
    retention: number; // days
  };
  manual: {
    lastBackup?: Date;
    nextScheduled?: Date;
  };
  storage: {
    location: string;
    maxSizeGB: number;
  };
  auditLogRetention: number; // days
}

// API Types
export interface ConfigurationResponse {
  taller: DatosTaller;
  usuarios: UsuariosPermisosConfig;
  flujo: FlujoSLAConfig;
  plantillas: PlantillasConfigExtended;
  agenda: AgendaConfigExtended;
  notificaciones: NotificacionesConfig;
  evidencias: EvidenciasConfig;
  interfaz: InterfazConfig;
  backup: any; // BackupConfig compatible with frontend
}

export interface RoleWithPermissions extends Role {
  permissions: (RolePermission & { permission: Permission })[];
}

export interface UserWithRoles {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roles: (UserRole & { role: Role })[];
}

// Permission Categories
export const PERMISSION_CATEGORIES = {
  CLIENTS: "clients",
  VEHICLES: "vehicles",
  WORK_ORDERS: "work_orders",
  QUOTES: "quotes",
  AGENDA: "agenda",
  EVIDENCE: "evidence",
  REPORTS: "reports",
  CONFIGURATION: "configuration",
  AUDIT: "audit",
} as const;

// Standard Permissions
export const STANDARD_PERMISSIONS = [
  // Clients
  "clients.view",
  "clients.create",
  "clients.edit",
  "clients.delete",
  "clients.merge",

  // Vehicles
  "vehicles.view",
  "vehicles.create",
  "vehicles.edit",
  "vehicles.delete",
  "vehicles.change_status",

  // Work Orders
  "work_orders.view",
  "work_orders.create",
  "work_orders.edit",
  "work_orders.delete",
  "work_orders.assign_technician",
  "work_orders.force_transition",
  "work_orders.pause",
  "work_orders.resume",

  // Quotes
  "quotes.view",
  "quotes.create",
  "quotes.edit",
  "quotes.delete",
  "quotes.send",
  "quotes.approve",

  // Agenda
  "agenda.view",
  "agenda.create",
  "agenda.edit",
  "agenda.delete",
  "agenda.assign",

  // Evidence
  "evidence.view",
  "evidence.upload",
  "evidence.delete",

  // Reports
  "reports.view",
  "reports.export",

  // Configuration
  "configuration.view",
  "configuration.edit",
  "configuration.manage_users",
  "configuration.manage_roles",

  // Audit
  "audit.view",
  "audit.delete",
] as const;

// Default Roles
export const DEFAULT_ROLES = [
  {
    name: "admin",
    displayName: "Administrador",
    description: "Acceso completo al sistema",
    isSystem: true,
  },
  {
    name: "reception",
    displayName: "Recepción",
    description: "Manejo de clientes, vehículos y recepción",
    isSystem: true,
  },
  {
    name: "technician",
    displayName: "Técnico",
    description: "Trabajo en órdenes asignadas y evidencias",
    isSystem: true,
  },
] as const;

export type ConfigurationSection =
  | "taller"
  | "usuarios"
  | "flujo"
  | "plantillas"
  | "agenda"
  | "notificaciones"
  | "evidencias"
  | "interfaz"
  | "backup";

// 1. DATOS DEL TALLER
export interface DatosTaller {
  nombreComercial: string;
  nit?: string;
  telefonos: string[];
  direccion?: string;
  horario?: string;
  zonaHoraria: string;
  moneda: "GTQ";
  ivaPorc: number;
  formatoFecha: "dd/MM/yyyy";
  idioma: "es-GT";
  logoUrl?: string;
  mostrarPreciosATecnicos: boolean;
  kilometrajeUnidad: "km";
  condicionesServicio?: string;
  camposPersonalizados: CampoPersonalizado[];
}

export interface CampoPersonalizado {
  entidad: "cliente" | "vehiculo" | "ot";
  nombre: string;
  tipo: "text" | "number" | "select";
  opciones?: string[];
  requerido: boolean;
}

// 2. USUARIOS Y PERMISOS
export type Rol = "ADMIN" | "RECEPCION" | "TECNICO" | "AUDITOR" | "INVITADO";

export type Permiso =
  | "clientes.read"
  | "clientes.write"
  | "clientes.delete"
  | "vehiculos.read"
  | "vehiculos.write"
  | "vehiculos.delete"
  | "ot.read"
  | "ot.write"
  | "ot.delete"
  | "ot.changeState"
  | "cotizaciones.read"
  | "cotizaciones.write"
  | "cotizaciones.delete"
  | "evidencias.read"
  | "evidencias.write"
  | "evidencias.delete"
  | "verCostos"
  | "exportar"
  | "configurar";

export interface RolPermisos {
  rol: Rol;
  permisos: Permiso[];
}

export interface Seguridad {
  longitudMinPass: number;
  intentosMax: number;
}

export interface UsuariosPermisosConfig {
  roles: RolPermisos[];
  seguridad: Seguridad;
}

// 3. FLUJO Y SLA
export interface EstadoFlujo {
  id: string;
  nombre: string;
  color?: string;
}

export interface Transicion {
  fromId: string;
  toIds: string[];
}

export interface SLA {
  estadoId: string;
  horas?: number;
  alertarAl80: boolean;
}

export interface AccionEstado {
  estadoId: string;
  checklist: string[];
  camposObligatorios: string[];
}

export interface FlujoSLAConfig {
  estados: EstadoFlujo[];
  transiciones: Transicion[];
  slas: SLA[];
  acciones: AccionEstado[];
}

// 4. PLANTILLAS
export interface PlantillaDocumento {
  tipo: string;
  nombre: string;
  descripcion: string;
  activa: boolean;
  encabezado: string;
  piePagina: string;
  contenido: string;
  variablesDisponibles: string[];
}

export interface PlantillaEmail {
  tipo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  asunto: string;
  remitente: string;
  contenidoHtml: string;
}

export interface PlantillaSMS {
  tipo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  mensaje: string;
}

export interface PlantillasConfigExtended {
  documentos: PlantillaDocumento[];
  emails: PlantillaEmail[];
  sms: PlantillaSMS[];
  configuracion?: {
    logoUrl: string;
    firmaDigital: string;
    formatoPDF: {
      tamanoPagina: string;
      margenes: {
        superior: number;
        inferior: number;
        izquierdo: number;
        derecho: number;
      };
    };
  };
}

export interface PlantillasConfig {
  cotizacion?: PlantillaDocumento;
  ot?: PlantillaDocumento;
  recibo?: PlantillaDocumento;
  checklistRecepcion?: PlantillaDocumento;
  checklistEntrega?: PlantillaDocumento;
}

// 5. AGENDA
export interface TipoCita {
  id: string;
  nombre: string;
  duracionMinutos: number;
  bufferMinutos: number;
  color?: string;
}

export interface AgendaReglas {
  antiDobleBooking: boolean;
  anticipacionMinMin: number;
  maxCitasPorFranja?: number;
}

export interface HorarioAtencion {
  dia: string;
  activo: boolean;
  apertura: string;
  cierre: string;
}

export interface TipoCitaExtended {
  nombre: string;
  duracionMinutos: number;
  color: string;
  precioBase: number;
  descripcion?: string;
}

export interface RecordatorioConfig {
  tipo: "sms" | "email" | "whatsapp";
  activo: boolean;
  horasAntes: number;
  mensaje?: string;
}

export interface AgendaConfigExtended {
  horarios: HorarioAtencion[];
  tiposCita: TipoCitaExtended[];
  intervaloMinutos: number;
  anticipacionMinimaHoras: number;
  maxCitasPorDia: number;
  recordatorios: RecordatorioConfig[];
  configuracionAvanzada?: {
    permitirReagendamiento: boolean;
    limiteCancelacion: number;
    requiereConfirmacion: boolean;
    citasSuperpuestas: boolean;
  };
}

export interface AgendaConfig {
  tiposCita: TipoCita[];
  reglas: AgendaReglas;
  horarioLaboral: {
    inicio: string;
    fin: string;
    descansos: { inicio: string; fin: string }[];
  };
  feriados: { fecha: string; nombre: string }[];
}

// 6. NOTIFICACIONES
export type EventoNoti =
  | "sla.porVencer"
  | "sla.vencido"
  | "ot.cambioEstado"
  | "cita.creada"
  | "cita.proxima"
  | "cotizacion.aprobada"
  | "cotizacion.rechazada"
  | "evidencia.subida";

export interface ConfigNoti {
  evento: EventoNoti;
  activo: boolean;
  modo: "inmediata" | "digest";
  cadaHoras?: number;
}

export interface DND {
  rol: Rol;
  desde: string;
  hasta: string;
}

export interface NotificacionesConfig {
  eventos: ConfigNoti[];
  dnd: DND[];
}

// 7. EVIDENCIAS
export interface EvidenciasConfig {
  requeridasPorEstado: { estadoId: string; minFotos: number }[];
  tamanioMaxMB: number;
  formatosPermitidos: string[];
  compresionAuto: boolean;
  selloAgua: boolean;
  gps: boolean;
  retencionMeses: number;
  privacidadPorDefecto: "interna" | "cliente";
}

// 8. INTERFAZ
export interface InterfazConfig {
  tema: "dark" | "light";
  colorPrimario?: string;
  densidad: "compacta" | "normal";
  homeWidgets: string[];
  tablas: { [modulo: string]: { columnasVisibles: string[] } };
  accesibilidad: {
    fuenteBasePx: number;
    altoContraste: boolean;
  };
}

// 9. RESPALDOS
export interface BackupCfg {
  ambito: {
    bd: boolean;
    adjuntos: boolean;
    plantillas: boolean;
  };
  programacion: {
    frecuencia: "diario" | "semanal";
    horaLocal: string;
    retencionDias: number;
  };
  destino: {
    tipo: "descarga" | "s3" | "minio" | "ftp" | "drive";
    credenciales?: any;
    cifrado: boolean;
  };
}

export interface BackupLog {
  id: string;
  fecha: string;
  usuario: string;
  tamanoBytes: number;
  estado: "OK" | "ERROR" | "RUNNING";
  mensaje?: string;
  ubicacion?: string;
  scope: {
    bd: boolean;
    adjuntos: boolean;
    plantillas: boolean;
  };
}

export interface RespaldosConfig {
  configuracion: BackupCfg;
  logs: BackupLog[];
}
