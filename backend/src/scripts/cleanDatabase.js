import { db } from '../db.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function cleanDatabase() {
    try {
        console.log('Iniciando limpieza de la base de datos...');
        
        // Leer el archivo SQL
        const sqlPath = resolve(__dirname, '../db/migrations/clean_database.sql');
        console.log('Archivo SQL de limpieza:', sqlPath);
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Ejecutar las sentencias SQL una por una
        const statements = sql.split(';').filter(stmt => stmt.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                console.log('Ejecutando:', statement.trim());
                await db.runAsync(statement);
            }
        }
        
        // Verificar las tablas restantes
        const tables = await db.allAsync(`
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            AND name NOT IN ('sqlite_sequence')
        `);
        
        console.log('\nTablas restantes en la base de datos:');
        tables.forEach(table => console.log(`- ${table.name}`));
        
        console.log('\nBase de datos limpiada exitosamente.');
        console.log('Solo se mantiene la tabla de usuarios con sus datos.');
        
        process.exit(0);
    } catch (error) {
        console.error('Error al limpiar la base de datos:', error);
        process.exit(1);
    }
}

// Ejecutar la limpieza
cleanDatabase(); 