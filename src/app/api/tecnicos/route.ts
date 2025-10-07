/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/tecnicos?search=&estado=todos|activo|inactivo&habilidades=&carga=todos
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") || "").trim();
  const estado = (searchParams.get("estado") || "todos").toLowerCase();
  const habilidad = (searchParams.get("habilidades") || "").trim();

  const where: any = {
    ...(search
      ? {
          OR: [
            { nombre: { contains: search } },
            { telefono: { contains: search } },
            { user: { email: { contains: search } } },
          ],
        }
      : {}),
    ...(habilidad ? { especialidad: { contains: habilidad } } : {}),
    ...(estado === "activo" ? { user: { is_active: true } } : {}),
    ...(estado === "inactivo" ? { user: { is_active: false } } : {}),
  };

  const rows = await prisma.technician.findMany({
    where,
    include: { user: true },
    orderBy: { id: "desc" },
  });

  const data = rows.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    telefono: t.telefono,
    especialidad: t.especialidad,
    horario_inicio: t.horario_inicio,
    horario_fin: t.horario_fin,
    user: {
      id: t.user.id,
      email: t.user.email,
      is_active: t.user.is_active,
      must_change_password: t.user.must_change_password,
    },
  }));

  return Response.json(data);
}

// POST /api/admin/tecnicos
export async function POST(req: Request) {
  const body = (await req.json()) as any;

  const nombre = String(body?.nombre || "").trim();
  const email = String(body?.email || "").trim();
  if (!nombre || !email) {
    return Response.json({ message: "nombre y email son obligatorios" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      is_active: body?.is_active ?? true,
      must_change_password: body?.must_change_password ?? true,
    },
  });

  const tecnico = await prisma.technician.create({
    data: {
      nombre,
      telefono: body?.telefono || null,
      especialidad: body?.especialidad || null,
      horario_inicio: body?.horario_inicio || null,
      horario_fin: body?.horario_fin || null,
      userId: user.id,
    },
    include: { user: true },
  });

  const auto_password = body?.password ? undefined : "Temp12345!"; // demo

  return Response.json(
    {
      ok: true,
      tecnico: {
        id: tecnico.id,
        nombre: tecnico.nombre,
        telefono: tecnico.telefono,
        especialidad: tecnico.especialidad,
        horario_inicio: tecnico.horario_inicio,
        horario_fin: tecnico.horario_fin,
        user: {
          id: tecnico.user.id,
          email: tecnico.user.email,
          is_active: tecnico.user.is_active,
          must_change_password: tecnico.user.must_change_password,
        },
      },
      auto_password,
    },
    { status: 201 }
  );
}
