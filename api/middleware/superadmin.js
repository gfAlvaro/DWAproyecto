function verificarSuperAdmin(req, res, next) {

  if (!req.administrador) {
    return res.status(401).json({
      mensaje: 'No autenticado'
    });
  }

  if (req.administrador.rol !== 'SUPER_ADMIN') {
    return res.status(403).json({
      mensaje: 'Se requieren permisos de SUPER_ADMIN'
    });
  }

  next();
}

module.exports = verificarSuperAdmin;
