-- Añadir columna linked_pages a la tabla tasks
ALTER TABLE tasks ADD COLUMN linked_pages TEXT DEFAULT '[]';

-- Actualizar las tareas existentes para tener un array vacío en linked_pages
UPDATE tasks SET linked_pages = '[]' WHERE linked_pages IS NULL; 