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

// Tipos para el formulario
interface FormData {
  nombre: string;
  telefono: string;
  email: string;
  fecha: string;
  servicio: string;
  mensaje: string;
}

interface FormErrors {
  nombre?: string;
  telefono?: string;
  email?: string;
  fecha?: string;
  servicio?: string;
}

const AgendarCita: React.FC = () => {
  const [agendaRef, isInView] = useInView(0.1, "0px 0px -100px 0px");
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    telefono: "",
    email: "",
    fecha: "",
    servicio: "",
    mensaje: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Opciones para el select de servicios
  const serviciosOptions = [
    { value: "", label: "Selecciona un servicio" },
    { value: "mantenimiento", label: "Mantenimiento Preventivo" },
    { value: "reparacion", label: "Reparación Mecánica" },
    { value: "diagnostico", label: "Diagnóstico Computarizado" },
    { value: "frenos", label: "Reparación de Frenos" },
    { value: "electrico", label: "Sistema Eléctrico" },
    { value: "aire", label: "Aire Acondicionado" },
    { value: "otro", label: "Otro Servicio" },
  ];

  // Función para manejar cambios en los inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error al empezar a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }

    if (!formData.fecha) {
      newErrors.fecha = "La fecha es requerida";
    } else {
      const selectedDate = new Date(formData.fecha);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.fecha = "La fecha debe ser hoy o posterior";
      }
    }

    if (!formData.servicio) {
      newErrors.servicio = "Selecciona un servicio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simular envío del formulario
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Datos del formulario:", formData);
      setIsSuccess(true);

      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        setFormData({
          nombre: "",
          telefono: "",
          email: "",
          fecha: "",
          servicio: "",
          mensaje: "",
        });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error al enviar formulario:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={agendaRef}
      id="agenda"
      className={`py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden transition-all duration-700 ease-out ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ease-out ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{
            transitionDelay: isInView ? "200ms" : "0ms",
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Agendar tu Cita</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Reserva fácilmente tu próxima visita a nuestro taller. Te contactaremos para confirmar
            tu cita.
          </p>
        </div>

        {/* Formulario */}
        <div
          className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl transition-all duration-700 ease-out ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{
            transitionDelay: isInView ? "400ms" : "0ms",
          }}
        >
          {isSuccess ? (
            // Mensaje de éxito
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">¡Cita Agendada!</h3>
              <p className="text-gray-300">
                Hemos recibido tu solicitud. Te contactaremos pronto para confirmar tu cita.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grid para desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre completo */}
                <div
                  className={`transition-all duration-700 ease-out ${
                    isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{
                    transitionDelay: isInView ? "500ms" : "0ms",
                  }}
                >
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu nombre completo"
                    className={`w-full px-4 py-3 bg-gray-700 border ${
                      errors.nombre ? "border-red-500" : "border-gray-600"
                    } text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300`}
                    aria-label="Nombre completo para la cita"
                  />
                  {errors.nombre && <p className="mt-1 text-sm text-red-400">{errors.nombre}</p>}
                </div>

                {/* Teléfono */}
                <div
                  className={`transition-all duration-700 ease-out ${
                    isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{
                    transitionDelay: isInView ? "600ms" : "0ms",
                  }}
                >
                  <label
                    htmlFor="telefono"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+502 1234 5678"
                    className={`w-full px-4 py-3 bg-gray-700 border ${
                      errors.telefono ? "border-red-500" : "border-gray-600"
                    } text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300`}
                    aria-label="Número de teléfono para contacto"
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-400">{errors.telefono}</p>
                  )}
                </div>

                {/* Email */}
                <div
                  className={`transition-all duration-700 ease-out ${
                    isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{
                    transitionDelay: isInView ? "700ms" : "0ms",
                  }}
                >
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@ejemplo.com"
                    className={`w-full px-4 py-3 bg-gray-700 border ${
                      errors.email ? "border-red-500" : "border-gray-600"
                    } text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300`}
                    aria-label="Correo electrónico para confirmación"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                </div>

                {/* Fecha */}
                <div
                  className={`transition-all duration-700 ease-out ${
                    isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{
                    transitionDelay: isInView ? "800ms" : "0ms",
                  }}
                >
                  <label htmlFor="fecha" className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha Preferida *
                  </label>
                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3 bg-gray-700 border ${
                      errors.fecha ? "border-red-500" : "border-gray-600"
                    } text-white rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300`}
                    aria-label="Fecha preferida para la cita"
                  />
                  {errors.fecha && <p className="mt-1 text-sm text-red-400">{errors.fecha}</p>}
                </div>
              </div>

              {/* Servicio requerido */}
              <div
                className={`transition-all duration-700 ease-out ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDelay: isInView ? "900ms" : "0ms",
                }}
              >
                <label htmlFor="servicio" className="block text-sm font-medium text-gray-300 mb-2">
                  Servicio Requerido *
                </label>
                <select
                  id="servicio"
                  name="servicio"
                  value={formData.servicio}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-700 border ${
                    errors.servicio ? "border-red-500" : "border-gray-600"
                  } text-white rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300`}
                  aria-label="Tipo de servicio requerido"
                >
                  {serviciosOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.servicio && <p className="mt-1 text-sm text-red-400">{errors.servicio}</p>}
              </div>

              {/* Mensaje adicional */}
              <div
                className={`transition-all duration-700 ease-out ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDelay: isInView ? "1000ms" : "0ms",
                }}
              >
                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-300 mb-2">
                  Mensaje Adicional
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe cualquier detalle adicional sobre tu vehículo o el servicio que necesitas..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300 resize-none"
                  aria-label="Mensaje adicional opcional"
                />
              </div>

              {/* Botón CTA */}
              <div
                className={`text-center transition-all duration-700 ease-out ${
                  isInView ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                style={{
                  transitionDelay: isInView ? "1100ms" : "0ms",
                }}
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center justify-center px-12 py-4 bg-primary-400 hover:bg-primary-500 disabled:bg-gray-600 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-2xl hover:shadow-primary-400/40 focus:outline-none focus:ring-4 focus:ring-primary-400/50 ${
                    !isSubmitting ? "animate-pulse" : ""
                  }`}
                  style={{
                    animationDuration: "3s",
                    animationIterationCount: "infinite",
                  }}
                  aria-label="Enviar solicitud de cita"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <span className="mr-3">Agendar Ahora</span>
                      <svg
                        className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default AgendarCita;
