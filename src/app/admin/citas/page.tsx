"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import GestionDeCitas from "@/components/admin/GestionDeCitas";
import { useCitas } from "@/hooks/useCitas";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";

export default function CitasPage() {
  const [selectedTab] = useState("citas" as const);
  const { citas, updateCitaEstado, deleteCita, createCita } = useCitas();
  const { notifications, markNotificationAsRead, addNotification } = useNotifications();

  const handleCreateCita = (nuevaCita: Parameters<typeof createCita>[0]) => {
    const cita = createCita(nuevaCita);

    // Agregar notificación
    addNotification({
      tipo: "cita_nueva",
      mensaje: `Nueva cita creada: ${cita.cliente} - ${cita.vehiculo}`,
      tiempo: "ahora",
      leida: false,
    });
  };

  return (
    <AdminLayout
      selectedTab={selectedTab}
      onTabChange={() => {}} // No se usa en páginas individuales
      notifications={notifications}
      onMarkNotificationAsRead={markNotificationAsRead}
    >
      <GestionDeCitas
        citas={citas}
        onUpdateCita={updateCitaEstado}
        onDeleteCita={deleteCita}
        onCreateCita={handleCreateCita}
      />
    </AdminLayout>
  );
}
