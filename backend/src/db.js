import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Usar la ruta de la base de datos desde las variables de entorno o una ruta por defecto
const dbPath = process.env.DB_PATH || resolve(__dirname, '../database.sqlite');
console.log('Usando base de datos en:', dbPath);

const db = new sqlite3.Database(dbPath);

// Promisificar métodos de la base de datos
db.getAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) {
                console.error('Error en db.get:', err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

db.allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error en db.all:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

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

// Función para inicializar la base de datos
export async function initializeDatabase() {
    try {
        // Tabla de usuarios
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de carpetas
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS folders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                parent_id INTEGER,
                user_id INTEGER NOT NULL,
                position INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES folders (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // Tabla de páginas
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS pages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT,
                parent_id INTEGER,
                user_id INTEGER NOT NULL,
                position INTEGER DEFAULT 0,
                tags TEXT DEFAULT '[]',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES folders (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // Tabla de tareas
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
                priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
                due_date DATETIME,
                linked_pages TEXT DEFAULT '[]',
                user_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // Tabla de notificaciones
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT,
                read INTEGER DEFAULT 0,
                data TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // Tabla de recordatorios simples
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS simple_reminders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT,
                reminder_time DATETIME NOT NULL,
                status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'cancelled')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Verificar y añadir columna linked_pages si no existe
        const rows = await db.allAsync(`PRAGMA table_info(tasks)`);
        const hasLinkedPages = rows.some(row => row.name === 'linked_pages');
        
        if (!hasLinkedPages) {
            await db.runAsync(`ALTER TABLE tasks ADD COLUMN linked_pages TEXT DEFAULT '[]'`);
            await db.runAsync(`UPDATE tasks SET linked_pages = '[]' WHERE linked_pages IS NULL`);
        }

        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        throw error;
    }
}

export { db }; 