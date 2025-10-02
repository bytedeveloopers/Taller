import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Listar clientes con búsqueda y filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Construir condiciones de búsqueda
    const searchConditions = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
            { email: { contains: search, mode: "insensitive" as const } },
            { altPhone: { contains: search } },
            {
              vehicles: {
                some: {
                  OR: [
                    { licensePlate: { contains: search, mode: "insensitive" as const } },
                    { trackingCode: { contains: search, mode: "insensitive" as const } },
                  ],
                },
              },
            },
          ],
        }
      : {};

    // Construir filtros adicionales
    let additionalFilters = {};

    switch (filter) {
      case "withVehicles":
        additionalFilters = { vehicles: { some: {} } };
        break;
      case "withoutVehicles":
        additionalFilters = { vehicles: { none: {} } };
        break;
      case "vip":
        additionalFilters = { labels: { contains: "VIP" } };
        break;
      case "fleet":
        additionalFilters = { labels: { contains: "FLOTA" } };
        break;
      case "recent":
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        additionalFilters = {
          lastVisit: {
            gte: thirtyDaysAgo,
          },
        };
        break;
    }

    const whereCondition = {
      isActive: true,
      ...searchConditions,
      ...additionalFilters,
    };

    // Obtener clientes con información relacionada
    const [clientes, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where: whereCondition,
        include: {
          vehicles: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              licensePlate: true,
              trackingCode: true,
              status: true,
            },
          },
          appointments: {
            select: {
              id: true,
              scheduledAt: true,
              status: true,
            },
            orderBy: { scheduledAt: "desc" },
            take: 1,
          },
          quotes: {
            select: {
              id: true,
              status: true,
              total: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              vehicles: true,
              appointments: true,
              quotes: true,
            },
          },
        },
        orderBy: {
          lastVisit: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where: whereCondition }),
    ]);

    // Formatear datos para la respuesta
    const clientesFormateados = clientes.map((cliente) => {
      const labels = cliente.labels ? cliente.labels.split(",").filter(Boolean) : [];

      return {
        id: cliente.id,
        name: cliente.name,
        phone: cliente.phone,
        email: cliente.email,
        altPhone: cliente.altPhone,
        address: cliente.address,
        contactPreference: cliente.contactPreference,
        labels,
        notes: cliente.notes,
        pickupPoints: cliente.pickupPoints,
        lastVisit: cliente.lastVisit,
        isActive: cliente.isActive,
        createdAt: cliente.createdAt,
        updatedAt: cliente.updatedAt,
        vehicles: cliente.vehicles,
        lastAppointment: cliente.appointments[0] || null,
        stats: {
          vehiculosCount: cliente._count.vehicles,
          citasCount: cliente._count.appointments,
          cotizacionesCount: cliente._count.quotes,
          cotizacionesAprobadas: cliente.quotes.filter((q) => q.status === "APPROVED").length,
          cotizacionesAprobadaRate:
            cliente._count.quotes > 0
              ? (cliente.quotes.filter((q) => q.status === "APPROVED").length /
                  cliente._count.quotes) *
                100
              : 0,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: clientesFormateados,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      name,
      phone,
      email,
      address,
      altPhone,
      contactPreference = "PHONE",
      labels = [],
      notes,
      pickupPoints,
      consents,
    } = data;

    // Validaciones básicas
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Nombre y teléfono son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un cliente con ese teléfono
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [{ phone }, { altPhone: phone }, { phone: altPhone }, { altPhone }].filter(Boolean),
      },
    });

    if (existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe un cliente con ese número de teléfono",
          duplicateCustomer: {
            id: existingCustomer.id,
            name: existingCustomer.name,
            phone: existingCustomer.phone,
          },
        },
        { status: 409 }
      );
    }

    // Crear el cliente
    const nuevoCliente = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        address,
        altPhone,
        contactPreference,
        labels: Array.isArray(labels) ? labels.join(",") : labels,
        notes,
        pickupPoints,
        consents,
        lastVisit: new Date(),
      },
      include: {
        vehicles: true,
        _count: {
          select: {
            vehicles: true,
            appointments: true,
            quotes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cliente creado exitosamente",
      data: {
        ...nuevoCliente,
        labels: nuevoCliente.labels ? nuevoCliente.labels.split(",") : [],
      },
    });
  } catch (error) {
    console.error("Error creando cliente:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar cliente existente
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      id,
      name,
      phone,
      email,
      address,
      altPhone,
      contactPreference,
      labels = [],
      notes,
      pickupPoints,
      consents,
    } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID del cliente es requerido" },
        { status: 400 }
      );
    }

    // Validaciones básicas
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Nombre y teléfono son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const clienteExistente = await prisma.customer.findUnique({
      where: { id },
    });

    if (!clienteExistente) {
      return NextResponse.json({ success: false, error: "Cliente no encontrado" }, { status: 404 });
    }

    // Verificar duplicados por teléfono (excluyendo el cliente actual)
    const duplicateCustomer = await prisma.customer.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { phone },
              { altPhone: phone },
              { phone: altPhone || undefined },
              { altPhone: altPhone || undefined },
            ].filter(Boolean),
          },
        ],
      },
    });

    if (duplicateCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe otro cliente con ese número de teléfono",
          duplicateCustomer: {
            id: duplicateCustomer.id,
            name: duplicateCustomer.name,
            phone: duplicateCustomer.phone,
          },
        },
        { status: 409 }
      );
    }

    // Actualizar el cliente
    const clienteActualizado = await prisma.customer.update({
      where: { id },
      data: {
        name,
        phone,
        email,
        address,
        altPhone,
        contactPreference,
        labels: Array.isArray(labels) ? labels.join(",") : labels,
        notes,
        pickupPoints,
        consents,
        updatedAt: new Date(),
      },
      include: {
        vehicles: true,
        _count: {
          select: {
            vehicles: true,
            appointments: true,
            quotes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cliente actualizado exitosamente",
      data: {
        ...clienteActualizado,
        labels: clienteActualizado.labels ? clienteActualizado.labels.split(",") : [],
      },
    });
  } catch (error) {
    console.error("Error actualizando cliente:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
