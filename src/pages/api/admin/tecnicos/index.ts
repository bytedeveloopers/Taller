import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { hash } from "bcryptjs";

/* ===== Tipos ===== */
const BlockTypeEnum = z.enum(["VACATION", "SICK_LEAVE", "TRAINING", "OTHER"]);
const BlockedDateSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(1),
  type: BlockTypeEnum.default("OTHER"),
});

const CreateSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().optional(),
  especialidad: z.string().optional(),
  skills: z.union([z.array(z.string()), z.string()]).optional(),
  habilidades: z.union([z.array(z.string()), z.string()]).optional(),
  capacidad: z.coerce.number().int().min(1).max(50).optional(),
  carga: z.coerce.number().int().min(0).optional(),
  horario_inicio: z.string().optional(),
  horario_fin: z.string().optional(),
  notas: z.string().optional(), // ⬅️ crea notas
  is_active: z.boolean().optional(),
  must_change_password: z.boolean().optional(),
  password: z.string().optional(),
  blockedDates: z.array(BlockedDateSchema).optional(),
});

/* ===== Helpers ===== */
function toArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  const s = String(v).trim();
  if (!s) return [];
  try {
    const p = JSON.parse(s);
    if (Array.isArray(p)) return p.map(String);
  } catch {}
  return s.split(",").map((t) => t.trim()).filter(Boolean);
}

function hhmm(v?: string) {
  if (!v) return undefined;
  const m = v.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return undefined;
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10))).toString().padStart(2, "0");
  const mm = Math.min(59, Math.max(0, parseInt(m[2], 10))).toString().padStart(2, "0");
  return `${h}:${mm}`;
}
function ymdToLocalDateStart(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}
function ymdToLocalDateEnd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 23, 59, 59, 999);
}
function toLocalYmd(date: Date): string {
  const d = new Date(date);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/* ===== Handler ===== */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const items = await prisma.tecnico.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              is_active: true,
              must_change_password: true,
              role: true,
              nombre: true,
              phone: true,
            },
          },
        },
        orderBy: { id: "desc" },
      });

      // traer bloqueos (si existe tabla)
      let bloqueosByTec: Record<number, any[]> = {};
      try {
        const allBlocks = await (prisma as any).tecnicoBloqueo.findMany({
          orderBy: [{ startDate: "asc" }, { endDate: "asc" }],
        });
        for (const b of allBlocks) {
          (bloqueosByTec[b.tecnicoId] ||= []).push(b);
        }
      } catch {}

      // normalizar skills[] y blockedDates[]
      const data = items.map((t: any) => {
        const skillsArr =
          Array.isArray(t.skills) ? t.skills :
          t?.skills?.values ?? (
            t.habilidades
              ? String(t.habilidades).split(",").map((s: string) => s.trim()).filter(Boolean)
              : []
          );

        const bloqueos = (bloqueosByTec[t.id] || []).map((b: any) => ({
          startDate: toLocalYmd(b.startDate),
          endDate: toLocalYmd(b.endDate),
          reason: b.reason || "",
          type: b.type,
        }));

        return { ...t, skills: skillsArr, blockedDates: bloqueos };
      });

      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const raw = {
        ...req.body,
        horario_inicio: req.body?.horario_inicio ?? req.body?.horarioInicio,
        horario_fin: req.body?.horario_fin ?? req.body?.horarioFin,
        skills: req.body?.skills ?? req.body?.habilidades,
      };

      const parsed = CreateSchema.safeParse(raw);
      if (!parsed.success) {
        return res.status(400).json({ ok: false, error: parsed.error.flatten() });
      }

      const {
        nombre,
        email,
        telefono,
        especialidad,
        skills,
        capacidad,
        carga,
        horario_inicio,
        horario_fin,
        notas,
        is_active,
        must_change_password,
        password,
        blockedDates,
      } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.role !== "TECNICO") {
        return res.status(400).json({
          ok: false,
          error: `El email ya pertenece a un usuario con rol ${existing.role}. Usa otro correo para el técnico.`,
        });
      }

      const skillsArray = toArray(skills);
      const habilidadesCsv = skillsArray.length ? skillsArray.join(",") : null;

      const hashed = password ? await hash(password, 10) : null;

      const user = await prisma.user.upsert({
        where: { email },
        update: {
          nombre,
          phone: telefono ?? null,
          is_active: is_active ?? true,
          must_change_password: must_change_password ?? true,
          ...(hashed ? { password: hashed } : {}),
          role: "TECNICO",
        },
        create: {
          email,
          password: hashed,
          nombre,
          role: "TECNICO",
          is_active: is_active ?? true,
          must_change_password: must_change_password ?? true,
          phone: telefono ?? null,
        },
      });

      let tecnico: any;
      const baseData: any = {
        nombre,
        telefono: telefono ?? null,
        especialidad: especialidad ?? null,
        habilidades: habilidadesCsv,     // CSV legacy
        capacidad: capacidad ?? 8,
        carga: carga ?? 0,
        horario_inicio: hhmm(horario_inicio) ?? "08:00",
        horario_fin: hhmm(horario_fin) ?? "17:00",
        notas: notas ?? null,            // ⬅️ guarda notas al crear
        userId: user.id,
      };

      tecnico = await prisma.tecnico.create({ data: baseData });

      if (Array.isArray(blockedDates) && blockedDates.length) {
        try {
          await (prisma as any).tecnicoBloqueo.createMany({
            data: blockedDates.map((b) => ({
              tecnicoId: tecnico.id,
              startDate: ymdToLocalDateStart(b.startDate),
              endDate: ymdToLocalDateEnd(b.endDate),
              reason: b.reason ?? null,
              type: b.type ?? "OTHER",
            })),
          });
        } catch {}
      }

      // responder normalizado
      let bloqueos: any[] = [];
      try {
        bloqueos = await (prisma as any).tecnicoBloqueo.findMany({
          where: { tecnicoId: tecnico.id },
          orderBy: [{ startDate: "asc" }, { endDate: "asc" }],
        });
      } catch {}

      return res.status(201).json({
        ok: true,
        tecnico: {
          ...tecnico,
          skills: skillsArray,
          blockedDates: bloqueos.map((b) => ({
            startDate: toLocalYmd(b.startDate),
            endDate: toLocalYmd(b.endDate),
            reason: b.reason || "",
            type: b.type,
          })),
        },
      });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("api/admin/tecnicos error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Error interno" });
  }
}
