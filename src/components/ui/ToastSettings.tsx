"use client";

import { TOAST_PREFERENCES } from "@/utils/toastUtils";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface ToastSettingsProps {
  onClose?: () => void;
}

export default function ToastSettings({ onClose }: ToastSettingsProps) {
  const [enableSound, setEnableSound] = useState(false);
  const [enableAnimations, setEnableAnimations] = useState(true);

  useEffect(() => {
    setEnableSound(TOAST_PREFERENCES.getEnableSound());
    setEnableAnimations(TOAST_PREFERENCES.getEnableAnimations());
  }, []);

  const handleSoundToggle = (enabled: boolean) => {
    setEnableSound(enabled);
    TOAST_PREFERENCES.setEnableSound(enabled);
  };

  const handleAnimationsToggle = (enabled: boolean) => {
    setEnableAnimations(enabled);
    TOAST_PREFERENCES.setEnableAnimations(enabled);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-secondary-800 rounded-xl border border-secondary-700 p-6 max-w-md w-full mx-4 animate-toast-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">🔧 Configuración de Notificaciones</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Configuración de sonidos */}
          <div className="flex items-center justify-between p-3 bg-secondary-700 rounded-lg">
            <div className="flex items-center gap-3">
              {enableSound ? (
                <SpeakerWaveIcon className="w-5 h-5 text-blue-400" />
              ) : (
                <SpeakerXMarkIcon className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="text-white font-medium">Sonidos</p>
                <p className="text-sm text-gray-400">Reproducir sonidos para notificaciones</p>
              </div>
            </div>
            <button
              onClick={() => handleSoundToggle(!enableSound)}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${enableSound ? "bg-blue-600" : "bg-gray-600"}
              `}
            >
              <div
                className={`
                  absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
                  ${enableSound ? "translate-x-7" : "translate-x-1"}
                `}
              />
            </button>
          </div>

          {/* Configuración de animaciones */}
          <div className="flex items-center justify-between p-3 bg-secondary-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-purple-400">✨</div>
              <div>
                <p className="text-white font-medium">Animaciones</p>
                <p className="text-sm text-gray-400">Efectos visuales y transiciones</p>
              </div>
            </div>
            <button
              onClick={() => handleAnimationsToggle(!enableAnimations)}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${enableAnimations ? "bg-purple-600" : "bg-gray-600"}
              `}
            >
              <div
                className={`
                  absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
                  ${enableAnimations ? "translate-x-7" : "translate-x-1"}
                `}
              />
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}
