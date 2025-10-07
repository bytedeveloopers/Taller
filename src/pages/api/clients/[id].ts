import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/* ========== Normalizadores ========== */
const onlyDigits = (s = "") => s.replace(/\D/g, "");
const normalizeEmail = (s?: string | null) =>
  s !== undefined && s !== null ? s.toString().trim().toLowerCase() : undefined;

/* ========== Schema update ========== */
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
  consents: z.object({
    marketing: z.boolean().optional(),
    notifications: z.boolean().optional(),
    dataProcessing: z.boolean().optional(),
    media: z.boolean().optional(),
    sms: z.boolean().optional(),
    photosVideo: z.boolean().optional(),
  }).optional(),
  is_active: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ success: false, error: "MISSING_ID" });

  // GET /api/clients/:id
  if (req.method === "GET") {
    try {
      const row = await prisma.client.findUnique({ where: { id } });
      if (!row) return res.status(404).json({ success: false, error: "NOT_FOUND" });
      return res.status(200).json({ success: true, data: row });
    } catch (e) {
      console.error("GET /clients/:id error:", e);
      return res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  }

  // PUT /api/clients/:id
  if (req.method === "PUT") {
    const parsed = UpdateClienteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, error: "VALIDATION", details: parsed.error.flatten() });
    }

    try {
      const input = parsed.data;
      const phone = input.phone ? onlyDigits(input.phone) : undefined;
      const emailNorm = normalizeEmail(input.email);
      const altNorm = input.alt_phone ? onlyDigits(input.alt_phone) : undefined;

      if (altNorm && phone && altNorm === phone) {
        return res.status(400).json({ success: false, error: "ALT_EQUALS_PRIMARY" });
      }

      // evitar duplicados exactos en otros registros
      if (phone || emailNorm !== undefined) {
        const dup = await prisma.client.findFirst({
          where: {
            id: { not: id },
            OR: [
              phone ? { phone } : undefined,
              emailNorm !== undefined ? { email: emailNorm || null } : undefined,
            ].filter(Boolean) as any,
          },
          select: { id: true },
        });
        if (dup) return res.status(409).json({ success: false, error: "DUPLICATE" });
      }

      const c = input.consents || undefined;

      const updated = await prisma.client.update({
        where: { id },
        data: {
          name: input.name !== undefined ? input.name.trim() : undefined,
          phone: phone ?? undefined,
          // si viene "", guardamos null
          email: input.email !== undefined ? (emailNorm || null) : undefined,
          // alt_phone: si se envía string → normalizado, si se envía null → null, si no se envía → undefined
          alt_phone:
            input.alt_phone !== undefined
              ? (typeof altNorm === "string" ? altNorm : input.alt_phone)
              : undefined,
          address: input.address !== undefined ? input.address : undefined,
          contact_preference: input.contact_preference ?? undefined,
          labels: input.labels ? input.labels.join(",") : undefined, // CSV
          pickup_points: input.pickup_points !== undefined ? input.pickup_points : undefined,
          notes: input.notes !== undefined ? input.notes : undefined,
          consents:
            c !== undefined
              ? JSON.stringify({
                  marketing: !!c.marketing,
                  notifications: !!c.notifications,
                  dataProcessing: !!c.dataProcessing,
                  media: !!c.media,
                  sms: !!(c as any).sms,
                  photosVideo: !!(c as any).photosVideo,
                })
              : undefined,
          is_active: input.is_active ?? undefined,
        },
      });

      return res.status(200).json({ success: true, data: updated });
    } catch (e: any) {
      console.error("PUT /clients/:id error:", e);
      if (e?.code === "P2002")
        return res.status(409).json({ success: false, error: "UNIQUE_CONSTRAINT", meta: e.meta });
      if (e?.code === "P2025")
        return res.status(404).json({ success: false, error: "NOT_FOUND" });
      return res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  }

  // DELETE /api/clients/:id
  if (req.method === "DELETE") {
    try {
      await prisma.client.delete({ where: { id } });
      return res.status(200).json({ success: true });
    } catch (e: any) {
      console.error("DELETE /clients/:id error:", e);
      if (e?.code === "P2025")
        return res.status(404).json({ success: false, error: "NOT_FOUND" });
      return res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  }

  return res.status(405).json({ success: false, error: "METHOD_NOT_ALLOWED" });
}
