import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalClientes: 5,
    totalVehiculos: 12,
    totalCitas: 8,
  });
}
