"use client";

import {
  BoltIcon,
  CloudIcon,
  CogIcon,
  ComputerDesktopIcon,
  StopIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useState } from "react";
import AgendarCita from "../components/AgendarCita";
import Footer from "../components/Footer";
import GalleryCarousel from "../components/GalleryCarousel";
import Navbar from "../components/layout/Navbar";
import Nosotros from "../components/Nosotros";
import { useInView } from "../hooks/useInView";

export default function Home() {
  const [trackingInputVisible, setTrackingInputVisible] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [buttonJustAppeared, setButtonJustAppeared] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hooks para animaciones de entrada
  const [serviciosRef, serviciosInView] = useInView(0.1, "0px 0px -100px 0px");
  const [instalacionesRef, instalacionesInView] = useInView(0.1, "0px 0px -100px 0px");
  const [contactoRef, contactoInView] = useInView(0.1, "0px 0px -100px 0px");

  // Efecto para detectar el scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-play del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev < 4 ? prev + 1 : 0));
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  const handleTrackingClick = () => {
    setTrackingInputVisible(true);
    setIsClosing(false);
    setButtonJustAppeared(false);
  };

  const handleCloseTracking = () => {
    setIsClosing(true);
    // Primer timeout: ocultar el formulario y mostrar el botón
    setTimeout(() => {
      setTrackingInputVisible(false);
      setTrackingCode("");
      setButtonJustAppeared(true);
      setIsClosing(false);

      // Segundo timeout: resetear la animación del botón
      setTimeout(() => {
        setButtonJustAppeared(false);
      }, 500);
    }, 380); // Ligeramente antes de que termine la animación para evitar parpadeo
  };

  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      // Aquí se implementaría la lógica de búsqueda
      console.log("Buscando código:", trackingCode);
    }
  };
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section - Rastreo */}
      <section
        id="rastreo"
        className="relative bg-gray-900 text-white overflow-hidden min-h-[700px] -mt-16"
        style={{
          transform: `translateY(-${scrollY * 0.4}px)`,
          opacity: Math.max(0, 1 - scrollY / 500),
          paddingTop: "4rem", // Compensar el margin negativo
        }}
      >
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(-${scrollY * 0.3}px)`,
          }}
        >
          <Image
            src="/images/hero/taller-hero.png"
            alt="Auto en el taller"
            fill
            className="object-cover object-right"
            priority
          />
          {/* Overlay oscuro para mejor legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center min-h-[700px] py-12">
            {/* Contenido del Hero */}
            <div
              className="max-w-2xl space-y-8"
              style={{
                opacity: Math.max(0, 1 - scrollY / 400),
                transform: `translateY(${scrollY * 0.1}px)`,
              }}
            >
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  Tu auto en buenas manos, <br />
                  <span className="text-primary-400">siempre informado.</span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-200 max-w-lg leading-relaxed">
                  Agenda en segundos o ingresa tu código de seguimiento para ver el progreso de tu
                  vehículo.
                </p>
              </div>

              {/* Botones CTA */}
              <div className="flex flex-col sm:flex-row gap-4 min-h-[4rem] items-start">
                <a
                  href="#agenda"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary-400 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary-400/25 h-16"
                >
                  Agendar cita
                </a>

                {!trackingInputVisible && !isClosing ? (
                  <button
                    onClick={handleTrackingClick}
                    className={`inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-gray-300 hover:border-primary-400 text-white font-semibold rounded-xl transition-all duration-500 hover:bg-primary-400/10 transform hover:scale-105 hover:shadow-lg hover:shadow-primary-400/20 group h-16 relative z-10 ${
                      buttonJustAppeared ? "animate-slide-in-left" : ""
                    }`}
                  >
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      Código de seguimiento
                    </span>
                    <svg
                      className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ) : (
                  <div
                    className={`w-full max-w-md relative z-20 ${
                      isClosing ? "animate-slide-out-right" : "animate-slide-in-right"
                    }`}
                  >
                    <form onSubmit={handleTrackingSubmit} className="flex relative h-16">
                      <input
                        type="text"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        placeholder="Ingresa tu código de seguimiento"
                        className="flex-1 px-4 py-4 bg-gray-800/90 border-2 border-gray-600 text-white placeholder-gray-400 rounded-l-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 backdrop-blur-sm transition-all duration-300 focus:shadow-lg focus:shadow-primary-400/20 h-16"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-r-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary-500/30 active:scale-95 h-16"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </button>

                      {/* Botón para cerrar con animación mejorada */}
                      <button
                        type="button"
                        onClick={handleCloseTracking}
                        className="absolute -right-10 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white transition-all duration-300 flex items-center justify-center hover:scale-110 hover:rotate-90 group"
                      >
                        <svg
                          className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">15+</div>
                  <div className="text-sm text-gray-300">Años experiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">500+</div>
                  <div className="text-sm text-gray-300">Autos reparados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">24h</div>
                  <div className="text-sm text-gray-300">Seguimiento</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        ref={serviciosRef}
        id="servicios"
        className="py-20 bg-gray-900 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div
            className={`text-center mb-16 transition-all duration-700 ease-out ${
              serviciosInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{
              transitionDelay: serviciosInView ? "100ms" : "300ms",
            }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Nuestros Servicios</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Soluciones completas para tu vehículo con la más alta calidad y tecnología de
              vanguardia
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: WrenchScrewdriverIcon,
                title: "Mantenimiento Preventivo",
                description:
                  "Cambio de aceite, filtros y revisión general para mantener tu vehículo en óptimas condiciones y prevenir averías costosas.",
              },
              {
                icon: CogIcon,
                title: "Reparaciones Mecánicas",
                description:
                  "Especialistas en motor, transmisión, frenos y suspensión. Reparaciones garantizadas con repuestos originales.",
              },
              {
                icon: ComputerDesktopIcon,
                title: "Diagnóstico Computarizado",
                description:
                  "Escaneo completo de sistemas electrónicos con equipos de última generación para detectar fallas invisibles.",
              },
              {
                icon: StopIcon,
                title: "Reparación de Frenos",
                description:
                  "Cambio de pastillas, discos y mantenimiento del sistema hidráulico. Tu seguridad es nuestra máxima prioridad.",
              },
              {
                icon: BoltIcon,
                title: "Sistema Eléctrico",
                description:
                  "Diagnóstico y reparación de batería, alternador y sistema de arranque. Soluciones integrales para problemas eléctricos.",
              },
              {
                icon: CloudIcon,
                title: "Aire Acondicionado",
                description:
                  "Recarga de gas, reparación de compresores y mantenimiento completo del sistema de climatización.",
              },
            ].map((service, index) => (
              <div
                key={index}
                className={`group bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-primary-400 shadow-xl hover:shadow-2xl hover:shadow-primary-400/20 transition-all duration-700 ease-out hover:-translate-y-3 ${
                  serviciosInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDelay: serviciosInView
                    ? `${300 + index * 100}ms`
                    : `${200 + (5 - index) * 80}ms`,
                }}
              >
                {/* Icon Container */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400/20 to-primary-600/10 rounded-xl flex items-center justify-center group-hover:from-primary-400/30 group-hover:to-primary-600/20 transition-all duration-300 group-hover:scale-110">
                    <service.icon className="w-8 h-8 text-primary-400 group-hover:text-primary-300 transition-colors duration-300" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary-400 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {service.description}
                </p>

                {/* Hover Effect Line */}
                <div className="mt-6 h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nuestras Instalaciones Section */}
      <section
        ref={instalacionesRef}
        id="instalaciones"
        className="py-20 bg-gray-800 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Título de la sección */}
          <div
            className={`text-center mb-16 transition-all duration-700 ease-out ${
              instalacionesInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{
              transitionDelay: instalacionesInView ? "100ms" : "200ms",
            }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nuestras Instalaciones
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Conoce nuestras modernas instalaciones equipadas con la última tecnología para
              brindarte el mejor servicio automotriz
            </p>
          </div>

          {/* Carrusel de instalaciones */}
          <div
            className={`transition-all duration-700 ease-out ${
              instalacionesInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: instalacionesInView ? "300ms" : "100ms",
            }}
          >
            <GalleryCarousel
              images={[
                {
                  src: "/images/gallery/instalaciones/taller1.png",
                  alt: "Vista general del taller mecánico con equipos modernos",
                },
                {
                  src: "/images/gallery/instalaciones/taller1.png",
                  alt: "Zona de diagnóstico computarizado con tecnología avanzada",
                },
                {
                  src: "/images/gallery/instalaciones/taller1.png",
                  alt: "Área de reparaciones mecánicas con herramientas especializadas",
                },
                {
                  src: "/images/gallery/instalaciones/taller1.png",
                  alt: "Estación de cambio de aceite y mantenimiento preventivo",
                },
                {
                  src: "/images/gallery/instalaciones/taller1.png",
                  alt: "Cómoda sala de espera para nuestros clientes",
                },
              ]}
              autoPlayMs={5000}
              showDots={true}
              showArrows={true}
              className="mb-12"
            />
          </div>

          {/* Características de las instalaciones */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 transition-all duration-700 ease-out ${
              instalacionesInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{
              transitionDelay: instalacionesInView ? "500ms" : "50ms",
            }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Equipos Modernos</h3>
              <p className="text-gray-300">
                Tecnología de última generación para diagnósticos precisos
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏢</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Amplio Espacio</h3>
              <p className="text-gray-300">
                Instalaciones espaciosas para trabajar con comodidad y eficiencia
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ambiente Limpio</h3>
              <p className="text-gray-300">
                Mantenemos altos estándares de limpieza y organización
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda Section */}
      <AgendarCita />

      {/* Nosotros Section */}
      <Nosotros />

      {/* Contacto Section */}

      {/* Footer Component */}
      <Footer />
    </div>
  );
}
