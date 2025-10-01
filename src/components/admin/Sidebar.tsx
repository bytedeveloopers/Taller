"use client";

import {
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TruckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

type TabType =
  | "dashboard"
  | "citas"
  | "reportes"
  | "clientes"
  | "vehiculos"
  | "servicios"
  | "facturacion"
  | "configuracion";

interface SidebarProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function Sidebar({ selectedTab, onTabChange }: SidebarProps) {
  const navigationItems = [
    {
      id: "dashboard" as TabType,
      label: "Dashboard",
      icon: ChartBarIcon,
    },
    {
      id: "citas" as TabType,
      label: "Gestión de Citas",
      icon: ClipboardDocumentListIcon,
    },
    {
      id: "reportes" as TabType,
      label: "Reportes",
      icon: DocumentTextIcon,
    },
    {
      id: "clientes" as TabType,
      label: "Clientes",
      icon: UserGroupIcon,
    },
    {
      id: "vehiculos" as TabType,
      label: "Vehículos",
      icon: TruckIcon,
    },
    {
      id: "servicios" as TabType,
      label: "Servicios",
      icon: WrenchScrewdriverIcon,
    },
    {
      id: "facturacion" as TabType,
      label: "Facturación",
      icon: CurrencyDollarIcon,
    },
    {
      id: "configuracion" as TabType,
      label: "Configuración",
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <div className="fixed left-0 top-0 w-64 h-full bg-secondary-800 shadow-2xl flex flex-col border-r border-secondary-700 z-30 transition-all duration-300 hover:shadow-primary-500/10">
      {/* Logo/Header */}
      <div className="flex items-center h-16 px-4 border-b border-secondary-700 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 transition-all duration-500">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="relative">
            <Image
              src="/images/icons/logo.png"
              alt="Taller Logo"
              width={32}
              height={32}
              className="rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
            />
            <div className="absolute -inset-1 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </div>
          <h1 className="text-lg font-bold text-white transition-all duration-300 group-hover:text-primary-100 group-hover:scale-105">
            Taller Admin
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`group relative overflow-hidden w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-300 transform ${
                  isActive
                    ? "bg-primary-500 text-white shadow-lg scale-105 translate-x-1"
                    : "text-gray-300 hover:bg-secondary-700 hover:text-white hover:scale-102 hover:translate-x-1"
                } active:scale-95 active:duration-75`}
              >
                {/* Background shine effect */}
                <div
                  className={`absolute inset-0 w-full h-full transition-all duration-500 ${
                    isActive
                      ? "bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-full"
                      : "bg-gradient-to-r from-transparent via-primary-400/10 to-transparent -translate-x-full group-hover:translate-x-full"
                  }`}
                ></div>

                <Icon
                  className={`h-5 w-5 mr-3 transition-all duration-300 z-10 ${
                    isActive
                      ? "text-white rotate-12 scale-110"
                      : "group-hover:text-primary-400 group-hover:rotate-6 group-hover:scale-105"
                  }`}
                />
                <span className="transition-all duration-300 group-hover:font-semibold z-10">
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto z-10">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <div className="px-3 mt-6 pt-6 border-t border-secondary-700">
          <Link
            href="/admin"
            className="group w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 active:duration-75"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
            <span className="transition-all duration-300 group-hover:font-semibold">
              Cerrar Sesión
            </span>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}
