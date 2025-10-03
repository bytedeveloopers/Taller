/**
 * Middleware personalizado para inicializar sistemas
 * Se ejecuta en el servidor y garantiza la inicialización de sistemas críticos
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

let backupSystemInitialized = false;

export async function middleware(request: NextRequest) {
  // Solo inicializar en el servidor y una vez
  if (!backupSystemInitialized && typeof window === "undefined") {
    try {
      // Importación dinámica para evitar problemas de SSR
      const { initBackupSystem } = await import("./src/lib/backup-init");
      await initBackupSystem();
      backupSystemInitialized = true;
    } catch (error) {
      console.error("Error initializing backup system in middleware:", error);
    }
  }

  return NextResponse.next();
}

// Configurar para que se ejecute solo en rutas de API y admin
export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
