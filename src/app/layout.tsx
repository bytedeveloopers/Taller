import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taller Management System",
  description: "Sistema de gestión para talleres mecánicos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
