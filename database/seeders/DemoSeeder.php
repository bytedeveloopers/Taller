<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Tecnico;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Técnicos de ejemplo
        $t1 = User::updateOrCreate(
            ['email' => 'tecnico1@taller.com'],
            [
                'name' => 'Técnico Uno',
                'password' => Hash::make('Temporal123!'),
                'role' => 'tecnico',
                'is_active' => true,
                'must_change_password' => true,
            ]
        );
        Tecnico::updateOrCreate(
            ['user_id' => $t1->id],
            ['nombre' => 'Técnico Uno', 'telefono' => '555-0101', 'especialidad' => 'Motor', 'horario_inicio' => '08:00', 'horario_fin' => '17:00']
        );

        $t2 = User::updateOrCreate(
            ['email' => 'tecnico2@taller.com'],
            [
                'name' => 'Técnico Dos',
                'password' => Hash::make('Temporal123!'),
                'role' => 'tecnico',
                'is_active' => true,
                'must_change_password' => true,
            ]
        );
        Tecnico::updateOrCreate(
            ['user_id' => $t2->id],
            ['nombre' => 'Técnico Dos', 'telefono' => '555-0102', 'especialidad' => 'Suspensión', 'horario_inicio' => '08:00', 'horario_fin' => '17:00']
        );

        $this->command->info('✅ Técnicos de demo creados exitosamente');
    }
}
