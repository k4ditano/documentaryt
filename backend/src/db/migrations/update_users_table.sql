-- Crear una tabla temporal con la nueva estructura
CREATE TABLE users_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copiar los datos existentes, convirtiendo 'name' a 'username'
INSERT INTO users_temp (id, username, email, password, created_at, updated_at)
SELECT id, name, email, password, created_at, updated_at
FROM users;

-- Eliminar la tabla original
DROP TABLE users;

-- Renombrar la tabla temporal a users
ALTER TABLE users_temp RENAME TO users; 