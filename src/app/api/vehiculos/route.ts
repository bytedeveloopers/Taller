import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/vehiculos - Obtener lista de vehículos con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const cliente = searchParams.get("cliente") || "";
    const estado = searchParams.get("estado") || "todos";
    const ultimaVisita = searchParams.get("ultimaVisita") || "todos";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    // Filtro de búsqueda
    if (search) {
      where.OR = [
        {
          licensePlate: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          vin: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          model: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          nickname: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customer: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          customer: {
            phone: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Filtro por cliente específico
    if (cliente) {
      where.customerId = cliente;
    }

    // Filtro por estado
    if (estado !== "todos") {
      if (estado === "activo") {
        where.isActive = true;
      } else if (estado === "inactivo") {
        where.isActive = false;
      }
    }

    // Filtro por última visita
    if (ultimaVisita !== "todos") {
      const dias = parseInt(ultimaVisita);
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - dias);

      where.appointments = {
        some: {
          scheduledAt: {
            gte: fechaLimite,
          },
        },
      };
    }

    const [vehiculos, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          _count: {
            select: {
              appointments: true,
              quotes: true,
            },
          },
        },
        orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.vehicle.count({ where }),
    ]);

    // Agregar información de última visita
    const vehiculosConUltimaVisita = await Promise.all(
      vehiculos.map(async (vehiculo) => {
        const ultimaCita = await prisma.appointment.findFirst({
          where: {
            vehicleId: vehiculo.id,
            status: "COMPLETED",
          },
          orderBy: {
            scheduledAt: "desc",
          },
          select: {
            scheduledAt: true,
          },
        });

        return {
          ...vehiculo,
          lastVisit: ultimaCita?.scheduledAt || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: vehiculosConUltimaVisita,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo vehículos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// POST /api/vehiculos - Crear nuevo vehículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customerId,
      licensePlate,
      vin,
      brand,
      model,
      year,
      color,
      mileage,
      fuelType,
      transmission,
      nickname,
      notes,
      nextServiceAtDate,
      nextServiceAtKm,
      isActive = true,
    } = body;

    // Validaciones
    if (!customerId || !brand || !model || !year) {
      return NextResponse.json(
        {
          success: false,
          error: "Los campos customerId, brand, model y year son requeridos",
        },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const cliente = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!cliente) {
      return NextResponse.json(
        {
          success: false,
          error: "Cliente no encontrado",
        },
        { status: 404 }
      );
    }

    // Verificar duplicados por placa (si se proporciona)
    if (licensePlate) {
      const vehiculoExistente = await prisma.vehicle.findFirst({
        where: {
          licensePlate: licensePlate,
          isActive: true,
        },
      });

      if (vehiculoExistente) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe un vehículo activo con esa placa",
          },
          { status: 409 }
        );
      }
    }

    // Verificar duplicados por VIN (si se proporciona)
    if (vin) {
      const vehiculoExistente = await prisma.vehicle.findFirst({
        where: {
          vin: vin,
          isActive: true,
        },
      });

      if (vehiculoExistente) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe un vehículo activo con ese VIN",
          },
          { status: 409 }
        );
      }
    }

    // Generar código de seguimiento único
    let trackingCode;
    let codigoExiste = true;

    while (codigoExiste) {
      trackingCode = `VEH-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const vehiculoConCodigo = await prisma.vehicle.findUnique({
        where: { trackingCode },
      });
      codigoExiste = !!vehiculoConCodigo;
    }

    // Crear vehículo
    const nuevoVehiculo = await prisma.vehicle.create({
      data: {
        customerId,
        licensePlate: licensePlate || null,
        vin: vin || null,
        brand,
        model,
        year: parseInt(year),
        color: color || null,
        mileage: mileage ? parseInt(mileage) : null,
        fuelType: fuelType || null,
        transmission: transmission || null,
        nickname: nickname || null,
        notes: notes || null,
        nextServiceAtDate: nextServiceAtDate ? new Date(nextServiceAtDate) : null,
        nextServiceAtKm: nextServiceAtKm ? parseInt(nextServiceAtKm) : null,
        trackingCode,
        status: "RECEIVED",
        isActive,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: nuevoVehiculo,
      message: "Vehículo creado exitosamente",
    });
  } catch (error) {
    console.error("Error creando vehículo:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
