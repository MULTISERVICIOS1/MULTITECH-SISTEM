const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// IMPORTACIONES DE MIDDLEWARES
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

/**
 * 1. 🔹 LISTAR TODOS LOS PRODUCTOS
 */
router.get('/', verificarToken, async (req, res) => {
  try {
    // Ajustado para traer nombre_producto
    const result = await pool.query(
      'SELECT id_producto, nombre_producto as nombre, stock, precio FROM productos ORDER BY id_producto ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

/**
 * REGISTRAR UN NUEVO PRODUCTO
 */
router.post('/', verificarToken, soloAdmin, async (req, res) => {
  const { nombre, stock, precio } = req.body;
  const usuario_id = req.usuario.id;

  try {
    // 1. Insertar en tabla productos usando 'nombre_producto'
    const result = await pool.query(
      `INSERT INTO productos (nombre_producto, stock, precio)
       VALUES ($1, $2, $3)
       RETURNING id_producto, nombre_producto as nombre, stock, precio`,
      [nombre, stock, precio]
    );

    // 2. Insertar en tabla auditoria usando 'id' como nombre de columna (según tu imagen)
    // Nota: Asegúrate de haber ejecutado el ALTER TABLE del paso anterior
    await pool.query(
      'INSERT INTO auditoria (accion, usuario_id, detalle) VALUES ($1, $2, $3)',
      ['CREÓ PRODUCTO', usuario_id, `Se creó: ${nombre}`]
    );

    res.status(201).json({
      message: 'Producto registrado correctamente',
      producto: result.rows[0],
    });
  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({ error: 'Error interno al registrar el producto' });
  }
});

//3. ✏️ ACTUALIZAR UN PRODUCTO
 
router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, stock, precio } = req.body;
  const usuario_id = req.usuario.id;

  try {
    // CORRECCIÓN AQUÍ: Se cambió 'nombre' por 'nombre_producto'
    const result = await pool.query(
      `UPDATE productos
       SET nombre_producto = $1, stock = $2, precio = $3
       WHERE id_producto = $4
       RETURNING id_producto, nombre_producto as nombre, stock, precio`,
      [nombre, stock, precio, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await pool.query(
      'INSERT INTO auditoria (accion, usuario_id, detalle) VALUES ($1, $2, $3)',
      ['ACTUALIZÓ PRODUCTO', usuario_id, `ID: ${id}`]
    );

    res.json({
      message: 'Producto actualizado correctamente',
      producto: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar:', error);
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

/**
 * 4. 🗑️ ELIMINAR UN PRODUCTO
 */
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;

  try {
    const result = await pool.query(
      'DELETE FROM productos WHERE id_producto = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await pool.query(
      'INSERT INTO auditoria (accion, usuario_id, detalle) VALUES ($1, $2, $3)',
      ['ELIMINÓ PRODUCTO', usuario_id, `ID: ${id}`]
    );

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar:', error);
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;