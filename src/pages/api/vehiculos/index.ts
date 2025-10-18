// pages/api/vehiculos/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { VehicleEstado } from "@prisma/client";

/** Mapea el row de Prisma al DTO que espera el front (solo campos seguros) */
function mapVehicle(row: any) {
  return {
    id: row.id,
    licensePlate: row.placa ?? "",
    vin: row.vin ?? "",
    brand: row.brand,
    model: row.model,
    year: row.year,
    color: row.color ?? "",
    mileage: row.kmActual ?? 0,
    fuelType: row.fuelType ?? "",
    transmission: row.transmission ?? "",
    nickname: row.nickname ?? "",
    notes: row.notes ?? "",
    nextServiceAtDate: row.proximoMantenimiento ?? null,
    nextServiceAtKm: row.proximoMantenimientoKm ?? null,
    customerId: row.clienteId,
    customer: row.cliente
      ? {
          id: row.cliente.id,
          name: row.cliente.name,
          phone: row.cliente.phone,
          // OJO: no pedimos email porque puede no existir en su schema
        }
      : null,
    status: row.estadoActual ?? "ACTIVO",
    isActive: !!row.activo,
    trackingCode: row.trackingCode ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    // _count removido para evitar errores si no existen relaciones
    lastVisit: row.lastVisit ?? null, // si no existe, será null y no rompe
  };
}

/** Validación de creación (campos mínimos) */
const CreateVehicleSchema = z.object({
  brand: z.string().min(1, "brand requerido"),
  model: z.string().min(1, "model requerido"),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 2),
  color: z.string().min(1, "color requerido"),
  mileage: z.coerce.number().int().min(0),
  customerId: z.string().uuid("customerId inválido"),
  // opcionales
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  nickname: z.string().optional(),
  notes: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET /api/vehiculos?search=&cliente=&estado=todos|activo|inactivo&ultimaVisita=todos|7|30|90
    if (req.method === "GET") {
      // Normalizamos query a string simples
      const q = (k: string) => {
        const v = (req.query as any)?.[k];
        return Array.isArray(v) ? v[0] ?? "" : (v ?? "");
      };

      const search = q("search");
      const cliente = q("cliente");
      const estado = q("estado") || "todos";
      const ultimaVisita = q("ultimaVisita") || "todos";

      const where: any = {};

      if (search) {
        where.OR = [
          { brand: { contains: search, mode: "insensitive" } },
          { model: { contains: search, mode: "insensitive" } },
          { placa: { contains: search, mode: "insensitive" } },
          { vin: { contains: search, mode: "insensitive" } },
        ];
      }

      if (cliente) where.clienteId = cliente;

      if (estado !== "todos") where.activo = estado === "activo";

      // IMPORTANTE: quitamos filtro lastVisit para evitar 500 si no existe en el schema
      // Si su schema sí tiene lastVisit (DateTime), puede reactivarlo luego.

      const rows = await prisma.vehicle.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          // Solo campos seguros del cliente
          cliente: { select: { id: true, name: true, phone: true } },
          // _count removido: si no hay relaciones definidas, hace 500
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
          placa: v.licensePlate?.trim(),
          vin: v.vin?.trim(),
          fuelType: v.fuelType,
          transmission: v.transmission,
          nickname: v.nickname,
          notes: v.notes,
        },
        include: {
          cliente: { select: { id: true, name: true, phone: true } },
        },
      });

      return res.status(201).json({ success: true, data: mapVehicle(created) });
    }

    return res.status(405).json({ success: false, error: "METHOD_NOT_ALLOWED" });
  } catch (e: any) {
    // Log explícito para detectar el campo problemático
    console.error("[API /vehiculos] error:", {
      message: e?.message,
      code: e?.code,
      meta: e?.meta,
      stack: e?.stack,
    });

    if (e?.code === "P2003")
      return res.status(400).json({ success: false, error: "FK_CLIENT_NOT_FOUND" });
    if (e?.code === "P2002")
      return res.status(409).json({ success: false, error: "UNIQUE_CONSTRAINT", meta: e.meta });

    return res.status(500).json({ success: false, error: "SERVER_ERROR" });
  }
}
