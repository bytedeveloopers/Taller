<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EnsureAdmin
{
    /**
     * Manejar la solicitud entrante.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar si el usuario está autenticado
        if (!auth()->check()) {
            return response()->json([
                'message' => 'No autenticado'
            ], 401);
        }

        // Verificar si el usuario es administrador
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Acceso denegado. Se requieren permisos de administrador.'
            ], 403);
        }

        // Verificar si el usuario está activo
        if (!auth()->user()->is_active) {
            return response()->json([
                'message' => 'Cuenta desactivada. Contacte al administrador.'
            ], 403);
        }

        return $next($request);
    }
}
