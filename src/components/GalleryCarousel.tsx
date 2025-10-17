"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// Tipos del componente
type CarouselImage = {
  src: string;
  alt: string;
};

type GalleryCarouselProps = {
  images: CarouselImage[];
  autoPlayMs?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
};

// Hook personalizado para IntersectionObserver
const useInView = (threshold = 0.1, rootMargin = "0px") => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

// Hook para detectar prefers-reduced-motion
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
};

const GalleryCarousel: React.FC<GalleryCarouselProps> = ({
  images,
  autoPlayMs = 5000,
  showDots = true,
  showArrows = true,
  className = "",
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [carouselRef, isInView] = useInView(0.1, "0px 0px -50px 0px");
  const prefersReducedMotion = usePrefersReducedMotion();
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Funciones de navegación
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Auto-play con pausa en hover/focus y cuando no está en viewport
  useEffect(() => {
    if (prefersReducedMotion || !isInView || isHovered || isFocused || images.length <= 1) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      goToNext();
    }, autoPlayMs);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [autoPlayMs, isInView, isHovered, isFocused, goToNext, prefersReducedMotion, images.length]);

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isInView) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          goToNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInView, goToPrevious, goToNext]);

  // Si no hay imágenes, no renderizar nada
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div
      ref={carouselRef}
      className={`relative w-full max-w-[1200px] mx-auto transition-all duration-700 ease-out ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="region"
      aria-label="Carrusel de imágenes de las instalaciones"
    >
      {/* Contenedor principal del carrusel */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-800 shadow-2xl">
        {/* Imágenes */}
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-300 ease-out ${
              prefersReducedMotion
                ? index === currentSlide
                  ? "opacity-100"
                  : "opacity-0"
                : index === currentSlide
                ? "opacity-100 translate-x-0"
                : index < currentSlide
                ? "opacity-0 -translate-x-4"
                : "opacity-0 translate-x-4"
            }`}
            style={{
              zIndex: index === currentSlide ? 1 : 0,
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            />
            {/* Overlay oscuro sutil */}
            <div className="absolute inset-0 bg-black/30 z-10" />
          </div>
        ))}

        {/* Flechas de navegación */}
        {showArrows && images.length > 1 && (
          <>
            {/* Flecha izquierda */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-200 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label="Imagen anterior"
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Flecha derecha */}
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-200 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label="Siguiente imagen"
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots de paginación */}
      {showDots && images.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2" role="tablist">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                index === currentSlide
                  ? "bg-primary-400 scale-110"
                  : "bg-gray-500 hover:bg-gray-400"
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
              aria-selected={index === currentSlide}
              role="tab"
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente demo con título y imágenes de ejemplo
export const CarouselSectionDemo: React.FC = () => {
  const sampleImages: CarouselImage[] = [
    {
      src: "/images/gallery/instalaciones/taller1.png",
      alt: "Vista general del taller mecánico",
    },
    {
      src: "/images/taller2.jpg",
      alt: "Zona de diagnóstico computarizado",
    },
    {
      src: "/images/taller3.jpg",
      alt: "Área de reparaciones mecánicas",
    },
    {
      src: "/images/taller4.jpg",
      alt: "Estación de cambio de aceite",
    },
    {
      src: "/images/taller5.jpg",
      alt: "Sala de espera para clientes",
    },
  ];

  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título de la sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nuestras Instalaciones</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Conoce nuestras modernas instalaciones equipadas con la última tecnología
          </p>
        </div>

        {/* Carrusel */}
        <GalleryCarousel
          images={sampleImages}
          autoPlayMs={5000}
          showDots={true}
          showArrows={true}
          className="mb-8"
        />
      </div>
    </section>
  );
};

export default GalleryCarousel;

/*
NOTAS DE CONFIGURACIÓN:

1. Tiempos de animación:
   - Aparición del carrusel: duration-700 (línea 147)
   - Transición entre slides: duration-300 (líneas 158-169)
   - Micro-hover en controles: duration-200 (líneas 207, 236, 270)

2. Auto-play:
   - Tiempo por defecto: 5000ms (línea 25)
   - Se pausa en hover, focus y cuando no está en viewport
   - Se deshabilita con prefers-reduced-motion

3. Responsive:
   - Mobile: w-full (100% ancho)
   - Desktop: max-w-[1200px] (máximo 1200px)
   - Aspect ratio fijo: aspect-[16/9]

4. Accesibilidad:
   - ARIA labels en todos los controles
   - Soporte completo de teclado
   - Focus rings accesibles
   - Respeta prefers-reduced-motion

5. IntersectionObserver:
   - Threshold: 0.1 (10% visible)
   - Root margin: "0px 0px -50px 0px" (activa 50px antes)
*/
