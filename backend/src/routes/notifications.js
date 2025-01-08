import express from 'express';
import { db } from '../db.js';
import {authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las notificaciones del usuario
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Primero, eliminar notificaciones leídas con más de 24 horas
        await db.runAsync(
            `DELETE FROM notifications 
             WHERE user_id = ? 
             AND read = TRUE 
             AND datetime(created_at) < datetime('now', '-24 hours')`,
            [req.user.id]
        );

        const notifications = await db.allAsync(
            `SELECT * FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [req.user.id]
        );
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las notificaciones' });
    }
});

// Obtener el conteo de notificaciones no leídas
router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
        const result = await db.getAsync(
            `SELECT COUNT(*) as count 
             FROM notifications 
             WHERE user_id = ? AND read = FALSE`,
            [req.user.id]
        );
        res.json({ count: result.count });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el conteo de notificaciones' });
    }
});

// Marcar notificación como leída
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        await db.runAsync(
            `UPDATE notifications 
             SET read = TRUE 
             WHERE id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );

        // Eliminar la notificación después de 1 hora
        setTimeout(async () => {
            try {
                await db.runAsync(
                    'DELETE FROM notifications WHERE id = ? AND user_id = ? AND read = TRUE',
                    [req.params.id, req.user.id]
                );
            } catch (error) {
                console.error('Error al eliminar notificación leída:', error);
            }
        }, 60 * 60 * 1000); // 1 hora

        res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la notificación' });
    }
});

// Marcar todas las notificaciones como leídas
router.put('/read-all', authenticateToken, async (req, res) => {
    try {
        await db.runAsync(
            `UPDATE notifications 
             SET read = TRUE 
             WHERE user_id = ? AND read = FALSE`,
            [req.user.id]
        );

        // Eliminar todas las notificaciones leídas después de 1 hora
        setTimeout(async () => {
            try {
                await db.runAsync(
                    'DELETE FROM notifications WHERE user_id = ? AND read = TRUE',
                    [req.user.id]
                );
            } catch (error) {
                console.error('Error al eliminar notificaciones leídas:', error);
            }
        }, 60 * 60 * 1000); // 1 hora

        res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar las notificaciones' });
    }
});

// Eliminar una notificación
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.runAsync(
            'DELETE FROM notifications WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Notificación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la notificación' });
    }
});

export default router; 