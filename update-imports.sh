#!/bin/bash

# Lista de archivos a modificar
files=(
  "backend/src/routes/files.js"
  "backend/src/routes/notifications.js"
  "backend/src/routes/positions.js"
  "backend/src/routes/pages.js"
  "backend/src/routes/auth.js"
  "backend/src/routes/reminders.js"
  "backend/src/routes/folders.js"
  "backend/src/routes/tasks.js"
)

# Actualizar cada archivo
for file in "${files[@]}"; do
  sed -i 's/import authenticateToken from/import { authenticateToken } from/g' "$file"
done 