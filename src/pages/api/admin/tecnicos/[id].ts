// src/pages/api/admin/tecnicos/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

/* ========= Schemas ========= */
const BlockTypeEnum = z.enum(["VACATION", "SICK_LEAVE", "TRAINING", "OTHER"]);
const BlockedDateSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(1).optional(),
  type: BlockTypeEnum.default("OTHER"),
});

const PatchSchema = z.object({
  nombre: z.string().optional(),
  telefono: z.string().nullable().optional(),
  especialidad: z.string().nullable().optional(),
  horario_inicio: z.string().nullable().optional(),
  horario_fin: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  must_change_password: z.boolean().optional(),
  capacidad: z.union([z.string(), z.number(), z.null()]).optional(),
  carga: z.union([z.string(), z.number(), z.null()]).optional(),
  // skills/habilidades en múltiples formatos
  skills: z.union([z.array(z.string()), z.string(), z.null()]).optional(),
  habilidades: z.union([z.array(z.string()), z.string(), z.null()]).optional(),
  habilidad: z.string().optional(), // una sola (merge)
  notas: z.string().nullable().optional(),
  blockedDates: z.array(BlockedDateSchema).optional(),
  email: z.string().email().optional(),
});

/* ========= Helpers ========= */
function toArray(v: any): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  const s = String(v).trim();
  if (!s) return [];
  try {
    const p = JSON.parse(s);
    if (Array.isArray(p)) return p.map((x) => String(x).trim()).filter(Boolean);
  } catch {}
  return s.split(",").map((t) => t.trim()).filter(Boolean);
}

function hhmm(v?: string | null) {
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

/* ========= Lookups ========= */
async function findTecnicoById(id: number) {
  return prisma.tecnico.findUnique({ where: { id }, include: { user: true } });
}
async function findTecnicoByEmail(email: string) {
  return prisma.tecnico.findFirst({ where: { user: { email } }, include: { user: true } });
}

/* ========= Handler ========= */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!idParam || typeof idParam !== "string") {
      return res.status(400).json({ ok: false, error: "Parámetro id inválido" });
    }
    const idNum = /^\d+$/.test(idParam) ? Number(idParam) : null;

    /* ------- PATCH ------- */
    if (req.method === "PATCH") {
      const rawBody = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      rawBody.horario_inicio = rawBody.horario_inicio ?? rawBody.horarioInicio ?? null;
      rawBody.horario_fin = rawBody.horario_fin ?? rawBody.horarioFin ?? null;

      const parsed = PatchSchema.safeParse(rawBody);
      if (!parsed.success) {
        const flat = parsed.error.flatten();
        const first =
          (Object.values(flat.fieldErrors)[0]?.[0]) ||
          flat.formErrors?.[0] ||
          "Payload inválido";
        return res.status(400).json({ ok: false, error: flat, message: first });
      }

      const {
        nombre, telefono, especialidad, horario_inicio, horario_fin,
        is_active, must_change_password, capacidad, carga,
        skills, habilidades, habilidad, notas, blockedDates, email,
      } = parsed.data;

      // localizar técnico
      let target: any = null;
      if (idNum !== null) target = await findTecnicoById(idNum);
      if (!target && idParam.includes("@")) target = await findTecnicoByEmail(idParam);
      if (!target && email) target = await findTecnicoByEmail(email);
      if (!target) return res.status(404).json({ ok: false, error: "Técnico no encontrado" });

      // ---------- data Tecnico ----------
      const dataTec: any = {};

      if (nombre !== undefined) dataTec.nombre = nombre;
      if (telefono !== undefined) dataTec.telefono = (telefono ?? "").trim() ? telefono : null;
      if (especialidad !== undefined) dataTec.especialidad = (especialidad ?? "").trim() ? especialidad : null;

      if (horario_inicio !== undefined) {
        dataTec.horario_inicio = horario_inicio ? (hhmm(horario_inicio) ?? null) : null;
      }
      if (horario_fin !== undefined) {
        dataTec.horario_fin = horario_fin ? (hhmm(horario_fin) ?? null) : null;
      }

      if (capacidad !== undefined && capacidad !== null) {
        const n = Number(capacidad);
        if (Number.isFinite(n) && n >= 1 && n <= 50) dataTec.capacidad = Math.floor(n);
      }
      if (carga !== undefined && carga !== null) {
        const n = Number(carga);
        if (Number.isFinite(n) && n >= 0) dataTec.carga = Math.floor(n);
      }

      // ---------- skills / habilidades (JSON + CSV espejo) ----------
      const currentSkillsArray: string[] =
        Array.isArray(target.skills) ? (target.skills as string[])
        : (target.habilidades ? String(target.habilidades).split(",").map((s: string) => s.trim()).filter(Boolean) : []);

      let nextSkillsArr: string[] | undefined;
      let nullifySkills = false;

      if (skills === null || habilidades === null) {
        nullifySkills = true;
      } else if (skills !== undefined) {
        nextSkillsArr = toArray(skills);
      } else if (habilidades !== undefined) {
        nextSkillsArr = toArray(habilidades);
      }

      if (habilidad && !nullifySkills) {
        const set = new Set((nextSkillsArr ?? currentSkillsArray).map((s) => s.trim()).filter(Boolean));
        set.add(habilidad.trim());
        nextSkillsArr = Array.from(set);
      }

      if (nullifySkills) {
        dataTec.skills = Prisma.DbNull;   // JSON → NULL
        dataTec.habilidades = null;       // CSV → NULL
      } else if (nextSkillsArr !== undefined) {
        const clean = Array.from(new Set(nextSkillsArr.map((s) => s.trim()).filter(Boolean)));
        dataTec.skills = clean;
        dataTec.habilidades = clean.join(",");
      }

      if (notas !== undefined) dataTec.notas = (notas ?? "").trim() ? notas : null;

      await prisma.tecnico.update({ where: { id: target.id }, data: dataTec });

      // flags de usuario
      if ((is_active !== undefined || must_change_password !== undefined) && target.userId) {
        await prisma.user.update({
          where: { id: target.userId },
          data: {
            ...(is_active !== undefined ? { is_active } : {}),
            ...(must_change_password !== undefined ? { must_change_password } : {}),
          },
        });
      }

      // bloqueos
      const tb = (prisma as any).tecnicoBloqueo;
      if (Array.isArray(blockedDates) && tb) {
        await tb.deleteMany({ where: { tecnicoId: target.id } });
        if (blockedDates.length) {
          await tb.createMany({
            data: blockedDates.map((b) => ({
              tecnicoId: target.id,
              startDate: ymdToLocalDateStart(b.startDate),
              endDate: ymdToLocalDateEnd(b.endDate),
              reason: b.reason ?? null,
              type: b.type ?? "OTHER",
            })),
          });
        }
      }

      // respuesta fresca
      const fresh = await prisma.tecnico.findUnique({ where: { id: target.id }, include: { user: true } });

      const skillsOut: string[] = Array.isArray(fresh?.skills)
        ? (fresh!.skills as string[])
        : (fresh?.habilidades ? String(fresh.habilidades).split(",").map((s: string) => s.trim()).filter(Boolean) : []);

      // notas internas (incluye autor)
      let notasInternas: any[] = [];
      try {
        notasInternas = await prisma.tecnicoNota.findMany({
          where: { tecnicoId: target.id, isPrivate: true },
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
          include: { author: { select: { id: true, nombre: true, email: true } } },
        });
      } catch {}

      return res.status(200).json({
        ok: true,
        tecnico: {
          ...fresh,
          skills: skillsOut,
          notasInternas,
        },
      });
    }

    /* ------- GET ------- */
    if (req.method === "GET") {
      let target: any = null;
      if (idNum !== null) target = await findTecnicoById(idNum);
      else if (idParam.includes("@")) target = await findTecnicoByEmail(idParam);
      if (!target) return res.status(404).json({ ok: false, message: "No encontrado" });

      const skillsArr: string[] = Array.isArray(target.skills)
        ? (target.skills as string[])
        : (target.habilidades ? String(target.habilidades).split(",").map((s: string) => s.trim()).filter(Boolean) : []);

      let notasInternas: any[] = [];
      try {
        notasInternas = await prisma.tecnicoNota.findMany({
          where: { tecnicoId: target.id, isPrivate: true },
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
          include: { author: { select: { id: true, nombre: true, email: true } } },
        });
      } catch {}

      return res.status(200).json({
        ...target,
        skills: skillsArr,
        notasInternas,
      });
    }

    /* ------- DELETE ------- */
    if (req.method === "DELETE") {
      let target: any = null;
      if (idNum !== null) target = await findTecnicoById(idNum);
      else if (idParam.includes("@")) target = await findTecnicoByEmail(idParam);
      if (!target) return res.status(404).json({ ok: false, error: "Técnico no encontrado" });

      try { await (prisma as any).tecnicoBloqueo.deleteMany({ where: { tecnicoId: target.id } }); } catch {}
      try { await prisma.tecnicoNota.deleteMany({ where: { tecnicoId: target.id } }); } catch {}
      await prisma.tecnico.delete({ where: { id: target.id } });

      return res.status(200).json({ ok: true });
    }

    /* ------- 405 ------- */
    res.setHeader("Allow", "GET, PATCH, DELETE");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("api/admin/tecnicos/[id] error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Error en /api/admin/tecnicos/[id]" });
  }
}
