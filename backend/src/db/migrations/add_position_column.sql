-- Añadir columna position a la tabla pages si no existe
ALTER TABLE pages ADD COLUMN position INTEGER DEFAULT 0;

-- Añadir columna position a la tabla folders si no existe
ALTER TABLE folders ADD COLUMN position INTEGER DEFAULT 0;

-- Actualizar posiciones de páginas
UPDATE pages 
SET position = (
  SELECT COUNT(*) 
  FROM pages p2 
  WHERE p2.id < pages.id 
  AND p2.parent_id IS NULL 
  AND p2.user_id = pages.user_id
)
WHERE parent_id IS NULL;

-- Actualizar posiciones de páginas dentro de carpetas
UPDATE pages 
SET position = (
  SELECT COUNT(*) 
  FROM pages p2 
  WHERE p2.id < pages.id 
  AND p2.parent_id = pages.parent_id 
  AND p2.user_id = pages.user_id
)
WHERE parent_id IS NOT NULL;

-- Actualizar posiciones de carpetas
UPDATE folders 
SET position = (
  SELECT COUNT(*) 
  FROM folders f2 
  WHERE f2.id < folders.id 
  AND f2.parent_id IS NULL 
  AND f2.user_id = folders.user_id
)
WHERE parent_id IS NULL;

-- Actualizar posiciones de subcarpetas
UPDATE folders 
SET position = (
  SELECT COUNT(*) 
  FROM folders f2 
  WHERE f2.id < folders.id 
  AND f2.parent_id = folders.parent_id 
  AND f2.user_id = folders.user_id
)
WHERE parent_id IS NOT NULL; 