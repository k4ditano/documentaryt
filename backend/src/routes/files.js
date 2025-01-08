import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db.js';
import authenticateToken from '../middleware/auth.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Subir un archivo
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    console.log('Recibiendo solicitud de subida de archivo:', req.file, req.body);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }

    const { page_id } = req.body;
    if (!page_id) {
      return res.status(400).json({ error: 'Se requiere el ID de la página' });
    }

    // Verificar que la página pertenece al usuario
    const page = await db.getAsync('SELECT id FROM pages WHERE id = ? AND user_id = ?', [page_id, req.user.id]);
    if (!page) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }

    // Guardar la información del archivo en la base de datos
    const result = await db.runAsync(
      'INSERT INTO files (name, url, page_id, user_id, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
      [
        req.file.originalname,
        `/uploads/${req.file.filename}`,
        page_id,
        req.user.id
      ]
    );

    const file = await db.getAsync(
      `SELECT 
        id,
        name,
        url,
        page_id,
        user_id,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', created_at) as created_at
      FROM files 
      WHERE id = ?`,
      [result.lastID]
    );

    console.log('Archivo subido exitosamente:', file);
    res.status(201).json(file);
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
});

// Obtener archivos de una página
router.get('/page/:pageId', authenticateToken, async (req, res) => {
  try {
    const files = await db.allAsync(
      `SELECT 
        id,
        name,
        url,
        page_id,
        user_id,
        strftime('%Y-%m-%dT%H:%M:%S.000Z', created_at) as created_at
      FROM files 
      WHERE page_id = ? AND user_id = ?
      ORDER BY created_at DESC`,
      [req.params.pageId, req.user.id]
    );
    res.json(files || []); // Asegurarnos de devolver un array vacío si no hay archivos
  } catch (error) {
    console.error('Error al obtener los archivos:', error);
    res.status(500).json({ error: 'Error al obtener los archivos' });
  }
});

// Eliminar un archivo
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Obtener la información del archivo
    const file = await db.getAsync(
      'SELECT * FROM files WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!file) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Eliminar el archivo físico
    const filePath = path.join(__dirname, '../../../', file.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar el registro de la base de datos
    await db.runAsync('DELETE FROM files WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    res.json({ message: 'Archivo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el archivo:', error);
    res.status(500).json({ error: 'Error al eliminar el archivo' });
  }
});

export default router; 