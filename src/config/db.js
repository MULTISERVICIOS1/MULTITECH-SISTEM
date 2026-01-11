const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Multiservi2025',
  database: 'multitech_inventario',
  port: 5432
});

module.exports = pool;
