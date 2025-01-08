import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  console.log('Verificando autenticación...');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);

  if (!authHeader) {
    console.log('No se encontró header de autorización');
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No se encontró token en el header de autorización');
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }

  try {
    console.log('Intentando verificar token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verificado exitosamente:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export default authenticateToken; 