import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { VehicleEstado } from "@prisma/client";

/** Mapea el row de Prisma al DTO que espera el front */
function mapVehicle(row: any) {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    color: row.color ?? "",
    mileage: row.kmActual ?? 0,
    customerId: row.clienteId,
    isActive: row.activo,
    estadoActual: row.estadoActual,
    createdAt: row.createdAt,
    customer: row.cliente
      ? { id: row.cliente.id, name: row.cliente.name, phone: row.cliente.phone }
      : null,
  };
}

const CreateVehicleSchema = z.object({
  brand: z.string().min(1, "brand requerido"),
  model: z.string().min(1, "model requerido"),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 2),
  color: z.string().min(1, "color requerido"),
  mileage: z.coerce.number().int().min(0),
  customerId: z.string().uuid("customerId inválido"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET /api/vehiculos
    if (req.method === "GET") {
      const rows = await prisma.vehicle.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {  // 👈 traemos el cliente
          cliente: { select: { id: true, name: true, phone: true } },
        },
      });
      const data = rows.map(mapVehicle);
      return res.status(200).json({ success: true, data });
    }

    // POST /api/vehiculos
    if (req.method === "POST") {
      const parsed = CreateVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ success: false, error: "VALIDATION", details: parsed.error.flatten() });
      }
      const v = parsed.data;

      const created = await prisma.vehicle.create({
        data: {
          brand: v.brand.trim(),
          model: v.model.trim(),
          year: v.year,
          color: v.color.trim(),
          kmActual: v.mileage,
          clienteId: v.customerId,
          activo: true,
          estadoActual: VehicleEstado.INGRESO,
        },
        include: {  // 👈 devolvemos con cliente
          cliente: { select: { id: true, name: true, phone: true } },
        },
      });

      return res.status(201).json({ success: true, data: mapVehicle(created) });
    }

    return res.status(405).json({ success: false, error: "METHOD_NOT_ALLOWED" });
  } catch (e: any) {
    console.error("[API /vehiculos] error:", { message: e?.message, code: e?.code, meta: e?.meta });
    if (e?.code === "P2003") return res.status(400).json({ success: false, error: "FK_CLIENT_NOT_FOUND" });
    if (e?.code === "P2002") return res.status(409).json({ success: false, error: "UNIQUE_CONSTRAINT", meta: e.meta });
    return res.status(500).json({ success: false, error: "SERVER_ERROR" });
  }
}
