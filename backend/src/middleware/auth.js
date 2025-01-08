import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  console.log('Verificando autenticación...');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Authorization header:', token ? '***' : 'No token');

  if (!token) {
    console.log('No se encontró token');
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }

  console.log('Intentando verificar token...');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verificado exitosamente:', decoded);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('Error al verificar token:', err.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export default authenticateToken; 