const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔐 REGISTRO DE USUARIO
router.post('/register', async (req, res) => {
  const { nombre, correo, password, rol } = req.body;

  try {
    // 1. Verificar si el correo ya existe
    const existe = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (existe.rowCount > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // 2. Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insertar nuevo usuario
    const nuevoUsuario = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario, nombre, correo, rol`,
      [nombre, correo, passwordHash, rol || 'usuario']
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuario: nuevoUsuario.rows[0],
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al procesar el registro' });
  }
});

// 🔑 LOGIN DE USUARIO
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;

  try {
    // 1. Buscar usuario por correo
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const usuario = result.rows[0];

    // 2. COMPARACIÓN CORRECTA CON BCRYPT
    // Comparamos la contraseña que viene del login con el hash de la BD
    const passwordValido = await bcrypt.compare(password, usuario.password); 

    if (!passwordValido) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // 3. 🔐 GENERAR TOKEN (Actualizado)
const token = jwt.sign(
  { 
    id: usuario.id_usuario, // ⚠️ CAMBIO: Usamos 'id' para que coincida con lo que espera el controlador de productos
    rol: usuario.rol 
  },
  'Multiservi2026', // 🔑 La misma clave que en authMiddleware.js
  { expiresIn: '24h' }        // ⏳ 24 horas para que no te expire mientras trabajas
);

    // 4. Respuesta exitosa
    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al procesar el inicio de sesión' });
  }
});

module.exports = router;