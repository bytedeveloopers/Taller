"use client";

import { useEffect, useMemo, useState } from "react";
import TecnicoLayout from "@/components/tecnico/TecnicoLayout";

// Secciones (ajusta los imports a los que ya tienes)
import InicioTecnico from "@/components/tecnico/InicioTecnico";
import MisOrdenesKanban from "@/components/tecnico/MisOrdenesKanban";
import RecepcionTecnico from "@/components/tecnico/RecepcionTecnico";
import DiagnosticoForm from "@/components/tecnico/DiagnosticoForm";
import MetricasPersonales from "@/components/tecnico/MetricasPersonales";
import AgendaReadOnly from "@/components/tecnico/AgendaReadOnly";

type SeccionID = "inicio" | "ordenes" | "recepcion" | "diagnostico" | "metricas" | "agenda";

export default function DashboardTecnico() {
  const [active, setActive] = useState<SeccionID>("inicio");

  // (Opcional) Leer / escribir el tab en la URL ?tab=...
  useEffect(() => {
    const url = new URL(window.location.href);
    const tab = (url.searchParams.get("tab") as SeccionID) || "inicio";
    setActive(tab);
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", active);
    window.history.replaceState(null, "", url.toString());
  }, [active]);

  const Section = useMemo(() => {
    const map: Record<SeccionID, JSX.Element> = {
      inicio: <InicioTecnico />,
      ordenes: <MisOrdenesKanban />,
      recepcion: <RecepcionTecnico />,
      diagnostico: <DiagnosticoForm />,
      metricas: <MetricasPersonales />,
      agenda: <AgendaReadOnly />,
    };
    return map[active] ?? <InicioTecnico />;
  }, [active]);

  return (
    <div className="tecnico-dashboard">
      <TecnicoLayout
        active={active}
        onChange={setActive}
      >
        <div className="tecnico-content">
          {Section}
        </div>
      </TecnicoLayout>
    </div>
  );
}
