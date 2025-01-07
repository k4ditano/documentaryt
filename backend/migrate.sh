#!/bin/bash

# Verificar si sqlite3 está instalado
if ! command -v sqlite3 &> /dev/null; then
    echo "Error: sqlite3 no está instalado"
    exit 1
fi

# Ejecutar la migración
echo "Ejecutando migración..."
sqlite3 database.sqlite < src/db/migrations/add_linked_pages_to_tasks.sql

# Verificar si la migración fue exitosa
if [ $? -eq 0 ]; then
    echo "Migración completada exitosamente"
else
    echo "Error al ejecutar la migración"
    exit 1
fi 