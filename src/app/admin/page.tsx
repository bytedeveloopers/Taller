"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulación de login - aquí irá la lógica real de autenticación
    try {
      // TODO: Implementar autenticación real
      if (email === "admin@autorepair.com" && password === "admin123") {
        // Simular delay de autenticación
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Redireccionar al dashboard administrativo
        router.push("/admin/dashboard");
      } else if (email === "tecnico@autorepair.com" && password === "tecnico123") {
        // Simular delay de autenticación
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Redireccionar al dashboard del técnico
        router.push("/tecnico/dashboard");
      } else {
        setError("Credenciales inválidas");
      }
    } catch (err) {
      setError("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

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
                placeholder="admin@autorepair.com"
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
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
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
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>

          {/* Back to home */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
            >
              ← Volver al inicio
            </Link>
          </div>
        </form>

        {/* Demo credentials info */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Credenciales de demo:</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-primary-400 mb-1">ADMINISTRADOR</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <p>
                  <span className="font-mono">Email:</span> admin@autorepair.com
                </p>
                <p>
                  <span className="font-mono">Password:</span> admin123
                </p>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-3">
              <h4 className="text-xs font-semibold text-blue-400 mb-1">TÉCNICO</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <p>
                  <span className="font-mono">Email:</span> tecnico@autorepair.com
                </p>
                <p>
                  <span className="font-mono">Password:</span> tecnico123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
