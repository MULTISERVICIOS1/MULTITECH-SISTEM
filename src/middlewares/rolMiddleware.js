const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({
      message: 'Acceso denegado: solo administradores'
    });
  }
  next();
};

module.exports = verificarAdmin;
