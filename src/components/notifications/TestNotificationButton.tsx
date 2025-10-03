"use client";

import { useState } from "react";

export function TestNotificationButton() {
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const createTestNotification = async () => {
    setCreating(true);
    setMessage("");

    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "demo-admin-user",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("¡Notificación de prueba creada exitosamente!");
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 bg-secondary-700 rounded-lg border border-secondary-600">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium mb-1">Probar Sistema de Notificaciones</h4>
          <p className="text-gray-400 text-sm">
            Crea una notificación de prueba para verificar el funcionamiento
          </p>
        </div>
        <button
          onClick={createTestNotification}
          disabled={creating}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? "Creando..." : "Crear Prueba"}
        </button>
      </div>
      {message && (
        <div
          className={`mt-3 p-3 rounded-lg ${
            message.includes("Error")
              ? "bg-red-900 border border-red-700 text-red-200"
              : "bg-green-900 border border-green-700 text-green-200"
          }`}
        >
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  );
}
