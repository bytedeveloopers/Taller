# Taller Management System

Sistema de gestión para talleres mecánicos desarrollado con Next.js, TypeScript y Prisma.

## 🚀 Características

### Landing Page

- Información del taller
- Sistema de búsqueda de vehículos por código de seguimiento
- Estado en tiempo real del vehículo

### Panel de Administración

- Dashboard con estadísticas
- Gestión de usuarios (técnicos)
- Asignación de tareas
- Generación de cotizaciones
- Gestión de clientes y vehículos

### Panel de Técnicos

- Dashboard simplificado
- Gestión de tareas asignadas
- Actualización de estados de trabajo

## 🛠️ Tecnologías

- **Frontend**: Next.js 15 con TypeScript
- **Styling**: Tailwind CSS
- **Base de datos**: MySQL con Prisma ORM
- **Autenticación**: NextAuth.js
- **UI Components**: Lucide React para iconos

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── admin/             # Rutas del panel de administración
│   ├── technician/        # Rutas del panel de técnicos
│   └── api/               # API Routes
│       ├── auth/          # Autenticación
│       ├── vehicles/      # Gestión de vehículos
│       ├── users/         # Gestión de usuarios
│       ├── tasks/         # Gestión de tareas
│       └── quotes/        # Gestión de cotizaciones
├── components/
│   ├── landing/           # Componentes del landing page
│   ├── admin/             # Componentes del panel admin
│   ├── technician/        # Componentes del panel técnico
│   ├── common/            # Componentes compartidos
│   ├── layout/            # Layouts
│   └── ui/                # Componentes UI básicos
├── lib/                   # Utilidades y configuraciones
├── types/                 # Definiciones de tipos TypeScript
└── app/globals.css        # Estilos globales

prisma/
├── schema.prisma          # Esquema de la base de datos
└── migrations/            # Migraciones de la base de datos
```

## 🗄️ Modelo de Base de Datos

- **Users**: Administradores y técnicos
- **Customers**: Clientes del taller
- **Vehicles**: Vehículos con código de seguimiento
- **Tasks**: Tareas/trabajos asignados
- **Quotes**: Cotizaciones y presupuestos
- **QuoteItems**: Items de las cotizaciones

## 🚀 Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno:

```bash
cp .env.example .env
```

3. Configurar la base de datos:

```bash
npm run db:push
```

4. Generar el cliente de Prisma:

```bash
npm run db:generate
```

5. Ejecutar en desarrollo:

```bash
npm run dev
```

## 📝 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en producción
- `npm run lint` - Ejecutar linter
- `npm run db:generate` - Generar cliente Prisma
- `npm run db:push` - Aplicar cambios a la BD
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:studio` - Abrir Prisma Studio

## 🔧 Configuración

Configura las siguientes variables de entorno en tu archivo `.env`:

- `DATABASE_URL`: URL de conexión a MySQL
- `NEXTAUTH_SECRET`: Secret para NextAuth.js
- `NEXTAUTH_URL`: URL de la aplicación
- `JWT_SECRET`: Secret para JWT

## 🏗️ Estado del Proyecto

✅ Estructura base creada
🚧 En desarrollo...

## 📄 Licencia

Este proyecto es privado y está destinado para uso interno del taller.
