const express = require('express');
const cors = require('cors'); // Asegúrate de que esta línea esté aquí
const app = express();

// --- CONFIGURACIÓN DE MIDDLEWARES (Debe ir antes de las rutas) ---

// 1. Configuración de CORS detallada
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Permite específicamente tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Lectura de JSON
app.use(express.json()); 

// --- RUTAS ---
const inventarioRoutes = require('./routes/inventario');
const productosRoutes = require('./routes/productos');
const authRoutes = require('./routes/auth');

app.use('/api/inventario', inventarioRoutes); 
app.use('/api/productos', productosRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;