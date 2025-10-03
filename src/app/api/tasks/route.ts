import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");
    const technicianId = searchParams.get("technicianId");
    const status = searchParams.get("status");

    const where: any = {};
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }
    if (technicianId) {
      where.technicianId = technicianId;
    }
    if (status) {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        vehicle: {
          include: {
            customer: true,
          },
        },
        technician: true,
        createdBy: true,
        photos: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener tareas",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, vehicleId, technicianId, estimatedTime, priority, createdById } =
      body;

    if (!title || !description || !vehicleId || !createdById) {
      return NextResponse.json(
        {
          success: false,
          error: "Título, descripción, vehículo y creador son requeridos",
        },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        vehicleId,
        technicianId,
        estimatedTime,
        priority: priority || "MEDIUM",
        status: "PENDING",
        createdById,
      },
      include: {
        vehicle: {
          include: {
            customer: true,
          },
        },
        technician: true,
        createdBy: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear tarea",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de tarea es requerido",
        },
        { status: 400 }
      );
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        vehicle: {
          include: {
            customer: true,
          },
        },
        technician: true,
        createdBy: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar tarea",
      },
      { status: 500 }
    );
  }
}
