import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/* ========== Normalizadores ========== */
const onlyDigits = (s = "") => s.replace(/\D/g, "");
const norm = (s?: string | null) => (s ? s.toString().trim() : "");
const normEmail = (s?: string | null) => (s ? s.toString().trim().toLowerCase() : "");

/* ========== Detectar provider para filtros CI ========== */
type DBProvider = "postgresql" | "mysql" | "sqlite" | "sqlserver" | "unknown";
function detectProviderFromUrl(url?: string): DBProvider {
  const u = (url || process.env.DATABASE_URL || "").toLowerCase();
  if (u.startsWith("postgres")) return "postgresql";
  if (u.startsWith("mysql")) return "mysql";
  if (u.startsWith("file:")) return "sqlite";
  if (u.startsWith("sqlserver")) return "sqlserver";
  return "unknown";
}
const DB_PROVIDER: DBProvider = detectProviderFromUrl();

/** Devuelve un filtro { contains } y solo agrega mode:'insensitive' en Postgres. */
function ciContains(term: string) {
  return DB_PROVIDER === "postgresql"
    ? { contains: term, mode: "insensitive" as const }
    : { contains: term };
}

/* ========== Schema create ========== */
const CreateSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  alt_phone: z.string().optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  contact_preference: z
    .string()
    .transform((v) => (v || "PHONE").toUpperCase())
    .pipe(z.enum(["PHONE", "WHATSAPP", "EMAIL", "SMS"])),
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
  is_active: z.boolean().optional().default(true),
});

/* ========== Helpers búsqueda/duplicados ========== */
function buildWhereFromSearch(search: string, excludeId?: string) {
  const s = norm(search);
  const phoneDigits = onlyDigits(s);
  const email = s.includes("@") ? normEmail(s) : "";
  const tokens = s
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const OR: any[] = [];
  if (phoneDigits) OR.push({ phone: phoneDigits }, { alt_phone: phoneDigits });
  if (email) OR.push({ email });

  if (tokens.length) {
    // Para Postgres: { contains, mode:'insensitive' }
    // Para MySQL/SQLite: solo { contains } (collation usualmente ya es *_ci)
    OR.push({
      AND: tokens.map((t) => ({ name: ciContains(t) })),
    });
  }

  const where: any = {};
  if (excludeId) where.id = { not: excludeId };
  if (OR.length) where.OR = OR;
  return where;
}

async function findDuplicates(search: string, excludeId?: string) {
  const where = buildWhereFromSearch(search, excludeId);
  if (!where.OR || where.OR.length === 0) return [];

  const found = await prisma.client.findMany({
    where,
    select: { id: true, name: true, phone: true, email: true },
    take: 5,
  });

  const d = onlyDigits(search);
  const e = normEmail(search);

  return found.map((c) => {
    let similarity = 0;
    if (d && c.phone === d) similarity = 100;
    else if (e && c.email && c.email.toLowerCase() === e) similarity = 100;
    else similarity = 60;
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || "",
      similarity,
      reason: similarity === 100 ? "Mismo teléfono/email" : "Coincidencia por nombre",
    };
  });
}

/* ========== Handler ========== */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/clients
  //  - ?select=min → para el <select> del form (id,name,phone,email)
  //  - ?detectDuplicates=true&search=... → lista posibles duplicados
  //  - listado paginado normal (items/total/page/...)
  if (req.method === "GET") {
    try {
      const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
      const limit = Math.min(Math.max(parseInt((req.query.limit as string) || "20", 10), 1), 100);
      const search = norm(req.query.search as string);
      const filter = (req.query.filter as string) || "all";
      const detectDuplicates = (req.query.detectDuplicates as string) === "true";
      const excludeId = req.query.excludeId as string | undefined;
      const selectMode = (req.query.select as string) === "min";

      if (detectDuplicates) {
        const duplicates = await findDuplicates(search, excludeId);
        return res.status(200).json({ success: true, duplicates });
      }

      const where: any = {};
      if (search) Object.assign(where, buildWhereFromSearch(search));
      if (filter === "vip") where.labels = { contains: "VIP" }; // CSV simple
      if (filter === "fleet") where.labels = { contains: "FLOTA" };
      if (filter === "withVehicles") where.vehicles_count = { gt: 0 };
      if (filter === "withoutVehicles") where.vehicles_count = { equals: 0 };

      if (selectMode) {
        const data = await prisma.client.findMany({
          where,
          take: limit,
          orderBy: { created_at: "desc" },
          select: { id: true, name: true, phone: true, email: true },
        });
        return res.status(200).json({ success: true, data });
      }

      const [total, items] = await Promise.all([
        prisma.client.count({ where }),
        prisma.client.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            alt_phone: true,
            address: true,
            contact_preference: true,
            labels: true,
            pickup_points: true,
            notes: true,
            is_active: true,
            created_at: true,
            updated_at: true,
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        items,
        total,
        page,
        pageSize: limit,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      });
    } catch (e: any) {
      // Log detallado para depurar rápidamente
      console.error("GET /api/clients error:", e?.message || e, {
        provider: DB_PROVIDER,
      });
      return res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  }

  // POST /api/clients (create)
  if (req.method === "POST") {
    const parsed = CreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, error: "VALIDATION", details: parsed.error.flatten() });
    }
    try {
      const input = parsed.data;
      const phone = onlyDigits(input.phone);
      const email = normEmail(input.email);
      const alt = input.alt_phone ? onlyDigits(input.alt_phone) : null;

      if (alt && alt === phone) {
        return res.status(400).json({ success: false, error: "ALT_EQUALS_PRIMARY" });
      }

      const dup = await prisma.client.findFirst({
        where: { OR: [{ phone }, email ? { email } : undefined].filter(Boolean) as any },
        select: { id: true, name: true, phone: true, email: true },
      });
      if (dup) return res.status(409).json({ success: false, error: "DUPLICATE", match: dup });

      const c = input.consents || {};
      const created = await prisma.client.create({
        data: {
          name: input.name.trim(),
          phone,
          email: email || null,
          alt_phone: alt,
          address: input.address ?? null,
          contact_preference: input.contact_preference,
          labels: (input.labels ?? []).join(","), // CSV
          pickup_points: input.pickup_points ?? null,
          notes: input.notes ?? null,
          consents: JSON.stringify({
            marketing: !!c.marketing,
            notifications: !!c.notifications,
            dataProcessing: !!c.dataProcessing,
            media: !!c.media,
            sms: !!(c as any).sms,
            photosVideo: !!(c as any).photosVideo,
          }),
          is_active: input.is_active ?? true,
        },
      });

      return res.status(201).json({ success: true, data: created });
    } catch (e: any) {
      console.error("POST /api/clients error:", e);
      if (e?.code === "P2002")
        return res.status(409).json({ success: false, error: "UNIQUE_CONSTRAINT", meta: e.meta });
      return res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
  }

  return res.status(405).json({ success: false, error: "METHOD_NOT_ALLOWED" });
}
