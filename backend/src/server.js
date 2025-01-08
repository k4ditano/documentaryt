import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
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
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurarnos de que exista la carpeta uploads
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configuración de Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://145.223.100.119', 'http://145.223.100.119:3001'],
    credentials: true,
  },
  path: '/socket.io'
});

// Crear namespace /api
const apiNamespace = io.of('/api');

const port = process.env.PORT || 3001;

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

// Socket.IO middleware para autenticación
apiNamespace.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Manejo de conexiones de socket
apiNamespace.on('connection', (socket) => {
  console.log(`Usuario ${socket.userId} conectado al namespace /api`);

  // Unir al usuario a su sala personal
  socket.join(`user-${socket.userId}`);

  socket.on('disconnect', () => {
    console.log(`Usuario ${socket.userId} desconectado del namespace /api`);
  });

  socket.on('error', (error) => {
    console.error(`Error en socket del usuario ${socket.userId}:`, error);
  });
});

// Middleware para verificar el token
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      console.log('Token verificado para usuario:', decoded.id);
    } catch (err) {
      console.error('Error al verificar token:', err.message);
    }
  }
  next();
});

// Servir archivos estáticos
app.use('/uploads', express.static(uploadsDir));

// Rutas API con soporte para websockets
console.log('Registrando rutas...');

// Función para emitir actualizaciones
const emitUpdate = (userId, event, data) => {
  apiNamespace.to(`user-${userId}`).emit(event, data);
};

// Middleware para inyectar la función emitUpdate en las rutas
app.use((req, res, next) => {
  req.emitUpdate = emitUpdate;
  next();
});

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

// Iniciar el servidor HTTP con socket.io
httpServer.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
  initializeDatabase();
}); 