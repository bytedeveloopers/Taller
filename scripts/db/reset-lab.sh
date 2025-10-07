#!/usr/bin/env bash
set -e
# Resetea la BD activa de .env (apunta antes a la lab) y corre migraciones + seeders
echo "🧪 Resetting laboratory database..."
npx prisma migrate reset --force
echo "🌱 Seeding minimal data (admin only)..."
npx tsx prisma/seed-lab.ts
echo "✅ OK: BD lab reseteada y seeders ejecutados."
