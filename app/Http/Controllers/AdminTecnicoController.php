<?php

namespace App\Http\Controllers;

use App\Models\Tecnico;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminTecnicoController extends Controller
{
    /**
     * Listar todos los técnicos con su información de usuario
     */
    public function index()
    {
        try {
            $tecnicos = Tecnico::with(['user:id,email,is_active,must_change_password'])
                ->orderBy('nombre')
                ->get();

            return response()->json($tecnicos);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los técnicos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo técnico
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telefono' => 'nullable|string|max:20',
            'especialidad' => 'nullable|string|max:255',
            'horario_inicio' => 'nullable|date_format:H:i',
            'horario_fin' => 'nullable|date_format:H:i',
            'password' => 'nullable|string|min:8',
            'must_change_password' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();

            // Generar contraseña si no se proporciona
            $password = $request->password;
            $autoPassword = null;

            if (!$password) {
                $password = Str::random(10);
                $autoPassword = $password;
            }

            // Crear usuario
            $user = User::create([
                'name' => $request->nombre,
                'email' => $request->email,
                'password' => Hash::make($password),
                'role' => 'tecnico',
                'is_active' => true,
                'must_change_password' => $request->must_change_password ?? true,
            ]);

            // Crear técnico
            $tecnico = Tecnico::create([
                'user_id' => $user->id,
                'nombre' => $request->nombre,
                'telefono' => $request->telefono,
                'especialidad' => $request->especialidad,
                'horario_inicio' => $request->horario_inicio,
                'horario_fin' => $request->horario_fin,
            ]);

            // Cargar la relación con el usuario
            $tecnico->load('user:id,email,is_active,must_change_password');

            DB::commit();

            $response = [
                'tecnico' => $tecnico,
            ];

            // Incluir contraseña automática si se generó
            if ($autoPassword) {
                $response['auto_password'] = $autoPassword;
            }

            return response()->json($response, 201);
        } catch (\Exception $e) {
            DB::rollback();

            return response()->json([
                'message' => 'Error al crear el técnico',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un técnico existente
     */
    public function update(Request $request, Tecnico $tecnico)
    {
        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($tecnico->user_id)
            ],
            'telefono' => 'nullable|string|max:20',
            'especialidad' => 'nullable|string|max:255',
            'horario_inicio' => 'nullable|date_format:H:i',
            'horario_fin' => 'nullable|date_format:H:i',
            'is_active' => 'sometimes|boolean',
            'must_change_password' => 'sometimes|boolean',
        ]);

        try {
            DB::beginTransaction();

            // Actualizar datos del técnico
            $tecnico->update($request->only([
                'nombre',
                'telefono',
                'especialidad',
                'horario_inicio',
                'horario_fin'
            ]));

            // Actualizar datos del usuario si se proporcionan
            $userUpdates = $request->only(['email', 'is_active', 'must_change_password']);

            if ($request->has('nombre')) {
                $userUpdates['name'] = $request->nombre;
            }

            if (!empty($userUpdates)) {
                $tecnico->user->update($userUpdates);
            }

            // Recargar la relación
            $tecnico->load('user:id,email,is_active,must_change_password');

            DB::commit();

            return response()->json($tecnico);
        } catch (\Exception $e) {
            DB::rollback();

            return response()->json([
                'message' => 'Error al actualizar el técnico',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un técnico (elimina el usuario en cascada)
     */
    public function destroy(Tecnico $tecnico)
    {
        try {
            // Al eliminar el usuario, el técnico se elimina por cascada
            $tecnico->user->delete();

            return response()->json([
                'message' => 'Técnico eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el técnico',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de técnicos
     */
    public function stats()
    {
        try {
            $stats = [
                'totalTecnicos' => Tecnico::count(),
                'tecnicosActivos' => Tecnico::whereHas('user', function ($q) {
                    $q->where('is_active', true);
                })->count(),
                'cargaPromedio' => 75, // Placeholder - implementar lógica real
                'disponibles' => Tecnico::whereHas('user', function ($q) {
                    $q->where('is_active', true);
                })->count(), // Placeholder - implementar lógica real
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
