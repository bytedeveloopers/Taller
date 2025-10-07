@echo off
REM Uso:
REM scripts\db\clone-structure.bat SRC_DB TGT_DB [HOST] [USER] [PASS]
REM Ejemplo:
REM scripts\db\clone-structure.bat PRODBD taller_lab localhost root secret

set SRC_DB=%1
set TGT_DB=%2
if "%TGT_DB%"=="" set TGT_DB=taller_lab
set HOST=%3
if "%HOST%"=="" set HOST=localhost
set USER=%4
if "%USER%"=="" set USER=root
set PASS=%5

if "%SRC_DB%"=="" (
  echo Falta SRC_DB. Uso: scripts\db\clone-structure.bat SRC_DB TGT_DB [HOST] [USER] [PASS]
  exit /b 1
)

set TMP_SCHEMA=tmp_schema.sql

echo ^>^> Dump de estructura (sin datos) de "%SRC_DB%"...
IF "%PASS%"=="" (
  mysqldump -h %HOST% -u %USER% --no-data --routines --triggers --events --single-transaction --set-gtid-purged=OFF %SRC_DB% > %TMP_SCHEMA%
) ELSE (
  mysqldump -h %HOST% -u %USER% -p%PASS% --no-data --routines --triggers --events --single-transaction --set-gtid-purged=OFF %SRC_DB% > %TMP_SCHEMA%
)

echo ^>^> Creando BD destino "%TGT_DB%"...
IF "%PASS%"=="" (
  mysql -h %HOST% -u %USER% -e "CREATE DATABASE IF NOT EXISTS %TGT_DB% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  mysql -h %HOST% -u %USER% %TGT_DB% < %TMP_SCHEMA%
) ELSE (
  mysql -h %HOST% -u %USER% -p%PASS% -e "CREATE DATABASE IF NOT EXISTS %TGT_DB% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  mysql -h %HOST% -u %USER% -p%PASS% %TGT_DB% < %TMP_SCHEMA%
)

echo ^>^> Listo. Estructura clonada en "%TGT_DB%".
