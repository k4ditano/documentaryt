import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const result = await db.runAsync(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [result.lastID]);

    // Crear token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '24h'
    });

    // Configurar opciones de cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    };

    // Enviar token en cookie y en la respuesta
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Intento de login:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Faltan credenciales');
      return res.status(400).json({ error: 'Por favor proporcione email y contraseña' });
    }

    // Buscar usuario
    const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Usuario encontrado:', user ? { ...user, password: '[REDACTED]' } : null);

    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Resultado de verificación de contraseña:', isMatch);

    if (!isMatch) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    console.log('Token generado exitosamente');

    // Enviar respuesta
    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Obtener usuario actual
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.getAsync('SELECT id, username, email FROM users WHERE id = ?', [req.userId]);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Cerrar sesión
router.post('/logout', (req, res) => {
  // Limpiar la cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

export default router; 