const pool = require('../config/db');

const obtenerProductos = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM productos ORDER BY id_producto'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearProducto = async (req, res) => {
  try {
    const { nombre_producto, descripcion, stock, precio } = req.body;

    await pool.query(
      `INSERT INTO productos
      (nombre_producto, descripcion, stock, precio)
      VALUES ($1, $2, $3, $4)`,
      [nombre_producto, descripcion, stock, precio]
    );

    res.json({ mensaje: 'Producto creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerProductos,
  crearProducto
};
