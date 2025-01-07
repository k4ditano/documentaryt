import express from 'express';
import { simpleReminderService } from '../services/simpleReminderService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Crear un nuevo recordatorio
router.post('/', async (req, res) => {
    try {
        const { title, message, reminderTime } = req.body;
        const userId = req.user.id;

        if (!title || !reminderTime) {
            return res.status(400).json({ 
                error: 'El título y la fecha/hora del recordatorio son obligatorios' 
            });
        }

        // Validar que la fecha del recordatorio sea futura
        const reminderDate = new Date(reminderTime);
        if (reminderDate <= new Date()) {
            return res.status(400).json({ 
                error: 'La fecha del recordatorio debe ser futura' 
            });
        }

        const reminderId = await simpleReminderService.createReminder(
            userId,
            title,
            message,
            reminderTime
        );

        res.status(201).json({ 
            message: 'Recordatorio creado exitosamente',
            reminderId 
        });
    } catch (error) {
        console.error('Error al crear recordatorio:', error);
        res.status(500).json({ error: 'Error al crear el recordatorio' });
    }
});

// Obtener recordatorios del usuario
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const reminders = await simpleReminderService.getUserReminders(userId);
        res.json(reminders);
    } catch (error) {
        console.error('Error al obtener recordatorios:', error);
        res.status(500).json({ error: 'Error al obtener los recordatorios' });
    }
});

// Cancelar un recordatorio
router.delete('/:id', async (req, res) => {
    try {
        const reminderId = req.params.id;
        const userId = req.user.id;

        await simpleReminderService.cancelReminder(reminderId, userId);
        res.json({ message: 'Recordatorio cancelado exitosamente' });
    } catch (error) {
        console.error('Error al cancelar recordatorio:', error);
        res.status(500).json({ error: 'Error al cancelar el recordatorio' });
    }
});

export default router; 