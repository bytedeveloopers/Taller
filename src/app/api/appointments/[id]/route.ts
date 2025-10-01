import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
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

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json({ error: "Error al obtener la cita" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status, scheduledAt, estimatedDuration, notes, technicianId } = body;

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(estimatedDuration && { estimatedDuration }),
        ...(notes !== undefined && { notes }),
        ...(technicianId !== undefined && { technicianId }),
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

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Error al actualizar la cita" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Cita eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json({ error: "Error al eliminar la cita" }, { status: 500 });
  }
}
