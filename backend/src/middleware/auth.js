import jwt from 'jsonwebtoken';
import { db } from '../db.js';

export const authenticateToken = async (req, res, next) => {
  try {
    let token;

    // 1. Intentar obtener el token de las cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Token encontrado en cookies:', token);
    }
    // 2. Intentar obtener el token del header de autorización
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token encontrado en header:', token);
    }

    // Si no hay token, retornar error
    if (!token) {
      console.log('No se encontró token');
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token no encontrado'
      });
    }

    try {
      // Verificar token
      console.log('Verificando token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decodificado:', decoded);

      // Obtener usuario del token
      const user = await db.getAsync('SELECT id, username, email FROM users WHERE id = ?', [decoded.id]);

      if (!user) {
        console.log('Usuario no encontrado para el token');
        // Limpiar la cookie si el usuario no existe
        res.clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Usuario no encontrado'
        });
      }

      // Añadir usuario a la request
      req.user = user;
      console.log('Usuario autenticado:', user.email);

      // Renovar el token si está cerca de expirar
      const tokenExp = decoded.exp * 1000; // Convertir a milisegundos
      const now = Date.now();
      const timeToExpire = tokenExp - now;
      
      // Si el token expira en menos de 1 hora, renovarlo
      if (timeToExpire < 3600000) {
        const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE || '24h'
        });
        
        // Configurar opciones de cookie
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000 // 24 horas
        };

        // Enviar el nuevo token en la cookie y en la respuesta
        res.cookie('token', newToken, cookieOptions);
        res.setHeader('Authorization', `Bearer ${newToken}`);
      }

      next();
    } catch (err) {
      console.error('Error al verificar token:', err);
      // Si el token está expirado o es inválido
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        // Limpiar la cookie
        res.clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        return res.status(401).json({
          success: false,
          message: 'Token inválido o expirado'
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('Error en middleware de autenticación:', err);
    // Limpiar la cookie en caso de error
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
}; 