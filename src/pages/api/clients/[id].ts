import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const onlyDigits = (s = "") => s.replace(/\D/g, "");
const normalizeEmail = (s?: string | null) =>
  s ? s.toString().trim().toLowerCase() : undefined;

const UpdateClienteSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().min(8).optional(),
  email: z.string().email().optional().or(z.literal("")).optional(),
  alt_phone: z.string().optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  contact_preference: z
    .string()
    .transform((v) => (v || "PHONE").toUpperCase())
    .pipe(z.enum(["PHONE", "WHATSAPP", "EMAIL", "SMS"]))
    .optional(),
  labels: z.array(z.string()).max(10).optional(), // UI manda array
  pickup_points: z.string().max(1000).nullable().optional(),
  notes: z.string().max(1000).optional().nullable(),
  consents: z
    .object({
      marketing: z.boolean().optional(),
      notifications: z.boolean().optional(),
      dataProcessing: z.boolean().optional(),
      media: z.boolean().optional(),
      sms: z.boolean().optional(),
      photosVideo: z.boolean().optional(),
    })
    .optional(),
  is_active: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;

  // GET /api/clients/:id  -> para pre-cargar si lo necesitas
  if (req.method === "GET") {
    try {
      const row = await prisma.client.findUnique({ where: { id } });
      if (!row) return res.status(404).json({ success: false, error: "NOT_FOUND" });

      return res.status(200).json({
        success: true,
        data: row,
      });
    } catch (e) {
      console.error("GET /clients/:id error:", e);
      return res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  }

  // PUT /api/clients/:id  -> actualizar
  if (req.method === "PUT") {
    const parsed = UpdateClienteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, error: "VALIDATION", details: parsed.error.flatten() });
    }

    try {
      // Normalizaciones
      const input = parsed.data;
      const phone = input.phone ? onlyDigits(input.phone) : undefined;
      const email = normalizeEmail(input.email);
      const alt = input.alt_phone ? onlyDigits(input.alt_phone) : undefined;

      if (alt && phone && alt === phone) {
        return res.status(400).json({ success: false, error: "ALT_EQUALS_PRIMARY" });
      }

      // Verificar duplicados (tel/email) en otros registros
      if (phone || email) {
        const dup = await prisma.client.findFirst({
          where: {
            id: { not: id },
            OR: [
              phone ? { phone } : undefined,
              email ? { email } : undefined,
            ].filter(Boolean) as any,
          },
          select: { id: true },
        });
        if (dup) {
          return res.status(409).json({ success: false, error: "DUPLICATE" });
        }
      }

      const c = input.consents || {};
      const updated = await prisma.client.update({
        where: { id },
        data: {
          name: input.name?.trim(),
          phone,
          email: email === "" ? null : email, // "" -> null
          alt_phone: typeof alt === "string" ? alt : input.alt_phone ?? undefined,
          address: input.address ?? undefined,
          contact_preference: input.contact_preference,
          labels: Array.isArray(input.labels) ? input.labels.join(",") : undefined, // guardamos CSV
          pickup_points: input.pickup_points ?? undefined,
          notes: input.notes ?? undefined,
          consents:
            input.consents !== undefined
              ? JSON.stringify({
                  marketing: !!c.marketing,
                  notifications: !!c.notifications,
                  dataProcessing: !!c.dataProcessing,
                  media: !!c.media,
                  sms: !!(c as any).sms,
                  photosVideo: !!(c as any).photosVideo,
                })
              : undefined,
          is_active: input.is_active,
        },
      });

      return res.status(200).json({ success: true, data: updated });
    } catch (e: any) {
      console.error("PUT /clients/:id error:", e);
      if (e?.code === "P2002") {
        return res.status(409).json({ success: false, error: "UNIQUE_CONSTRAINT", meta: e.meta });
      }
      if (e?.code === "P2025") {
        return res.status(404).json({ success: false, error: "NOT_FOUND" });
      }
      return res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  }

  // DELETE (opcional, por si luego lo usas)
  if (req.method === "DELETE") {
    try {
      await prisma.client.delete({ where: { id } });
      return res.status(200).json({ success: true });
    } catch (e: any) {
      console.error("DELETE /clients/:id error:", e);
      if (e?.code === "P2025") {
        return res.status(404).json({ success: false, error: "NOT_FOUND" });
      }
      return res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  }

  return res.status(405).json({ success: false, error: "METHOD_NOT_ALLOWED" });
}
