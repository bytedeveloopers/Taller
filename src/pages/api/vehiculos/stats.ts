import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Ajusta esta lista si usas otros nombres en tu enum VehicleEstado.
// Como lo calculamos en JS, NO hace falta que existan todos en el enum.
const ESTADOS_EN_TALLER = new Set([
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

    // 1) total y activos van directo por DB
    const [totalVehiculos, vehiculosActivos] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { activo: true } }),
    ]);

    // 2) proximo mantenimiento (entre hoy e +30 días)
    const proximoMantenimiento = await prisma.vehicle.count({
      where: { proximoMantenimiento: { gte: now, lte: in30 } },
    });

    // 3) enTaller: lo calculamos en JS para evitar acoplar al enum exacto
    //    Tomamos solo activos para que no cuente archivados/inactivos
    const estados = await prisma.vehicle.findMany({
      where: { activo: true },
      select: { estadoActual: true },
      // si tienes muchísimos registros, puedes usar take/skip o un count especializado
    });

    const enTaller = estados.reduce((acc, v) => {
      const estado = String(v.estadoActual || "").toUpperCase();
      return acc + (ESTADOS_EN_TALLER.has(estado) ? 1 : 0);
    }, 0);

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
