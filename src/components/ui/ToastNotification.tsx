"use client";

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastNotificationProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastNotification = ({ toasts, removeToast }: ToastNotificationProps) => {
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration !== 0) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-3 max-w-sm">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            transform: `translateY(${index * 4}px)`,
            zIndex: 60 - index,
          }}
          className="transition-transform duration-300 ease-out"
        >
          <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animación de entrada con delay suave
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          bg: "bg-gradient-to-r from-green-500 to-green-600",
          border: "border-green-400",
          icon: CheckCircleIcon,
          iconColor: "text-green-100",
        };
      case "error":
        return {
          bg: "bg-gradient-to-r from-red-500 to-red-600",
          border: "border-red-400",
          icon: XCircleIcon,
          iconColor: "text-red-100",
        };
      case "warning":
        return {
          bg: "bg-gradient-to-r from-yellow-500 to-yellow-600",
          border: "border-yellow-400",
          icon: ExclamationTriangleIcon,
          iconColor: "text-yellow-100",
        };
      case "info":
        return {
          bg: "bg-gradient-to-r from-blue-500 to-blue-600",
          border: "border-blue-400",
          icon: InformationCircleIcon,
          iconColor: "text-blue-100",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-500 to-gray-600",
          border: "border-gray-400",
          icon: InformationCircleIcon,
          iconColor: "text-gray-100",
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.icon;

  return (
    <div
      className={`
        transform transition-all duration-500 ease-out
        ${
          isExiting
            ? "animate-toast-out"
            : isVisible
            ? "animate-toast-in opacity-100"
            : "translate-x-full translate-y-2 opacity-0 scale-95"
        }
        ${styles.bg} ${styles.border} border-2
        rounded-xl shadow-2xl backdrop-blur-sm
        p-4 min-w-[320px] max-w-md
        relative overflow-hidden
        hover:scale-105 hover:shadow-3xl hover:animate-glow-pulse
        cursor-pointer group
      `}
      onMouseEnter={() => !isExiting && setIsVisible(true)}
      onClick={() => !isExiting && handleClose()}
    >
      {/* Efectos de brillo y animación */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out"></div>

      {/* Ondas de fondo */}
      <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Contenido */}
      <div className="relative z-10 flex items-start space-x-3">
        {/* Icono con animación */}
        <div className="flex-shrink-0 relative">
          <Icon className={`h-6 w-6 ${styles.iconColor} animate-pulse-soft`} />
          {toast.type === "success" && (
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
          )}
        </div>

        {/* Contenido del mensaje */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="text-white/90 text-sm mt-1 leading-relaxed">{toast.message}</p>
          )}
        </div>

        {/* Botón de cerrar mejorado */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1.5 hover:bg-white/30 rounded-full transition-all duration-200 hover:scale-110 hover:rotate-90 group/close"
          title="Cerrar notificación"
        >
          <XMarkIcon className="h-4 w-4 text-white/80 group-hover/close:text-white transition-colors" />
        </button>
      </div>

      {/* Barra de progreso mejorada */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-white/60 to-white/40 shadow-sm"
            style={{
              animation: `toast-progress ${toast.duration}ms ease-out forwards`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      )}

      <style jsx>{`
        @keyframes toast-progress {
          0% {
            width: 100%;
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            width: 0%;
            opacity: 0.5;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-pulse-soft {
          animation: pulse-soft 2s infinite;
        }
      `}</style>
    </div>
  );
};

// Estado global para los toasts - SOLUCIÓN A MÚLTIPLES TOASTS
let globalToasts: Toast[] = [];
let globalListeners: Array<(toasts: Toast[]) => void> = [];

// Funciones para manejar el estado global
const addGlobalToast = (toast: Omit<Toast, "id">) => {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newToast = { ...toast, id };

  // Limitar a máximo 3 toasts a la vez para evitar solapamiento
  globalToasts = [...globalToasts.slice(-2), newToast];

  // Notificar a todos los listeners
  globalListeners.forEach((listener) => listener([...globalToasts]));
};

const removeGlobalToast = (id: string) => {
  globalToasts = globalToasts.filter((toast) => toast.id !== id);
  globalListeners.forEach((listener) => listener([...globalToasts]));
};

const clearAllToasts = () => {
  globalToasts = [];
  globalListeners.forEach((listener) => listener([]));
};

const replaceToast = (toast: Omit<Toast, "id">, replaceId?: string) => {
  const id = replaceId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newToast = { ...toast, id };

  // Si hay un ID específico, reemplazar ese toast
  if (replaceId) {
    const existingIndex = globalToasts.findIndex((t) => t.id === replaceId);
    if (existingIndex !== -1) {
      globalToasts[existingIndex] = newToast;
    } else {
      globalToasts = [...globalToasts.slice(-2), newToast];
    }
  } else {
    // Comportamiento normal
    globalToasts = [...globalToasts.slice(-2), newToast];
  }

  globalListeners.forEach((listener) => listener([...globalToasts]));
};

// Hook personalizado para manejar toasts globales
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([...globalToasts]);

  useEffect(() => {
    // Suscribirse a cambios globales
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts);
    };

    globalListeners.push(listener);

    // Cleanup al desmontar
    return () => {
      globalListeners = globalListeners.filter((l) => l !== listener);
    };
  }, []);

  const showSuccess = (title: string, message?: string, duration?: number) => {
    addGlobalToast({ type: "success", title, message, duration });
  };

  const showError = (title: string, message?: string, duration?: number) => {
    addGlobalToast({ type: "error", title, message, duration });
  };

  const showWarning = (title: string, message?: string, duration?: number) => {
    addGlobalToast({ type: "warning", title, message, duration });
  };

  const showInfo = (title: string, message?: string, duration?: number) => {
    addGlobalToast({ type: "info", title, message, duration });
  };

  // Funciones de reemplazo para acciones administrativas
  const showSuccessReplace = (
    title: string,
    message?: string,
    duration?: number,
    id = "admin-action"
  ) => {
    replaceToast({ type: "success", title, message, duration }, id);
  };

  const showErrorReplace = (
    title: string,
    message?: string,
    duration?: number,
    id = "admin-action"
  ) => {
    replaceToast({ type: "error", title, message, duration }, id);
  };

  const showWarningReplace = (
    title: string,
    message?: string,
    duration?: number,
    id = "admin-action"
  ) => {
    replaceToast({ type: "warning", title, message, duration }, id);
  };

  const showInfoReplace = (
    title: string,
    message?: string,
    duration?: number,
    id = "admin-action"
  ) => {
    replaceToast({ type: "info", title, message, duration }, id);
  };

  return {
    toasts,
    removeToast: removeGlobalToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showSuccessReplace,
    showErrorReplace,
    showWarningReplace,
    showInfoReplace,
    clearAll: clearAllToasts,
    ToastContainer: () => <ToastNotification toasts={toasts} removeToast={removeGlobalToast} />,
  };
};

export default ToastNotification;
