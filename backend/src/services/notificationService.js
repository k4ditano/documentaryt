import { db } from '../db.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Verificar si la configuración de correo está disponible
const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

let transporter = null;
let emailConfigurationTested = false;

// Función para probar la configuración de correo
async function testEmailConfiguration() {
    if (!isEmailConfigured || emailConfigurationTested) return false;
    
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Verificar la conexión
        await transporter.verify();
        console.log('Servicio de correo configurado y verificado correctamente.');
        emailConfigurationTested = true;
        return true;
    } catch (error) {
        console.error('Error en la configuración del correo:', error.message);
        transporter = null;
        emailConfigurationTested = true;
        return false;
    }
}

if (!isEmailConfigured) {
    console.log('Advertencia: Configuración de correo no encontrada. El sistema funcionará sin envío de correos.');
} else {
    testEmailConfiguration();
}

export const notificationService = {
    // Crear una nueva notificación
    async createNotification(userId, type, title, message, referenceId = null, referenceType = null) {
        try {
            const result = await db.runAsync(
                `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, type, title, message, referenceId, referenceType]
            );
            return result.lastID;
        } catch (error) {
            console.error('Error al crear notificación:', error);
            throw error;
        }
    },

    // Crear un recordatorio para una tarea
    async createTaskReminder(taskId, reminderTime) {
        try {
            await db.runAsync(
                `INSERT INTO reminders (task_id, reminder_time)
                 VALUES (?, ?)`,
                [taskId, reminderTime]
            );
        } catch (error) {
            console.error('Error al crear recordatorio:', error);
            throw error;
        }
    },

    // Obtener recordatorios pendientes
    async getPendingReminders() {
        try {
            const now = new Date().toISOString();
            return await db.allAsync(
                `SELECT r.*, t.title, t.user_id, t.due_date, u.email
                 FROM reminders r
                 JOIN tasks t ON r.task_id = t.id
                 JOIN users u ON t.user_id = u.id
                 WHERE r.reminder_time <= ?
                 AND r.status = 'pending'`,
                [now]
            );
        } catch (error) {
            console.error('Error al obtener recordatorios pendientes:', error);
            throw error;
        }
    },

    // Marcar recordatorio como enviado
    async markReminderAsSent(reminderId) {
        try {
            await db.runAsync(
                `UPDATE reminders
                 SET status = 'sent'
                 WHERE id = ?`,
                [reminderId]
            );
        } catch (error) {
            console.error('Error al actualizar estado del recordatorio:', error);
            throw error;
        }
    },

    // Enviar notificación por correo
    async sendEmailNotification(email, subject, message) {
        // Si el correo no está configurado o falló la prueba de configuración
        if (!isEmailConfigured || !transporter) {
            if (!emailConfigurationTested) {
                console.log('Email no enviado (configuración no disponible):', {
                    to: email,
                    subject: subject
                });
            }
            return;
        }

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: subject,
                html: message
            });
            console.log('Email enviado correctamente a:', email);
        } catch (error) {
            // Si hay un error de autenticación, desactivar el transportador
            if (error.responseCode === 535) {
                console.error('Error de autenticación de correo. Desactivando el servicio de correo.');
                transporter = null;
            } else {
                console.error('Error al enviar correo:', error.message);
            }
        }
    },

    // Procesar recordatorios pendientes
    async processReminders() {
        try {
            const pendingReminders = await this.getPendingReminders();
            
            for (const reminder of pendingReminders) {
                // Crear notificación en la plataforma
                await this.createNotification(
                    reminder.user_id,
                    'task_reminder',
                    'Recordatorio de tarea',
                    `La tarea "${reminder.title}" vence pronto.`,
                    reminder.task_id,
                    'task'
                );

                // Enviar correo electrónico (si está configurado y funcionando)
                if (transporter) {
                    const emailMessage = `
                        <h2>Recordatorio de tarea</h2>
                        <p>Tu tarea "${reminder.title}" vence el ${new Date(reminder.due_date).toLocaleString()}.</p>
                        <p>Por favor, revisa tu lista de tareas y actualiza el estado si es necesario.</p>
                    `;

                    await this.sendEmailNotification(
                        reminder.email,
                        'Recordatorio de tarea pendiente',
                        emailMessage
                    );
                }

                // Marcar recordatorio como enviado
                await this.markReminderAsSent(reminder.id);
            }

            return {
                processed: pendingReminders.length,
                emailEnabled: Boolean(transporter)
            };
        } catch (error) {
            console.error('Error al procesar recordatorios:', error);
            throw error;
        }
    }
}; 