require('dotenv').config();
const app = require('./src/app');

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
