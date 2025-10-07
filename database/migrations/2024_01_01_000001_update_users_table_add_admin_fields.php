<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Agregar columnas si no existen (idempotencia)
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('tecnico')->after('email');
            }

            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('role');
            }

            if (!Schema::hasColumn('users', 'must_change_password')) {
                $table->boolean('must_change_password')->default(false)->after('is_active');
            }

            // Asegurar que email sea único si no lo es
            if (!$this->hasUniqueConstraint('users', 'email')) {
                $table->unique('email');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }

            if (Schema::hasColumn('users', 'is_active')) {
                $table->dropColumn('is_active');
            }

            if (Schema::hasColumn('users', 'must_change_password')) {
                $table->dropColumn('must_change_password');
            }
        });
    }

    /**
     * Verificar si existe un constraint único en una columna
     */
    private function hasUniqueConstraint(string $table, string $column): bool
    {
        $indexes = Schema::getConnection()
            ->getDoctrineSchemaManager()
            ->listTableIndexes($table);

        foreach ($indexes as $index) {
            if ($index->isUnique() && in_array($column, $index->getColumns())) {
                return true;
            }
        }

        return false;
    }
};
