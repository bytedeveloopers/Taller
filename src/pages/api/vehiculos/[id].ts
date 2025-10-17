import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

const UpdateVehicleSchema = z.object({
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 2).optional(),
  color: z.string().min(1).optional(),
  mileage: z.coerce.number().int().min(0).optional(),
  customerId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") return res.status(400).json({ success: false, error: "MISSING_ID" });

  try {
    if (req.method === "GET") {
      const row = await prisma.vehicle.findUnique({
        where: { id },
        include: { cliente: { select: { id: true, name: true, phone: true } } },
      });
      if (!row) return res.status(404).json({ success: false, error: "NOT_FOUND" });
      return res.status(200).json({ success: true, data: mapVehicle(row) });
    }

    if (req.method === "PUT") {
      const parsed = UpdateVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ success: false, error: "VALIDATION", details: parsed.error.flatten() });
      }
      const v = parsed.data;

      const updated = await prisma.vehicle.update({
        where: { id },
        data: {
          brand: v.brand?.trim(),
          model: v.model?.trim(),
          year: v.year,
          color: v.color?.trim(),
          kmActual: v.mileage,
          clienteId: v.customerId,
          activo: v.isActive,
        },
        include: { cliente: { select: { id: true, name: true, phone: true } } },
      });

      return res.status(200).json({ success: true, data: mapVehicle(updated) });
    }

    if (req.method === "DELETE") {
      await prisma.vehicle.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: "METHOD_NOT_ALLOWED" });
  } catch (e: any) {
    console.error("[API /vehiculos/:id] error:", { message: e?.message, code: e?.code, meta: e?.meta });
    if (e?.code === "P2025") return res.status(404).json({ success: false, error: "NOT_FOUND" });
    if (e?.code === "P2003") return res.status(400).json({ success: false, error: "FK_CLIENT_NOT_FOUND" });
    return res.status(500).json({ success: false, error: "SERVER_ERROR" });
  }
}
