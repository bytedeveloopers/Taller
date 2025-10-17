import type { NextApiRequest, NextApiResponse } from "next";
import prisma from '@/lib/prisma';

type Resp =
  | { ok: true; data: { total: number; activos: number; disponibles: number; cargaPromedio: number } }
  | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    // Traemos solo lo necesario
    const tecnicos = await prisma.tecnico.findMany({
      select: {
        id: true,
        capacidad: true,
        carga: true,
        user: { select: { is_active: true } },
      },
    });

    const total = tecnicos.length;

    if (total === 0) {
      return res.status(200).json({
        ok: true,
        data: { total: 0, activos: 0, disponibles: 0, cargaPromedio: 0 },
      });
    }

    const activos = tecnicos.filter(t => t.user?.is_active ?? true).length;

    let sumaPorcentajes = 0;
    let disponibles = 0;

    for (const t of tecnicos) {
      const cap = t.capacidad ?? 0;
      const car = t.carga ?? 0;

      const pct = cap > 0 ? Math.min(100, Math.max(0, (car / cap) * 100)) : 0;
      sumaPorcentajes += pct;

      const esActivo = t.user?.is_active ?? true;
      if (esActivo && cap - car > 0) disponibles += 1;
    }

    const cargaPromedio = Math.round(sumaPorcentajes / total);

    return res.status(200).json({
      ok: true,
      data: { total, activos, disponibles, cargaPromedio },
    });
  } catch (err) {
    console.error("api/admin/tecnicos/stats error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
