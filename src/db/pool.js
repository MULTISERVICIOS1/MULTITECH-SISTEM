const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'multitech_inventario',
  password: 'Multiservi2025', // 👈 el mismo de pgAdmin
  port: 5432,
});

pool.query('SELECT NOW()')
  .then(res => {
    console.log('✅ PostgreSQL conectado:', res.rows[0]);
  })
  .catch(err => {
    console.error('❌ Error PostgreSQL:', err.message);
  });

module.exports = pool;
