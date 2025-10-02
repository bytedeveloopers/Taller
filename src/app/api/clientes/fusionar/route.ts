import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST - Fusionar clientes duplicados
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { sourceClientId, targetClientId, fieldsToKeep = {}, userId, reason } = data;

    if (!sourceClientId || !targetClientId || !userId) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos para la fusión" },
        { status: 400 }
      );
    }

    if (sourceClientId === targetClientId) {
      return NextResponse.json(
        { success: false, error: "No se puede fusionar un cliente consigo mismo" },
        { status: 400 }
      );
    }

    // Verificar que ambos clientes existen
    const [sourceClient, targetClient] = await Promise.all([
      prisma.customer.findUnique({
        where: { id: sourceClientId },
        include: {
          vehicles: true,
          appointments: true,
          quotes: true,
        },
      }),
      prisma.customer.findUnique({
        where: { id: targetClientId },
        include: {
          vehicles: true,
          appointments: true,
          quotes: true,
        },
      }),
    ]);

    if (!sourceClient || !targetClient) {
      return NextResponse.json(
        { success: false, error: "Uno o ambos clientes no existen" },
        { status: 404 }
      );
    }

    // Preparar datos para fusionar
    const mergedData = {
      name: fieldsToKeep.name || targetClient.name,
      phone: fieldsToKeep.phone || targetClient.phone,
      email: fieldsToKeep.email || targetClient.email || sourceClient.email,
      address: fieldsToKeep.address || targetClient.address || sourceClient.address,
      altPhone: fieldsToKeep.altPhone || targetClient.altPhone || sourceClient.altPhone,
      contactPreference: fieldsToKeep.contactPreference || targetClient.contactPreference,
      labels: fieldsToKeep.labels || targetClient.labels || sourceClient.labels,
      notes: fieldsToKeep.notes || targetClient.notes || sourceClient.notes,
      pickupPoints:
        fieldsToKeep.pickupPoints || targetClient.pickupPoints || sourceClient.pickupPoints,
      consents: fieldsToKeep.consents || targetClient.consents || sourceClient.consents,
      lastVisit:
        targetClient.lastVisit && sourceClient.lastVisit
          ? targetClient.lastVisit > sourceClient.lastVisit
            ? targetClient.lastVisit
            : sourceClient.lastVisit
          : targetClient.lastVisit || sourceClient.lastVisit,
    };

    // Realizar la fusión en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Transferir todos los vehículos del cliente origen al destino
      await tx.vehicle.updateMany({
        where: { customerId: sourceClientId },
        data: { customerId: targetClientId },
      });

      // 2. Transferir todas las citas del cliente origen al destino
      await tx.appointment.updateMany({
        where: { customerId: sourceClientId },
        data: { customerId: targetClientId },
      });

      // 3. Transferir todas las cotizaciones del cliente origen al destino
      await tx.quote.updateMany({
        where: { customerId: sourceClientId },
        data: { customerId: targetClientId },
      });

      // 4. Actualizar el cliente destino con los datos fusionados
      const updatedClient = await tx.customer.update({
        where: { id: targetClientId },
        data: mergedData,
      });

      // 5. Registrar la fusión en el log de auditoría
      const mergeLog = await tx.clientMergeLog.create({
        data: {
          sourceClientId,
          targetClientId,
          mergedData: {
            sourceData: {
              name: sourceClient.name,
              phone: sourceClient.phone,
              email: sourceClient.email,
              vehiclesCount: sourceClient.vehicles.length,
              appointmentsCount: sourceClient.appointments.length,
              quotesCount: sourceClient.quotes.length,
            },
            targetData: {
              name: targetClient.name,
              phone: targetClient.phone,
              email: targetClient.email,
              vehiclesCount: targetClient.vehicles.length,
              appointmentsCount: targetClient.appointments.length,
              quotesCount: targetClient.quotes.length,
            },
            mergedFields: fieldsToKeep,
          },
          mergedBy: userId,
          reason: reason || "Fusión de duplicados",
        },
      });

      // 6. Marcar el cliente origen como inactivo (no eliminarlo para mantener auditoría)
      await tx.customer.update({
        where: { id: sourceClientId },
        data: {
          isActive: false,
          name: `[FUSIONADO] ${sourceClient.name}`,
          notes: `${sourceClient.notes || ""}\n\n[FUSIONADO CON ${
            updatedClient.name
          } EL ${new Date().toLocaleString()}]`.trim(),
        },
      });

      return { updatedClient, mergeLog };
    });

    // Obtener el cliente fusionado con toda su información actualizada
    const clienteFusionado = await prisma.customer.findUnique({
      where: { id: targetClientId },
      include: {
        vehicles: true,
        appointments: true,
        quotes: true,
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
      message: "Clientes fusionados exitosamente",
      data: {
        fusedClient: clienteFusionado,
        mergeLog: result.mergeLog,
        summary: {
          vehiclesTransferred: sourceClient.vehicles.length,
          appointmentsTransferred: sourceClient.appointments.length,
          quotesTransferred: sourceClient.quotes.length,
          totalVehicles: clienteFusionado?._count.vehicles || 0,
          totalAppointments: clienteFusionado?._count.appointments || 0,
          totalQuotes: clienteFusionado?._count.quotes || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fusionando clientes:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener sugerencias de duplicados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");
    const excludeId = searchParams.get("excludeId");

    if (!phone && !email) {
      return NextResponse.json(
        { success: false, error: "Se requiere teléfono o email para buscar duplicados" },
        { status: 400 }
      );
    }

    // Buscar posibles duplicados
    const conditions = [];

    if (phone) {
      conditions.push({ phone: { equals: phone } }, { altPhone: { equals: phone } });
    }

    if (email) {
      conditions.push({ email: { equals: email, mode: "insensitive" as const } });
    }

    const whereCondition = {
      isActive: true,
      ...(excludeId && { id: { not: excludeId } }),
      OR: conditions,
    };

    const duplicados = await prisma.customer.findMany({
      where: whereCondition,
      include: {
        vehicles: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            licensePlate: true,
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
      orderBy: { createdAt: "desc" },
    });

    const duplicadosFormateados = duplicados.map((cliente) => ({
      id: cliente.id,
      name: cliente.name,
      phone: cliente.phone,
      email: cliente.email,
      altPhone: cliente.altPhone,
      address: cliente.address,
      labels: cliente.labels ? cliente.labels.split(",") : [],
      createdAt: cliente.createdAt,
      lastVisit: cliente.lastVisit,
      vehiculosCount: cliente._count.vehicles,
      citasCount: cliente._count.appointments,
      cotizacionesCount: cliente._count.quotes,
      vehicles: cliente.vehicles,
    }));

    return NextResponse.json({
      success: true,
      data: duplicadosFormateados,
      count: duplicadosFormateados.length,
    });
  } catch (error) {
    console.error("Error buscando duplicados:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
