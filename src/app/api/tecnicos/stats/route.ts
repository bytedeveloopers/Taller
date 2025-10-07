import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET() {
  const [totalTecnicos, activos] = await Promise.all([
    prisma.technician.count(),
    prisma.technician.count({ where: { user: { is_active: true } } }),
  ]);

  return Response.json({
    totalTecnicos,
    tecnicosActivos: activos,
    cargaPromedio: 0, // placeholder
    disponibles: activos, // placeholder
  });
}
