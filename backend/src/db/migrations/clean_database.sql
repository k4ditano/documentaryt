-- Desactivar las restricciones de clave foránea temporalmente
PRAGMA foreign_keys = OFF;

-- Eliminar todas las tablas excepto users
DROP TABLE IF EXISTS simple_reminders;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS folders;

-- Vaciar la tabla sqlite_sequence excepto para users
DELETE FROM sqlite_sequence WHERE name != 'users';

-- Reactivar las restricciones de clave foránea
PRAGMA foreign_keys = ON; 