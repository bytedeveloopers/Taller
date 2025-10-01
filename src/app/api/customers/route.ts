import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        vehicles: true,
        appointments: true,
        _count: {
          select: {
            vehicles: true,
            appointments: true,
            quotes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ customers, count: customers.length });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Error al obtener los clientes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address } = body;

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: "Error al crear el cliente" }, { status: 500 });
  }
}
