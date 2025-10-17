/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "slide-in-right": "slideInRight 0.5s ease-out",
        "slide-out-right": "slideOutRight 0.4s ease-in",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "slide-out-left": "slideOutLeft 0.4s ease-in",
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-out": "fadeOut 0.3s ease-in",
        "scale-in": "scaleIn 0.3s ease-out",
        "scale-out": "scaleOut 0.3s ease-in",
        "bounce-soft": "bounceSoft 0.6s ease-out",
      },
      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOutRight: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOutLeft: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(-100%)", opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleOut: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.9)", opacity: "0" },
        },
        bounceSoft: {
          "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-10px)" },
          "60%": { transform: "translateY(-5px)" },
        },
      },
      colors: {
        // Paleta basada en el logo del taller
        primary: {
          50: "#f0fdf4", // Verde muy claro
          100: "#dcfce7", // Verde claro
          200: "#bbf7d0", // Verde suave
          300: "#86efac", // Verde medio claro
          400: "#7ED321", // VERDE DEL LOGO - Color principal
          500: "#6BB518", // Verde del logo más oscuro
          600: "#5A9615", // Verde oscuro para hover
          700: "#4A7C0A", // Verde muy oscuro
          800: "#3D6308", // Verde profundo
          900: "#1F3A02", // Verde casi negro
        },
        // Grises profesionales para complementar
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        // Colores adicionales para el taller
        accent: {
          orange: "#FF6B35", // Para alertas/urgente
          blue: "#4A90E2", // Para información
          green: "#7ED321", // Alias del primary-400
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          /* IE and Edge */
          "-ms-overflow-style": "none",
          /* Firefox */
          "scrollbar-width": "none",
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".scrollbar-thin": {
          /* Firefox */
          "scrollbar-width": "thin",
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#475569",
            "border-radius": "2px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#64748b",
          },
        },
      });
    },
  ],
};
