// src/pages/api/admin/tecnicos/index.ts
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
  notas: z.string().optional(),
  is_active: z.boolean().optional(),
  must_change_password: z.boolean().optional(),
  password: z.string().optional(),
  blockedDates: z.array(BlockedDateSchema).optional(),
});

/* ===== Helpers ===== */
function toArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  const s = String(v).trim();
  if (!s) return [];
  try {
    const p = JSON.parse(s);
    if (Array.isArray(p)) return p.map((x) => String(x).trim()).filter(Boolean);
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
function pctCarga(capacidad: number, carga: number) {
  const cap = Math.max(1, Number(capacidad) || 1);
  const cur = Math.max(0, Number(carga) || 0);
  return Math.min(100, Math.round((cur / cap) * 100));
}

/* ===== Handler ===== */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    /* ============== GET (con filtros) ============== */
    if (req.method === "GET") {
      const { search = "", estado = "todos", habilidades = "", carga = "todos" } =
        (req.query as Record<string, string>) || {};

      const AND: any[] = [];

      /* ---------- BÚSQUEDA ROBUSTA ---------- */
      const q = String(search || "").trim();
      if (q) {
        const tokens = q.split(/\s+/).filter(Boolean);          // "Brenner Granados" -> ["Brenner","Granados"]
        const digits = q.replace(/\D/g, "");                    // "341-788-56" -> "34178856"

        // nombre del técnico (todas las palabras)
        const nombreAND = tokens.map((t) => ({
          nombre: { contains: t, mode: "insensitive" as any },
        }));

        // nombre del user (todas las palabras)
        const userNombreAND = tokens.map((t) => ({
          user: { is: { nombre: { contains: t, mode: "insensitive" as any } } },
        }));

        const byEmail = { user: { is: { email: { contains: q, mode: "insensitive" as any } } } };
        const byPhone = digits.length >= 3 ? { telefono: { contains: digits } } : null;

        AND.push({
          OR: [
            { AND: nombreAND },
            { AND: userNombreAND },
            byEmail,
            ...(byPhone ? [byPhone] : []),
          ],
        });
      }

      /* ---------- Estado ---------- */
      if (estado === "activo") AND.push({ user: { is: { is_active: true } } });
      if (estado === "inactivo") AND.push({ user: { is: { is_active: false } } });

      /* ---------- Habilidades (primer pase CSV) ---------- */
      if (habilidades) {
        AND.push({
          OR: [{ habilidades: { contains: habilidades, mode: "insensitive" as any } }],
        });
      }

      const items = await prisma.tecnico.findMany({
        where: AND.length ? { AND } : undefined,
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
        take: 500,
      });

      /* ---------- Bloqueos (si existe tabla) ---------- */
      let bloqueosByTec: Record<number, any[]> = {};
      try {
        const allBlocks = await (prisma as any).tecnicoBloqueo.findMany({
          orderBy: [{ startDate: "asc" }, { endDate: "asc" }],
        });
        for (const b of allBlocks) {
          (bloqueosByTec[b.tecnicoId] ||= []).push(b);
        }
      } catch {}

      /* ---------- Normalización + % carga ---------- */
      const normalizados = items.map((t: any) => {
        const skillsArr =
          Array.isArray(t.skills)
            ? t.skills
            : t?.skills?.values ??
              (t.habilidades
                ? String(t.habilidades)
                    .split(",")
                    .map((s: string) => s.trim())
                    .filter(Boolean)
                : t.especialidad
                ? [t.especialidad]
                : []);

        const bloqueos = (bloqueosByTec[t.id] || []).map((b: any) => ({
          startDate: toLocalYmd(b.startDate),
          endDate: toLocalYmd(b.endDate),
          reason: b.reason || "",
          type: b.type,
        }));

        const capacidad = Number.isFinite(Number(t.capacidad)) ? Math.max(1, Number(t.capacidad)) : 8;
        const cargaHoy = Number.isFinite(Number(t.carga)) ? Math.max(0, Number(t.carga)) : 0;

        return {
          ...t,
          skills: skillsArr,
          blockedDates: bloqueos,
          _cap: capacidad,
          _cur: cargaHoy,
          _pct: pctCarga(capacidad, cargaHoy),
        };
      });

      /* ---------- Segundo pase por skills[] JSON ---------- */
      const byHabilidad = habilidades
        ? normalizados.filter((t) =>
            t.skills.some((s: string) =>
              String(s).toLowerCase().includes(String(habilidades).toLowerCase())
            )
          )
        : normalizados;

      /* ---------- Filtro por carga relativa ---------- */
      const filtrados = byHabilidad.filter((t) => {
        if (carga === "todos") return true;
        const p = t._pct as number;
        if (carga === "baja") return p <= 50;
        if (carga === "media") return p > 50 && p <= 80;
        if (carga === "alta") return p > 80;
        return true;
      });

      /* ---------- Limpieza de campos internos ---------- */
      const data = filtrados.map(({ _cap, _cur, _pct, ...t }) => t);
      return res.status(200).json(data);
    }

    /* ============== POST (crear) ============== */
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

      const tecnico = await prisma.tecnico.create({
        data: {
          nombre,
          telefono: telefono ?? null,
          especialidad: especialidad ?? null,
          habilidades: habilidadesCsv, // CSV compat
          skills: skillsArray, // JSON (si existe la columna)
          capacidad: capacidad ?? 8,
          carga: carga ?? 0,
          horario_inicio: hhmm(horario_inicio) ?? "08:00",
          horario_fin: hhmm(horario_fin) ?? "17:00",
          notas: (notas ?? "").trim() || null,
          userId: user.id,
        },
      });

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
