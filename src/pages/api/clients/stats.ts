// src/pages/api/clients/stats.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

    const [total, activos, nuevosMes] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { is_active: true } }), // usa el nombre del campo del modelo
      prisma.client.count({
        where: { created_at: { gte: startOfMonth, lt: startOfNextMonth } }, // campo de tu schema
      }),
    ]);

    res.status(200).json({ total, activos, nuevosMes });
  } catch (e: any) {
    console.error("GET /api/clients/stats error:", e);
    res.status(500).json({ error: "SERVER_ERROR", message: e?.message });
  }
}
