export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🔧 Taller AutoService</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#servicios" className="text-gray-500 hover:text-gray-900">
                Servicios
              </a>
              <a href="#buscar" className="text-gray-500 hover:text-gray-900">
                Buscar Vehículo
              </a>
              <a href="#contacto" className="text-gray-500 hover:text-gray-900">
                Contacto
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Tu Taller de Confianza
            </h2>
            <p className="mt-6 max-w-3xl mx-auto text-xl">
              Servicio automotriz profesional con seguimiento en tiempo real. Consulta el estado de
              tu vehículo en cualquier momento.
            </p>
          </div>
        </div>
      </section>

      {/* Vehicle Search Section */}
      <section id="buscar" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-extrabold text-gray-900">
              Consulta el Estado de tu Vehículo
            </h3>
            <p className="mt-4 text-lg text-gray-500">
              Ingresa tu código de seguimiento para ver el progreso de tu servicio
            </p>
          </div>

          <div className="mt-12 max-w-md mx-auto">
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                placeholder="Ej: VH123456ABC"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Buscar
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              * El código de seguimiento se proporciona al dejar tu vehículo
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-extrabold text-gray-900">Nuestros Servicios</h3>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Mantenimiento Preventivo",
                description: "Cambio de aceite, filtros, revisión general",
              },
              {
                title: "Reparaciones Mecánicas",
                description: "Motor, transmisión, frenos, suspensión",
              },
              {
                title: "Diagnóstico Computarizado",
                description: "Escaneo completo de sistemas electrónicos",
              },
              {
                title: "Reparación de Frenos",
                description: "Pastillas, discos, sistema hidráulico",
              },
              {
                title: "Sistema Eléctrico",
                description: "Batería, alternador, sistema de arranque",
              },
              {
                title: "Aire Acondicionado",
                description: "Recarga, reparación, mantenimiento",
              },
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h4>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Access */}
      <section className="py-8 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <a
              href="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-800 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              🔐 Acceso Administrativo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-4">Taller AutoService</h4>
            <p className="text-gray-400">© 2025 Todos los derechos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
