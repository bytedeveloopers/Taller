import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// POST /api/cotizaciones/public/[token]/response - Respuesta del cliente
export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params;
    const body = await request.json();
    const {
      approved,
      acceptedTerms,
      clientComments,
      adjustmentRequest,
      contactPhone,
      signature,
      userAgent,
    } = body;

    console.log("📝 Procesando respuesta del cliente:", token);

    // Verificar token
    if (token !== "abc123def456") {
      return NextResponse.json(
        {
          success: false,
          error: "Cotización no encontrada",
        },
        { status: 404 }
      );
    }

    // Obtener IP del cliente
    const clientIp =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    // Determinar nuevo estado
    let newStatus = "VISTA";
    if (approved === true) {
      newStatus = "APROBADA";
    } else if (approved === false) {
      if (adjustmentRequest && adjustmentRequest.trim()) {
        newStatus = "AJUSTE_SOLICITADO";
      } else {
        newStatus = "RECHAZADA";
      }
    }

    // Simular actualización de cotización
    const updatedQuote = {
      id: "1",
      estado: newStatus,
      approvedAt: approved === true ? new Date() : null,
      rejectedAt: approved === false && !adjustmentRequest ? new Date() : null,
      adjustRequestedAt: adjustmentRequest ? new Date() : null,
      adjustComment: adjustmentRequest || null,
      acceptedIp: clientIp,
      acceptedUa: userAgent,
      updatedAt: new Date(),
    };

    // Crear evento en timeline
    const timelineEvent = {
      id: `event_${Date.now()}`,
      quoteId: "1",
      tipo: newStatus,
      descripcion:
        {
          APROBADA: "Cliente aprobó la cotización",
          RECHAZADA: "Cliente rechazó la cotización",
          AJUSTE_SOLICITADO: "Cliente solicitó ajustes",
        }[newStatus] || "Cliente respondió",
      metadata: {
        approved,
        acceptedTerms,
        clientComments,
        adjustmentRequest,
        contactPhone,
        signature,
        ip: clientIp,
        userAgent,
      },
      ip: clientIp,
      userAgent,
      userId: null,
      createdAt: new Date(),
    };

    console.log(`✅ Respuesta procesada: ${newStatus}`);

    // Aquí se podría enviar notificación al taller
    console.log("📧 Enviando notificación al taller...");

    return NextResponse.json({
      success: true,
      data: {
        status: newStatus,
        message: {
          APROBADA:
            "¡Gracias por aprobar nuestra cotización! Nos pondremos en contacto para coordinar el inicio de los trabajos.",
          RECHAZADA: "Gracias por su tiempo. Si tiene alguna consulta, no dude en contactarnos.",
          AJUSTE_SOLICITADO:
            "Hemos recibido su solicitud de ajuste. Nos pondremos en contacto con una nueva propuesta.",
        }[newStatus],
      },
      message: "Respuesta registrada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error procesando respuesta:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
