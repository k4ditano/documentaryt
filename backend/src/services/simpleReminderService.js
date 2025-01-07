import { db } from '../db.js';
import { notificationService } from './notificationService.js';

export const simpleReminderService = {
    // Verificar si la tabla existe
    async checkTableExists() {
        try {
            const result = await db.getAsync(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='simple_reminders'
            `);
            return Boolean(result);
        } catch (error) {
            console.error('Error al verificar la tabla:', error);
            return false;
        }
    },

    // Crear un nuevo recordatorio
    async createReminder(userId, title, message, reminderTime) {
        try {
            const result = await db.runAsync(
                `INSERT INTO simple_reminders (user_id, title, message, reminder_time)
                 VALUES (?, ?, ?, ?)`,
                [userId, title, message, reminderTime]
            );
            return result.lastID;
        } catch (error) {
            console.error('Error al crear recordatorio simple:', error);
            throw error;
        }
    },

    // Obtener recordatorios de un usuario
    async getUserReminders(userId) {
        try {
            return await db.allAsync(
                `SELECT * FROM simple_reminders 
                 WHERE user_id = ? 
                 AND status = 'pending'
                 ORDER BY reminder_time ASC`,
                [userId]
            );
        } catch (error) {
            console.error('Error al obtener recordatorios del usuario:', error);
            throw error;
        }
    },

    // Obtener recordatorios pendientes que deben enviarse
    async getPendingReminders() {
        try {
            const now = new Date().toISOString();
            return await db.allAsync(
                `SELECT r.*, u.email 
                 FROM simple_reminders r
                 JOIN users u ON r.user_id = u.id
                 WHERE r.reminder_time <= ?
                 AND r.status = 'pending'`,
                [now]
            );
        } catch (error) {
            console.error('Error al obtener recordatorios pendientes:', error);
            throw error;
        }
    },

    // Marcar un recordatorio como enviado
    async markAsSent(reminderId) {
        try {
            await db.runAsync(
                `UPDATE simple_reminders 
                 SET status = 'sent' 
                 WHERE id = ?`,
                [reminderId]
            );
        } catch (error) {
            console.error('Error al marcar recordatorio como enviado:', error);
            throw error;
        }
    },

    // Cancelar un recordatorio
    async cancelReminder(reminderId, userId) {
        try {
            await db.runAsync(
                `UPDATE simple_reminders 
                 SET status = 'cancelled' 
                 WHERE id = ? AND user_id = ?`,
                [reminderId, userId]
            );
        } catch (error) {
            console.error('Error al cancelar recordatorio:', error);
            throw error;
        }
    },

    // Procesar recordatorios pendientes
    async processReminders() {
        try {
            const pendingReminders = await this.getPendingReminders();
            
            for (const reminder of pendingReminders) {
                // Crear notificación
                await notificationService.createNotification(
                    reminder.user_id,
                    'reminder',
                    reminder.title,
                    reminder.message || 'Recordatorio programado'
                );

                // Marcar como enviado
                await this.markAsSent(reminder.id);

                console.log(`Recordatorio procesado: ${reminder.id} - ${reminder.title}`);
            }

            return pendingReminders.length;
        } catch (error) {
            console.error('Error al procesar recordatorios:', error);
            throw error;
        }
    }
}; 