import express from 'express';
import { db } from '../db.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las páginas del usuario
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pages = await db.allAsync(
      `SELECT 
        id, 
        title, 
        content, 
        parent_id,
        user_id,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', created_at) as created_at,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', updated_at) as updated_at
      FROM pages 
      WHERE user_id = ? 
      ORDER BY updated_at DESC`,
      [req.user.id]
    );
    res.json(pages || []); // Asegurarnos de devolver un array vacío si no hay páginas
  } catch (error) {
    console.error('Error al obtener páginas:', error);
    res.status(500).json({ error: 'Error al obtener las páginas' });
  }
});

// Función de validación de contenido
const validateContent = (content) => {
  console.log('Validando contenido recibido:', {
    type: typeof content,
    isString: typeof content === 'string',
    sample: typeof content === 'string' ? content.substring(0, 100) : 'N/A'
  });
  
  try {
    if (typeof content === 'string') {
      console.log('Contenido es string, intentando parsear...');
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        console.error('El contenido parseado no es un array');
        throw new Error('El contenido debe ser un array');
      }
      // Validar la estructura de cada bloque
      parsed.forEach((block, index) => {
        if (!block.type || !block.content) {
          console.error(`Bloque ${index} inválido:`, block);
          throw new Error(`Bloque ${index} no tiene la estructura correcta`);
        }
      });
      return content; // Mantener como string si ya es válido
    } else if (Array.isArray(content)) {
      console.log('Contenido es array, validando estructura...');
      // Validar la estructura de cada bloque
      content.forEach((block, index) => {
        if (!block.type || !block.content) {
          console.error(`Bloque ${index} inválido:`, block);
          throw new Error(`Bloque ${index} no tiene la estructura correcta`);
        }
      });
      return JSON.stringify(content);
    } else if (content === null || content === undefined) {
      console.log('Contenido es null/undefined, usando array vacío...');
      return JSON.stringify([{
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [{
          type: "text",
          text: "",
          styles: {}
        }],
        props: {}
      }]);
    } else {
      throw new Error('El contenido debe ser un string JSON o un array');
    }
  } catch (error) {
    console.error('Error validando contenido:', error);
    throw error;
  }
};

// Crear una nueva página
router.post('/', authenticateToken, async (req, res) => {
  const { title, content, parent_id } = req.body;
  try {
    const validContent = validateContent(content);

    const result = await db.runAsync(
      'INSERT INTO pages (title, content, parent_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))',
      [title, validContent, parent_id, req.user.id]
    );
    
    const newPage = await db.getAsync(
      `SELECT 
        id, 
        title, 
        content, 
        parent_id,
        user_id,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', created_at) as created_at,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', updated_at) as updated_at
      FROM pages 
      WHERE id = ?`,
      [result.lastID]
    );

    // Asegurar que el contenido sea válido antes de enviarlo
    if (newPage) {
      newPage.content = validateContent(newPage.content);
    }
    
    res.status(201).json(newPage);
  } catch (error) {
    console.error('Error al crear página:', error);
    res.status(500).json({ error: 'Error al crear la página' });
  }
});

// Ruta para actualizar una página
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    console.log('Recibida solicitud de actualización:', {
      id,
      title,
      contentType: typeof content,
      contentLength: content ? (typeof content === 'string' ? content.length : 'N/A') : 'N/A'
    });

    // Obtener la página actual
    const currentPage = await db.getAsync(
      'SELECT title, content, parent_id FROM pages WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!currentPage) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }

    // Validar y formatear el contenido si se proporciona
    let validatedContent;
    if (content !== undefined) {
      try {
        validatedContent = validateContent(content);
        console.log('Contenido validado exitosamente, longitud:', validatedContent.length);
      } catch (error) {
        console.error('Error en validación de contenido:', error);
        return res.status(400).json({ error: error.message });
      }
    }

    // Preparar los valores para la actualización
    const newTitle = title !== undefined ? title : currentPage.title;
    const newContent = validatedContent !== undefined ? validatedContent : currentPage.content;
    const newParentId = currentPage.parent_id;

    console.log('Actualizando página con:', {
      title: newTitle,
      contentLength: newContent ? newContent.length : 'N/A',
      parentId: newParentId
    });

    // Actualizar la página
    await db.runAsync(
      'UPDATE pages SET title = ?, content = ?, parent_id = ?, updated_at = datetime("now") WHERE id = ? AND user_id = ?',
      [newTitle, newContent, newParentId, id, req.user.id]
    );

    // Obtener la página actualizada
    const updatedPage = await db.getAsync(
      `SELECT 
        id, 
        title, 
        content, 
        parent_id,
        user_id,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', created_at) as created_at,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', updated_at) as updated_at
      FROM pages 
      WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    if (!updatedPage) {
      return res.status(404).json({ error: 'Página no encontrada después de actualizar' });
    }

    // Validar el contenido antes de enviarlo
    if (updatedPage.content) {
      try {
        const validatedResponseContent = validateContent(updatedPage.content);
        updatedPage.content = validatedResponseContent;
        console.log('Contenido de respuesta validado, longitud:', validatedResponseContent.length);
      } catch (error) {
        console.error('Error validando contenido de respuesta:', error);
        return res.status(500).json({ error: 'Error en el contenido de la página' });
      }
    }

    console.log('Página actualizada exitosamente:', {
      id: updatedPage.id,
      title: updatedPage.title,
      contentLength: updatedPage.content ? updatedPage.content.length : 'N/A'
    });

    res.json(updatedPage);
  } catch (error) {
    console.error('Error al actualizar página:', error);
    res.status(500).json({ error: 'Error al actualizar la página' });
  }
});

// Eliminar una página
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.runAsync('DELETE FROM pages WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Página eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar página:', error);
    res.status(500).json({ error: 'Error al eliminar la página' });
  }
});

// Obtener una página específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const page = await db.getAsync(
      `SELECT 
        id, 
        title, 
        content, 
        parent_id,
        user_id,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', created_at) as created_at,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', updated_at) as updated_at
      FROM pages 
      WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!page) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }

    // Validar y formatear el contenido antes de enviarlo
    try {
      page.content = validateContent(page.content);
      console.log('Contenido validado y formateado:', {
        length: page.content.length,
        sample: page.content.substring(0, 100)
      });
    } catch (error) {
      console.error('Error al validar contenido, usando contenido por defecto:', error);
      page.content = JSON.stringify([{
        id: crypto.randomUUID(),
        type: "paragraph",
        content: [{
          type: "text",
          text: "",
          styles: {}
        }],
        props: {}
      }]);
    }

    res.json(page);
  } catch (error) {
    console.error('Error al obtener la página:', error);
    res.status(500).json({ error: 'Error al obtener la página' });
  }
});

export default router; 