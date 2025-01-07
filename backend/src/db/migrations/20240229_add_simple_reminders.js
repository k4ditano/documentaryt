import { db } from '../../db';

export async function up() {
    try {
        // Crear la tabla de recordatorios simples
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

        // Crear índices
        await db.runAsync(`
            CREATE INDEX IF NOT EXISTS idx_simple_reminders_user_id 
            ON simple_reminders(user_id)
        `);

        await db.runAsync(`
            CREATE INDEX IF NOT EXISTS idx_simple_reminders_reminder_time 
            ON simple_reminders(reminder_time)
        `);

        console.log('✅ Migración de recordatorios simples completada');
    } catch (error) {
        console.error('❌ Error en la migración de recordatorios simples:', error);
        throw error;
    }
}

export async function down() {
    try {
        // Eliminar índices
        await db.runAsync(`DROP INDEX IF EXISTS idx_simple_reminders_user_id`);
        await db.runAsync(`DROP INDEX IF EXISTS idx_simple_reminders_reminder_time`);
        
        // Eliminar tabla
        await db.runAsync(`DROP TABLE IF EXISTS simple_reminders`);
        
        console.log('✅ Rollback de recordatorios simples completado');
    } catch (error) {
        console.error('❌ Error en el rollback de recordatorios simples:', error);
        throw error;
    }
} 