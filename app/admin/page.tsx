"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ApiUser = {
  id: string;
  email: string;
  name?: string;
  role: "ADMIN" | "TECNICO" | string;
};

type LoginOk = {
  success: true;
  user: ApiUser;
  redirect?: string;
};

type LoginFail = {
  success: false;
  message?: string;
  error?: string;
  detail?: string;
};

type MeOk = {
  authenticated: true;
  user: ApiUser & { is_active?: boolean };
};

type MeFail = { authenticated: false };

function isJsonContentType(ct: string | null) {
  return (ct || "").toLowerCase().includes("application/json");
}

async function parseErrorResponse(res: Response): Promise<string> {
  const statusLine = `HTTP ${res.status} ${res.statusText || ""}`.trim();

  try {
    if (isJsonContentType(res.headers.get("content-type"))) {
      const j = (await res.json().catch(() => ({}))) as LoginFail & Record<string, any>;
      const msg =
        j?.message ||
        j?.error ||
        j?.detail ||
        j?.errors?.[0] ||
        j?.reason ||
        j?.msg ||
        j?.statusMessage ||
        null;
      if (msg) return `${statusLine} – ${msg}`;
      return `${statusLine} – (JSON sin 'message')`;
    } else {
      // no JSON → puede ser HTML (404 de página)
      const t = await res.text().catch(() => "");
      if (t.startsWith("<!DOCTYPE") || t.startsWith("<html")) {
        return `${statusLine} – Ruta /api/auth/login no encontrada o devuelve HTML.\n` +
          `Sugerencia: Asegúrate de tener pages/api/auth/login.ts (Pages Router) y reiniciar el dev server.\n` +
          `Body (preview 300): ${t.slice(0, 300)}…`;
      }
      return `${statusLine} – ${t.slice(0, 300)}…`;
    }
  } catch (e: any) {
    return `${statusLine} – Error al leer la respuesta: ${e?.message || e}`;
  }
}

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(""); // mensaje claro
  const router = useRouter();

  // Si ya hay sesión, redirige según rol
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        let data: MeOk | MeFail = { authenticated: false };
        if (isJsonContentType(res.headers.get("content-type"))) {
          data = (await res.json().catch(() => ({ authenticated: false } as MeFail))) as MeOk | MeFail;
        }

        if (!alive) return;
        if (res.ok && (data as MeOk).authenticated) {
          const role = ((data as MeOk).user.role || "").toUpperCase();
          router.replace(role === "TECNICO" ? "/tecnico/dashboard" : "/admin/dashboard");
          return;
        }
      } catch (e) {
        // sin sesión o error de red -> mostrar login
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include", // requerido para cookie httpOnly
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = await parseErrorResponse(res);
        setError(msg);
        return;
      }

      // Si es OK, esperamos JSON
      if (!isJsonContentType(res.headers.get("content-type"))) {
        const text = await res.text().catch(() => "");
        setError(`Respuesta inesperada del servidor (no JSON). Body: ${text.slice(0, 300)}…`);
        return;
      }

      const data = (await res.json().catch(() => null)) as LoginOk | LoginFail | null;
      if (!data || typeof (data as any) !== "object" || !("success" in data)) {
        setError("Respuesta inesperada del servidor (sin campo 'success').");
        return;
      }

      if (!data.success) {
        const fail = data as LoginFail;
        setError(fail.message || fail.error || fail.detail || "Credenciales inválidas");
        return;
      }

      const role = (data.user.role || "").toUpperCase();
      const fallback = role === "TECNICO" ? "/tecnico/dashboard" : "/admin/dashboard";
      router.push(data.redirect || fallback);
    } catch (err: any) {
      setError(`Error de red o servidor: ${err?.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-300">Cargando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-400 rounded-full flex items-center justify-center mb-6">
            <span className="text-gray-900 font-bold text-2xl">AR</span>
          </div>
          <h2 className="text-3xl font-bold text-white">Acceso al Sistema</h2>
          <p className="mt-2 text-gray-400">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg whitespace-pre-wrap text-sm">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-400 hover:bg-primary-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Iniciando sesión…
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>

          {/* Back to home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
              ← Volver al inicio
            </Link>
          </div>
        </form>

        {/* Nota de ayuda */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Ayuda rápida:</h3>
          <p className="text-[11px] text-gray-500">
            Si aparece “Ruta /api/auth/login no encontrada…”, crea <code>pages/api/auth/login.ts</code> (Pages Router),
            implementa el endpoint y reinicia el servidor.
          </p>
        </div>
      </div>
    </div>
  );
}
