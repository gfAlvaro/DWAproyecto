function verificarAdmin(req, res, next) {

  if (!req.administrador) {
    return res.status(401).json({
      mensaje: 'No autenticado'
    });
  }

  if (
    req.administrador.rol !== 'ADMIN' &&
    req.administrador.rol !== 'SUPER_ADMIN'
  ) {
    return res.status(403).json({
      mensaje: 'No tienes permisos de administrador'
    });
  }

  next();
}

module.exports = verificarAdmin;
