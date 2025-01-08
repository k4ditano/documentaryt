import express from 'express';
import { db } from '../db.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las carpetas del usuario
router.get('/', authenticateToken, async (req, res) => {
  try {
    const folders = await db.allAsync(
      `SELECT 
        id, 
        name, 
        parent_id,
        user_id,
        position,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', created_at) as created_at,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', updated_at) as updated_at
      FROM folders 
      WHERE user_id = ? 
      ORDER BY position ASC`,
      [req.user.id]
    );
    res.json(folders || []); // Asegurarnos de devolver un array vacío si no hay carpetas
  } catch (error) {
    console.error('Error al obtener carpetas:', error);
    res.status(500).json({ error: 'Error al obtener las carpetas' });
  }
});

// Crear una nueva carpeta
router.post('/', authenticateToken, async (req, res) => {
  const { name, parent_id } = req.body;
  try {
    // Obtener la última posición para el padre actual
    const lastPosition = await db.getAsync(
      'SELECT COALESCE(MAX(position), -1) as maxPos FROM folders WHERE user_id = ? AND parent_id IS ?',
      [req.user.id, parent_id]
    );
    const newPosition = (lastPosition?.maxPos ?? -1) + 1;

    const result = await db.runAsync(
      'INSERT INTO folders (name, parent_id, user_id, position, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))',
      [name, parent_id, req.user.id, newPosition]
    );
    
    const newFolder = await db.getAsync(
      `SELECT 
        id, 
        name, 
        parent_id,
        user_id,
        position,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', created_at) as created_at,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', updated_at) as updated_at
      FROM folders 
      WHERE id = ?`,
      [result.lastID]
    );
    
    res.status(201).json(newFolder);
  } catch (error) {
    console.error('Error al crear carpeta:', error);
    res.status(500).json({ error: 'Error al crear la carpeta' });
  }
});

// Actualizar una carpeta
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const currentFolder = await db.getAsync(
      'SELECT name, parent_id FROM folders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!currentFolder) {
      return res.status(404).json({ error: 'Carpeta no encontrada' });
    }

    await db.runAsync(
      'UPDATE folders SET name = ?, parent_id = ?, updated_at = datetime("now") WHERE id = ? AND user_id = ?',
      [name || currentFolder.name, parent_id ?? currentFolder.parent_id, req.params.id, req.user.id]
    );
    
    const updatedFolder = await db.getAsync(
      `SELECT 
        id, 
        name, 
        parent_id,
        user_id,
        position,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', created_at) as created_at,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', updated_at) as updated_at
      FROM folders 
      WHERE id = ?`,
      [req.params.id]
    );

    if (!updatedFolder) {
      return res.status(404).json({ error: 'Carpeta no encontrada después de actualizar' });
    }

    res.json(updatedFolder);
  } catch (error) {
    console.error('Error al actualizar carpeta:', error);
    res.status(500).json({ error: 'Error al actualizar la carpeta' });
  }
});

// Eliminar una carpeta
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.runAsync('DELETE FROM folders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Carpeta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar carpeta:', error);
    res.status(500).json({ error: 'Error al eliminar la carpeta' });
  }
});

// Obtener una carpeta específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const folder = await db.getAsync(
      `SELECT 
        id, 
        name, 
        parent_id,
        user_id,
        position,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', created_at) as created_at,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', updated_at) as updated_at
      FROM folders 
      WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!folder) {
      return res.status(404).json({ error: 'Carpeta no encontrada' });
    }

    res.json(folder);
  } catch (error) {
    console.error('Error al obtener la carpeta:', error);
    res.status(500).json({ error: 'Error al obtener la carpeta' });
  }
});

export default router; 