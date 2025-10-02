# 🗄️ Guía de Conexión a Base de Datos MySQL

## 📋 **Pasos para Conectar el Dashboard con Datos Reales**

### **1. Iniciar XAMPP**

- Abrir **XAMPP Control Panel**
- Iniciar servicios **Apache** y **MySQL**
- Verificar que MySQL esté corriendo en puerto **3306**

### **2. Verificar Base de Datos**

```bash
# Verificar conexión
npx prisma db push

# Si hay error, crear la base de datos manualmente:
# - Abrir phpMyAdmin (http://localhost/phpmyadmin)
# - Crear base de datos: taller_autorepair
```

### **3. Poblar con Datos de Ejemplo**

```bash
# Ejecutar el seed para crear datos iniciales
npm run db:seed
```

### **4. Reiniciar el Servidor**

```bash
# Reiniciar Next.js para aplicar cambios
npm run dev
```

---

## ✅ **Estado Actual del Dashboard**

### **🔄 Modo Híbrido Implementado:**

- ✅ **Intenta conectar con MySQL** primero
- ✅ **Fallback a datos mock** si BD no disponible
- ✅ **Dashboard siempre funcional** independiente de BD
- ✅ **Logs informativos** en consola del servidor

### **📊 Datos que se Obtienen de la BD:**

1. **Clientes**: Conteo total de registros
2. **Vehículos**: Inventario completo
3. **Citas**: Por estado (pendiente, proceso, completada)
4. **Cotizaciones**: Total y aprobadas
5. **Ingresos**: Calculados desde cotizaciones
6. **Citas Recientes**: Últimas 5 con detalles completos

### **🎯 Beneficios:**

- **Desarrollo**: Funciona sin configurar BD
- **Producción**: Usa datos reales automáticamente
- **Robustez**: No se rompe si BD está offline
- **Escalabilidad**: Fácil transición a datos reales

---

## 🚀 **Próximos Pasos Recomendados**

1. **Configurar XAMPP** y ejecutar `npx prisma db push`
2. **Poblar datos** con `npm run db:seed`
3. **Verificar logs** en consola del servidor
4. **Confirmar** que muestra datos reales en dashboard

**¡El sistema está listo para datos reales! 🎉**
