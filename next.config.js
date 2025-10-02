/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  eslint: {
    // Desactivar ESLint durante el build para evitar errores de configuración
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
