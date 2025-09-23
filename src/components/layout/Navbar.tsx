"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("rastreo");

  useEffect(() => {
    const detectActiveSection = () => {
      // Detectar sección activa
      const sections = ["contacto", "nosotros", "agenda", "instalaciones", "servicios", "rastreo"];
      const scrollPosition = window.scrollY + 100;

      // Si estamos muy arriba, activamos rastreo
      if (window.scrollY < 100) {
        setActiveSection("rastreo");
        return;
      }

      // Buscar la sección que está más visible en el viewport
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;

          // Si el scroll ha pasado esta sección, esta es la activa
          if (scrollPosition >= elementTop) {
            setActiveSection(section);
            return;
          }
        }
      }
    };

    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      detectActiveSection();
    };

    // Detectar sección activa al cargar la página
    detectActiveSection();

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navigationItems = [
    { name: "Rastreo", href: "#rastreo", id: "rastreo" },
    { name: "Servicios", href: "#servicios", id: "servicios" },
    { name: "Instalaciones", href: "#instalaciones", id: "instalaciones" },
    { name: "Agenda", href: "#agenda", id: "agenda" },
    { name: "Nosotros", href: "#nosotros", id: "nosotros" },
  ];

  return (
    <>
      <nav
        className={`shadow-xl fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-500 w-full ${
          scrolled
            ? "bg-gray-900/95 backdrop-blur-md border-gray-700"
            : "bg-gray-900 border-gray-800"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300 hover:scale-105 group"
            >
              <div className="w-20 h-20 relative transition-transform duration-300 group-hover:rotate-3 overflow-hidden">
                <Image
                  src="/images/icons/logo.png"
                  alt="AutoRepair Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold text-white">Auto</span>
                <span className="text-2xl font-bold text-primary-400">Repair</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navigationItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 group ${
                        isActive
                          ? "text-primary-400 bg-gray-800/50"
                          : "text-gray-300 hover:text-primary-400 hover:bg-gray-800/50"
                      }`}
                    >
                      <span className="relative z-10">{item.name}</span>
                      <div
                        className={`absolute bottom-0 left-0 h-0.5 bg-primary-400 transition-all duration-300 ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* CTA desktop */}
            <div className="hidden md:block">
              <Link
                href="#agenda"
                className="bg-primary-400 hover:bg-primary-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-xl"
              >
                Agendar Cita
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-primary-400 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-300"
              >
                <span className="sr-only">Abrir menú</span>
                {isMenuOpen ? (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 shadow-lg border-t border-gray-800">
              {navigationItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                      isActive
                        ? "text-primary-400 bg-gray-800"
                        : "text-gray-300 hover:text-primary-400 hover:bg-gray-800"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                    {isActive && <div className="w-full h-0.5 bg-primary-400 mt-1 rounded" />}
                  </Link>
                );
              })}
              <div className="pt-4 pb-2">
                <Link
                  href="#agenda"
                  className="block w-full text-center bg-primary-400 hover:bg-primary-500 text-white px-6 py-3 rounded-lg text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Agendar Cita
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
