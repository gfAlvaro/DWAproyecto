const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function verificarToken(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      mensaje: 'Token no proporcionado'
    });
  }

  const partes = authHeader.split(' ');

  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({
      mensaje: 'Formato de autorización inválido'
    });
  }

  const token = partes[1];

  try {

    const datos = jwt.verify(token, JWT_SECRET);

    req.administrador = datos;

    next();

  } catch (error) {

    console.error('❌ Token inválido:', error.message);

    return res.status(401).json({
      mensaje: 'Token inválido o expirado'
    });
  }
}

module.exports = verificarToken;
