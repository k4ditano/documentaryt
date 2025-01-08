import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import pagesRoutes from './routes/pages.js';
import foldersRoutes from './routes/folders.js';
import filesRoutes from './routes/files.js';
import positionsRouter from './routes/positions.js';
import tasksRouter from './routes/tasks.js';
import notificationsRouter from './routes/notifications.js';
import remindersRouter from './routes/reminders.js';
import { initializeDatabase } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import './workers/reminderWorker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurarnos de que exista la carpeta uploads
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware para loggear las peticiones
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Solo logear el body si no es una subida de archivo
  if (!req.path.includes('/upload')) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Configuración de CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://145.223.100.119', 'http://145.223.100.119:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));

// Parsear JSON y URL-encoded bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Middleware para verificar el token
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    console.log('Token encontrado:', token);
  } else {
    console.log('No se encontró token en la petición');
  }
  next();
});

// Servir archivos estáticos
app.use('/uploads', express.static(uploadsDir));

// Rutas API
console.log('Registrando rutas...');
app.use('/api/auth', authRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/positions', positionsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reminders', remindersRouter);

// Servir archivos estáticos del frontend
const frontendBuildPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendBuildPath));

// Todas las rutas no-API sirven el frontend
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  }
});

// Middleware para manejar rutas API no encontradas
app.use('/api/*', (req, res) => {
  console.log(`Ruta API no encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Inicializar la base de datos y luego iniciar el servidor
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Base de datos inicializada correctamente');

    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer(); 