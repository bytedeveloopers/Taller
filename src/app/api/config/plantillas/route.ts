import { configurationService } from "@/services/ConfigurationService";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const plantillas = await configurationService.getConfigurationByNamespace("plantillas");
    return NextResponse.json(plantillas || getDefaultPlantillasConfig());
  } catch (error) {
    console.error("Error obteniendo configuración de plantillas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    // Validar datos
    const validatedData = validatePlantillasConfig(data);

    // Guardar cada configuración individualmente
    for (const [key, value] of Object.entries(validatedData)) {
      await configurationService.setSetting({
        namespace: "plantillas",
        key,
        value: JSON.stringify(value),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Configuración de plantillas guardada exitosamente",
    });
  } catch (error) {
    console.error("Error guardando configuración de plantillas:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}

function getDefaultPlantillasConfig() {
  return {
    documentos: [
      {
        tipo: "orden_trabajo",
        nombre: "Orden de Trabajo",
        descripcion: "Documento principal de la orden de trabajo",
        activa: true,
        encabezado: "{taller.nombre}\n{taller.direccion}\n{taller.telefono}\nNIT: {taller.nit}",
        piePagina: "Gracias por confiar en nosotros\n{taller.email} - {taller.telefono}",
        contenido: `ORDEN DE TRABAJO #{orden.numero}

Cliente: {cliente.nombre}
Teléfono: {cliente.telefono}
Email: {cliente.email}

Vehículo: {vehiculo.marca} {vehiculo.modelo} {vehiculo.año}
Placa: {vehiculo.placa}
Kilometraje: {vehiculo.kilometraje} km

Fecha de Ingreso: {orden.fechaIngreso}
Técnico Asignado: {orden.tecnico}

SERVICIOS SOLICITADOS:
{orden.servicios}

OBSERVACIONES:
{orden.observaciones}

TOTAL: ${orden.total}`,
        variablesDisponibles: [
          "taller.nombre",
          "taller.direccion",
          "taller.telefono",
          "taller.nit",
          "taller.email",
          "cliente.nombre",
          "cliente.telefono",
          "cliente.email",
          "vehiculo.marca",
          "vehiculo.modelo",
          "vehiculo.año",
          "vehiculo.placa",
          "vehiculo.kilometraje",
          "orden.numero",
          "orden.fechaIngreso",
          "orden.tecnico",
          "orden.servicios",
          "orden.observaciones",
          "orden.total",
        ],
      },
      {
        tipo: "cotizacion",
        nombre: "Cotización",
        descripcion: "Cotización de servicios y repuestos",
        activa: true,
        encabezado: "{taller.nombre}\nCOTIZACIÓN DE SERVICIOS\n{taller.telefono}",
        piePagina: "Cotización válida por 15 días\n{taller.email}",
        contenido: `COTIZACIÓN #{cotizacion.numero}

Cliente: {cliente.nombre}
Fecha: {cotizacion.fecha}
Vehículo: {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}

DETALLE DE SERVICIOS:
{cotizacion.servicios}

REPUESTOS NECESARIOS:
{cotizacion.repuestos}

SUBTOTAL: ${cotizacion.subtotal}
IVA ({taller.iva}%): ${cotizacion.iva}
TOTAL: ${cotizacion.total}

Observaciones: {cotizacion.observaciones}`,
        variablesDisponibles: [
          "taller.nombre",
          "taller.telefono",
          "taller.email",
          "taller.iva",
          "cliente.nombre",
          "vehiculo.marca",
          "vehiculo.modelo",
          "vehiculo.placa",
          "cotizacion.numero",
          "cotizacion.fecha",
          "cotizacion.servicios",
          "cotizacion.repuestos",
          "cotizacion.subtotal",
          "cotizacion.iva",
          "cotizacion.total",
          "cotizacion.observaciones",
        ],
      },
      {
        tipo: "factura",
        nombre: "Factura",
        descripcion: "Factura de venta de servicios",
        activa: true,
        encabezado:
          "{taller.nombre}\nFACTURA DE VENTA\nNIT: {taller.nit}\nRégimen: {taller.regimen}",
        piePagina: "Factura generada electrónicamente\n{taller.email} - {taller.telefono}",
        contenido: `FACTURA #{factura.numero}
Fecha: {factura.fecha}
Hora: {factura.hora}

DATOS DEL CLIENTE:
Nombre: {cliente.nombre}
Documento: {cliente.documento}
Teléfono: {cliente.telefono}
Dirección: {cliente.direccion}

VEHÍCULO:
{vehiculo.marca} {vehiculo.modelo} {vehiculo.año}
Placa: {vehiculo.placa}

DETALLE:
{factura.items}

RESUMEN:
Subtotal: ${factura.subtotal}
Descuentos: ${factura.descuentos}
IVA: ${factura.iva}
TOTAL A PAGAR: ${factura.total}

Forma de Pago: {factura.formaPago}`,
        variablesDisponibles: [
          "taller.nombre",
          "taller.nit",
          "taller.regimen",
          "taller.email",
          "taller.telefono",
          "cliente.nombre",
          "cliente.documento",
          "cliente.telefono",
          "cliente.direccion",
          "vehiculo.marca",
          "vehiculo.modelo",
          "vehiculo.año",
          "vehiculo.placa",
          "factura.numero",
          "factura.fecha",
          "factura.hora",
          "factura.items",
          "factura.subtotal",
          "factura.descuentos",
          "factura.iva",
          "factura.total",
          "factura.formaPago",
        ],
      },
    ],
    emails: [
      {
        tipo: "orden_completada",
        nombre: "Orden Completada",
        descripcion: "Email cuando se completa una orden de trabajo",
        activo: true,
        asunto: "Su vehículo {vehiculo.placa} está listo - {taller.nombre}",
        remitente: "{taller.email}",
        contenidoHtml: `
<h2>¡Su vehículo está listo!</h2>
<p>Estimado/a {cliente.nombre},</p>
<p>Nos complace informarle que su vehículo <strong>{vehiculo.marca} {vehiculo.modelo}</strong> con placa <strong>{vehiculo.placa}</strong> ya está listo para ser retirado.</p>

<h3>Detalles del servicio:</h3>
<ul>
<li>Orden #: {orden.numero}</li>
<li>Técnico: {orden.tecnico}</li>
<li>Servicios realizados: {orden.servicios}</li>
<li>Total: ${orden.total}</li>
</ul>

<p>Puede retirar su vehículo en nuestro horario de atención:</p>
<p><strong>Dirección:</strong> {taller.direccion}<br>
<strong>Teléfono:</strong> {taller.telefono}<br>
<strong>Horario:</strong> Lunes a Viernes 8:00 AM - 6:00 PM</p>

<p>Gracias por confiar en {taller.nombre}</p>
`,
      },
      {
        tipo: "recordatorio_cita",
        nombre: "Recordatorio de Cita",
        descripción: "Recordatorio de cita programada",
        activo: true,
        asunto: "Recordatorio: Cita programada para {cita.fecha} - {taller.nombre}",
        remitente: "{taller.email}",
        contenidoHtml: `
<h2>Recordatorio de Cita</h2>
<p>Estimado/a {cliente.nombre},</p>
<p>Le recordamos que tiene una cita programada para el mantenimiento de su vehículo.</p>

<h3>Detalles de la cita:</h3>
<ul>
<li>Fecha: {cita.fecha}</li>
<li>Hora: {cita.hora}</li>
<li>Vehículo: {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}</li>
<li>Tipo de servicio: {cita.tipoServicio}</li>
</ul>

<p><strong>Dirección:</strong> {taller.direccion}<br>
<strong>Teléfono:</strong> {taller.telefano}</p>

<p>Si necesita reprogramar su cita, por favor contáctenos con al menos 24 horas de anticipación.</p>

<p>¡Esperamos verle pronto!</p>
`,
      },
    ],
    sms: [
      {
        tipo: "orden_completada",
        nombre: "Orden Completada",
        descripcion: "SMS cuando se completa una orden",
        activo: true,
        mensaje:
          "Hola {cliente.nombre}, su {vehiculo.marca} {vehiculo.placa} está listo. Puede retirarlo en {taller.nombre}. Total: ${orden.total}",
      },
      {
        tipo: "recordatorio_cita",
        nombre: "Recordatorio de Cita",
        descripcion: "SMS de recordatorio de cita",
        activo: true,
        mensaje:
          "Recordatorio: Cita {cita.fecha} {cita.hora} para {vehiculo.placa} en {taller.nombre}. Info: {taller.telefono}",
      },
      {
        tipo: "cotizacion_lista",
        nombre: "Cotización Lista",
        descripcion: "SMS cuando la cotización está lista",
        activo: true,
        mensaje:
          "Su cotización #{cotizacion.numero} está lista. Total: ${cotizacion.total}. Válida por 15 días. {taller.nombre}",
      },
    ],
    configuracion: {
      logoUrl: "",
      firmaDigital: "",
      formatoPDF: {
        tamanoPagina: "A4",
        margenes: {
          superior: 20,
          inferior: 20,
          izquierdo: 20,
          derecho: 20,
        },
      },
    },
  };
}

function validatePlantillasConfig(data: any) {
  // Validar documentos
  if (data.documentos && Array.isArray(data.documentos)) {
    data.documentos.forEach((doc: any, index: number) => {
      if (!doc.tipo || typeof doc.tipo !== "string") {
        throw new Error(`El tipo de documento es requerido en documento ${index + 1}`);
      }
      if (!doc.nombre || typeof doc.nombre !== "string") {
        throw new Error(`El nombre de documento es requerido en documento ${index + 1}`);
      }
      if (typeof doc.activa !== "boolean") {
        throw new Error(`El estado activo debe ser boolean en documento ${index + 1}`);
      }
    });
  }

  // Validar emails
  if (data.emails && Array.isArray(data.emails)) {
    data.emails.forEach((email: any, index: number) => {
      if (!email.tipo || typeof email.tipo !== "string") {
        throw new Error(`El tipo de email es requerido en email ${index + 1}`);
      }
      if (typeof email.activo !== "boolean") {
        throw new Error(`El estado activo debe ser boolean en email ${index + 1}`);
      }
      if (email.activo && (!email.asunto || !email.contenidoHtml)) {
        throw new Error(
          `Asunto y contenido son requeridos cuando el email está activo en email ${index + 1}`
        );
      }
    });
  }

  // Validar SMS
  if (data.sms && Array.isArray(data.sms)) {
    data.sms.forEach((sms: any, index: number) => {
      if (!sms.tipo || typeof sms.tipo !== "string") {
        throw new Error(`El tipo de SMS es requerido en SMS ${index + 1}`);
      }
      if (typeof sms.activo !== "boolean") {
        throw new Error(`El estado activo debe ser boolean en SMS ${index + 1}`);
      }
      if (sms.activo && (!sms.mensaje || sms.mensaje.length > 160)) {
        throw new Error(
          `El mensaje es requerido y debe tener máximo 160 caracteres en SMS ${index + 1}`
        );
      }
    });
  }

  return data;
}
