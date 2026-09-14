function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {

    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }

    if (!rolesPermitidos.includes(req.usuario.tipo)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para acceder a este recurso' });
    }

    next();
  };
}

module.exports = requiereRol;