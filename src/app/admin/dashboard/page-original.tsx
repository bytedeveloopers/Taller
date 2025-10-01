"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import DashboardOverview from "@/components/admin/DashboardOverview";
import GestionDeCitas from "@/components/admin/GestionDeCitas";
import { useCitas } from "@/hooks/useCitas";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";

type TabType = "dashboard" | "citas" | "reportes" | "clientes" | "vehiculos" | "servicios" | "facturacion" | "configuracion";

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState<TabType>("dashboard");
  
  // Hooks personalizados
  const { citas, updateCitaEstado, deleteCita, createCita } = useCitas();
  const stats = useDashboardStats(citas);
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

  const renderContent = () => {
    switch (selectedTab) {
      case "dashboard":
        return <DashboardOverview stats={stats} />;
      
      case "citas":
        return (
          <GestionDeCitas
            citas={citas}
            onUpdateCita={updateCitaEstado}
            onDeleteCita={deleteCita}
            onCreateCita={handleCreateCita}
          />
        );
      
      case "reportes":
        return (
          <div className="bg-secondary-800 rounded-lg p-6 border border-primary-400/10 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-primary-400">
              Reportes y Estadísticas
            </h3>
            <p className="text-gray-400">
              Sección en desarrollo. Aquí se mostrarán gráficos y reportes detallados.
            </p>
          </div>
        );
      
      default:
        return (
          <div className="bg-secondary-800 rounded-lg p-6 border border-primary-400/10 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-primary-400">
              {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
            </h3>
            <p className="text-gray-400">
              Sección en desarrollo. Próximamente disponible.
            </p>
          </div>
        );
    }
  };

  return (
    <AdminLayout
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      notifications={notifications}
      onMarkNotificationAsRead={markNotificationAsRead}
    >
      {renderContent()}
    </AdminLayout>
  );
}