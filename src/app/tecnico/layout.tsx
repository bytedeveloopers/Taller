"use client";

import TecnicoLayout from "@/components/tecnico/TecnicoLayout";
import "@/styles/tecnico-dashboard.css";
import React from "react";

export default function TecnicoLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="tecnico-dashboard">
      <TecnicoLayout>{children}</TecnicoLayout>
    </div>
  );
}
