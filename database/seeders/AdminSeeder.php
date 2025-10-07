<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear o actualizar el usuario administrador único
        User::updateOrCreate(
            ['email' => 'admin@taller.com'],
            [
                'name' => 'Administrador',
                'email' => 'admin@taller.com',
                'password' => Hash::make('Admin123!'),
                'role' => 'admin',
                'is_active' => true,
                'must_change_password' => false,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Usuario administrador creado/actualizado exitosamente');
        $this->command->info('📧 Email: admin@taller.com');
        $this->command->info('🔐 Password: Admin123!');
        $this->command->warn('⚠️  Se recomienda cambiar la contraseña después del primer login');
    }
}
