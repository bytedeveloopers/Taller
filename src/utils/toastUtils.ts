// Utilidades para mejorar las notificaciones toast
export const TOAST_SOUNDS = {
  success: () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Sonido sutil usando Web Audio API o Speech Synthesis
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.setValueAtTime(800, context.currentTime);
        oscillator.frequency.setValueAtTime(1000, context.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.2);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.2);
      } catch (e) {
        // Fallback silencioso si no se puede reproducir sonido
      }
    }
  },

  error: () => {
    if (typeof window !== "undefined") {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.setValueAtTime(400, context.currentTime);
        oscillator.frequency.setValueAtTime(300, context.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.3);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.3);
      } catch (e) {
        // Fallback silencioso
      }
    }
  },
};

export const TOAST_PRESETS = {
  // Técnicos
  tecnicoCreado: (nombre: string) => ({
    type: "success" as const,
    title: "👨‍🔧 Técnico Registrado",
    message: `${nombre} ha sido agregado al equipo y está listo para trabajar`,
    duration: 4000,
  }),

  tecnicoActualizado: (nombre: string) => ({
    type: "success" as const,
    title: "✅ Perfil Actualizado",
    message: `Los datos de ${nombre} han sido actualizados correctamente`,
    duration: 3500,
  }),

  tecnicoActivado: (nombre: string) => ({
    type: "success" as const,
    title: "🟢 Técnico Activado",
    message: `${nombre} está ahora disponible para asignaciones`,
    duration: 3000,
  }),

  tecnicoDesactivado: (nombre: string) => ({
    type: "warning" as const,
    title: "🟡 Técnico Desactivado",
    message: `${nombre} ha sido desactivado temporalmente`,
    duration: 3000,
  }),

  // Errores comunes
  errorConexion: {
    type: "error" as const,
    title: "🌐 Error de Conexión",
    message: "No se pudo conectar con el servidor. Revisa tu conexión a internet.",
    duration: 6000,
  },

  errorValidacion: (campo: string) => ({
    type: "error" as const,
    title: "⚠️ Datos Incorrectos",
    message: `El campo "${campo}" no es válido. Por favor, revísalo.`,
    duration: 5000,
  }),

  // Acciones
  cargandoDatos: {
    type: "info" as const,
    title: "⏳ Cargando...",
    message: "Obteniendo información actualizada del sistema",
    duration: 2000,
  },

  filtrosAplicados: (cantidad: number) => ({
    type: "info" as const,
    title: "🔍 Búsqueda Actualizada",
    message: `Se encontraron ${cantidad} resultados`,
    duration: 2000,
  }),
};

// Helper para mostrar toasts con sonido
export const showToastWithSound = (
  showToast: (type: string, title: string, message?: string, duration?: number) => void,
  preset: any,
  enableSound = false
) => {
  if (enableSound && TOAST_SOUNDS[preset.type as keyof typeof TOAST_SOUNDS]) {
    TOAST_SOUNDS[preset.type as keyof typeof TOAST_SOUNDS]();
  }

  showToast(preset.type, preset.title, preset.message, preset.duration);
};

// Configuración para persistir preferencias de usuario
export const TOAST_PREFERENCES = {
  getEnableSound: () => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("toast-sound-enabled") === "true";
  },

  setEnableSound: (enabled: boolean) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("toast-sound-enabled", enabled.toString());
  },

  getEnableAnimations: () => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("toast-animations-enabled") !== "false";
  },

  setEnableAnimations: (enabled: boolean) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("toast-animations-enabled", enabled.toString());
  },
};
