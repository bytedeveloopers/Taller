"use client";

import AgendaReadOnly from "@/components/tecnico/AgendaReadOnly";
import TecnicoLayout from "@/components/tecnico/TecnicoLayout";

export default function AgendaPage() {
  return (
    <TecnicoLayout>
      <AgendaReadOnly />
    </TecnicoLayout>
  );
}
