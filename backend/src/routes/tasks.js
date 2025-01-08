import express from 'express';
import { db } from '../db.js';
import {authenticateToken } from '../middleware/auth.js';

console.log('Inicializando router de tareas...');
const router = express.Router();

// Ruta de prueba
router.get('/test', (req, res) => {
    console.log('Test de ruta de tareas');
    res.json({ message: 'Ruta de tareas funcionando' });
});

// Obtener todas las tareas del usuario
router.get('/', authenticateToken, async (req, res) => {
    console.log('GET /api/tasks - Obteniendo tareas para el usuario:', req.user?.id);
    try {
        const tasks = await db.allAsync(
            `SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC`,
            [req.user.id]
        );
        console.log('Tareas encontradas:', tasks?.length || 0);
        
        // Parsear las páginas enlazadas para cada tarea
        const parsedTasks = tasks.map(task => ({
            ...task,
            linked_pages: task.linked_pages ? JSON.parse(task.linked_pages) : []
        }));
        
        res.json(parsedTasks || []);
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        res.status(500).json({ error: 'Error al obtener las tareas' });
    }
});

// Crear una nueva tarea
router.post('/', authenticateToken, async (req, res) => {
    console.log('POST /api/tasks - Creando tarea:', req.body);
    const { title, description, due_date, priority, page_id } = req.body;
    try {
        const result = await db.runAsync(
            `INSERT INTO tasks (title, description, due_date, priority, user_id, page_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, description, due_date, priority, req.user.id, page_id]
        );
        
        if (due_date) {
            await db.runAsync(
                `INSERT INTO reminders (task_id, reminder_time)
                 VALUES (?, ?)`,
                [result.lastID, due_date]
            );
        }

        const task = await db.getAsync('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
        console.log('Tarea creada:', task);
        res.status(201).json(task);
    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({ error: 'Error al crear la tarea' });
    }
});

// Actualizar una tarea
router.put('/:id', authenticateToken, async (req, res) => {
    const { title, description, due_date, status, priority, linked_pages } = req.body;
    try {
        await db.runAsync(
            `UPDATE tasks 
             SET title = ?, description = ?, due_date = ?, status = ?, priority = ?, 
                 linked_pages = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            [
                title, 
                description, 
                due_date, 
                status, 
                priority, 
                JSON.stringify(Array.isArray(linked_pages) ? linked_pages : []),
                req.params.id, 
                req.user.id
            ]
        );

        if (due_date) {
            await db.runAsync(
                `INSERT OR REPLACE INTO reminders (task_id, reminder_time)
                 VALUES (?, ?)`,
                [req.params.id, due_date]
            );
        }

        const task = await db.getAsync('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
        // Parsear las páginas enlazadas antes de enviar la respuesta
        if (task) {
            try {
                task.linked_pages = JSON.parse(task.linked_pages || '[]');
            } catch (e) {
                task.linked_pages = [];
            }
        }
        res.json(task);
    } catch (error) {
        console.error('Error al actualizar la tarea:', error);
        res.status(500).json({ error: 'Error al actualizar la tarea' });
    }
});

// Eliminar una tarea
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.runAsync(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Tarea eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
});

// Obtener tareas por fecha
router.get('/calendar/:start/:end', authenticateToken, async (req, res) => {
    try {
        const tasks = await db.allAsync(
            `SELECT * FROM tasks 
             WHERE user_id = ? 
             AND due_date BETWEEN ? AND ?
             ORDER BY due_date ASC`,
            [req.user.id, req.params.start, req.params.end]
        );
        
        // Parsear las páginas enlazadas para cada tarea
        const parsedTasks = tasks.map(task => ({
            ...task,
            linked_pages: task.linked_pages ? JSON.parse(task.linked_pages) : []
        }));
        
        res.json(parsedTasks || []);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las tareas del calendario' });
    }
});

console.log('Router de tareas configurado correctamente');
export default router; 