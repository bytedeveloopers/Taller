Taller Management System

Sistema de gestión para talleres mecánicos desarrollado con Next.js, TypeScript y Prisma.

🚀 Características
🔹 Landing Page

Hero section con efecto parallax y botón de seguimiento interactivo.

Sección de servicios con 6 tarjetas animadas y carrusel de instalaciones.

Componente de agenda con formulario completo y validación.

Sección Nosotros con mapa embebido e información empresarial.

Footer profesional con tres columnas y enlaces rápidos.

Navbar responsive con detección de sección activa.

Animaciones con IntersectionObserver en todas las secciones.

Diseño completamente responsive (móvil + desktop).

Tema oscuro consistente con paleta verde #7CFC00.

🔹 Panel de Administración

Dashboard con estadísticas.

Gestión de usuarios (técnicos).

Asignación de tareas.

Generación de cotizaciones.

Gestión de clientes y vehículos.

🔹 Panel de Técnicos

Dashboard simplificado.

Gestión de tareas asignadas.

Actualización de estados de trabajo.

🔹 Sistema de Seguimiento

Consulta de vehículos por código de seguimiento.

Estado en tiempo real del vehículo.

🔹 Seguridad y Acceso

Página de login admin básica (/admin).

Autenticación con NextAuth.js.

🛠️ Tecnologías

Frontend: Next.js 15 con TypeScript

Styling: Tailwind CSS

Base de datos: MySQL con Prisma ORM

Autenticación: NextAuth.js

UI Components: Lucide React

📁 Estructura del Proyecto
src/
├── app/                    
│   ├── admin/              # Panel de administración
│   ├── technician/         # Panel de técnicos
│   ├── api/                # API Routes
│   │   ├── auth/           # Autenticación
│   │   ├── vehicles/       # Gestión de vehículos
│   │   ├── users/          # Gestión de usuarios
│   │   ├── tasks/          # Gestión de tareas
│   │   └── quotes/         # Gestión de cotizaciones
│   └── globals.css         # Estilos globales
├── components/
│   ├── landing/            # Hero, Servicios, Carrusel, Agenda, Nosotros, Footer
│   ├── admin/              # Panel admin
│   ├── technician/         # Panel técnico
│   ├── common/             # Componentes compartidos
│   ├── layout/             # Navbar, layouts
│   └── ui/                 # UI básicos
├── hooks/                  # Hooks (IntersectionObserver, etc.)
├── lib/                    # Utilidades y configuraciones
└── types/                  # Definiciones TS

prisma/
├── schema.prisma           # Esquema BD
└── migrations/             # Migraciones BD

🗄️ Modelo de Base de Datos

Users: Administradores y técnicos

Customers: Clientes del taller

Vehicles: Vehículos con código de seguimiento

Tasks: Tareas/trabajos asignados

Quotes: Cotizaciones y presupuestos

QuoteItems: Items de las cotizaciones

🚀 Instalación

Instalar dependencias:

npm install


Configurar variables de entorno:

cp .env.example .env


Configurar la base de datos:

npm run db:push


Generar el cliente de Prisma:

npm run db:generate


Ejecutar en desarrollo:

npm run dev

📝 Scripts Disponibles

npm run dev → Desarrollo

npm run build → Build producción

npm run start → Ejecutar en producción

npm run lint → Linter

npm run db:generate → Cliente Prisma

npm run db:push → Push BD

npm run db:migrate → Migraciones

npm run db:studio → Prisma Studio

🔧 Configuración

Variables necesarias en .env:

DATABASE_URL → URL conexión MySQL

NEXTAUTH_SECRET → Secret para NextAuth.js

NEXTAUTH_URL → URL de la app

JWT_SECRET → Secret JWT

🏗️ Estado del Proyecto

✅ Landing page completa implementada
✅ Estructura base creada
🚧 Paneles y funcionalidades en desarrollo

📄 Licencia

Este proyecto es privado y está destinado para uso interno del taller.
