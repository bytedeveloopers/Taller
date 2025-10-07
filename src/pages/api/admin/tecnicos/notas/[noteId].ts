import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  titulo: z.string().trim().max(200).nullable().optional(),
  body: z.string().trim().min(1).nullable().optional(),
  pinned: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const noteParam = Array.isArray(req.query.noteId) ? req.query.noteId[0] : req.query.noteId;
    if (!noteParam || !/^\d+$/.test(String(noteParam))) {
      return res.status(400).json({ ok: false, error: "noteId inválido" });
    }
    const noteId = Number(noteParam);

    const nota = await prisma.tecnicoNota.findUnique({ where: { id: noteId } });
    if (!nota) return res.status(404).json({ ok: false, error: "Nota no encontrada" });

    if (req.method === "PATCH") {
      const raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const parsed = UpdateSchema.safeParse(raw);
      if (!parsed.success) {
        const msg = parsed.error.flatten().formErrors[0] ?? "Payload inválido";
        return res.status(400).json({ ok: false, error: msg });
      }

      const { titulo, body, pinned } = parsed.data;
      const updated = await prisma.tecnicoNota.update({
        where: { id: noteId },
        data: {
          ...(titulo !== undefined ? { titulo: titulo?.trim() || null } : {}),
          ...(body !== undefined ? { body: body?.trim() || "" } : {}),
          ...(pinned !== undefined ? { pinned } : {}),
        },
      });

      return res.status(200).json({ ok: true, nota: updated });
    }

    if (req.method === "DELETE") {
      await prisma.tecnicoNota.delete({ where: { id: noteId } });
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "PATCH, DELETE");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (e: any) {
    console.error("Notas internas (update/delete) error:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? "Error interno" });
  }
}
