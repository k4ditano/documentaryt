import express from 'express';
import authenticateToken from '../middleware/auth.js';
import { db } from '../db.js';

const router = express.Router();

// Función para asegurar que las columnas position existan
async function ensurePositionColumns() {
  try {
    // Verificar y añadir columna position a pages si no existe
    const pagesTableInfo = await db.all("PRAGMA table_info(pages)");
    if (!pagesTableInfo.some(col => col.name === 'position')) {
      await db.run("ALTER TABLE pages ADD COLUMN position INTEGER DEFAULT 0");
    }

    // Verificar y añadir columna position a folders si no existe
    const foldersTableInfo = await db.all("PRAGMA table_info(folders)");
    if (!foldersTableInfo.some(col => col.name === 'position')) {
      await db.run("ALTER TABLE folders ADD COLUMN position INTEGER DEFAULT 0");
    }

    console.log('Columnas position verificadas/creadas correctamente');
  } catch (error) {
    console.error('Error al verificar/crear columnas position:', error);
    throw error;
  }
}

// Ruta para actualizar las posiciones
router.put('/update', authenticateToken, async (req, res) => {
  const updates = req.body;
  const userId = req.user.id;

  try {
    // Asegurar que las columnas position existan
    await ensurePositionColumns();

    // Iniciar transacción
    await db.run('BEGIN TRANSACTION');

    // Primero, obtener todos los elementos del mismo nivel para cada actualización
    for (const update of updates) {
      const { id, type, position, parent_id } = update;
      
      // Obtener todos los elementos del mismo nivel
      let siblings;
      if (type === 'page') {
        siblings = await db.all(
          'SELECT id, position FROM pages WHERE user_id = ? AND (parent_id IS NULL AND ? IS NULL OR parent_id = ?) ORDER BY position',
          [userId, parent_id, parent_id]
        );
      } else {
        siblings = await db.all(
          'SELECT id, position FROM folders WHERE user_id = ? AND (parent_id IS NULL AND ? IS NULL OR parent_id = ?) ORDER BY position',
          [userId, parent_id, parent_id]
        );
      }

      // Actualizar el elemento movido
      if (type === 'page') {
        await db.run(
          'UPDATE pages SET position = ?, parent_id = ? WHERE id = ? AND user_id = ?',
          [position, parent_id, id, userId]
        );
      } else {
        await db.run(
          'UPDATE folders SET position = ?, parent_id = ? WHERE id = ? AND user_id = ?',
          [position, parent_id, id, userId]
        );
      }

      // Reordenar los elementos afectados
      const table = type === 'page' ? 'pages' : 'folders';
      await db.run(
        `UPDATE ${table} 
         SET position = position + 1 
         WHERE user_id = ? 
         AND (parent_id IS NULL AND ? IS NULL OR parent_id = ?)
         AND position >= ? 
         AND id != ?`,
        [userId, parent_id, parent_id, position, id]
      );
    }

    // Confirmar transacción
    await db.run('COMMIT');

    // Obtener los elementos actualizados
    const [updatedPages, updatedFolders] = await Promise.all([
      db.all('SELECT * FROM pages WHERE user_id = ? ORDER BY position', [userId]),
      db.all('SELECT * FROM folders WHERE user_id = ? ORDER BY position', [userId])
    ]);

    res.json({ 
      success: true,
      data: {
        pages: updatedPages,
        folders: updatedFolders
      }
    });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error('Error al actualizar posiciones:', error);
    res.status(500).json({ 
      error: 'Error al actualizar posiciones',
      details: error.message 
    });
  }
});

export default router; 