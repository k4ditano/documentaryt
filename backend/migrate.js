import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function runMigration() {
    try {
        // Crear una tabla temporal con la nueva estructura
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS users_temp (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Copiar los datos existentes, manejando el caso donde las columnas no existen
        await db.runAsync(`
            INSERT OR IGNORE INTO users_temp (id, username, email, password)
            SELECT id, 
                   COALESCE(name, email) as username, 
                   email, 
                   password
            FROM users
        `);

        // Eliminar la tabla original
        await db.runAsync('DROP TABLE IF EXISTS users');

        // Renombrar la tabla temporal a users
        await db.runAsync('ALTER TABLE users_temp RENAME TO users');

        console.log('Migración completada exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('Error al ejecutar la migración:', error);
        process.exit(1);
    }
}

// Promisificar los métodos de la base de datos
db.runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error en db.run:', err);
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

runMigration(); 