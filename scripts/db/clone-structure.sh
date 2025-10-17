#!/usr/bin/env bash
set -e

# Uso:
# ./scripts/db/clone-structure.sh SRC_DB TGT_DB [HOST] [USER] [PASS]
# Ejemplo:
# ./scripts/db/clone-structure.sh PRODBD taller_lab localhost root secret

SRC_DB="${1:-}"
TGT_DB="${2:-taller_lab}"
HOST="${3:-localhost}"
USER="${4:-root}"
PASS="${5:-}"

if [ -z "$SRC_DB" ]; then
  echo "Falta SRC_DB. Uso: ./scripts/db/clone-structure.sh SRC_DB TGT_DB [HOST] [USER] [PASS]"
  exit 1
fi

TMP_SCHEMA="./tmp_schema.sql"
mkdir -p "$(dirname "$TMP_SCHEMA")"

echo ">> Dump de estructura (sin datos) de '$SRC_DB'..."
if [ -n "$PASS" ]; then
  mysqldump -h "$HOST" -u "$USER" -p"$PASS" \
    --no-data --routines --triggers --events --single-transaction --set-gtid-purged=OFF \
    "$SRC_DB" > "$TMP_SCHEMA"
else
  mysqldump -h "$HOST" -u "$USER" \
    --no-data --routines --triggers --events --single-transaction --set-gtid-purged=OFF \
    "$SRC_DB" > "$TMP_SCHEMA"
fi

echo ">> Creando BD destino '$TGT_DB'..."
if [ -n "$PASS" ]; then
  mysql -h "$HOST" -u "$USER" -p"$PASS" -e "CREATE DATABASE IF NOT EXISTS \`$TGT_DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  mysql -h "$HOST" -u "$USER" -p"$PASS" "$TGT_DB" < "$TMP_SCHEMA"
else
  mysql -h "$HOST" -u "$USER" -e "CREATE DATABASE IF NOT EXISTS \`$TGT_DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  mysql -h "$HOST" -u "$USER" "$TGT_DB" < "$TMP_SCHEMA"
fi

echo ">> Listo. Estructura clonada en '$TGT_DB'."
