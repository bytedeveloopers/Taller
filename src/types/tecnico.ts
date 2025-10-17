// Tipos específicos para el Dashboard del Técnico
// Reutiliza la estructura existente sin romper compatibilidad

export type EstadoOT =
  | "INGRESO"
  | "DIAGNOSTICO"
  | "COTIZACION_ENVIADA"
  | "DESARME"
  | "ARMADO"
  | "PRUEBA_CALIDAD"
  | "LISTO_ENTREGA"
  | "ENTREGADO"
  | "EN_ESPERA";

export type PrioridadOT = "BAJA" | "MEDIA" | "ALTA" | "URGENTE";

export interface Evidencia {
  id: string;
  url: string;
  tipo: "ANTES" | "DESPUES" | "GENERAL";
  creadoEn: string; // ISO
  autorId: string;
}

export interface NotaTecnica {
  id: string;
  texto: string;
  creadoEn: string; // ISO
  autorId: string;
}

export interface MotivoEspera {
  motivo: string;
  desde: string; // ISO
  hasta?: string; // ISO
}

export interface ChecklistItem {
  texto: string;
  done: boolean;
}

export interface Checklist {
  id: string;
  nombre: string;
  items: ChecklistItem[];
}

export interface OrdenTrabajo {
  id: string;
  numero?: string; // Para mostrar OT-2024-001
  clienteId: string;
  vehiculoId: string;
  estado: EstadoOT;
  prioridad: PrioridadOT;
  asignadoA: string; // técnicoId
  asignadoPor: string; // adminId
  asignadoEn: string; // ISO
  slaAt?: string; // ISO fecha/hora límite
  km?: number;
  combustible?: number; // 0-100
  diagnostico?: string;
  estimacionHoras?: number;
  motivosEspera?: MotivoEspera[];
  evidencias: Evidencia[];
  notasTecnicas: NotaTecnica[];
  checklists: Checklist[];
  cotizacionId?: string;
  firmaRecepcion?: string; // url/objeto
  firmaEntrega?: string; // url/objeto

  // Información relacionada (joins)
  cliente?: {
    id: string;
    nombre: string;
    telefono?: string;
    email?: string;
  };
  vehiculo?: {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
    año: number;
    vin?: string;
  };

  // Campos calculados
  esNueva?: boolean; // asignadoEn <= 24h
  tiempoTranscurrido?: number; // minutos desde último cambio de estado
  porcentajeProgreso?: number; // 0-100
}

export interface KPIsTecnico {
  otsActivas: number;
  otsAtrasadas: number;
  tareasHoy: number;
  cumplimientoSLA: number;
}

export interface AlertaTecnico {
  id: string;
  tipo: "OT_NUEVA" | "OT_ATRASADA" | "FALTAN_EVIDENCIAS" | "EN_ESPERA_MUCHO_TIEMPO";
  mensaje: string;
  ordenId?: string;
  timestamp: string;
  leida: boolean;
}

export interface CronometroEstado {
  ordenId: string;
  estadoActual: EstadoOT;
  inicioEn: string; // ISO
  pausadoEn?: string; // ISO
  tiempoAcumulado: number; // minutos
  activo: boolean;
}

export interface FiltrosOrdenes {
  estado?: EstadoOT;
  prioridad?: PrioridadOT;
  busqueda?: string; // placa/VIN/cliente
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface MetricasPersonales {
  tiempoPromedioPorEstado: Record<EstadoOT, number>; // minutos
  cumplimientoSLA: number; // porcentaje
  retrabajos: number;
  ordenesCerradasMes: number;
  satisfaccionCliente?: number;
  periodo: {
    inicio: string;
    fin: string;
  };
}

// Request/Response types para las APIs
export interface CambioEstadoRequest {
  estado: EstadoOT;
  motivoEnEspera?: string;
}

export interface EvidenciaUploadRequest {
  tipo: "ANTES" | "DESPUES" | "GENERAL";
  archivos: File[];
}

export interface NotaTecnicaRequest {
  texto: string;
}

export interface OrdenesResponse {
  ordenes: OrdenTrabajo[];
  total: number;
  pagina: number;
  totalPaginas: number;
  kpis: KPIsTecnico;
}

export interface AlertasResponse {
  alertas: AlertaTecnico[];
  sinLeer: number;
}

// Tipos para componentes específicos
export interface OrdenCardProps {
  orden: OrdenTrabajo;
  onCambiarEstado: (ordenId: string, nuevoEstado: EstadoOT, motivo?: string) => void;
  onSubirEvidencias: (ordenId: string, evidencias: File[]) => void;
  onAgregarNota: (ordenId: string, nota: string) => void;
  onAbrirChecklist: (ordenId: string) => void;
}

export interface KanbanColumnProps {
  estado: EstadoOT;
  ordenes: OrdenTrabajo[];
  titulo: string;
  color: string;
  onOrdenDrop?: (ordenId: string, nuevoEstado: EstadoOT) => void;
}

export interface EstadoTimerProps {
  cronometro: CronometroEstado;
  onIniciar: (ordenId: string) => void;
  onPausar: (ordenId: string, motivo?: string) => void;
  onReanudar: (ordenId: string) => void;
}
