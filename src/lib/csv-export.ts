// Utilidades para exportación de reportes

export interface CSVExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: "short" | "long";
  numberFormat?: "decimal" | "currency";
  currency?: "GTQ" | "USD";
}

export interface CSVColumn {
  key: string;
  label: string;
  type?: "string" | "number" | "date" | "currency" | "percentage";
  format?: (value: any) => string;
}

export class CSVExporter {
  private static formatValue(
    value: any,
    type: string = "string",
    currency: string = "GTQ"
  ): string {
    if (value === null || value === undefined) return "";

    switch (type) {
      case "date":
        return new Date(value).toLocaleDateString("es-GT");
      case "currency":
        return `${currency} ${Number(value).toFixed(2)}`;
      case "percentage":
        return `${Number(value).toFixed(1)}%`;
      case "number":
        return Number(value).toString();
      default:
        return String(value);
    }
  }

  private static escapeCSV(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  static exportToCSV<T>(data: T[], columns: CSVColumn[], options: CSVExportOptions = {}): void {
    const {
      filename = `reporte-${new Date().toISOString().split("T")[0]}.csv`,
      includeHeaders = true,
      currency = "GTQ",
    } = options;

    let csvContent = "";

    // Agregar headers si se requiere
    if (includeHeaders) {
      const headers = columns.map((col) => this.escapeCSV(col.label)).join(",");
      csvContent += headers + "\n";
    }

    // Agregar datos
    data.forEach((row) => {
      const values = columns.map((col) => {
        const value = (row as any)[col.key];
        const formattedValue = col.format
          ? col.format(value)
          : this.formatValue(value, col.type, currency);
        return this.escapeCSV(formattedValue);
      });
      csvContent += values.join(",") + "\n";
    });

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // Exportadores específicos por tipo de reporte
  static exportOperacionDiaria(data: any[], filters: any) {
    const columns: CSVColumn[] = [
      { key: "trackingCode", label: "Código OT" },
      { key: "cliente", label: "Cliente" },
      { key: "vehiculo", label: "Vehículo" },
      { key: "tecnico", label: "Técnico" },
      { key: "fechaInicio", label: "Fecha Inicio", type: "date" },
      { key: "fechaFin", label: "Fecha Fin", type: "date" },
      { key: "estado", label: "Estado" },
      { key: "tiempoEstimado", label: "Tiempo Estimado (h)", type: "number" },
      { key: "tiempoReal", label: "Tiempo Real (h)", type: "number" },
      { key: "slaDeadline", label: "Límite SLA", type: "date" },
      { key: "isAtrasada", label: "Atrasada", format: (value) => (value ? "Sí" : "No") },
    ];

    this.exportToCSV(data, columns, {
      filename: `operacion-diaria-${filters.dateFrom || "hoy"}.csv`,
    });
  }

  exportTiemposSLA(data: any, filters: any) {
    const columns: CSVColumn[] = [
      { key: "trackingCode", label: "Código OT" },
      { key: "cliente", label: "Cliente" },
      { key: "vehiculo", label: "Vehículo" },
      { key: "tecnico", label: "Técnico" },
      { key: "tiempoTranscurrido", label: "Tiempo Transcurrido (h)", type: "number" },
      { key: "tiempoRestante", label: "Tiempo Restante (h)", type: "number" },
      { key: "cumplimientoSLA", label: "Cumplimiento SLA", type: "percentage" },
      { key: "estado", label: "Estado" },
      { key: "fechaInicio", label: "Fecha Inicio", type: "date" },
      { key: "slaDeadline", label: "Límite SLA", type: "date" },
    ];

    CSVExporter.exportToCSV(data.detalleOTs || [], columns, {
      filename: `tiempos-sla-${filters.dateFrom || "periodo"}.csv`,
    });
  }

  static exportCotizacionesEmbudo(data: any[], filters: any) {
    const columns: CSVColumn[] = [
      { key: "quoteNumber", label: "No. Cotización" },
      { key: "cliente", label: "Cliente" },
      { key: "vehiculo", label: "Vehículo" },
      { key: "monto", label: "Monto", type: "currency" },
      { key: "status", label: "Estado" },
      { key: "fechaCreacion", label: "Fecha Creación", type: "date" },
      { key: "fechaEnvio", label: "Fecha Envío", type: "date" },
      { key: "fechaRespuesta", label: "Fecha Respuesta", type: "date" },
      { key: "tiempoRespuesta", label: "Tiempo Respuesta (h)", type: "number" },
      { key: "razonRechazo", label: "Razón Rechazo" },
    ];

    this.exportToCSV(data, columns, {
      filename: `cotizaciones-embudo-${filters.dateFrom || "periodo"}.csv`,
    });
  }

  exportCotizacionesEmbudo(data: any, filters: any) {
    const columns: CSVColumn[] = [
      { key: "quoteNumber", label: "No. Cotización" },
      { key: "cliente", label: "Cliente" },
      { key: "vehiculo", label: "Vehículo" },
      { key: "monto", label: "Monto", type: "currency" },
      { key: "status", label: "Estado" },
      { key: "fechaCreacion", label: "Fecha Creación", type: "date" },
      { key: "fechaEnvio", label: "Fecha Envío", type: "date" },
      { key: "fechaRespuesta", label: "Fecha Respuesta", type: "date" },
      { key: "tiempoRespuesta", label: "Tiempo Respuesta (h)", type: "number" },
      { key: "razonRechazo", label: "Razón Rechazo" },
    ];

    CSVExporter.exportToCSV(data.cotizaciones || [], columns, {
      filename: `cotizaciones-embudo-${filters.dateFrom || "periodo"}.csv`,
    });
  }

  static exportProductividadTecnicos(data: any[], filters: any) {
    const columns: CSVColumn[] = [
      { key: "nombre", label: "Técnico" },
      { key: "otsFinalizadas", label: "OTs Finalizadas", type: "number" },
      { key: "onTimePercentage", label: "% A Tiempo", type: "percentage" },
      { key: "cargaPromedio", label: "Carga Promedio", type: "number" },
      { key: "capacidadDiaria", label: "Capacidad Diaria", type: "number" },
      { key: "utilizacion", label: "Utilización %", type: "percentage" },
      { key: "retrabajos", label: "Retrabajos", type: "number" },
      { key: "tiempoPromedioPorOT", label: "Tiempo Promedio (min)", type: "number" },
    ];

    this.exportToCSV(data, columns, {
      filename: `productividad-tecnicos-${filters.dateFrom || "periodo"}.csv`,
    });
  }

  exportProductividadTecnicos(data: any, filters: any) {
    const columns: CSVColumn[] = [
      { key: "nombre", label: "Técnico" },
      { key: "otsFinalizadas", label: "OTs Finalizadas", type: "number" },
      { key: "onTimePercentage", label: "% A Tiempo", type: "percentage" },
      { key: "cargaPromedio", label: "Carga Promedio", type: "number" },
      { key: "capacidadDiaria", label: "Capacidad Diaria", type: "number" },
      { key: "utilizacion", label: "Utilización %", type: "percentage" },
      { key: "retrabajos", label: "Retrabajos", type: "number" },
      { key: "tiempoPromedioPorOT", label: "Tiempo Promedio (min)", type: "number" },
    ];

    CSVExporter.exportToCSV(data.tecnicos || [], columns, {
      filename: `productividad-tecnicos-${filters.dateFrom || "periodo"}.csv`,
    });
  }

  static exportClientesRetencion(data: any[], filters: any) {
    const columns: CSVColumn[] = [
      { key: "nombre", label: "Cliente" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Teléfono" },
      { key: "totalVisitas", label: "Total Visitas", type: "number" },
      { key: "primeraVisita", label: "Primera Visita", type: "date" },
      { key: "ultimaVisita", label: "Última Visita", type: "date" },
      { key: "diasPromedio", label: "Días Promedio", type: "number" },
      { key: "montoTotal", label: "Monto Total", type: "currency" },
      { key: "tasaAprobacion", label: "Tasa Aprobación", type: "percentage" },
      {
        key: "vehiculos",
        label: "Vehículos",
        format: (value) => (Array.isArray(value) ? value.join("; ") : value),
      },
    ];

    this.exportToCSV(data, columns, {
      filename: `clientes-retencion-${filters.dateFrom || "periodo"}.csv`,
    });
  }

  exportClientesRetencion(data: any, filters: any) {
    const columns: CSVColumn[] = [
      { key: "nombre", label: "Cliente" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Teléfono" },
      { key: "totalVisitas", label: "Total Visitas", type: "number" },
      { key: "primeraVisita", label: "Primera Visita", type: "date" },
      { key: "ultimaVisita", label: "Última Visita", type: "date" },
      { key: "diasPromedio", label: "Días Promedio", type: "number" },
      { key: "montoTotal", label: "Monto Total", type: "currency" },
      { key: "tasaAprobacion", label: "Tasa Aprobación", type: "percentage" },
      {
        key: "vehiculos",
        label: "Vehículos",
        format: (value) => (Array.isArray(value) ? value.join("; ") : value),
      },
    ];

    CSVExporter.exportToCSV(data.clientes || [], columns, {
      filename: `clientes-retencion-${filters.dateFrom || "periodo"}.csv`,
    });
  }

  static exportVehiculos(data: any[], filters: any) {
    const columns: CSVColumn[] = [
      { key: "trackingCode", label: "Código" },
      { key: "cliente", label: "Cliente" },
      { key: "vehiculo", label: "Vehículo" },
      { key: "totalVisitas", label: "Total Visitas", type: "number" },
      { key: "ultimoEstado", label: "Último Estado" },
      { key: "fechaUltimaVisita", label: "Última Visita", type: "date" },
      { key: "proximaRevisionFecha", label: "Próxima Revisión", type: "date" },
      { key: "proximaRevisionKm", label: "Próxima Revisión (Km)", type: "number" },
      { key: "kmActual", label: "Km Actual", type: "number" },
    ];

    this.exportToCSV(data, columns, {
      filename: `vehiculos-${filters.dateFrom || "actual"}.csv`,
    });
  }

  exportVehiculos(data: any, filters: any) {
    const columns: CSVColumn[] = [
      { key: "trackingCode", label: "Código" },
      { key: "cliente", label: "Cliente" },
      { key: "vehiculo", label: "Vehículo" },
      { key: "totalVisitas", label: "Total Visitas", type: "number" },
      { key: "ultimoEstado", label: "Último Estado" },
      { key: "fechaUltimaVisita", label: "Última Visita", type: "date" },
      { key: "proximaRevisionFecha", label: "Próxima Revisión", type: "date" },
      { key: "proximaRevisionKm", label: "Próxima Revisión (Km)", type: "number" },
      { key: "kmActual", label: "Km Actual", type: "number" },
    ];

    CSVExporter.exportToCSV(data.vehiculos || [], columns, {
      filename: `vehiculos-${filters.dateFrom || "actual"}.csv`,
    });
  }

  static exportAgendaCumplimiento(data: any[], filters: any) {
    const columns: CSVColumn[] = [
      { key: "titulo", label: "Título Evento" },
      { key: "tipo", label: "Tipo" },
      { key: "tecnico", label: "Técnico" },
      { key: "cliente", label: "Cliente" },
      { key: "vehiculo", label: "Vehículo" },
      { key: "fechaProgramada", label: "Fecha Programada", type: "date" },
      { key: "fechaRealizada", label: "Fecha Realizada", type: "date" },
      { key: "estado", label: "Estado" },
      { key: "reprogramaciones", label: "Reprogramaciones", type: "number" },
    ];

    this.exportToCSV(data, columns, {
      filename: `agenda-cumplimiento-${filters.dateFrom || "periodo"}.csv`,
    });
  }

  exportAgendaCumplimiento(data: any, filters: any) {
    const columns: CSVColumn[] = [
      { key: "titulo", label: "Título Evento" },
      { key: "tipo", label: "Tipo" },
      { key: "tecnico", label: "Técnico" },
      { key: "cliente", label: "Cliente" },
      { key: "vehiculo", label: "Vehículo" },
      { key: "fechaProgramada", label: "Fecha Programada", type: "date" },
      { key: "fechaRealizada", label: "Fecha Realizada", type: "date" },
      { key: "estado", label: "Estado" },
      { key: "reprogramaciones", label: "Reprogramaciones", type: "number" },
    ];

    CSVExporter.exportToCSV(data.eventos || [], columns, {
      filename: `agenda-cumplimiento-${filters.dateFrom || "periodo"}.csv`,
    });
  }

  static exportEvidenciasAuditoria(data: any[], filters: any) {
    const columns: CSVColumn[] = [
      { key: "trackingCode", label: "Código OT" },
      { key: "cliente", label: "Cliente" },
      { key: "vehiculo", label: "Vehículo" },
      { key: "tecnico", label: "Técnico" },
      { key: "totalFotos", label: "Total Fotos", type: "number" },
      {
        key: "fotasFaltantes",
        label: "Fotos Faltantes",
        format: (value) => (Array.isArray(value) ? value.join("; ") : value),
      },
      { key: "ultimaFoto", label: "Última Foto", type: "date" },
    ];

    this.exportToCSV(data, columns, {
      filename: `evidencias-auditoria-${filters.dateFrom || "periodo"}.csv`,
    });
  }

  exportEvidenciasAuditoria(data: any, filters: any) {
    const columns: CSVColumn[] = [
      { key: "trackingCode", label: "Código OT" },
      { key: "cliente", label: "Cliente" },
      { key: "vehiculo", label: "Vehículo" },
      { key: "tecnico", label: "Técnico" },
      { key: "totalFotos", label: "Total Fotos", type: "number" },
      {
        key: "fotasFaltantes",
        label: "Fotos Faltantes",
        format: (value) => (Array.isArray(value) ? value.join("; ") : value),
      },
      { key: "ultimaFoto", label: "Última Foto", type: "date" },
    ];

    CSVExporter.exportToCSV(data.evidencias || [], columns, {
      filename: `evidencias-auditoria-${filters.dateFrom || "periodo"}.csv`,
    });
  }
}
