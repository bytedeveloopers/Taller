# Sistema de Gestión Automotriz

Sistema completo de gestión para talleres mecánicos desarrollado con **Next.js 15.5.3**, **TypeScript** y **MySQL**.

---

## 🚀 Características Principales

### 🔹 Landing Page Profesional

- Hero section con efecto parallax y botón de seguimiento interactivo
- Sección de servicios con 6 tarjetas animadas y carrusel de instalaciones
- Componente de agenda con formulario completo y validación
- Sección _Nosotros_ con mapa embebido e información empresarial
- Footer profesional con tres columnas y enlaces rápidos
- Navbar responsive con detección de sección activa
- Animaciones con **IntersectionObserver** en todas las secciones
- Diseño completamente responsive (móvil + desktop)
- Tema oscuro consistente con paleta verde `#7CFC00`

### 🔹 Dashboard Administrativo Completo

- **12 secciones especializadas** con navegación por sidebar fija
- **Estadísticas en tiempo real** del taller y vehículos
- **Gestión completa de usuarios** (administradores y técnicos)
- **Sistema de asignación de tareas** con prioridades
- **Generación automática de cotizaciones** con items detallados
- **Gestión integral de clientes y vehículos**

### 🔹 Sistema de Recepción Avanzado ⭐

- **Documentación fotográfica real** con cámara integrada
- **Inspecciones visuales completas** con ubicaciones predefinidas
- **Observaciones específicas** para cada foto capturada
- **Códigos de seguimiento únicos** generados automáticamente
- **Reportes PDF profesionales** con jsPDF
- **Creación manual de órdenes de trabajo** para clientes sin cita
- **Formularios completos** con validación de datos

### 🔹 Gestión de Vehículos en Taller

- **Estados de trabajo detallados** (recepción, diagnóstico, reparación, finalizado)
- **Asignación de técnicos** especialistas
- **Seguimiento de progreso** en tiempo real
- **Gestión de capacidad** del taller
- **Historial completo** de trabajos realizados

### 🔹 Panel de Técnicos Especializado

- Dashboard simplificado con tareas asignadas
- Actualización de estados de trabajo en tiempo real
- Gestión de herramientas y recursos
- Sistema de reportes de progreso

### 🔹 Sistema de Seguimiento para Clientes

- **Consulta pública** por código de seguimiento único
- **Estado en tiempo real** del vehículo y reparaciones
- **Historial detallado** de trabajos realizados
- **Notificaciones automáticas** de cambios de estado

### 🔹 Seguridad y Autenticación

- Sistema de login robusto con roles diferenciados
- Autenticación con **NextAuth.js**
- Protección de rutas por nivel de acceso
- Gestión segura de sesiones

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15.5.3 con App Router y TypeScript
- **Styling**: Tailwind CSS con scrollbars personalizados
- **Base de datos**: MySQL (XAMPP) con Prisma ORM
- **Autenticación**: NextAuth.js con JWT
- **UI Components**: Heroicons y componentes personalizados
- **Generación PDF**: jsPDF para reportes profesionales
- **Notificaciones**: Sistema de toast notifications
- **Cámara**: Integración nativa con MediaDevices API
- **Validación**: Formularios con validación en tiempo real

---

## 📁 Estructura del Proyecto

src/
├── app/
│ ├── admin/ # Panel de administración con 12 secciones
│ ├── technician/ # Panel de técnicos especializado
│ ├── api/ # API Routes
│ │ ├── auth/ # Autenticación y sesiones
│ │ ├── recepcion/ # API de recepción y fotos
│ │ ├── vehicles/ # Gestión de vehículos
│ │ ├── users/ # Gestión de usuarios y técnicos
│ │ ├── tasks/ # Gestión de tareas y OT
│ │ └── quotes/ # Gestión de cotizaciones
│ └── globals.css # Estilos globales Tailwind
├── components/
│ ├── landing/ # Hero, Servicios, Carrusel, Agenda, Nosotros, Footer
│ ├── admin/ # Dashboard y secciones administrativas
│ │ ├── AdminDashboard.tsx # Dashboard principal con sidebar
│ │ └── sections/ # 12 secciones especializadas
│ │ ├── RecepcionSection.tsx # Sistema de inspección completo
│ │ ├── VehiculosEnTallerSection.tsx # Gestión de taller
│ │ └── ... # Otras secciones
│ ├── technician/ # Panel técnico especializado
│ ├── common/ # Componentes compartidos
│ ├── layout/ # Layouts y navegación
│ └── ui/ # Componentes UI base
│ ├── CameraComponent.tsx # Integración de cámara
│ └── ToastNotification.tsx # Sistema de notificaciones
├── hooks/ # Custom hooks (IntersectionObserver, etc.)
├── lib/ # Utilidades y configuraciones Prisma
└── types/ # Definiciones TypeScript

prisma/
├── schema.prisma # Esquema completo con InspectionPhoto
└── migrations/ # Migraciones de base de datos

---

## 🗄️ Modelo de Base de Datos

- **Users**: Administradores y técnicos con roles diferenciados
- **Customers**: Clientes del taller con historial completo
- **Vehicles**: Vehículos con códigos de seguimiento únicos
- **Tasks**: Tareas/trabajos asignados con estados y prioridades
- **Quotes**: Cotizaciones y presupuestos detallados
- **QuoteItems**: Items individuales de las cotizaciones
- **InspectionPhoto**: Fotos de inspección con ubicación y observaciones

---

## 🚀 Instalación

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Configurar variables de entorno:

   ```bash
   cp .env.example .env
   ```

3. Iniciar MySQL (XAMPP):

   - Abrir XAMPP Control Panel
   - Iniciar Apache y MySQL

4. Configurar la base de datos:

   ```bash
   npm run db:push
   ```

5. Generar el cliente de Prisma:

   ```bash
   npm run db:generate
   ```

6. Ejecutar en desarrollo:

   ```bash
   npm run dev
   ```

   El proyecto estará disponible en:

   - Puerto principal: http://localhost:3000
   - Puerto alternativo: http://localhost:3002

## 📝 Scripts Disponibles

- `npm run dev` → Ejecutar en modo desarrollo
- `npm run build` → Construir para producción
- `npm run start` → Ejecutar build de producción
- `npm run lint` → Ejecutar linter ESLint
- `npm run db:generate` → Generar cliente Prisma
- `npm run db:push` → Sincronizar esquema con BD
- `npm run db:migrate` → Crear migraciones
- `npm run db:studio` → Abrir Prisma Studio

## 🔧 Configuración

### Variables de entorno necesarias en `.env`:

```env
# Base de datos
DATABASE_URL="mysql://root:@localhost:3306/taller_db"

# Autenticación
NEXTAUTH_SECRET="tu-secret-key-aqui"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="jwt-secret-key"

# Configuración del taller
TALLER_NAME="Tu Taller Mecánico"
TALLER_EMAIL="contacto@tutaller.com"
```

---

## 🧪 BD de Laboratorio (sin datos)

### Para clonar solo la estructura desde una BD de producción a una BD de laboratorio:

#### 1) Clonar estructura (Linux/Mac)

```bash
./scripts/db/clone-structure.sh PRODBD taller_lab localhost root secret
```

#### 2) Clonar estructura (Windows)

```cmd
scripts\db\clone-structure.bat PRODBD taller_lab localhost root secret
```

#### 3) Apuntar a la BD de laboratorio

```bash
cp .env.lab.example .env
# (ajusta usuario/clave si es necesario)
```

#### 4) Resetear y sembrar datos de prueba

**Linux/Mac:**

```bash
./scripts/db/reset-lab.sh
```

**Windows:**

```cmd
scripts\db\reset-lab.bat
```

#### O manualmente:

```bash
npx prisma migrate reset --force
npx tsx prisma/seed-lab.ts
```

### Datos de acceso de laboratorio:

- **Admin**: admin@taller.com / admin123 (⚠️ SOLO admin, sin datos de demo)

---

## 🏗️ Estado del Proyecto

### ✅ Completado

- Landing page profesional con todas las secciones
- Dashboard administrativo con 12 secciones especializadas
- **Sistema de recepción completo** con documentación fotográfica
- **Captura de fotos reales** con cámara integrada
- **Códigos de seguimiento únicos** para consulta de clientes
- **Generación de reportes PDF** profesionales
- **Creación manual de órdenes de trabajo**
- Gestión completa de vehículos en taller
- Sistema de estados y progreso de trabajos
- Base de datos MySQL con Prisma ORM
- API endpoints funcionales

### 🚧 En Desarrollo

- Panel de técnicos avanzado
- Sistema de notificaciones push
- Integración con sistemas de pago
- Módulo de inventario de repuestos
- Reportes estadísticos avanzados

### 🎯 Próximas Funcionalidades

- App móvil para técnicos
- Sistema de citas online integrado
- WhatsApp Business API
- Dashboard de métricas en tiempo real

## 📄 Licencia

Este proyecto es privado y está destinado para uso interno del taller.

---

## 👨‍💻 Desarrollado por

**ByteDevelopers Team**
Especialistas en sistemas de gestión empresarial

📧 Contacto: info@bytedevelopers.com
🌐 Website: www.bytedevelopers.com

---

_Última actualización: Octubre 2025_
