# Sistema de Gestión Automotriz - Instrucciones para Copilot

Este es un sistema completo de gestión automotriz desarrollado con Next.js 15.5.3, TypeScript y MySQL.

## Características Principales

### Dashboard Administrativo

- Sistema de 12 secciones especializadas
- Navegación por sidebar fija
- Sección de recepción con documentación fotográfica de vehículos
- Gestión de vehículos en taller con estados y progreso
- Sistema de códigos de seguimiento para consultas de clientes

### Tecnologías Utilizadas

- **Frontend**: Next.js 15.5.3 con App Router, TypeScript, Tailwind CSS
- **Backend**: API Routes de Next.js, Prisma ORM
- **Base de Datos**: MySQL (XAMPP localhost)
- **UI/UX**: Heroicons, sistema de toast notifications, scrollbars personalizados
- **Funcionalidades**: Captura de fotos reales, generación de PDFs, códigos de seguimiento

### Estructura del Proyecto

- Componentes modulares organizados por funcionalidad
- Sistema de autenticación y roles
- API endpoints para manejo de fotos y datos de vehículos
- Integración completa con cámara para documentación de daños

### Configuración de Desarrollo

- Puerto por defecto: 3000 (alternativo: 3002)
- Base de datos: MySQL en XAMPP
- Comando de desarrollo: `npm run dev`

### Notas de Implementación

- Sistema de fotos de inspección con observaciones específicas
- Generación automática de códigos de seguimiento únicos
- Reportes en PDF con jsPDF
- Gestión completa del flujo de trabajo automotriz
