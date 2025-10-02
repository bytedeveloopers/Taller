import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/cotizaciones/public/[token] - Obtener cotización pública
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params;
    console.log("🔓 Obteniendo cotización pública:", token);

    // Simular cotización pública
    if (token !== "abc123def456") {
      return NextResponse.json(
        {
          success: false,
          error: "Cotización no encontrada",
        },
        { status: 404 }
      );
    }

    const publicQuote = {
      id: "1",
      token,
      estado: "ENVIADA",
      fechaCreacion: new Date("2024-01-20"),
      vencimientoAt: new Date("2024-01-23"),
      moneda: "GTQ",
      total: 1120,
      isExpired: new Date() > new Date("2024-01-23"),

      // Datos del taller
      taller: {
        nombre: "Taller Automotriz Guatemala",
        telefono: "+502 2345-6789",
        email: "contacto@tallergt.com",
        direccion: "Zona 10, Ciudad de Guatemala",
        logo: null,
      },

      // Datos del cliente
      cliente: {
        nombre: "Juan Pérez",
        telefono: "3001234567",
      },

      // Datos del vehículo
      vehiculo: {
        marca: "Toyota",
        modelo: "Corolla",
        anio: 2020,
        placa: "ABC123",
      },

      // Items y totales
      items: [
        {
          id: "1",
          concepto: "Cambio de aceite",
          descripcion: "Cambio de aceite sintético 5W-30",
          cantidad: 1,
          precioUnitario: 500,
          tipo: "SERVICIO",
          subtotal: 500,
        },
        {
          id: "2",
          concepto: "Filtro de aceite",
          descripcion: "Filtro de aceite original",
          cantidad: 1,
          precioUnitario: 500,
          tipo: "REPUESTO",
          subtotal: 500,
        },
      ],

      subtotal: 1000,
      impuestos: 120,
      descuento: 0,

      // Imágenes
      imagenes: [],

      // Términos
      terminos:
        "Los precios incluyen IVA. Garantía de 30 días en mano de obra y 6 meses en repuestos originales.",
    };

    // Registrar vista
    console.log("👁️ Registrando vista de cotización");

    console.log("✅ Cotización pública obtenida");

    return NextResponse.json({
      success: true,
      data: publicQuote,
      message: "Cotización obtenida exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo cotización pública:", error);
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
