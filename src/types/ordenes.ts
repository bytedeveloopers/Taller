// Tipos para Órdenes de Trabajo del Panel Técnico

export const ESTADOS_ORDEN = [
  "INGRESO",
  "DIAGNOSTICO",
  "PROCESO_DESARME",
  "ESPERA",
  "PROCESO_ARMADO",
  "EN_PRUEBA",
  "FINALIZADO",
] as const;

export type EstadoOT = (typeof ESTADOS_ORDEN)[number];

export const LABEL_ESTADO: Record<EstadoOT, string> = {
  INGRESO: "Ingreso",
  DIAGNOSTICO: "Diagnóstico",
  PROCESO_DESARME: "Proceso desarme",
  ESPERA: "Espera",
  PROCESO_ARMADO: "Proceso armado",
  EN_PRUEBA: "En prueba",
  FINALIZADO: "Finalizado",
};

export const COLORES_ESTADO: Record<EstadoOT, string> = {
  INGRESO: "bg-blue-100 text-blue-800 border-blue-200",
  DIAGNOSTICO: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PROCESO_DESARME: "bg-orange-100 text-orange-800 border-orange-200",
  ESPERA: "bg-red-100 text-red-800 border-red-200",
  PROCESO_ARMADO: "bg-purple-100 text-purple-800 border-purple-200",
  EN_PRUEBA: "bg-indigo-100 text-indigo-800 border-indigo-200",
  FINALIZADO: "bg-green-100 text-green-800 border-green-200",
};

export type SubtipoEvidencia360 =
  | "360_FRONTAL"
  | "360_FRONT_IZQ"
  | "360_LATERAL_IZQ"
  | "360_TRAS_IZQ"
  | "360_TRASERA"
  | "360_TRAS_DER"
  | "360_LATERAL_DER"
  | "360_FRONT_DER"
  | "360_TECHO"
  | "360_COFRE"
  | "360_MALETERO"
  | "360_LLANTAS"
  | "VIN"
  | "ODOMETRO"
  | "COMBUSTIBLE"
  | "DANIO";

export const SUBTIPOS_360: SubtipoEvidencia360[] = [
  "360_FRONTAL",
  "360_FRONT_IZQ",
  "360_LATERAL_IZQ",
  "360_TRAS_IZQ",
  "360_TRASERA",
  "360_TRAS_DER",
  "360_LATERAL_DER",
  "360_FRONT_DER",
  "360_TECHO",
  "360_COFRE",
  "360_MALETERO",
  "360_LLANTAS",
];

export const SUBTIPOS_DETALLES: SubtipoEvidencia360[] = ["VIN", "ODOMETRO", "COMBUSTIBLE", "DANIO"];

export const LABELS_SUBTIPO: Record<SubtipoEvidencia360, string> = {
  "360_FRONTAL": "Frontal",
  "360_FRONT_IZQ": "Frontal Izq.",
  "360_LATERAL_IZQ": "Lateral Izq.",
  "360_TRAS_IZQ": "Trasera Izq.",
  "360_TRASERA": "Trasera",
  "360_TRAS_DER": "Trasera Der.",
  "360_LATERAL_DER": "Lateral Der.",
  "360_FRONT_DER": "Frontal Der.",
  "360_TECHO": "Techo",
  "360_COFRE": "Cofre",
  "360_MALETERO": "Maletero",
  "360_LLANTAS": "Llantas",
  VIN: "VIN",
  ODOMETRO: "Odómetro",
  COMBUSTIBLE: "Combustible",
  DANIO: "Daño",
};

export interface Evidencia {
  id: string;
  ordenId: string;
  url: string;
  tipo: "FOTO";
  sub_tipo: SubtipoEvidencia360;
  autorId: string;
  creadoEn: string;
  descripcion?: string;
}

export interface NotaTecnica {
  id: string;
  ordenId: string;
  texto: string;
  autorId: string;
  creadoEn: string;
  fase?: EstadoOT;
}

export interface ChecklistItem {
  id: string;
  descripcion: string;
  completado: boolean;
  observaciones?: string;
  autorId?: string;
  creadoEn?: string;
}

export interface ChecklistFase {
  completo: boolean;
  items: ChecklistItem[];
  completadoEn?: string;
  completadoPor?: string;
}

export interface OrdenTrabajo {
  id: string;
  numero?: string; // Número de orden correlativo
  clienteId: string;
  vehiculoId: string;
  estado: EstadoOT;
  prioridad: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
  asignadoA: string;
  asignadoEn: string;

  // Datos del vehículo al ingreso
  km?: number;
  combustible?: number;
  vin?: string;

  // Diagnóstico
  diagnostico?: string;
  estimacionHoras?: number;

  // Checklists por fase
  checklists?: {
    INGRESO?: {
      fotos360Completo: boolean;
      vinOk: boolean;
      odometroOk: boolean;
      combustibleOk: boolean;
      items?: ChecklistItem[];
    };
    DESARME?: ChecklistFase;
    ARMADO?: ChecklistFase;
    PRUEBA?: ChecklistFase;
  };

  // Evidencias y notas
  evidencias: Evidencia[];
  notasTecnicas: NotaTecnica[];

  // Firmas
  firmaRecepcion?: string;
  firmaEntrega?: string;

  // Estado en espera
  enEspera?: boolean;
  motivoEspera?: string;
  tiempoEspera?: number; // en minutos

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  iniciadoEn?: string;
  finalizadoEn?: string;

  // Relaciones expandidas (para evitar consultas adicionales)
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
    ano: number;
    color?: string;
    vin?: string;
  };
  tecnico?: {
    id: string;
    nombre: string;
    email: string;
  };
}

// Gates de validación para transiciones de estado
export const gates = {
  puedeIrADiagnostico: (ot: OrdenTrabajo): boolean => {
    const ingreso = ot?.checklists?.INGRESO;
    return !!(
      ingreso?.fotos360Completo &&
      ingreso?.vinOk &&
      ingreso?.odometroOk &&
      ingreso?.combustibleOk &&
      ot?.firmaRecepcion
    );
  },

  puedeIrADesarme: (ot: OrdenTrabajo): boolean => {
    // Diagnóstico es opcional pero debe estar en estado DIAGNOSTICO
    return ot.estado === "DIAGNOSTICO";
  },

  puedeIrAArmado: (ot: OrdenTrabajo): boolean => {
    return ot?.checklists?.DESARME?.completo === true;
  },

  puedeIrAPrueba: (ot: OrdenTrabajo): boolean => {
    return ot?.checklists?.ARMADO?.completo === true;
  },

  puedeFinalizar: (ot: OrdenTrabajo): boolean => {
    return ot?.checklists?.PRUEBA?.completo === true;
  },

  puedePonerEnEspera: (ot: OrdenTrabajo): boolean => {
    // Puede poner en espera desde cualquier estado excepto FINALIZADO
    return ot.estado !== "FINALIZADO";
  },

  puedeSalirDeEspera: (ot: OrdenTrabajo): boolean => {
    return ot.estado === "ESPERA";
  },
};

// Helpers para validar evidencias 360
export const validarEvidencias360 = (evidencias: Evidencia[]): boolean => {
  const subtipos360Encontrados = evidencias
    .filter((e) => SUBTIPOS_360.includes(e.sub_tipo))
    .map((e) => e.sub_tipo);

  return SUBTIPOS_360.every((subtipo) => subtipos360Encontrados.includes(subtipo));
};

export const contarEvidencias360 = (evidencias: Evidencia[]): number => {
  return evidencias.filter((e) => SUBTIPOS_360.includes(e.sub_tipo)).length;
};

// Helper para generar número de orden
export const generarNumeroOrden = (): string => {
  const ahora = new Date();
  const año = ahora.getFullYear().toString().slice(-2);
  const mes = (ahora.getMonth() + 1).toString().padStart(2, "0");
  const dia = ahora.getDate().toString().padStart(2, "0");
  const hora = ahora.getHours().toString().padStart(2, "0");
  const minuto = ahora.getMinutes().toString().padStart(2, "0");

  return `OT${año}${mes}${dia}${hora}${minuto}`;
};

// Mock data para desarrollo
export const ordenesDesarrolloMock: OrdenTrabajo[] = [
  {
    id: "1",
    numero: "OT241003001",
    clienteId: "cliente1",
    vehiculoId: "vehiculo1",
    estado: "INGRESO",
    prioridad: "ALTA",
    asignadoA: "tecnico1",
    asignadoEn: new Date().toISOString(),
    evidencias: [],
    notasTecnicas: [],
    cliente: {
      id: "cliente1",
      nombre: "Juan Pérez",
      telefono: "123456789",
    },
    vehiculo: {
      id: "vehiculo1",
      placa: "ABC123",
      marca: "Toyota",
      modelo: "Corolla",
      ano: 2020,
      color: "Blanco",
    },
    checklists: {
      INGRESO: {
        fotos360Completo: false,
        vinOk: false,
        odometroOk: false,
        combustibleOk: false,
      },
    },
  },
  {
    id: "2",
    numero: "OT241003002",
    clienteId: "cliente2",
    vehiculoId: "vehiculo2",
    estado: "DIAGNOSTICO",
    prioridad: "MEDIA",
    asignadoA: "tecnico1",
    asignadoEn: new Date().toISOString(),
    evidencias: [],
    notasTecnicas: [],
    cliente: {
      id: "cliente2",
      nombre: "María García",
      telefono: "987654321",
    },
    vehiculo: {
      id: "vehiculo2",
      placa: "XYZ789",
      marca: "Honda",
      modelo: "Civic",
      ano: 2019,
      color: "Negro",
    },
    checklists: {
      INGRESO: {
        fotos360Completo: true,
        vinOk: true,
        odometroOk: true,
        combustibleOk: true,
      },
    },
    firmaRecepcion: "data:image/png;base64,...",
  },
];
