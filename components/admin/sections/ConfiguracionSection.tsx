"use client";

import {
  ConfigurationSection as ConfigSectionType,
  ConfigurationResponse,
  EventoNoti,
  Permiso,
  Permission,
  Rol,
  Role,
  UserWithRoles,
  WaitCause,
} from "@/types/configuration";
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BellIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  CircleStackIcon,
  ClockIcon,
  CloudIcon,
  CogIcon,
  ComputerDesktopIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PhotoIcon,
  PlayIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface Props {
  stats: any;
}

const ConfiguracionSection = ({ stats }: Props) => {
  const [activeTab, setActiveTab] = useState<ConfigSectionType>("taller");
  const [config, setConfig] = useState<ConfigurationResponse | null>(null);

  // Debug: Log config changes
  useEffect(() => {
    console.log("Config state changed:", config);
  }, [config]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // RBAC State
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRoles[]>([]);
  const [waitCauses, setWaitCauses] = useState<WaitCause[]>([]);

  // UI State
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Backup State
  const [backupRunning, setBackupRunning] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupLogs, setBackupLogs] = useState<any[]>([]);
  const [backupPolling, setBackupPolling] = useState<NodeJS.Timeout | null>(null);

  const tabs: { id: ConfigSectionType; name: string; icon: any; description: string }[] = [
    {
      id: "taller",
      name: "Datos del Taller",
      icon: BuildingStorefrontIcon,
      description: "Información básica del taller y branding",
    },
    {
      id: "usuarios",
      name: "Usuarios y Permisos",
      icon: ShieldCheckIcon,
      description: "Gestión de roles, permisos y usuarios",
    },
    {
      id: "flujo",
      name: "Flujo y SLA",
      icon: ClockIcon,
      description: "Configuración de tiempos y procesos",
    },
    {
      id: "plantillas",
      name: "Plantillas",
      icon: DocumentTextIcon,
      description: "Plantillas de documentos y reportes",
    },
    {
      id: "agenda",
      name: "Agenda",
      icon: ClockIcon,
      description: "Gestión de citas y recordatorios",
    },
    {
      id: "notificaciones",
      name: "Notificaciones",
      icon: BellIcon,
      description: "Configuración de alertas y notificaciones",
    },
    {
      id: "evidencias",
      name: "Evidencias",
      icon: PhotoIcon,
      description: "Configuración de captura de evidencias",
    },
    {
      id: "interfaz",
      name: "Interfaz",
      icon: AdjustmentsHorizontalIcon,
      description: "Personalización de la interfaz de usuario",
    },
    {
      id: "backup",
      name: "Respaldos",
      icon: CircleStackIcon,
      description: "Configuración de copias de seguridad",
    },
  ];

  useEffect(() => {
    fetchConfiguration();
  }, []);

  // Backup functions
  const fetchBackupLogs = async () => {
    try {
      const response = await fetch("/api/backup/logs");
      const result = await response.json();
      if (result.success) {
        setBackupLogs(result.data);
      }
    } catch (error) {
      console.error("Error fetching backup logs:", error);
    }
  };

  const fetchBackupStatus = async () => {
    try {
      const response = await fetch("/api/backup/status");
      const result = await response.json();
      if (result.success) {
        console.log("Backup status:", result.data);
      }
    } catch (error) {
      console.error("Error fetching backup status:", error);
    }
  };

  // Fetch backup logs on component mount
  useEffect(() => {
    if (activeTab === "backup") {
      fetchBackupLogs();
      fetchBackupStatus();
    }
    return () => {
      if (backupPolling) {
        clearInterval(backupPolling);
      }
    };
  }, [activeTab, backupPolling]);

  const fetchConfiguration = async (section?: ConfigSectionType) => {
    try {
      setLoading(true);

      if (section) {
        // Fetch specific section
        const response = await fetch(`/api/config/${section}`);
        const result = await response.json();

        if (result.success) {
          setConfig((prev) => ({ ...prev, [section]: result.data } as ConfigurationResponse));
        } else {
          console.error(`Error fetching ${section} config:`, result.error);
        }
      } else {
        // Fetch all configurations
        console.log("Fetching configuration from /api/configuration...");
        const response = await fetch("/api/configuration");
        console.log("Response status:", response.status);
        const result = await response.json();
        console.log("Raw API response:", result);

        if (result.success) {
          console.log("Configuration loaded successfully:", result.data);
          console.log("Setting config state...");
          setConfig(result.data);
        } else {
          console.error("Error fetching configuration:", result.error);
          console.log("Setting empty config as fallback");
          setConfig({} as any);
        }
      }
    } catch (error) {
      console.error("Error fetching configuration:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async (section: ConfigSectionType, data: any) => {
    try {
      setSaving(true);

      const response = await fetch(`/api/config/${section}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setConfig((prev) => ({ ...prev, [section]: result.data } as ConfigurationResponse));
        // Toast notification would go here
        console.log(`${section} configuration saved successfully`);
      } else {
        console.error(`Error saving ${section} configuration:`, result.error);
      }
    } catch (error) {
      console.error(`Error saving ${section} configuration:`, error);
    } finally {
      setSaving(false);
    }
  };

  const renderTallerConfig = () => {
    console.log("renderTallerConfig called, config:", config);
    console.log("config?.taller:", config?.taller);

    if (!config?.taller) {
      return (
        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="text-center py-6">
            <CogIcon className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              Cargando configuración del taller...
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Por favor espere mientras se cargan los datos.
            </p>
            <div className="mt-3 text-xs text-gray-500 max-w-md mx-auto">
              <details>
                <summary>Debug Info</summary>
                <pre className="text-left mt-2">{JSON.stringify(config, null, 2)}</pre>
              </details>
            </div>
          </div>
        </div>
      );
    }

    const taller = config.taller;

    return (
      <div className="space-y-4">
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Información Básica</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Nombre Comercial
              </label>
              <input
                type="text"
                value={taller.nombreComercial}
                onChange={(e) => {
                  const newTaller = { ...taller, nombreComercial: e.target.value };
                  setConfig({ ...config, taller: newTaller });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Mi Taller Automotriz"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">NIT</label>
              <input
                type="text"
                value={taller.nit || ""}
                onChange={(e) => {
                  const newTaller = { ...taller, nit: e.target.value || undefined };
                  setConfig({ ...config, taller: newTaller });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="12345678-9"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Teléfonos (separar con comas)
              </label>
              <input
                type="text"
                value={taller.telefonos.join(", ")}
                onChange={(e) => {
                  const telefonos = e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t);
                  const newTaller = { ...taller, telefonos };
                  setConfig({ ...config, taller: newTaller });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="+502 1234-5678, +502 8765-4321"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Horario de Atención
              </label>
              <input
                type="text"
                value={taller.horario || ""}
                onChange={(e) => {
                  const newTaller = { ...taller, horario: e.target.value || undefined };
                  setConfig({ ...config, taller: newTaller });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="L-V 8:00-18:00, S 8:00-14:00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">IVA (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taller.ivaPorc}
                onChange={(e) => {
                  const newTaller = { ...taller, ivaPorc: Number(e.target.value) };
                  setConfig({ ...config, taller: newTaller });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Mostrar Precios a Técnicos
              </label>
              <label className="flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={taller.mostrarPreciosATecnicos}
                  onChange={(e) => {
                    const newTaller = { ...taller, mostrarPreciosATecnicos: e.target.checked };
                    setConfig({ ...config, taller: newTaller });
                  }}
                  className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <span className="ml-2 text-xs text-gray-300">Permitir ver costos y precios</span>
              </label>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-300 mb-1">Dirección</label>
              <textarea
                value={taller.direccion || ""}
                onChange={(e) => {
                  const newTaller = { ...taller, direccion: e.target.value || undefined };
                  setConfig({ ...config, taller: newTaller });
                }}
                rows={2}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Dirección completa del taller"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Condiciones de Servicio
              </label>
              <textarea
                value={taller.condicionesServicio || ""}
                onChange={(e) => {
                  const newTaller = { ...taller, condicionesServicio: e.target.value || undefined };
                  setConfig({ ...config, taller: newTaller });
                }}
                rows={3}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Términos y condiciones generales del servicio..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => saveConfiguration("taller", taller)}
            disabled={saving}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    );
  };

  const renderUsuariosConfig = () => {
    if (!config?.usuarios) {
      return (
        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="text-center py-6">
            <CogIcon className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              Cargando configuración de usuarios...
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Por favor espere mientras se cargan los datos.
            </p>
          </div>
        </div>
      );
    }

    const usuarios = config.usuarios;
    const todosLosPermisos: Permiso[] = [
      "clientes.read",
      "clientes.write",
      "clientes.delete",
      "vehiculos.read",
      "vehiculos.write",
      "vehiculos.delete",
      "ot.read",
      "ot.write",
      "ot.delete",
      "ot.changeState",
      "cotizaciones.read",
      "cotizaciones.write",
      "cotizaciones.delete",
      "evidencias.read",
      "evidencias.write",
      "evidencias.delete",
      "verCostos",
      "exportar",
      "configurar",
    ];

    return (
      <div className="space-y-4">
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Matriz de Permisos por Rol</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-secondary-600">
                  <th className="text-left py-2 px-2 text-gray-300 font-medium">Permiso</th>
                  {usuarios.roles.map((rol) => (
                    <th
                      key={rol.rol}
                      className="text-center py-2 px-2 text-gray-300 font-medium min-w-20"
                    >
                      {rol.rol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todosLosPermisos.map((permiso) => (
                  <tr key={permiso} className="border-b border-secondary-700/50">
                    <td className="py-2 px-2 text-gray-300 font-mono text-xs">{permiso}</td>
                    {usuarios.roles.map((rol) => (
                      <td key={`${rol.rol}-${permiso}`} className="text-center py-2 px-2">
                        <input
                          type="checkbox"
                          checked={rol.permisos.includes(permiso)}
                          onChange={(e) => {
                            const newRoles = usuarios.roles.map((r) => {
                              if (r.rol === rol.rol) {
                                const permisos = e.target.checked
                                  ? [...r.permisos, permiso]
                                  : r.permisos.filter((p) => p !== permiso);
                                return { ...r, permisos };
                              }
                              return r;
                            });
                            const newUsuarios = { ...usuarios, roles: newRoles };
                            setConfig({ ...config, usuarios: newUsuarios });
                          }}
                          className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Configuración de Seguridad</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Longitud Mínima de Contraseña
              </label>
              <input
                type="number"
                min="6"
                max="32"
                value={usuarios.seguridad.longitudMinPass}
                onChange={(e) => {
                  const newSeguridad = {
                    ...usuarios.seguridad,
                    longitudMinPass: Number(e.target.value),
                  };
                  const newUsuarios = { ...usuarios, seguridad: newSeguridad };
                  setConfig({ ...config, usuarios: newUsuarios });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Máximo Intentos de Login
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={usuarios.seguridad.intentosMax}
                onChange={(e) => {
                  const newSeguridad = {
                    ...usuarios.seguridad,
                    intentosMax: Number(e.target.value),
                  };
                  const newUsuarios = { ...usuarios, seguridad: newSeguridad };
                  setConfig({ ...config, usuarios: newUsuarios });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="mt-3">
            <button className="inline-flex items-center px-3 py-1.5 border border-red-600 rounded-lg shadow-sm text-xs font-medium text-red-400 bg-red-900/20 hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Forzar Cierre de Sesión a Todos los Usuarios
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => saveConfiguration("usuarios", usuarios)}
            disabled={saving}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    );
  };

  const renderFlujoConfig = () => {
    if (!config?.flujo) {
      return (
        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="text-center py-6">
            <CogIcon className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              Cargando configuración de flujo...
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Por favor espere mientras se cargan los datos.
            </p>
          </div>
        </div>
      );
    }

    const flujo = config.flujo;

    return (
      <div className="space-y-4">
        {/* Estados del Flujo */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Estados del Flujo</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
            {flujo.estados.map((estado, index) => (
              <div
                key={estado.id}
                className="bg-secondary-700 rounded-lg p-3 border border-secondary-600"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full border-2"
                    style={{ backgroundColor: estado.color || "#6b7280" }}
                  />
                  <span className="text-xs text-gray-300">#{index + 1}</span>
                </div>
                <input
                  type="text"
                  value={estado.nombre}
                  onChange={(e) => {
                    const newEstados = flujo.estados.map((est) =>
                      est.id === estado.id ? { ...est, nombre: e.target.value } : est
                    );
                    const newFlujo = { ...flujo, estados: newEstados };
                    setConfig({ ...config, flujo: newFlujo });
                  }}
                  className="w-full px-2 py-1 text-sm bg-secondary-600 border border-secondary-500 text-white rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <input
                  type="color"
                  value={estado.color || "#6b7280"}
                  onChange={(e) => {
                    const newEstados = flujo.estados.map((est) =>
                      est.id === estado.id ? { ...est, color: e.target.value } : est
                    );
                    const newFlujo = { ...flujo, estados: newEstados };
                    setConfig({ ...config, flujo: newFlujo });
                  }}
                  className="w-full mt-2 h-8 border border-secondary-500 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SLA por Estado */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">SLA por Estado</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {flujo.estados.map((estado) => {
              const sla = flujo.slas?.find((s) => s.estadoId === estado.id);
              return (
                <div key={estado.id} className="bg-secondary-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: estado.color || "#6b7280" }}
                    />
                    <span className="text-sm text-white font-medium">{estado.nombre}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-300 mb-1">Horas límite</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={sla?.horas || ""}
                        onChange={(e) => {
                          const horas = e.target.value ? Number(e.target.value) : undefined;
                          const newSlas = (flujo.slas || []).filter(
                            (s) => s.estadoId !== estado.id
                          );
                          if (horas) {
                            newSlas.push({
                              estadoId: estado.id,
                              horas,
                              alertarAl80: sla?.alertarAl80 || false,
                            });
                          }
                          const newFlujo = { ...flujo, slas: newSlas };
                          setConfig({ ...config, flujo: newFlujo });
                        }}
                        className="w-full px-2 py-1 text-xs bg-secondary-600 border border-secondary-500 text-white rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Sin límite"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-300 mb-1">Alertar al 80%</label>
                      <label className="flex items-center mt-1">
                        <input
                          type="checkbox"
                          checked={sla?.alertarAl80 || false}
                          onChange={(e) => {
                            const newSlas = (flujo.slas || []).filter(
                              (s) => s.estadoId !== estado.id
                            );
                            if (sla?.horas || e.target.checked) {
                              newSlas.push({
                                estadoId: estado.id,
                                horas: sla?.horas || 24,
                                alertarAl80: e.target.checked,
                              });
                            }
                            const newFlujo = { ...flujo, slas: newSlas };
                            setConfig({ ...config, flujo: newFlujo });
                          }}
                          className="rounded border-secondary-500 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                        <span className="ml-1 text-xs text-gray-400">Sí</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => saveConfiguration("flujo", flujo)}
            disabled={saving}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    );
  };

  const renderNotificacionesConfig = () => {
    if (!config?.notificaciones) {
      return (
        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="text-center py-6">
            <CogIcon className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              Cargando configuración de notificaciones...
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Por favor espere mientras se cargan los datos.
            </p>
          </div>
        </div>
      );
    }

    const notificaciones = config.notificaciones;
    const eventosDisponibles: { evento: EventoNoti; descripcion: string }[] = [
      { evento: "sla.porVencer", descripcion: "SLA por vencer (80%)" },
      { evento: "sla.vencido", descripcion: "SLA vencido" },
      { evento: "ot.cambioEstado", descripcion: "Cambio de estado en OT" },
      { evento: "cita.creada", descripcion: "Nueva cita programada" },
      { evento: "cita.proxima", descripcion: "Cita próxima (recordatorio)" },
      { evento: "cotizacion.aprobada", descripcion: "Cotización aprobada" },
      { evento: "cotizacion.rechazada", descripcion: "Cotización rechazada" },
      { evento: "evidencia.subida", descripcion: "Nueva evidencia subida" },
    ];

    const rolesDisponibles: Rol[] = ["ADMIN", "RECEPCION", "TECNICO", "AUDITOR", "INVITADO"];

    return (
      <div className="space-y-4">
        {/* Configuración de Eventos */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Eventos de Notificación</h3>

          <div className="space-y-3">
            {eventosDisponibles.map(({ evento, descripcion }) => {
              const config_evento = notificaciones.eventos.find((e) => e.evento === evento);
              return (
                <div key={evento} className="bg-secondary-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-white">{descripcion}</span>
                      <span className="block text-xs text-gray-400 font-mono">{evento}</span>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config_evento?.activo || false}
                        onChange={(e) => {
                          const newEventos = notificaciones.eventos.filter(
                            (ev) => ev.evento !== evento
                          );
                          if (e.target.checked) {
                            newEventos.push({
                              evento,
                              activo: true,
                              modo: "inmediata",
                            });
                          }
                          const newNotificaciones = { ...notificaciones, eventos: newEventos };
                          setConfig({ ...config, notificaciones: newNotificaciones });
                        }}
                        className="rounded border-secondary-500 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-xs text-gray-300">Activo</span>
                    </label>
                  </div>

                  {config_evento?.activo && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Modo</label>
                        <select
                          value={config_evento.modo}
                          onChange={(e) => {
                            const newEventos = notificaciones.eventos.map((ev) =>
                              ev.evento === evento
                                ? { ...ev, modo: e.target.value as "inmediata" | "digest" }
                                : ev
                            );
                            const newNotificaciones = { ...notificaciones, eventos: newEventos };
                            setConfig({ ...config, notificaciones: newNotificaciones });
                          }}
                          className="w-full px-2 py-1 text-xs bg-secondary-600 border border-secondary-500 text-white rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="inmediata">Inmediata</option>
                          <option value="digest">Resumen</option>
                        </select>
                      </div>

                      {config_evento.modo === "digest" && (
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">Cada (horas)</label>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={config_evento.cadaHoras || 4}
                            onChange={(e) => {
                              const newEventos = notificaciones.eventos.map((ev) =>
                                ev.evento === evento
                                  ? { ...ev, cadaHoras: Number(e.target.value) }
                                  : ev
                              );
                              const newNotificaciones = { ...notificaciones, eventos: newEventos };
                              setConfig({ ...config, notificaciones: newNotificaciones });
                            }}
                            className="w-full px-2 py-1 text-xs bg-secondary-600 border border-secondary-500 text-white rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* No Molestar (DND) */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">
            Horarios Sin Notificaciones (DND)
          </h3>

          <div className="space-y-3">
            {rolesDisponibles.map((rol) => {
              const dnd = notificaciones.dnd.find((d) => d.rol === rol);
              return (
                <div key={rol} className="bg-secondary-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{rol}</span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!!dnd}
                        onChange={(e) => {
                          const newDnd = notificaciones.dnd.filter((d) => d.rol !== rol);
                          if (e.target.checked) {
                            newDnd.push({ rol, desde: "22:00", hasta: "06:00" });
                          }
                          const newNotificaciones = { ...notificaciones, dnd: newDnd };
                          setConfig({ ...config, notificaciones: newNotificaciones });
                        }}
                        className="rounded border-secondary-500 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-xs text-gray-300">Configurar DND</span>
                    </label>
                  </div>

                  {dnd && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Desde</label>
                        <input
                          type="time"
                          value={dnd.desde}
                          onChange={(e) => {
                            const newDnd = notificaciones.dnd.map((d) =>
                              d.rol === rol ? { ...d, desde: e.target.value } : d
                            );
                            const newNotificaciones = { ...notificaciones, dnd: newDnd };
                            setConfig({ ...config, notificaciones: newNotificaciones });
                          }}
                          className="w-full px-2 py-1 text-xs bg-secondary-600 border border-secondary-500 text-white rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Hasta</label>
                        <input
                          type="time"
                          value={dnd.hasta}
                          onChange={(e) => {
                            const newDnd = notificaciones.dnd.map((d) =>
                              d.rol === rol ? { ...d, hasta: e.target.value } : d
                            );
                            const newNotificaciones = { ...notificaciones, dnd: newDnd };
                            setConfig({ ...config, notificaciones: newNotificaciones });
                          }}
                          className="w-full px-2 py-1 text-xs bg-secondary-600 border border-secondary-500 text-white rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => saveConfiguration("notificaciones", notificaciones)}
            disabled={saving}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    );
  };

  const renderEvidenciasConfig = () => {
    if (!config?.evidencias) {
      return (
        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="text-center py-6">
            <CogIcon className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              Cargando configuración de evidencias...
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Por favor espere mientras se cargan los datos.
            </p>
          </div>
        </div>
      );
    }

    const evidencias = config.evidencias;
    const formatosDisponibles = ["jpg", "jpeg", "png", "webp", "mp4", "mov", "avi"];

    return (
      <div className="space-y-4">
        {/* Configuración General */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Configuración General</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Tamaño Máximo (MB)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                step="0.1"
                value={evidencias.tamanioMaxMB}
                onChange={(e) => {
                  const newEvidencias = { ...evidencias, tamanioMaxMB: Number(e.target.value) };
                  setConfig({ ...config, evidencias: newEvidencias });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Retención (meses)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={evidencias.retencionMeses}
                onChange={(e) => {
                  const newEvidencias = { ...evidencias, retencionMeses: Number(e.target.value) };
                  setConfig({ ...config, evidencias: newEvidencias });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Privacidad por Defecto
              </label>
              <select
                value={evidencias.privacidadPorDefecto}
                onChange={(e) => {
                  const newEvidencias = {
                    ...evidencias,
                    privacidadPorDefecto: e.target.value as "interna" | "cliente",
                  };
                  setConfig({ ...config, evidencias: newEvidencias });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="interna">Solo Interna</option>
                <option value="cliente">Mostrable al Cliente</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-300">Opciones</label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={evidencias.compresionAuto}
                    onChange={(e) => {
                      const newEvidencias = { ...evidencias, compresionAuto: e.target.checked };
                      setConfig({ ...config, evidencias: newEvidencias });
                    }}
                    className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-xs text-gray-300">Compresión automática</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={evidencias.selloAgua}
                    onChange={(e) => {
                      const newEvidencias = { ...evidencias, selloAgua: e.target.checked };
                      setConfig({ ...config, evidencias: newEvidencias });
                    }}
                    className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-xs text-gray-300">Sello de agua (logo)</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={evidencias.gps}
                    onChange={(e) => {
                      const newEvidencias = { ...evidencias, gps: e.target.checked };
                      setConfig({ ...config, evidencias: newEvidencias });
                    }}
                    className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-xs text-gray-300">Guardar coordenadas GPS</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Formatos Permitidos */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Formatos Permitidos</h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {formatosDisponibles.map((formato) => (
              <label key={formato} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={evidencias.formatosPermitidos.includes(formato)}
                  onChange={(e) => {
                    const newFormatos = e.target.checked
                      ? [...evidencias.formatosPermitidos, formato]
                      : evidencias.formatosPermitidos.filter((f) => f !== formato);
                    const newEvidencias = { ...evidencias, formatosPermitidos: newFormatos };
                    setConfig({ ...config, evidencias: newEvidencias });
                  }}
                  className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <span className="text-xs text-gray-300 font-mono uppercase">{formato}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Requerimientos por Estado */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Fotos Requeridas por Estado</h3>

          <div className="space-y-3">
            {config.flujo?.estados.map((estado) => {
              const requerimiento = evidencias.requeridasPorEstado.find(
                (r) => r.estadoId === estado.id
              );
              return (
                <div key={estado.id} className="bg-secondary-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: estado.color || "#6b7280" }}
                      />
                      <span className="text-sm text-white font-medium">{estado.nombre}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-300">Mín. fotos:</span>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={requerimiento?.minFotos || 0}
                        onChange={(e) => {
                          const minFotos = Number(e.target.value);
                          const newRequerimientos = evidencias.requeridasPorEstado.filter(
                            (r) => r.estadoId !== estado.id
                          );
                          if (minFotos > 0) {
                            newRequerimientos.push({ estadoId: estado.id, minFotos });
                          }
                          const newEvidencias = {
                            ...evidencias,
                            requeridasPorEstado: newRequerimientos,
                          };
                          setConfig({ ...config, evidencias: newEvidencias });
                        }}
                        className="w-16 px-2 py-1 text-xs bg-secondary-600 border border-secondary-500 text-white rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              );
            }) || <p className="text-xs text-gray-400">Configure primero los estados del flujo</p>}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => saveConfiguration("evidencias", evidencias)}
            disabled={saving}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    );
  };

  const renderInterfazConfig = () => {
    if (!config?.interfaz) {
      return (
        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="text-center py-6">
            <CogIcon className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              Cargando configuración de interfaz...
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Por favor espere mientras se cargan los datos.
            </p>
          </div>
        </div>
      );
    }

    const interfaz = config.interfaz;
    const widgetsDisponibles = [
      { id: "totalOrdenes", nombre: "Total de Órdenes" },
      { id: "ordenesHoy", nombre: "Órdenes de Hoy" },
      { id: "citasHoy", nombre: "Citas de Hoy" },
      { id: "ingresos", nombre: "Ingresos del Mes" },
      { id: "vehiculosEnTaller", nombre: "Vehículos en Taller" },
      { id: "tecnicos", nombre: "Técnicos Activos" },
      { id: "pendienteAprobacion", nombre: "Pendientes de Aprobación" },
      { id: "slaVencidos", nombre: "SLA Vencidos" },
    ];

    return (
      <div className="space-y-4">
        {/* Apariencia General */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Apariencia General</h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Tema</label>
              <select
                value={interfaz.tema}
                onChange={(e) => {
                  const newInterfaz = { ...interfaz, tema: e.target.value as "dark" | "light" };
                  setConfig({ ...config, interfaz: newInterfaz });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="dark">Oscuro</option>
                <option value="light">Claro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Densidad</label>
              <select
                value={interfaz.densidad}
                onChange={(e) => {
                  const newInterfaz = {
                    ...interfaz,
                    densidad: e.target.value as "compacta" | "normal",
                  };
                  setConfig({ ...config, interfaz: newInterfaz });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="normal">Normal</option>
                <option value="compacta">Compacta</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Color Primario</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={interfaz.colorPrimario || "#3b82f6"}
                  onChange={(e) => {
                    const newInterfaz = { ...interfaz, colorPrimario: e.target.value };
                    setConfig({ ...config, interfaz: newInterfaz });
                  }}
                  className="h-8 w-16 border border-secondary-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={interfaz.colorPrimario || "#3b82f6"}
                  onChange={(e) => {
                    const newInterfaz = { ...interfaz, colorPrimario: e.target.value };
                    setConfig({ ...config, interfaz: newInterfaz });
                  }}
                  className="flex-1 px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Widgets del Dashboard */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Widgets del Dashboard</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {widgetsDisponibles.map((widget) => (
              <label key={widget.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={interfaz.homeWidgets.includes(widget.id)}
                  onChange={(e) => {
                    const newWidgets = e.target.checked
                      ? [...interfaz.homeWidgets, widget.id]
                      : interfaz.homeWidgets.filter((w) => w !== widget.id);
                    const newInterfaz = { ...interfaz, homeWidgets: newWidgets };
                    setConfig({ ...config, interfaz: newInterfaz });
                  }}
                  className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <span className="text-xs text-gray-300">{widget.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Configuración de Tablas */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Columnas Visibles en Tablas</h3>

          <div className="space-y-3">
            {Object.entries(interfaz.tablas).map(([modulo, config_tabla]) => (
              <div key={modulo} className="bg-secondary-700 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-2 capitalize">{modulo}</h4>
                <div className="flex flex-wrap gap-2">
                  {config_tabla.columnasVisibles.map((columna) => (
                    <span
                      key={columna}
                      className="px-2 py-1 text-xs bg-primary-600/20 text-primary-400 rounded border border-primary-600/30"
                    >
                      {columna}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accesibilidad */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Accesibilidad</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Tamaño de Fuente Base (px)
              </label>
              <input
                type="number"
                min="10"
                max="24"
                value={interfaz.accesibilidad.fuenteBasePx}
                onChange={(e) => {
                  const newAccesibilidad = {
                    ...interfaz.accesibilidad,
                    fuenteBasePx: Number(e.target.value),
                  };
                  const newInterfaz = { ...interfaz, accesibilidad: newAccesibilidad };
                  setConfig({ ...config, interfaz: newInterfaz });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Alto Contraste</label>
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={interfaz.accesibilidad.altoContraste}
                  onChange={(e) => {
                    const newAccesibilidad = {
                      ...interfaz.accesibilidad,
                      altoContraste: e.target.checked,
                    };
                    const newInterfaz = { ...interfaz, accesibilidad: newAccesibilidad };
                    setConfig({ ...config, interfaz: newInterfaz });
                  }}
                  className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <span className="ml-2 text-xs text-gray-300">Activar alto contraste</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => saveConfiguration("interfaz", interfaz)}
            disabled={saving}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    );
  };

  const renderAgendaConfig = () => {
    if (!config?.agenda) {
      return (
        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="text-center py-6">
            <CogIcon className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              Cargando configuración de agenda...
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Por favor espere mientras se cargan los datos.
            </p>
          </div>
        </div>
      );
    }

    const agenda = config.agenda;

    return (
      <div className="space-y-4">
        {/* Horarios de Atención */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Horarios de Atención</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {agenda.horarios.map((horario, index) => (
              <div key={horario.dia} className="bg-secondary-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{horario.dia}</span>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={horario.activo}
                      onChange={(e) => {
                        const newHorarios = [...agenda.horarios];
                        newHorarios[index] = { ...horario, activo: e.target.checked };
                        const newAgenda = { ...agenda, horarios: newHorarios };
                        setConfig({ ...config, agenda: newAgenda });
                      }}
                      className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-xs text-gray-300">Activo</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Apertura</label>
                    <input
                      type="time"
                      value={horario.apertura}
                      onChange={(e) => {
                        const newHorarios = [...agenda.horarios];
                        newHorarios[index] = { ...horario, apertura: e.target.value };
                        const newAgenda = { ...agenda, horarios: newHorarios };
                        setConfig({ ...config, agenda: newAgenda });
                      }}
                      className="w-full px-2 py-1 text-xs bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Cierre</label>
                    <input
                      type="time"
                      value={horario.cierre}
                      onChange={(e) => {
                        const newHorarios = [...agenda.horarios];
                        newHorarios[index] = { ...horario, cierre: e.target.value };
                        const newAgenda = { ...agenda, horarios: newHorarios };
                        setConfig({ ...config, agenda: newAgenda });
                      }}
                      className="w-full px-2 py-1 text-xs bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de Cita */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Tipos de Cita</h3>

          <div className="space-y-2">
            {agenda.tiposCita.map((tipo, index) => (
              <div key={index} className="bg-secondary-700 rounded-lg p-3">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={tipo.nombre}
                      onChange={(e) => {
                        const newTipos = [...agenda.tiposCita];
                        newTipos[index] = { ...tipo, nombre: e.target.value };
                        const newAgenda = { ...agenda, tiposCita: newTipos };
                        setConfig({ ...config, agenda: newAgenda });
                      }}
                      className="w-full px-2 py-1.5 text-sm bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Duración (min)</label>
                    <input
                      type="number"
                      value={tipo.duracionMinutos}
                      onChange={(e) => {
                        const newTipos = [...agenda.tiposCita];
                        newTipos[index] = { ...tipo, duracionMinutos: Number(e.target.value) };
                        const newAgenda = { ...agenda, tiposCita: newTipos };
                        setConfig({ ...config, agenda: newAgenda });
                      }}
                      className="w-full px-2 py-1.5 text-sm bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={tipo.color}
                      onChange={(e) => {
                        const newTipos = [...agenda.tiposCita];
                        newTipos[index] = { ...tipo, color: e.target.value };
                        const newAgenda = { ...agenda, tiposCita: newTipos };
                        setConfig({ ...config, agenda: newAgenda });
                      }}
                      className="w-full h-9 border border-secondary-500 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Precio Base ($)</label>
                    <input
                      type="number"
                      value={tipo.precioBase}
                      onChange={(e) => {
                        const newTipos = [...agenda.tiposCita];
                        newTipos[index] = { ...tipo, precioBase: Number(e.target.value) };
                        const newAgenda = { ...agenda, tiposCita: newTipos };
                        setConfig({ ...config, agenda: newAgenda });
                      }}
                      className="w-full px-2 py-1.5 text-sm bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuraciones Generales */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Configuraciones Generales</h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Intervalo de Citas (minutos)
              </label>
              <select
                value={agenda.intervaloMinutos}
                onChange={(e) => {
                  const newAgenda = { ...agenda, intervaloMinutos: Number(e.target.value) };
                  setConfig({ ...config, agenda: newAgenda });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Anticipación Mínima (horas)
              </label>
              <input
                type="number"
                min="1"
                value={agenda.anticipacionMinimaHoras}
                onChange={(e) => {
                  const newAgenda = { ...agenda, anticipacionMinimaHoras: Number(e.target.value) };
                  setConfig({ ...config, agenda: newAgenda });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Máximo Citas por Día
              </label>
              <input
                type="number"
                min="1"
                value={agenda.maxCitasPorDia}
                onChange={(e) => {
                  const newAgenda = { ...agenda, maxCitasPorDia: Number(e.target.value) };
                  setConfig({ ...config, agenda: newAgenda });
                }}
                className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Recordatorios */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">Recordatorios</h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {agenda.recordatorios.map((recordatorio, index) => (
              <div key={recordatorio.tipo} className="bg-secondary-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white capitalize">
                    {recordatorio.tipo}
                  </span>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={recordatorio.activo}
                      onChange={(e) => {
                        const newRecordatorios = [...agenda.recordatorios];
                        newRecordatorios[index] = { ...recordatorio, activo: e.target.checked };
                        const newAgenda = { ...agenda, recordatorios: newRecordatorios };
                        setConfig({ ...config, agenda: newAgenda });
                      }}
                      className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-xs text-gray-300">Activo</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Horas antes</label>
                  <input
                    type="number"
                    min="1"
                    value={recordatorio.horasAntes}
                    onChange={(e) => {
                      const newRecordatorios = [...agenda.recordatorios];
                      newRecordatorios[index] = {
                        ...recordatorio,
                        horasAntes: Number(e.target.value),
                      };
                      const newAgenda = { ...agenda, recordatorios: newRecordatorios };
                      setConfig({ ...config, agenda: newAgenda });
                    }}
                    className="w-full px-2 py-1 text-xs bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => saveConfiguration("agenda", agenda)}
            disabled={saving}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    );
  };

  const renderPlantillasConfig = () => {
    if (!config?.plantillas) {
      return (
        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="text-center py-6">
            <CogIcon className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              Cargando configuración de plantillas...
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Por favor espere mientras se cargan los datos.
            </p>
          </div>
        </div>
      );
    }

    const plantillas = config.plantillas;

    return (
      <div className="space-y-4">
        {/* Plantillas de Documentos */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">📄 Plantillas de Documentos</h3>

          <div className="space-y-3">
            {plantillas.documentos.map((plantilla, index) => (
              <div key={plantilla.tipo} className="bg-secondary-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-white">{plantilla.nombre}</h4>
                    <p className="text-xs text-gray-400">{plantilla.descripcion}</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={plantilla.activa}
                      onChange={(e) => {
                        const newDocumentos = [...plantillas.documentos];
                        newDocumentos[index] = { ...plantilla, activa: e.target.checked };
                        const newPlantillas = { ...plantillas, documentos: newDocumentos };
                        setConfig({ ...config, plantillas: newPlantillas });
                      }}
                      className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-xs text-gray-300">Activa</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Encabezado</label>
                    <textarea
                      value={plantilla.encabezado}
                      onChange={(e) => {
                        const newDocumentos = [...plantillas.documentos];
                        newDocumentos[index] = { ...plantilla, encabezado: e.target.value };
                        const newPlantillas = { ...plantillas, documentos: newDocumentos };
                        setConfig({ ...config, plantillas: newPlantillas });
                      }}
                      rows={3}
                      className="w-full px-2 py-1.5 text-sm bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Texto del encabezado..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Pie de Página</label>
                    <textarea
                      value={plantilla.piePagina}
                      onChange={(e) => {
                        const newDocumentos = [...plantillas.documentos];
                        newDocumentos[index] = { ...plantilla, piePagina: e.target.value };
                        const newPlantillas = { ...plantillas, documentos: newDocumentos };
                        setConfig({ ...config, plantillas: newPlantillas });
                      }}
                      rows={3}
                      className="w-full px-2 py-1.5 text-sm bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Texto del pie de página..."
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs text-gray-400 mb-1">Contenido Principal</label>
                  <textarea
                    value={plantilla.contenido}
                    onChange={(e) => {
                      const newDocumentos = [...plantillas.documentos];
                      newDocumentos[index] = { ...plantilla, contenido: e.target.value };
                      const newPlantillas = { ...plantillas, documentos: newDocumentos };
                      setConfig({ ...config, plantillas: newPlantillas });
                    }}
                    rows={5}
                    className="w-full px-2 py-1.5 text-sm bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Contenido de la plantilla. Use variables como {cliente.nombre}, {vehiculo.placa}, {orden.numero}..."
                  />
                </div>

                {/* Variables Disponibles */}
                <div className="mt-3 p-2 bg-secondary-600 rounded border">
                  <p className="text-xs font-medium text-gray-300 mb-1">Variables Disponibles:</p>
                  <div className="flex flex-wrap gap-1">
                    {plantilla.variablesDisponibles.map((variable) => (
                      <span
                        key={variable}
                        className="px-1.5 py-0.5 text-xs bg-primary-600/20 text-primary-400 rounded border border-primary-600/30"
                      >
                        {`{${variable}}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plantillas de Email */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">📧 Plantillas de Email</h3>

          <div className="space-y-3">
            {plantillas.emails.map((email, index) => (
              <div key={email.tipo} className="bg-secondary-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-white">{email.nombre}</h4>
                    <p className="text-xs text-gray-400">{email.descripcion}</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={email.activo}
                      onChange={(e) => {
                        const newEmails = [...plantillas.emails];
                        newEmails[index] = { ...email, activo: e.target.checked };
                        const newPlantillas = { ...plantillas, emails: newEmails };
                        setConfig({ ...config, plantillas: newPlantillas });
                      }}
                      className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-xs text-gray-300">Activo</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Asunto</label>
                    <input
                      type="text"
                      value={email.asunto}
                      onChange={(e) => {
                        const newEmails = [...plantillas.emails];
                        newEmails[index] = { ...email, asunto: e.target.value };
                        const newPlantillas = { ...plantillas, emails: newEmails };
                        setConfig({ ...config, plantillas: newPlantillas });
                      }}
                      className="w-full px-2 py-1.5 text-sm bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Asunto del email..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Remitente</label>
                    <input
                      type="email"
                      value={email.remitente}
                      onChange={(e) => {
                        const newEmails = [...plantillas.emails];
                        newEmails[index] = { ...email, remitente: e.target.value };
                        const newPlantillas = { ...plantillas, emails: newEmails };
                        setConfig({ ...config, plantillas: newPlantillas });
                      }}
                      className="w-full px-2 py-1.5 text-sm bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="taller@empresa.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Contenido HTML</label>
                  <textarea
                    value={email.contenidoHtml}
                    onChange={(e) => {
                      const newEmails = [...plantillas.emails];
                      newEmails[index] = { ...email, contenidoHtml: e.target.value };
                      const newPlantillas = { ...plantillas, emails: newEmails };
                      setConfig({ ...config, plantillas: newPlantillas });
                    }}
                    rows={6}
                    className="w-full px-2 py-1.5 text-sm bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="<h1>Hola {cliente.nombre}</h1><p>Su orden {orden.numero} está lista...</p>"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plantillas de SMS */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">📱 Plantillas de SMS</h3>

          <div className="space-y-3">
            {plantillas.sms.map((sms, index) => (
              <div key={sms.tipo} className="bg-secondary-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-white">{sms.nombre}</h4>
                    <p className="text-xs text-gray-400">{sms.descripcion}</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sms.activo}
                      onChange={(e) => {
                        const newSms = [...plantillas.sms];
                        newSms[index] = { ...sms, activo: e.target.checked };
                        const newPlantillas = { ...plantillas, sms: newSms };
                        setConfig({ ...config, plantillas: newPlantillas });
                      }}
                      className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-xs text-gray-300">Activo</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Mensaje ({sms.mensaje.length}/160 caracteres)
                  </label>
                  <textarea
                    value={sms.mensaje}
                    onChange={(e) => {
                      const newSms = [...plantillas.sms];
                      newSms[index] = { ...sms, mensaje: e.target.value };
                      const newPlantillas = { ...plantillas, sms: newSms };
                      setConfig({ ...config, plantillas: newPlantillas });
                    }}
                    rows={3}
                    maxLength={160}
                    className="w-full px-2 py-1.5 text-sm bg-secondary-600 border border-secondary-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Hola {cliente.nombre}, su vehículo {vehiculo.placa} está listo..."
                  />
                  <div className="mt-1 flex justify-between">
                    <p className="text-xs text-gray-500">
                      Variables: &#123;cliente.nombre&#125;, &#123;vehiculo.placa&#125;,
                      &#123;orden.numero&#125;
                    </p>
                    <p
                      className={`text-xs ${
                        sms.mensaje.length > 160 ? "text-red-400" : "text-gray-500"
                      }`}
                    >
                      {sms.mensaje.length}/160
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => saveConfiguration("plantillas", plantillas)}
            disabled={saving}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    );
  };

  const renderRespaldosConfig = () => {
    if (!config?.backup) {
      return (
        <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
          <div className="text-center py-6">
            <CogIcon className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              Cargando configuración de respaldos...
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Por favor espere mientras se cargan los datos.
            </p>
          </div>
        </div>
      );
    }

    const backup = config.backup;

    const runBackup = async () => {
      try {
        setBackupRunning(true);
        setBackupProgress(0);

        const response = await fetch("/api/backup/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
          // Start polling for progress
          const pollInterval = setInterval(async () => {
            try {
              const logsResponse = await fetch("/api/backup/logs");
              const logsResult = await logsResponse.json();

              if (logsResult.success && logsResult.data.length > 0) {
                const latestLog = logsResult.data[0];
                setBackupLogs(logsResult.data);

                if (latestLog.estado === "completado" || latestLog.estado === "error") {
                  setBackupRunning(false);
                  setBackupProgress(100);
                  clearInterval(pollInterval);
                  setBackupPolling(null);
                }
              }
            } catch (error) {
              console.error("Error polling backup status:", error);
            }
          }, 2000);

          setBackupPolling(pollInterval);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Error running backup:", error);
        setBackupRunning(false);
      }
    };

    const downloadBackup = async (backupId: string) => {
      try {
        const response = await fetch(`/api/backup/download/${backupId}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `backup-${backupId}.tar.gz`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } catch (error) {
        console.error("Error downloading backup:", error);
      }
    };

    return (
      <div className="space-y-4">
        {/* Ámbito del Respaldo */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">🎯 Ámbito del Respaldo</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Base de Datos</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={backup.incluirDatos}
                    onChange={(e) => {
                      const newBackup = { ...backup, incluirDatos: e.target.checked };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-xs text-gray-300">Datos de la aplicación</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={backup.incluirEsquema}
                    onChange={(e) => {
                      const newBackup = { ...backup, incluirEsquema: e.target.checked };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-xs text-gray-300">Estructura de tablas</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Archivos</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={backup.incluirUploads}
                    onChange={(e) => {
                      const newBackup = { ...backup, incluirUploads: e.target.checked };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-xs text-gray-300">
                    Carpeta de uploads (evidencias)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={backup.incluirPlantillas}
                    onChange={(e) => {
                      const newBackup = { ...backup, incluirPlantillas: e.target.checked };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-xs text-gray-300">Plantillas personalizadas</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={backup.incluirConfiguracion}
                    onChange={(e) => {
                      const newBackup = { ...backup, incluirConfiguracion: e.target.checked };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-xs text-gray-300">Configuración del sistema</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Programación */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">⏰ Programación Automática</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={backup.habilitado}
                  onChange={(e) => {
                    const newBackup = { ...backup, habilitado: e.target.checked };
                    setConfig({ ...config, backup: newBackup });
                  }}
                  className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-white font-medium">
                  Habilitar respaldos automáticos
                </span>
              </label>

              {backup.habilitado && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Frecuencia
                    </label>
                    <select
                      value={backup.frecuencia}
                      onChange={(e) => {
                        const newBackup = { ...backup, frecuencia: e.target.value as any };
                        setConfig({ ...config, backup: newBackup });
                      }}
                      className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Hora de ejecución
                    </label>
                    <input
                      type="time"
                      value={backup.hora}
                      onChange={(e) => {
                        const newBackup = { ...backup, hora: e.target.value };
                        setConfig({ ...config, backup: newBackup });
                      }}
                      className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {backup.frecuencia === "semanal" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Día de la semana
                      </label>
                      <select
                        value={backup.diaSemana || 0}
                        onChange={(e) => {
                          const newBackup = { ...backup, diaSemana: Number(e.target.value) };
                          setConfig({ ...config, backup: newBackup });
                        }}
                        className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value={0}>Domingo</option>
                        <option value={1}>Lunes</option>
                        <option value={2}>Martes</option>
                        <option value={3}>Miércoles</option>
                        <option value={4}>Jueves</option>
                        <option value={5}>Viernes</option>
                        <option value={6}>Sábado</option>
                      </select>
                    </div>
                  )}

                  {backup.frecuencia === "mensual" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Día del mes
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="28"
                        value={backup.diaMes || 1}
                        onChange={(e) => {
                          const newBackup = { ...backup, diaMes: Number(e.target.value) };
                          setConfig({ ...config, backup: newBackup });
                        }}
                        className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Retención</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Mantener respaldos por (días)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={backup.retencionDias}
                    onChange={(e) => {
                      const newBackup = { ...backup, retencionDias: Number(e.target.value) };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Máximo número de respaldos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={backup.maxRespaldos}
                    onChange={(e) => {
                      const newBackup = { ...backup, maxRespaldos: Number(e.target.value) };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Destino */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">💾 Destino de Almacenamiento</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Tipo de destino
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <label className="flex items-center p-3 border border-secondary-600 rounded-lg cursor-pointer hover:border-primary-500">
                  <input
                    type="radio"
                    name="tipoDestino"
                    value="local"
                    checked={backup.tipoDestino === "local"}
                    onChange={(e) => {
                      const newBackup = { ...backup, tipoDestino: e.target.value as any };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="text-primary-600 focus:ring-primary-500 border-secondary-600"
                  />
                  <div className="ml-3">
                    <ComputerDesktopIcon className="h-5 w-5 text-gray-400 mb-1" />
                    <div className="text-sm text-white">Local</div>
                    <div className="text-xs text-gray-400">Servidor local</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-secondary-600 rounded-lg cursor-pointer hover:border-primary-500">
                  <input
                    type="radio"
                    name="tipoDestino"
                    value="s3"
                    checked={backup.tipoDestino === "s3"}
                    onChange={(e) => {
                      const newBackup = { ...backup, tipoDestino: e.target.value as any };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="text-primary-600 focus:ring-primary-500 border-secondary-600"
                  />
                  <div className="ml-3">
                    <CloudIcon className="h-5 w-5 text-gray-400 mb-1" />
                    <div className="text-sm text-white">AWS S3</div>
                    <div className="text-xs text-gray-400">Nube Amazon</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-secondary-600 rounded-lg cursor-pointer hover:border-primary-500">
                  <input
                    type="radio"
                    name="tipoDestino"
                    value="minio"
                    checked={backup.tipoDestino === "minio"}
                    onChange={(e) => {
                      const newBackup = { ...backup, tipoDestino: e.target.value as any };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="text-primary-600 focus:ring-primary-500 border-secondary-600"
                  />
                  <div className="ml-3">
                    <CloudIcon className="h-5 w-5 text-gray-400 mb-1" />
                    <div className="text-sm text-white">MinIO</div>
                    <div className="text-xs text-gray-400">S3 Compatible</div>
                  </div>
                </label>
              </div>
            </div>

            {backup.tipoDestino === "local" && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Ruta de almacenamiento
                </label>
                <input
                  type="text"
                  value={backup.rutaLocal || ""}
                  onChange={(e) => {
                    const newBackup = { ...backup, rutaLocal: e.target.value };
                    setConfig({ ...config, backup: newBackup });
                  }}
                  className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="/var/backups/taller"
                />
              </div>
            )}

            {(backup.tipoDestino === "s3" || backup.tipoDestino === "minio") && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Endpoint (MinIO) / Región (S3)
                  </label>
                  <input
                    type="text"
                    value={backup.s3Endpoint || ""}
                    onChange={(e) => {
                      const newBackup = { ...backup, s3Endpoint: e.target.value };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="us-east-1 o http://minio:9000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Bucket</label>
                  <input
                    type="text"
                    value={backup.s3Bucket || ""}
                    onChange={(e) => {
                      const newBackup = { ...backup, s3Bucket: e.target.value };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="taller-backups"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Access Key</label>
                  <input
                    type="text"
                    value={backup.s3AccessKey || ""}
                    onChange={(e) => {
                      const newBackup = { ...backup, s3AccessKey: e.target.value };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Secret Key</label>
                  <input
                    type="password"
                    value={backup.s3SecretKey || ""}
                    onChange={(e) => {
                      const newBackup = { ...backup, s3SecretKey: e.target.value };
                      setConfig({ ...config, backup: newBackup });
                    }}
                    className="w-full px-2 py-1.5 text-sm bg-secondary-700 border border-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={backup.encriptar}
                  onChange={(e) => {
                    const newBackup = { ...backup, encriptar: e.target.checked };
                    setConfig({ ...config, backup: newBackup });
                  }}
                  className="rounded border-secondary-600 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-white">Encriptar respaldos (AES-256)</span>
              </label>
              <p className="mt-1 text-xs text-gray-400">
                Los respaldos se encriptarán antes de almacenarse
              </p>
            </div>

            {/* Botón para probar conexión */}
            <div className="mt-4">
              <button
                onClick={async () => {
                  try {
                    const testConfig = {
                      tipoDestino: backup.tipoDestino,
                      config: {
                        rutaLocal: backup.rutaLocal,
                        s3Endpoint: backup.s3Endpoint,
                        s3Bucket: backup.s3Bucket,
                        s3AccessKey: backup.s3AccessKey,
                        s3SecretKey: backup.s3SecretKey,
                      },
                    };

                    const response = await fetch("/api/backup/test-connection", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(testConfig),
                    });

                    const result = await response.json();

                    if (result.success) {
                      if (result.data.conectado) {
                        alert(
                          `✅ ${result.data.mensaje}\n\nDetalles: ${JSON.stringify(
                            result.data.detalles,
                            null,
                            2
                          )}`
                        );
                      } else {
                        alert(
                          `❌ ${result.data.mensaje}\n\nDetalles: ${JSON.stringify(
                            result.data.detalles,
                            null,
                            2
                          )}`
                        );
                      }
                    } else {
                      alert(`Error: ${result.error}`);
                    }
                  } catch (error) {
                    alert(`Error de conexión: ${error}`);
                  }
                }}
                className="inline-flex items-center px-3 py-1.5 border border-blue-600 rounded-lg shadow-sm text-xs font-medium text-blue-300 bg-blue-900/20 hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CheckCircleIcon className="h-3 w-3 mr-2" />
                Probar Conexión
              </button>
            </div>
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">📊 Estado del Sistema</h3>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-secondary-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary-400">
                {backupLogs.filter((log) => log.estado === "completado").length}
              </div>
              <div className="text-xs text-gray-400">Respaldos Exitosos</div>
            </div>

            <div className="bg-secondary-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400">
                {backupLogs.filter((log) => log.estado === "error").length}
              </div>
              <div className="text-xs text-gray-400">Respaldos Fallidos</div>
            </div>

            <div className="bg-secondary-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {backupLogs.filter((log) => log.estado === "en_progreso").length}
              </div>
              <div className="text-xs text-gray-400">En Progreso</div>
            </div>

            <div className="bg-secondary-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-300">
                {backupLogs.length > 0
                  ? new Date(backupLogs[0].fechaCreacion).toLocaleDateString()
                  : "N/A"}
              </div>
              <div className="text-xs text-gray-400">Último Respaldo</div>
            </div>
          </div>

          {backupLogs.length > 0 && backupLogs[0].estado === "completado" && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <span className="text-sm text-green-300">
                  Último respaldo exitoso: {new Date(backupLogs[0].fechaCreacion).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {backupLogs.length > 0 && backupLogs[0].estado === "error" && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <span className="text-sm text-red-300">
                  Error en último respaldo: {backupLogs[0].error || "Error desconocido"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">🎬 Acciones</h3>

          <div className="flex items-center space-x-3">
            <button
              onClick={runBackup}
              disabled={backupRunning}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {backupRunning ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Ejecutando...
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Ejecutar Respaldo Ahora
                </>
              )}
            </button>

            <button
              onClick={() => saveConfiguration("backup", backup)}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-secondary-700 hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>

          {backupRunning && (
            <div className="mt-4 p-3 bg-secondary-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white">Progreso del respaldo</span>
                <span className="text-xs text-gray-400">{backupProgress}%</span>
              </div>
              <div className="w-full bg-secondary-600 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${backupProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bitácora */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">📋 Bitácora de Respaldos</h3>

          <div className="space-y-3">
            {backupLogs.length === 0 ? (
              <div className="text-center py-6">
                <DocumentDuplicateIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-400">No hay respaldos registrados</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {backupLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-secondary-700 rounded-lg border border-secondary-600"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {log.estado === "completado" && (
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        )}
                        {log.estado === "error" && (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                        )}
                        {log.estado === "en_progreso" && (
                          <ArrowPathIcon className="h-5 w-5 text-blue-400 animate-spin" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-white">Respaldo #{log.id}</span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              log.estado === "completado"
                                ? "bg-green-900/50 text-green-300"
                                : log.estado === "error"
                                ? "bg-red-900/50 text-red-300"
                                : "bg-blue-900/50 text-blue-300"
                            }`}
                          >
                            {log.estado}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(log.fechaCreacion).toLocaleString()} •{" "}
                          {log.tamanioBytes
                            ? `${(log.tamanioBytes / 1024 / 1024).toFixed(1)} MB`
                            : "N/A"}
                        </div>
                        {log.error && <div className="text-xs text-red-400 mt-1">{log.error}</div>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {log.estado === "completado" && (
                        <button
                          onClick={() => downloadBackup(log.id)}
                          className="inline-flex items-center px-2 py-1 border border-gray-600 rounded text-xs font-medium text-gray-300 bg-secondary-600 hover:bg-secondary-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        >
                          <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                          Descargar
                        </button>
                      )}
                      <button className="inline-flex items-center px-2 py-1 border border-gray-600 rounded text-xs font-medium text-gray-300 bg-secondary-600 hover:bg-secondary-500 focus:outline-none focus:ring-1 focus:ring-gray-500">
                        <InformationCircleIcon className="h-3 w-3 mr-1" />
                        Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Restaurar */}
        <div className="bg-secondary-800 rounded-xl p-3 border border-secondary-700">
          <h3 className="text-lg font-semibold text-white mb-3">🔄 Restaurar Sistema</h3>

          <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-300">Zona de Peligro</h4>
                <p className="mt-1 text-xs text-yellow-200">
                  La restauración de un respaldo sobrescribirá todos los datos actuales del sistema.
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <button className="inline-flex items-center px-3 py-1.5 border border-yellow-600 rounded-lg shadow-sm text-xs font-medium text-yellow-300 bg-yellow-900/30 hover:bg-yellow-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                <ArrowPathIcon className="h-3 w-3 mr-2" />
                Seleccionar Respaldo para Restaurar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlaceholder = (sectionName: string) => (
    <div className="bg-secondary-800 rounded-xl border border-secondary-700 p-4">
      <div className="text-center py-6">
        <CogIcon className="mx-auto h-10 w-10 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-white">Sección {sectionName}</h3>
        <p className="mt-1 text-xs text-gray-300">Esta sección estará disponible próximamente.</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col space-y-6">
        <div className="animate-pulse flex-1">
          <div className="h-8 bg-secondary-600 rounded w-1/4 mb-6"></div>
          <div className="border-b border-secondary-700 mb-6">
            <div className="flex space-x-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-secondary-600 rounded w-24 mb-4"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4 overflow-y-auto">
            <div className="h-32 bg-secondary-700 rounded-xl"></div>
            <div className="h-32 bg-secondary-700 rounded-xl"></div>
            <div className="h-32 bg-secondary-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-xl font-bold text-white">Configuración del Sistema</h1>
        <p className="mt-1 text-xs text-gray-300">
          Administra la configuración general del taller, usuarios, permisos y preferencias.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-700 flex-shrink-0 mb-4">
        <nav className="-mb-px flex space-x-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 py-2 px-2 border-b-2 font-medium text-xs whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary-400 text-primary-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-secondary-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="pb-4">
          {activeTab === "taller" && renderTallerConfig()}
          {activeTab === "usuarios" && renderUsuariosConfig()}
          {activeTab === "flujo" && renderFlujoConfig()}
          {activeTab === "plantillas" && renderPlantillasConfig()}
          {activeTab === "agenda" && renderAgendaConfig()}
          {activeTab === "notificaciones" && renderNotificacionesConfig()}
          {activeTab === "evidencias" && renderEvidenciasConfig()}
          {activeTab === "interfaz" && renderInterfazConfig()}
          {activeTab === "backup" && renderRespaldosConfig()}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionSection;
