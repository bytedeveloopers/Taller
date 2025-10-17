// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function setAuthCookie(res: NextApiResponse, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  const maxAge = 60 * 60 * 24 * 7; // 7 días
  res.setHeader(
    "Set-Cookie",
    [
      `auth_token=${token}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      isProd ? "Secure" : "",
      `Max-Age=${maxAge}`,
    ]
      .filter(Boolean)
      .join("; ")
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Datos inválidos" });
    }
    const { email, password } = parsed.data;

    // 🔎 Traemos al usuario + perfil técnico (nombre correcto de relación: 'tecnico')
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { tecnico: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    // Campo de contraseña según tu schema: 'password'
    const stored = user.password || "";
    let valid = false;

    // Si parece hash bcrypt, comparamos; si no, (solo en dev) permitimos texto plano para pruebas
    if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
      valid = await bcrypt.compare(password, stored);
    } else {
      // ⚠️ Solo útil en desarrollo si metiste contraseñas en texto claro en la BD
      valid = password === stored;
    }

    if (!valid) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    // Role y activo del schema
    const role = String(user.role || "").toUpperCase(); // enum UserRole
    const isActive = !!user.is_active;

    if (!isActive) {
      return res.status(403).json({ success: false, message: "Usuario inactivo" });
    }

    // Si es TECNICO, debe existir perfil Tecnico vinculado
    if (role === "TECNICO" && !user.tecnico) {
      return res.status(403).json({ success: false, message: "Perfil técnico no encontrado" });
    }

    const secret = process.env.AUTH_JWT_SECRET || "dev-secret-change-me";
    const token = jwt.sign(
      { sub: user.id, role }, // sub = user.id
      secret,
      { algorithm: "HS256", expiresIn: "7d" }
    );

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      user: {
        id: String(user.id),
        email: user.email,
        name: user.nombre ?? "",
        role,
        tecnicoId: user.tecnico?.id ?? null,
      },
      redirect: role === "TECNICO" ? "/tecnico/dashboard" : "/admin/dashboard",
    });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return res.status(500).json({ success: false, message: "SERVER_ERROR" });
  }
}
