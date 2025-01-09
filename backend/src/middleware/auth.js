import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  console.log('Verificando autenticación...');
  
  try {
    // Intentar obtener el token del header o de las cookies
    const authHeader = req.headers['authorization'];
    const tokenFromHeader = authHeader && authHeader.split(' ')[1];
    const tokenFromCookie = req.cookies?.token;
    const token = tokenFromHeader || tokenFromCookie;
    
    console.log('Token encontrado:', token ? '***' : 'No token');

    if (!token) {
      console.log('No se encontró token');
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verificado exitosamente:', decoded);
    
    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
      console.log('Token no contiene ID de usuario válido');
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // Establecer el ID del usuario en la request
    req.userId = decoded.id;
    req.user = { id: decoded.id };
    
    // Renovar el token si está próximo a expirar
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
    
    next();
  } catch (err) {
    console.error('Error al verificar token:', err.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}; 