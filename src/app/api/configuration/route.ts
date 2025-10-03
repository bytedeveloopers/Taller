import { configurationService } from "@/services/ConfigurationService";
import { NextRequest, NextResponse } from "next/server";

// GET /api/configuration - Get full configuration
export async function GET() {
  try {
    // Get all configuration namespaces
    const taller = await configurationService.getConfigurationByNamespace("taller");
    const usuarios = await configurationService.getConfigurationByNamespace("usuarios");
    const flujo = await configurationService.getConfigurationByNamespace("flujo");
    const plantillas = await configurationService.getConfigurationByNamespace("plantillas");
    const agenda = await configurationService.getConfigurationByNamespace("agenda");
    const notificaciones = await configurationService.getConfigurationByNamespace("notificaciones");
    const evidencias = await configurationService.getConfigurationByNamespace("evidencias");
    const interfaz = await configurationService.getConfigurationByNamespace("interfaz");
    const respaldos = await configurationService.getConfigurationByNamespace("respaldos");

    // Default configurations
    const defaultConfig = {
      taller: {
        nombreComercial: "Mi Taller Automotriz",
        telefonos: ["+502 1234-5678"],
        zonaHoraria: "America/Guatemala",
        moneda: "GTQ" as const,
        ivaPorc: 12,
        formatoFecha: "dd/MM/yyyy" as const,
        idioma: "es-GT" as const,
        mostrarPreciosATecnicos: false,
        kilometrajeUnidad: "km" as const,
        camposPersonalizados: [],
      },
      usuarios: {
        roles: [
          {
            rol: "ADMIN" as const,
            permisos: [
              "clientes.read",
              "clientes.write",
              "clientes.delete",
              "vehiculos.read",
              "vehiculos.write",
              "vehiculos.delete",
              "ot.read",
              "ot.write",
              "ot.delete",
              "ot.changeState",
              "cotizaciones.read",
              "cotizaciones.write",
              "cotizaciones.delete",
              "evidencias.read",
              "evidencias.write",
              "evidencias.delete",
              "verCostos",
              "exportar",
              "configurar",
            ] as const,
          },
        ],
        seguridad: {
          longitudMinPass: 8,
          intentosMax: 3,
        },
      },
    };

    // Default configurations for all sections
    const defaultFlujo = {
      estados: [
        { id: "recibido", nombre: "Recibido", color: "#3B82F6", orden: 1 },
        { id: "diagnostico", nombre: "Diagnóstico", color: "#F59E0B", orden: 2 },
        { id: "reparacion", nombre: "En Reparación", color: "#EF4444", orden: 3 },
        { id: "completado", nombre: "Completado", color: "#10B981", orden: 4 },
      ],
      slas: [
        { estadoId: "recibido", horas: 2, alertaHoras: 1 },
        { estadoId: "diagnostico", horas: 8, alertaHoras: 6 },
        { estadoId: "reparacion", horas: 24, alertaHoras: 20 },
        { estadoId: "completado", horas: 1, alertaHoras: 0 },
      ],
      transiciones: [],
      configuracion: { slaHoras: 24, alertasHabilitadas: true },
    };

    const defaultPlantillas = {
      documentos: [
        {
          tipo: "orden_trabajo",
          nombre: "Orden de Trabajo",
          descripcion: "Documento principal de la orden de trabajo",
          activa: true,
          encabezado: "Mi Taller Automotriz",
          piePagina: "Gracias por su confianza",
          contenido: "Orden de trabajo #{orden.numero}",
          variablesDisponibles: ["orden.numero", "cliente.nombre", "vehiculo.placa"],
        },
      ],
      emails: [],
      sms: [],
    };

    const defaultAgenda = {
      horarios: [
        { dia: "Lunes", activo: true, apertura: "08:00", cierre: "18:00" },
        { dia: "Martes", activo: true, apertura: "08:00", cierre: "18:00" },
        { dia: "Miércoles", activo: true, apertura: "08:00", cierre: "18:00" },
        { dia: "Jueves", activo: true, apertura: "08:00", cierre: "18:00" },
        { dia: "Viernes", activo: true, apertura: "08:00", cierre: "18:00" },
        { dia: "Sábado", activo: true, apertura: "08:00", cierre: "14:00" },
        { dia: "Domingo", activo: false, apertura: "08:00", cierre: "18:00" },
      ],
      tiposCita: [
        { nombre: "Diagnóstico", duracionMinutos: 30, color: "#3B82F6", precioBase: 25000 },
        { nombre: "Mantenimiento", duracionMinutos: 60, color: "#10B981", precioBase: 50000 },
      ],
      intervaloMinutos: 30,
      anticipacionMinimaHoras: 2,
      maxCitasPorDia: 20,
      recordatorios: [
        { tipo: "sms", activo: true, horasAntes: 24 },
        { tipo: "email", activo: true, horasAntes: 48 },
      ],
    };

    const defaultNotificaciones = {
      eventos: [
        { evento: "sla.porVencer", activo: true, modo: "inmediata" },
        { evento: "ot.cambioEstado", activo: true, modo: "digest", cadaHoras: 4 },
      ],
      dnd: [],
    };

    const defaultEvidencias = {
      requeridasPorEstado: [],
      tamanioMaxMB: 10,
      formatosPermitidos: ["jpg", "jpeg", "png", "pdf"],
      compresionAuto: true,
      selloAgua: false,
      gps: true,
      retencionMeses: 12,
      privacidadPorDefecto: "interna",
    };

    const defaultInterfaz = {
      tema: "dark",
      densidad: "normal",
      homeWidgets: ["orders_summary", "revenue_chart", "client_stats"],
      tablas: {},
      accesibilidad: { fuenteBasePx: 14, altoContraste: false },
    };

    const defaultRespaldos = {
      // Ámbito del respaldo
      incluirDatos: true,
      incluirEsquema: true,
      incluirUploads: true,
      incluirPlantillas: true,
      incluirConfiguracion: true,

      // Programación automática
      habilitado: false,
      frecuencia: "diario",
      hora: "02:30",
      diaSemana: 0,
      diaMes: 1,
      retencionDias: 30,
      maxRespaldos: 10,

      // Destino de almacenamiento
      tipoDestino: "local",
      rutaLocal: "/var/backups/taller",
      s3Endpoint: "",
      s3Bucket: "",
      s3AccessKey: "",
      s3SecretKey: "",
      encriptar: false,
    };

    // Get backup configuration using BackupService
    let backupConfig;
    try {
      const { BackupService } = await import("@/services/BackupService");
      backupConfig = await BackupService.getBackupConfig();
    } catch (error) {
      console.warn("Error loading backup config:", error);
      backupConfig = defaultRespaldos;
    }

    const configuration = {
      taller: taller || defaultConfig.taller,
      usuarios: usuarios || defaultConfig.usuarios,
      flujo: flujo || defaultFlujo,
      plantillas: plantillas || defaultPlantillas,
      agenda: agenda || defaultAgenda,
      notificaciones: notificaciones || defaultNotificaciones,
      evidencias: evidencias || defaultEvidencias,
      interfaz: interfaz || defaultInterfaz,
      backup: backupConfig,
    };

    return NextResponse.json({
      success: true,
      data: configuration,
    });
  } catch (error) {
    console.error("Error fetching configuration:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener la configuración" },
      { status: 500 }
    );
  }
}

// POST /api/configuration - Update configuration settings
export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();

    // Process each namespace of updates
    for (const [namespace, settings] of Object.entries(updates)) {
      if (typeof settings === "object" && settings !== null) {
        for (const [key, value] of Object.entries(settings)) {
          await configurationService.setSetting({
            namespace,
            key,
            value,
            type:
              typeof value === "boolean"
                ? "boolean"
                : typeof value === "number"
                ? "number"
                : Array.isArray(value) || (typeof value === "object" && value !== null)
                ? "json"
                : "string",
          });
        }
      }
    }

    // Return updated configuration
    const updatedConfig = await configurationService.getFullConfiguration();

    return NextResponse.json({
      success: true,
      data: updatedConfig,
      message: "Configuración actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error updating configuration:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la configuración" },
      { status: 500 }
    );
  }
}
