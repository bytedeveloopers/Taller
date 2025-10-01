import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        customer: true,
        vehicle: true,
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    return NextResponse.json({ appointments, count: appointments.length });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Error al obtener las citas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scheduledAt, estimatedDuration, notes, vehicleId, customerId, technicianId } = body;

    const appointment = await prisma.appointment.create({
      data: {
        scheduledAt: new Date(scheduledAt),
        estimatedDuration,
        notes,
        vehicleId,
        customerId,
        technicianId,
      },
      include: {
        customer: true,
        vehicle: true,
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Error al crear la cita" }, { status: 500 });
  }
}
