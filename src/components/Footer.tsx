"use client";

import { useEffect, useRef, useState } from "react";

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  // IntersectionObserver para animaciones de entrada
  useEffect(() => {
    const currentRef = footerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const socialLinks = [
    {
      name: "Facebook",
      icon: "📘",
      url: "#",
      color: "hover:bg-blue-600",
    },
    {
      name: "Instagram",
      icon: "📷",
      url: "#",
      color: "hover:bg-pink-600",
    },
    {
      name: "Twitter",
      icon: "🐦",
      url: "#",
      color: "hover:bg-blue-400",
    },
    {
      name: "WhatsApp",
      icon: "📱",
      url: "#",
      color: "hover:bg-green-600",
    },
  ];

  const quickLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Servicios", href: "#servicios" },
    { name: "Rastreo", href: "#rastreo" },
    { name: "Agenda", href: "#agenda" },
    { name: "Nosotros", href: "#nosotros" },
    { name: "Contacto", href: "#contacto" },
    { name: "Administración", href: "/admin", type: "admin" },
  ];

  const contactInfo = [
    {
      icon: "📍",
      text: "Calle Principal #123, Ciudad, País",
    },
    {
      icon: "📞",
      text: "+1 (234) 567-8900",
    },
    {
      icon: "✉️",
      text: "info@autorepair.com",
    },
    {
      icon: "🕒",
      text: "Lun - Vie: 8:00 AM - 6:00 PM",
    },
  ];

  return (
    <footer ref={footerRef} className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Información del taller */}
          <div
            className={`space-y-6 transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: isVisible ? "0ms" : "0ms",
            }}
          >
            {/* Logo y nombre */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-400 rounded-lg flex items-center justify-center">
                {/* Usar logo real cuando esté disponible */}
                {/* <Image
                  src="/images/icons/logo.png"
                  alt="AutoRepair Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                /> */}
                <span className="text-gray-900 font-bold text-lg">AR</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-400">AutoRepair</h3>
                <p className="text-sm text-gray-400">Confianza y Tecnología para tu vehículo</p>
              </div>
            </div>

            {/* Redes sociales */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={social.name}
                    href={social.url}
                    aria-label={`Síguenos en ${social.name}`}
                    className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${social.color}`}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div
            className={`transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: isVisible ? "200ms" : "0ms",
            }}
          >
            <h4 className="text-lg font-semibold mb-6">Enlaces rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`transition-all duration-300 focus:outline-none ${
                      link.type === "admin"
                        ? "text-gray-500 hover:text-gray-400 text-sm"
                        : "text-gray-300 hover:text-primary-400 hover:underline focus:text-primary-400 focus:underline"
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div
            className={`transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: isVisible ? "400ms" : "0ms",
            }}
          >
            <h4 className="text-lg font-semibold mb-6">Contacto</h4>
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 text-primary-400 flex-shrink-0 flex items-center justify-center">
                    <span>{info.icon}</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{info.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer inferior */}
        <div
          className={`border-t border-gray-700 mt-8 pt-6 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            transitionDelay: isVisible ? "600ms" : "0ms",
          }}
        >
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 AutoRepair. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
