import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/tecnicos - Listar técnicos con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const estado = searchParams.get("estado") || "todos";
    const habilidades = searchParams.get("habilidades") || "";
    const carga = searchParams.get("carga") || "todos";

    console.log("🔍 Buscando técnicos con filtros:", { search, estado, habilidades, carga });

    // Construir condiciones de filtrado
    const whereConditions: any = {};

    // Filtro por búsqueda (nombre o teléfono)
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtro por estado activo/inactivo
    if (estado !== "todos") {
      whereConditions.active = estado === "activo";
    }

    // Filtro por habilidades (simulado - en la implementación real sería un campo JSON)
    if (habilidades) {
      // Por ahora simulamos que todas las habilidades están disponibles
      // En implementación real: whereConditions.skills = { has: habilidades };
    }

    const tecnicos = await prisma.user.findMany({
      where: {
        role: "TECHNICIAN",
        ...whereConditions,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    });

    // Simular datos adicionales que vendrían de la tabla technicians
    const tecnicosConDatos = tecnicos.map((tecnico) => ({
      id: tecnico.id,
      name: tecnico.name,
      phone: generatePhone(), // Simulado
      email: tecnico.email,
      skills: generateSkills(), // Simulado
      capacityPerDay: Math.floor(Math.random() * 5) + 3, // 3-8 trabajos
      currentLoad: Math.floor(Math.random() * 6), // 0-5 trabajos actuales
      workHours: {
        start: "08:00",
        end: "17:00",
      },
      active: tecnico.isActive,
      avatarUrl: null,
      notes: "",
      createdAt: tecnico.createdAt,
      updatedAt: tecnico.updatedAt,
    }));

    // Aplicar filtro de carga si es necesario
    let tecnicosFiltrados = tecnicosConDatos;
    if (carga !== "todos") {
      tecnicosFiltrados = tecnicosConDatos.filter((tecnico) => {
        const loadPercentage = (tecnico.currentLoad / tecnico.capacityPerDay) * 100;
        if (carga === "baja") return loadPercentage <= 50;
        if (carga === "media") return loadPercentage > 50 && loadPercentage <= 80;
        if (carga === "alta") return loadPercentage > 80;
        return true;
      });
    }

    console.log(`✅ Encontrados ${tecnicosFiltrados.length} técnicos`);

    return NextResponse.json({
      success: true,
      data: tecnicosFiltrados,
      message: `Se encontraron ${tecnicosFiltrados.length} técnicos`,
    });
  } catch (error) {
    console.error("❌ Error obteniendo técnicos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

// POST /api/tecnicos - Crear nuevo técnico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      skills,
      capacityPerDay,
      workHours,
      active,
      avatarUrl,
      notes,
      blockedDates,
    } = body;

    console.log("➕ Creando nuevo técnico:", { name, phone, email });

    // Validaciones
    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Nombre y teléfono son obligatorios",
        },
        { status: 400 }
      );
    }

    // Crear usuario técnico en users
    const user = await prisma.user.create({
      data: {
        email: email || `${phone}@taller.local`,
        password: "temp123", // Password temporal - en producción debería ser hasheado
        name: name.trim(),
        role: "TECHNICIAN",
        isActive: active !== false,
      },
    });

    // En una implementación real, aquí crearíamos el registro en la tabla technicians
    // con todos los datos adicionales como skills, capacityPerDay, etc.

    console.log("✅ Técnico creado exitosamente con ID:", user.id);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        phone,
        email: user.email,
        skills: skills || [],
        capacityPerDay: capacityPerDay || 5,
        workHours: workHours || { start: "08:00", end: "17:00" },
        active: user.isActive,
        avatarUrl: avatarUrl || null,
        notes: notes || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: "Técnico creado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error creando técnico:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

// Funciones auxiliares para simular datos
function generatePhone(): string {
  const prefixes = ["3", "6", "9"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return `${prefix}${number}`;
}

function generateSkills(): string[] {
  const allSkills = [
    "Motor",
    "Transmisión",
    "Frenos",
    "Electricidad",
    "Aire Acondicionado",
    "Suspensión",
    "Carrocería",
    "Diagnóstico",
    "Soldadura",
    "Pintura",
  ];

  const numSkills = Math.floor(Math.random() * 4) + 2; // 2-5 habilidades
  const selectedSkills: string[] = [];

  for (let i = 0; i < numSkills; i++) {
    const skill = allSkills[Math.floor(Math.random() * allSkills.length)];
    if (!selectedSkills.includes(skill)) {
      selectedSkills.push(skill);
    }
  }

  return selectedSkills;
}
