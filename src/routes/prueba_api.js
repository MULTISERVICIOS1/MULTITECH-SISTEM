const axios = require('axios'); // Asegúrate de tener axios instalado: npm install axios

const loginData = {
    correo: "admin@multitech.com",
    password: "admin123"
};

async function ejecutarPruebas() {
    try {
        console.log("--- 1. Intentando Login ---");
        const loginRes = await axios.post('http://localhost:4000/api/auth/login', loginData);
        const token = loginRes.data.token;
        console.log("✅ Login Exitoso. Token obtenido:");
        console.log(token);
        console.log("\n");

        console.log("--- 2. Consultando Productos (Captura 7) ---");
        const productosRes = await axios.get('http://localhost:4000/api/productos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.table(productosRes.data); // Esto mostrará una tabla bonita en tu terminal
        console.log("✅ Datos recibidos correctamente.");

    } catch (error) {
        console.error("❌ Error en la petición:", error.response ? error.response.data : error.message);
    }
}

ejecutarPruebas();