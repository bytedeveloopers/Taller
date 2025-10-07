/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string} };

export async function GET(_req: Request, { params }: Ctx) {
  const id = Number(params.id);
  const t = await prisma.technician.findUnique({ where: { id }, include: { user: true } });
  if (!t) return Response.json({ message: "No encontrado" }, { status: 404 });
  return Response.json(t);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const id = Number(params.id);
  const body = (await req.json()) as any;

  const t = await prisma.technician.findUnique({ where: { id }, include: { user: true } });
  if (!t) return Response.json({ message: "No encontrado" }, { status: 404 });

  const tecnico = await prisma.technician.update({
    where: { id },
    data: {
      nombre: body?.nombre ?? t.nombre,
      telefono: body?.telefono ?? t.telefono,
      especialidad: body?.especialidad ?? t.especialidad,
      horario_inicio: body?.horario_inicio ?? t.horario_inicio,
      horario_fin: body?.horario_fin ?? t.horario_fin,
    },
    include: { user: true },
  });

  if (typeof body?.is_active === "boolean" || typeof body?.must_change_password === "boolean") {
    await prisma.user.update({
      where: { id: t.userId },
      data: {
        is_active:
          typeof body?.is_active === "boolean" ? body.is_active : tecnico.user.is_active,
        must_change_password:
          typeof body?.must_change_password === "boolean"
            ? body.must_change_password
            : tecnico.user.must_change_password,
      },
    });
  }

  const updated = await prisma.technician.findUnique({ where: { id }, include: { user: true } });
  return Response.json({ ok: true, tecnico: updated });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const id = Number(params.id);
  const t = await prisma.technician.findUnique({ where: { id }, include: { user: true } });
  if (!t) return Response.json({ message: "No encontrado" }, { status: 404 });

  await prisma.technician.delete({ where: { id } });
  // opcional: también borrar el user:
  // await prisma.user.delete({ where: { id: t.userId } });

  return Response.json({ ok: true });
}
