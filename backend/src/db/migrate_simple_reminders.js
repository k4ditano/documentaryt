import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function migrate() {
    try {
        // Abrir la conexión con la base de datos
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        console.log('🔄 Iniciando migración de recordatorios simples...');

        // Crear la tabla de recordatorios simples
        await db.exec(`
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

        // Crear índices
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_simple_reminders_user_id 
            ON simple_reminders(user_id)
        `);

        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_simple_reminders_reminder_time 
            ON simple_reminders(reminder_time)
        `);

        console.log('✅ Migración completada exitosamente');
        await db.close();

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

// Ejecutar la migración
migrate(); 