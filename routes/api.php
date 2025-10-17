<?php

use App\Http\Controllers\AdminTecnicoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rutas de autenticación (ya existentes con Sanctum)
// POST /api/auth/login

// Rutas protegidas para administradores
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // CRUD de técnicos
    Route::get('/tecnicos', [AdminTecnicoController::class, 'index'])
        ->name('admin.tecnicos.index');

    Route::post('/tecnicos', [AdminTecnicoController::class, 'store'])
        ->name('admin.tecnicos.store');

    Route::patch('/tecnicos/{tecnico}', [AdminTecnicoController::class, 'update'])
        ->name('admin.tecnicos.update');

    Route::delete('/tecnicos/{tecnico}', [AdminTecnicoController::class, 'destroy'])
        ->name('admin.tecnicos.destroy');

    // Estadísticas de técnicos
    Route::get('/tecnicos/stats', [AdminTecnicoController::class, 'stats'])
        ->name('admin.tecnicos.stats');
});
