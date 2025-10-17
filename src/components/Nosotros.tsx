"use client";

import { useEffect, useRef, useState } from "react";

// Hook personalizado para IntersectionObserver
const useInView = (threshold = 0.1, rootMargin = "0px") => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);

  return [ref, isInView] as const;
};

const Nosotros: React.FC = () => {
  const [nosotrosRef, isInView] = useInView(0.1, "0px 0px -100px 0px");

  // Puntos fuertes del taller
  const puntosFortes = [
    {
      icon: "✔️",
      text: "Más de 15 años de experiencia en el sector automotriz",
    },
    {
      icon: "✔️",
      text: "Personal técnico certificado y altamente calificado",
    },
    {
      icon: "✔️",
      text: "Tecnología de última generación y equipos modernos",
    },
    {
      icon: "✔️",
      text: "Garantía completa en cada servicio realizado",
    },
    {
      icon: "✔️",
      text: "Atención personalizada y seguimiento post-servicio",
    },
  ];

  return (
    <section
      ref={nosotrosRef}
      id="nosotros"
      className={`py-20 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 relative overflow-hidden transition-all duration-700 ease-out ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Columna Izquierda - Contenido de Texto */}
          <div className="space-y-8">
            {/* Título */}
            <div
              className={`transition-all duration-700 ease-out ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: isInView ? "200ms" : "0ms",
              }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Sobre{" "}
                <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  Nosotros
                </span>
              </h2>
            </div>

            {/* Párrafos descriptivos */}
            <div className="space-y-6">
              <p
                className={`text-lg text-gray-300 leading-relaxed transition-all duration-700 ease-out ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDelay: isInView ? "300ms" : "0ms",
                }}
              >
                En nuestro taller automotriz, combinamos más de una década de experiencia con la
                pasión por brindar el mejor servicio a nuestros clientes. Nos especializamos en el
                mantenimiento y reparación de todo tipo de vehículos, desde autos compactos hasta
                camionetas y vehículos comerciales.
              </p>

              <p
                className={`text-lg text-gray-300 leading-relaxed transition-all duration-700 ease-out ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDelay: isInView ? "400ms" : "0ms",
                }}
              >
                Nuestra misión es mantener tu vehículo en óptimas condiciones de funcionamiento y
                seguridad, utilizando únicamente repuestos originales y técnicas certificadas.
                Creemos que cada cliente merece un servicio transparente, confiable y de la más alta
                calidad.
              </p>

              <p
                className={`text-lg text-gray-300 leading-relaxed transition-all duration-700 ease-out ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDelay: isInView ? "500ms" : "0ms",
                }}
              >
                Nuestro compromiso va más allá de la reparación: ofrecemos asesoramiento
                personalizado para el cuidado preventivo de tu vehículo, garantizando que cada
                servicio contribuya a prolongar su vida útil y optimizar su rendimiento.
              </p>
            </div>

            {/* Lista de puntos fuertes */}
            <div
              className={`space-y-4 transition-all duration-700 ease-out ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                transitionDelay: isInView ? "600ms" : "0ms",
              }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Lo que nos distingue:</h3>
              <div className="space-y-3">
                {puntosFortes.map((punto, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 transition-all duration-700 ease-out ${
                      isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                    style={{
                      transitionDelay: isInView ? `${700 + index * 100}ms` : "0ms",
                    }}
                  >
                    <span className="text-primary-400 text-xl flex-shrink-0 mt-1">
                      {punto.icon}
                    </span>
                    <p className="text-gray-300 leading-relaxed">{punto.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha - Mapa */}
          <div
            className={`transition-all duration-700 ease-out ${
              isInView ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{
              transitionDelay: isInView ? "800ms" : "0ms",
            }}
          >
            <div className="sticky top-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center md:text-left">
                Nuestra Ubicación
              </h3>

              {/* Contenedor del mapa */}
              <div className="aspect-[16/9] rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-800">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.1234567890123!2d-74.08098678523048!3d4.710988596249844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9bfd2da6cb29%3A0x239d635520a33914!2sBogot%C3%A1%2C%20Colombia!5e0!3m2!1sen!2sco!4v1635789012345!5m2!1sen!2sco"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación del taller automotriz"
                  aria-label="Ubicación del taller en Google Maps"
                />
              </div>

              {/* Información de contacto adicional */}
              <div className="mt-6 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                <h4 className="text-lg font-bold text-white mb-4">Información de Contacto</h4>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center space-x-3">
                    <span className="text-primary-400">📍</span>
                    <span>Calle Principal #123, Ciudad, País</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-primary-400">📞</span>
                    <span>+1 (234) 567-8900</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-primary-400">🕒</span>
                    <div>
                      <div>Lun - Vie: 8:00 AM - 6:00 PM</div>
                      <div>Sáb: 8:00 AM - 4:00 PM</div>
                      <div>Dom: Cerrado</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default Nosotros;
