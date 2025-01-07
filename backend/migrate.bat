@echo off
echo Ejecutando migración...

:: Ejecutar la migración
sqlite3 database.sqlite ".read src/db/migrations/add_linked_pages_to_tasks.sql"

:: Verificar si la migración fue exitosa
if %ERRORLEVEL% EQU 0 (
    echo Migración completada exitosamente
) else (
    echo Error al ejecutar la migración
    exit /b 1
) 