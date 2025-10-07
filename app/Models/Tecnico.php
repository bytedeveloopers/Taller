<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tecnico extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'nombre',
        'telefono',
        'especialidad',
        'horario_inicio',
        'horario_fin',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'horario_inicio' => 'datetime:H:i',
        'horario_fin' => 'datetime:H:i',
    ];

    /**
     * Relación con el modelo User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para técnicos activos
     */
    public function scopeActivos($query)
    {
        return $query->whereHas('user', function ($q) {
            $q->where('is_active', true);
        });
    }

    /**
     * Obtener el nombre completo del técnico
     */
    public function getNombreCompletoAttribute(): string
    {
        return $this->nombre;
    }

    /**
     * Obtener el email del técnico desde el usuario
     */
    public function getEmailAttribute(): string
    {
        return $this->user->email ?? '';
    }

    /**
     * Verificar si el técnico está activo
     */
    public function getActivoAttribute(): bool
    {
        return $this->user->is_active ?? false;
    }
}
