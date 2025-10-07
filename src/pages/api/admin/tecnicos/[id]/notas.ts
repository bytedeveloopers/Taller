import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  titulo: z.string().trim().max(200).optional(),
  body: z.string().trim().min(1, "La nota no puede estar vacía"),
  pinned: z.boolean().optional(),
  isPrivate: z.boolean().optional(), // default true
  authorId: z.number().int().optional(), // si tienes auth, pásalo del token
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!idParam || !/^\d+$/.test(String(idParam))) {
      return res.status(400).json({ ok: false, error: "id inválido" });
    }
    const tecnicoId = Number(idParam);

    if (req.method === "GET") {
      const search = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const pinnedFirst = String(req.query.pinnedFirst ?? "true") === "true";
      const take = Math.min(100, Number(req.query.limit ?? 50));

      const where: any = {
        tecnicoId,
        isPrivate: true,
      };
      if (search) {
        where.OR = [{ body: { contains: search } }, { titulo: { contains: search } }];
      }

      const notas = await prisma.tecnicoNota.findMany({
        where,
        orderBy: pinnedFirst
          ? [{ pinned: "desc" as const }, { createdAt: "desc" as const }]
          : [{ createdAt: "desc" as const }],
        take,
        include: { author: { select: { id: true, nombre: true, email: true } } },
      });

      return res.status(200).json({ ok: true, items: notas });
    }

    if (req.method === "POST") {
      const raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const parsed = CreateSchema.safeParse(raw);
      if (!parsed.success) {
        const msg = parsed.error.flatten().formErrors[0] ?? "Payload inválido";
        return res.status(400).json({ ok: false, error: msg });
      }

      const { titulo, body, pinned, isPrivate = true, authorId } = parsed.data;

      const tech = await prisma.tecnico.findUnique({ where: { id: tecnicoId } });
      if (!tech) return res.status(404).json({ ok: false, error: "Técnico no encontrado" });

      const nota = await prisma.tecnicoNota.create({
        data: {
          tecnicoId,
          authorId: authorId ?? null,
          titulo: titulo?.trim() || null,
          body,
          pinned: !!pinned,
          isPrivate,
        },
      });

      return res.status(201).json({ ok: true, nota });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (e: any) {
    console.error("Notas internas (list/create) error:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? "Error interno" });
  }
}
