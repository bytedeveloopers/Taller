import "./globals.css";

export const metadata = {
  title: "Sistema de Gestión Automotriz",
  description: "Sistema completo de gestión para talleres mecánicos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
