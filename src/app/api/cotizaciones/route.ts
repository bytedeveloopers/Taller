import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/cotizaciones - Obtener cotizaciones con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const estado = searchParams.get("estado");
    const cliente = searchParams.get("cliente");
    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("🔍 Obteniendo cotizaciones con filtros");

    // Simular cotizaciones (por ahora hasta implementar tabla quotes)
    const quotes = [
      {
        id: "1",
        workOrderId: "OT-2024-001",
        clientId: "client-1",
        vehicleId: "vehicle-1",
        estado: "ENVIADA",
        moneda: "GTQ",
        subtotal: 1000,
        impuestos: 120,
        descuento: 0,
        total: 1120,
        fechaCreacion: new Date("2024-01-20"),
        vencimientoAt: new Date("2024-01-23"),
        publicToken: "abc123def456",
        publicExpiresAt: new Date("2024-01-23"),
        updatedAt: new Date(),

        // Relaciones simuladas
        client: {
          id: "client-1",
          name: "Juan Pérez",
          phone: "3001234567",
        },
        vehicle: {
          id: "vehicle-1",
          brand: "Toyota",
          model: "Corolla",
          year: 2020,
          licensePlate: "ABC123",
        },
        items: [
          {
            id: "1",
            quoteId: "1",
            concepto: "Cambio de aceite",
            cantidad: 1,
            precioUnitario: 500,
            tipo: "SERVICIO",
            subtotal: 500,
          },
          {
            id: "2",
            quoteId: "1",
            concepto: "Filtro de aceite",
            cantidad: 1,
            precioUnitario: 500,
            tipo: "REPUESTO",
            subtotal: 500,
          },
        ],
      },
      {
        id: "2",
        workOrderId: "OT-2024-002",
        clientId: "client-2",
        vehicleId: "vehicle-2",
        estado: "APROBADA",
        moneda: "GTQ",
        subtotal: 2000,
        impuestos: 240,
        descuento: 0,
        total: 2240,
        fechaCreacion: new Date("2024-01-19"),
        vencimientoAt: new Date("2024-01-22"),
        publicToken: "def789ghi012",
        publicExpiresAt: new Date("2024-01-22"),
        updatedAt: new Date(),

        // Relaciones simuladas
        client: {
          id: "client-2",
          name: "María García",
          phone: "3009876543",
        },
        vehicle: {
          id: "vehicle-2",
          brand: "Honda",
          model: "Civic",
          year: 2019,
          licensePlate: "XYZ789",
        },
        items: [
          {
            id: "3",
            quoteId: "2",
            concepto: "Reparación de frenos",
            cantidad: 1,
            precioUnitario: 2000,
            tipo: "MO",
            subtotal: 2000,
          },
        ],
      },
    ];

    // Aplicar filtros
    let filteredQuotes = [...quotes];

    if (search) {
      filteredQuotes = filteredQuotes.filter(
        (q) =>
          q.client?.name.toLowerCase().includes(search.toLowerCase()) ||
          q.vehicle?.brand.toLowerCase().includes(search.toLowerCase()) ||
          q.vehicle?.model.toLowerCase().includes(search.toLowerCase()) ||
          q.workOrderId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (estado) {
      filteredQuotes = filteredQuotes.filter((q) => q.estado === estado);
    }

    if (cliente) {
      filteredQuotes = filteredQuotes.filter((q) =>
        q.client?.name.toLowerCase().includes(cliente.toLowerCase())
      );
    }

    if (fechaDesde) {
      const fromDate = new Date(fechaDesde);
      filteredQuotes = filteredQuotes.filter((q) => q.fechaCreacion >= fromDate);
    }

    if (fechaHasta) {
      const toDate = new Date(fechaHasta);
      filteredQuotes = filteredQuotes.filter((q) => q.fechaCreacion <= toDate);
    }

    console.log(`✅ ${filteredQuotes.length} cotizaciones encontradas`);

    return NextResponse.json({
      success: true,
      data: filteredQuotes,
      pagination: {
        page,
        limit,
        total: filteredQuotes.length,
        pages: Math.ceil(filteredQuotes.length / limit),
      },
      message: "Cotizaciones obtenidas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo cotizaciones:", error);
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

// POST /api/cotizaciones - Crear nueva cotización
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, vehicleId, workOrderId, vencimientoAt, moneda, items, termsVersion } = body;

    console.log("📝 Creando nueva cotización");

    // Validaciones básicas
    if (!clientId || !vehicleId || !items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos requeridos faltantes",
          details: "clientId, vehicleId e items son requeridos",
        },
        { status: 400 }
      );
    }

    // Calcular totales
    const subtotal = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    const impuestos = subtotal * 0.12; // IVA 12%
    const descuento = 0;
    const total = subtotal + impuestos - descuento;

    // Simular creación de cotización
    const newQuote = {
      id: `quote_${Date.now()}`,
      clientId,
      vehicleId,
      workOrderId: workOrderId || null,
      estado: "BORRADOR",
      moneda: moneda || "GTQ",
      subtotal,
      impuestos,
      descuento,
      total,
      fechaCreacion: new Date(),
      vencimientoAt: new Date(vencimientoAt),
      termsVersion: termsVersion || "1.0",
      sentVia: "link",
      createdAt: new Date(),
      updatedAt: new Date(),
      items,
    };

    console.log("✅ Cotización creada exitosamente");

    return NextResponse.json({
      success: true,
      data: newQuote,
      message: "Cotización creada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error creando cotización:", error);
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
