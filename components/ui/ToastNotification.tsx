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
        >
          <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
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
        transform transition-all duration-300 ease-in-out
        ${isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"}
        ${styles.bg} ${styles.border} border-2
        rounded-xl shadow-2xl backdrop-blur-sm
        p-4 min-w-[320px] max-w-md
        relative overflow-hidden
      `}
    >
      {/* Efecto de brillo */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>

      {/* Contenido */}
      <div className="relative z-10 flex items-start space-x-3">
        {/* Icono */}
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${styles.iconColor}`} />
        </div>

        {/* Contenido del mensaje */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="text-white/90 text-sm mt-1 leading-relaxed">{toast.message}</p>
          )}
        </div>

        {/* Botón de cerrar */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <XMarkIcon className="h-4 w-4 text-white/80" />
        </button>
      </div>

      {/* Barra de progreso (opcional) */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white/40 transition-all ease-linear"
            style={{
              animation: `toast-progress ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

// Estado global para los toasts
let globalToasts: Toast[] = [];
let globalListeners: Array<(toasts: Toast[]) => void> = [];

// Funciones para manejar el estado global
const addGlobalToast = (toast: Omit<Toast, "id">) => {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newToast = { ...toast, id };

  // Limitar a máximo 3 toasts a la vez
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

  return {
    toasts,
    removeToast: removeGlobalToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll: clearAllToasts,
    ToastContainer: () => <ToastNotification toasts={toasts} removeToast={removeGlobalToast} />,
  };
};

export default ToastNotification;
