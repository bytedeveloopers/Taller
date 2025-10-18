import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Estados considerados "en taller" (sin acoplarse estrictamente al enum de Prisma)
const ESTADOS_EN_TALLER = new Set<string>([
  "DIAGNOSTICO",
  "DESARME",
  "REPARACION",
  "ARMADO",
  "PRUEBA",
  "ESPERA",
  "EN_TALLER",
  "MANTENIMIENTO",
]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [totalVehiculos, vehiculosActivos, proximoMantenimiento, estadosActivos] =
      await prisma.$transaction([
        prisma.vehicle.count(),
        prisma.vehicle.count({ where: { activo: true } }),
        prisma.vehicle.count({
          where: { proximoMantenimiento: { gte: now, lte: in30 } },
        }),
        prisma.vehicle.findMany({
          where: { activo: true },
          select: { estadoActual: true },
        }),
      ]);

    const enTaller = estadosActivos.reduce((acc, v) => {
      const estado = String(v.estadoActual ?? "").toUpperCase();
      return acc + (ESTADOS_EN_TALLER.has(estado) ? 1 : 0);
    }, 0);

    // Evita golpear DB en ráfagas, manteniendo datos frescos
    res.setHeader("Cache-Control", "private, max-age=10, must-revalidate");

    return res.status(200).json({
      success: true,
      data: {
        totalVehiculos,
        vehiculosActivos,
        proximoMantenimiento,
        enTaller,
      },
    });
  } catch (e: any) {
    console.error("[API /vehiculos/stats] error:", {
      message: e?.message,
      code: e?.code,
      meta: e?.meta,
    });
    return res.status(500).json({ success: false, error: "SERVER_ERROR" });
  }
}
