import { db } from '../db';
import * as simpleReminders from './migrations/20240229_add_simple_reminders';

// Lista de migraciones en orden
const migrations = [
    {
        name: 'add_simple_reminders',
        up: simpleReminders.up,
        down: simpleReminders.down
    }
];

// Crear tabla de migraciones si no existe
async function initMigrationTable() {
    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// Verificar si una migración ya fue ejecutada
async function isMigrationExecuted(name) {
    const result = await db.getAsync(
        'SELECT COUNT(*) as count FROM migrations WHERE name = ?',
        [name]
    );
    return result.count > 0;
}

// Registrar una migración como ejecutada
async function recordMigration(name) {
    await db.runAsync(
        'INSERT INTO migrations (name) VALUES (?)',
        [name]
    );
}

// Eliminar registro de una migración
async function removeMigrationRecord(name) {
    await db.runAsync(
        'DELETE FROM migrations WHERE name = ?',
        [name]
    );
}

// Ejecutar migraciones pendientes
async function migrate() {
    try {
        await initMigrationTable();

        for (const migration of migrations) {
            const isExecuted = await isMigrationExecuted(migration.name);
            
            if (!isExecuted) {
                console.log(`🔄 Ejecutando migración: ${migration.name}`);
                await migration.up();
                await recordMigration(migration.name);
                console.log(`✅ Migración completada: ${migration.name}`);
            } else {
                console.log(`⏭️ Migración ya ejecutada: ${migration.name}`);
            }
        }

        console.log('✨ Todas las migraciones han sido ejecutadas');
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    } finally {
        await db.closeAsync();
    }
}

// Revertir última migración
async function rollback() {
    try {
        await initMigrationTable();

        // Obtener última migración ejecutada
        const lastMigration = await db.getAsync(
            'SELECT name FROM migrations ORDER BY executed_at DESC LIMIT 1'
        );

        if (lastMigration) {
            const migration = migrations.find(m => m.name === lastMigration.name);
            
            if (migration) {
                console.log(`🔄 Revirtiendo migración: ${migration.name}`);
                await migration.down();
                await removeMigrationRecord(migration.name);
                console.log(`✅ Migración revertida: ${migration.name}`);
            }
        } else {
            console.log('ℹ️ No hay migraciones para revertir');
        }
    } catch (error) {
        console.error('❌ Error durante el rollback:', error);
        throw error;
    } finally {
        await db.closeAsync();
    }
}

// Ejecutar según el comando
const command = process.argv[2];

if (command === 'rollback') {
    rollback();
} else {
    migrate();
} 