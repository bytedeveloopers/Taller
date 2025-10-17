"use client";

import { ReactNode } from "react";

type SeccionID = "inicio" | "ordenes" | "recepcion" | "diagnostico" | "metricas" | "agenda";

export default function TecnicoLayout({
  children,
  active,
  onChange,
}: {
  children: ReactNode;
  active: SeccionID;
  onChange: (id: SeccionID) => void;
}) {
  return (
    <>
      {/* Sidebar */}
      <aside className="tecnico-sidebar">
        <div className="tecnico-sidebar-header">
          <div className="tecnico-sidebar-title">Panel Técnico</div>
          <div className="tecnico-sidebar-subtitle">Técnico Demo</div>
        </div>

        <nav className="tecnico-nav">
          <button
            className={`tecnico-nav-button ${active === "inicio" ? "active" : ""}`}
            onClick={() => onChange("inicio")}
          >
            <div className="tecnico-nav-content">
              <div className="tecnico-nav-name">Inicio</div>
              <div className="tecnico-nav-description">Resumen del día</div>
            </div>
          </button>

          <button
            className={`tecnico-nav-button ${active === "ordenes" ? "active" : ""}`}
            onClick={() => onChange("ordenes")}
          >
            <div className="tecnico-nav-content">
              <div className="tecnico-nav-name">Mis Órdenes</div>
              <div className="tecnico-nav-description">Kanban y lista</div>
            </div>
          </button>

          <button
            className={`tecnico-nav-button ${active === "recepcion" ? "active" : ""}`}
            onClick={() => onChange("recepcion")}
          >
            <div className="tecnico-nav-content">
              <div className="tecnico-nav-name">Recepción</div>
              <div className="tecnico-nav-description">Fotos + firma</div>
            </div>
          </button>

          <button
            className={`tecnico-nav-button ${active === "diagnostico" ? "active" : ""}`}
            onClick={() => onChange("diagnostico")}
          >
            <div className="tecnico-nav-content">
              <div className="tecnico-nav-name">Diagnóstico</div>
              <div className="tecnico-nav-description">Checklist y notas</div>
            </div>
          </button>

          <button
            className={`tecnico-nav-button ${active === "metricas" ? "active" : ""}`}
            onClick={() => onChange("metricas")}
          >
            <div className="tecnico-nav-content">
              <div className="tecnico-nav-name">Mis Métricas</div>
              <div className="tecnico-nav-description">Cumplimiento, retrabajos</div>
            </div>
          </button>

          <button
            className={`tecnico-nav-button ${active === "agenda" ? "active" : ""}`}
            onClick={() => onChange("agenda")}
          >
            <div className="tecnico-nav-content">
              <div className="tecnico-nav-name">Agenda</div>
              <div className="tecnico-nav-description">Citas / slots</div>
            </div>
          </button>
        </nav>

        <div className="tecnico-sidebar-footer">
          {/* Info del técnico */}
          <div className="tecnico-status-card">
            <div className="tecnico-status-online">
              <div className="tecnico-status-dot"></div>
              <span className="text-xs text-green-400 font-medium">Disponible</span>
            </div>
            <p className="text-xs text-gray-400">Especialidad: Mecánica General</p>
            <p className="text-xs text-gray-400">Turno: Mañana</p>
          </div>

          {/* Botón de cerrar sesión */}
          <button
            onClick={() => {
              // Limpiar datos de sesión si existieran
              localStorage.removeItem("userToken");
              sessionStorage.clear();
              // Redireccionar al login o página principal
              window.location.href = "/admin";
            }}
            className="tecnico-logout-button"
          >
            <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="tecnico-main">{children}</main>
    </>
  );
}
