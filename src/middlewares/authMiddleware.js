const jwt = require('jsonwebtoken');

/* =========================
   VERIFICAR TOKEN
========================= */
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // formato esperado: Bearer TOKEN
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  try {
    const decoded = jwt.verify(token, 'Multiservi2026');
    req.usuario = decoded; // guardamos datos del usuario
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido o expirado' });
  }
};

/* =========================
   SOLO ADMIN
========================= */
const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso solo para administradores' });
  }
  next();
};

module.exports = {
  verificarToken,
  soloAdmin
};
