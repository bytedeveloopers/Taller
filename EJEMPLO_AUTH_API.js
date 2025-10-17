// Ejemplo de uso del API de autenticación para técnicos
// Ubicación: src/app/api/auth/login/route.ts

/*
=== ENDPOINTS CREADOS ===

1. POST /api/auth/login - Autenticar técnico
2. POST /api/auth/logout - Cerrar sesión
3. GET /api/auth/verify - Verificar token actual

=== EJEMPLO DE USO ===

// 1. Login exitoso
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'tecnico@taller.com',
    password: 'tech123'
  })
});

const result = await loginResponse.json();
// Respuesta exitosa (200):
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Juan Técnico",
    "email": "tecnico@taller.com",
    "role": "TECNICO",
    "tecnico": {
      "id": 1,
      "nombre": "Juan Técnico",
      "especialidad": "Mecánica General",
      "capacidad": 8,
      "carga": 0
    }
  }
}

// Cookie 'auth_token' se setea automáticamente (httpOnly)

// 2. Verificar sesión actual
const verifyResponse = await fetch('/api/auth/verify');
const verified = await verifyResponse.json();

// 3. Logout
const logoutResponse = await fetch('/api/auth/logout', { method: 'POST' });
const loggedOut = await logoutResponse.json();

=== CÓDIGOS DE ERROR ===

400 - Datos inválidos (Zod validation)
401 - Credenciales incorrectas / Token inválido
403 - Usuario no es técnico / Usuario inactivo / Sin perfil técnico
500 - Error interno del servidor

=== VALIDACIONES IMPLEMENTADAS ===

✅ Email y contraseña requeridos (Zod)
✅ Usuario debe existir en BD
✅ Contraseña debe coincidir (bcrypt)
✅ Usuario debe tener role "TECNICO"
✅ Usuario debe estar activo (is_active = true)
✅ Debe existir perfil de técnico vinculado
✅ JWT firmado con HS256 y expiración 7 días
✅ Cookie httpOnly, secure en producción
✅ Error claro si JWT_SECRET no está configurado

=== USUARIO DE PRUEBA CREADO ===

Email: tecnico@taller.com
Password: tech123
Rol: TECNICO
Especialidad: Mecánica General

*/
