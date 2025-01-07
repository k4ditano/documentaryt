import { simpleReminderService } from '../services/simpleReminderService.js';

// Intervalo de verificación (5 minutos)
const CHECK_INTERVAL = 5 * 60 * 1000;

async function checkTableExists() {
    try {
        const result = await simpleReminderService.checkTableExists();
        return result;
    } catch (error) {
        return false;
    }
}

async function processReminders() {
    try {
        // Verificar si la tabla existe antes de procesar
        const tableExists = await checkTableExists();
        if (!tableExists) {
            console.log('Esperando a que la tabla simple_reminders sea creada...');
            return;
        }

        const processedCount = await simpleReminderService.processReminders();
        if (processedCount > 0) {
            console.log(`Se procesaron ${processedCount} recordatorios`);
        }
    } catch (error) {
        // Solo logear errores que no sean de tabla no existente
        if (!error.message?.includes('no such table')) {
            console.error('Error al procesar recordatorios:', error);
        }
    }
}

// Iniciar el procesamiento de recordatorios
console.log('Iniciando worker de recordatorios simples...');

// Ejecutar inmediatamente al inicio
processReminders();

// Configurar el intervalo de ejecución
setInterval(processReminders, CHECK_INTERVAL); 