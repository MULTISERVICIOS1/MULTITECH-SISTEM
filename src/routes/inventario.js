const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// IMPORTACIÓN CORREGIDA (usando llaves { } para extraer las funciones)
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// 📦 REGISTRAR MOVIMIENTO
router.post('/', verificarToken, soloAdmin, async (req, res) => {
    const { id_producto, tipo_movimiento, cantidad, motivo } = req.body;
    
    // El usuario viene del token decodificado
    const usuario_id = req.usuario.id_usuario; 
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Obtener y bloquear stock
        const producto = await client.query(
            'SELECT stock FROM productos WHERE id_producto = $1 FOR UPDATE',
            [id_producto]
        );

        if (producto.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        let stockActual = producto.rows[0].stock;
        let nuevoStock = stockActual;

        // 2. Lógica de cálculo
        if (tipo_movimiento === 'ENTRADA') {
            nuevoStock += Number(cantidad);
        } else if (tipo_movimiento === 'SALIDA') {
            if (Number(cantidad) > stockActual) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Stock insuficiente' });
            }
            nuevoStock -= Number(cantidad);
        }

        // 3. Actualizar tabla productos
        await client.query(
            'UPDATE productos SET stock = $1 WHERE id_producto = $2',
            [nuevoStock, id_producto]
        );

        // 4. Insertar en historial de movimientos
        await client.query(
            `INSERT INTO inventario_movimientos (id_producto, tipo_movimiento, cantidad, motivo, usuario_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [id_producto, tipo_movimiento, cantidad, motivo, usuario_id]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Movimiento registrado con éxito',
            stock_anterior: stockActual,
            stock_nuevo: nuevoStock
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error detallado:', error);
        res.status(500).json({ error: 'Error al procesar el inventario' });
    } finally {
        client.release();
    }
});

module.exports = router;