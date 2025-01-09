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

const port = process.env.PORT || 3001;
console.log(`Puerto configurado: ${port}`);

const app = express();
const httpServer = createServer(app);

// Configuración de CORS
const corsOptions = {
  origin: [
    "http://145.223.100.119",
    "http://145.223.100.119:3001",
    "http://145.223.100.119:80",
    "http://localhost",
    "http://localhost:3001",
    "http://localhost:80"
  ],
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware para verificar el token
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Solo renovar el token si está próximo a expirar
      const tokenExp = decoded.exp * 1000; // Convertir a milisegundos
      const now = Date.now();
      const timeToExpire = tokenExp - now;
      
      // Si el token expira en menos de 12 horas, renovarlo
      if (timeToExpire < 12 * 60 * 60 * 1000) {
        const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE || '24h'
        });
        
        res.cookie('token', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });
      }
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

// Configuración de Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://145.223.100.119",
      "http://145.223.100.119:3001",
      "http://145.223.100.119:80",
      "http://localhost",
      "http://localhost:3001",
      "http://localhost:80"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8,
  serveClient: false
});

// Middleware para Socket.IO
io.use((socket, next) => {
  console.log('Intento de conexión websocket...');
  console.log('Headers de conexión:', socket.handshake.headers);
  console.log('Auth data:', socket.handshake.auth);
  
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log('No se proporcionó token en la conexión websocket');
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    console.log(`Token websocket verificado para usuario: ${decoded.id}`);
    next();
  } catch (err) {
    console.log('Error al verificar token websocket:', err.message);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Manejo de conexiones de socket
io.on('connection', (socket) => {
  console.log(`Usuario ${socket.userId} conectado. ID Socket: ${socket.id}`);
  console.log('Handshake headers:', socket.handshake.headers);
  console.log('Transport usado:', socket.conn.transport.name);

  // Unir al usuario a su sala personal
  socket.join(`user-${socket.userId}`);
  console.log(`Usuario unido a sala: user-${socket.userId}`);

  socket.on('disconnect', (reason) => {
    console.log(`Usuario ${socket.userId} desconectado. Razón: ${reason}`);
  });

  socket.on('error', (error) => {
    console.error(`Error en socket del usuario ${socket.userId}:`, error);
  });

  // Enviar confirmación de conexión al cliente
  socket.emit('connected', { userId: socket.userId });
});

// Función para emitir actualizaciones
const emitUpdate = (userId, event, data) => {
  console.log(`Emitiendo evento ${event} para usuario ${userId}`);
  io.to(`user-${userId}`).emit(event, data);
};

// Middleware para inyectar la función emitUpdate en las rutas
app.use((req, res, next) => {
  req.emitUpdate = emitUpdate;
  next();
});

// Iniciar el servidor HTTP con socket.io
httpServer.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
  console.log(`CORS configurado con origin: ${corsOptions.origin}`);
  console.log(`Socket.IO configurado con origin: ${io.opts.cors.origin}`);
  initializeDatabase();
}); 