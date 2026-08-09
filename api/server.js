const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Permite que Angular acceda a la API
app.use(express.json());

// Añade esto al inicio para capturar cualquier fallo global que tire el servidor
process.on('uncaughtException', (err) => {
  console.error('❌ SE CAYÓ EL SERVIDOR POR UN ERROR NO CONTROLADO:', err);
});

// Configurar conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,             // <--- El puerto va aquí como un número
  user: 'alvarogfv1-2526_',
  password: 'PDBdozprztg4@45!',
  database: 'alvarogfv1-2526_'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado a MySQL con éxito');
});

app.listen(3000, () => console.log('Servidor Node.js corriendo en el puerto 3000'));

app.get('/api/clientes', (req, res) => {
  console.log('--- 📥 Petición recibida desde Angular en /api/clientes ---');

  db.query('SELECT * FROM clientes', (err, results) => {
    if (err) {
      console.error("❌ ERROR REAL EN MYSQL:", err.message);
      // Enviamos el mensaje de error real a Angular para que lo veas en el navegador
      return res.status(500).json({ 
        mensaje: "Error en la base de datos", 
        errorDetallado: err.message,
        codigoError: err.code 
      });
    }
    
    console.log(`✅ Consulta exitosa. Se encontraron ${results.length} clientes.`);
    res.json(results);
  });
});
