const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// 🔹 LISTAR CATEGORÍAS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categorias ORDER BY id_categoria ASC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// 🔹 CREAR CATEGORÍA
router.post('/', async (req, res) => {
  const { nombre_categoria } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO categorias (nombre_categoria) VALUES ($1) RETURNING *',
      [nombre_categoria]
    );

    res.status(201).json({
      message: 'Categoría creada correctamente',
      categoria: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

module.exports = router;
