require('dotenv').config();


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
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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

app.get('/api/productos', (req, res) => {
  console.log('--- 📥 Petición recibida desde Angular en /api/productos ---');

  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      console.error("❌ ERROR REAL EN MYSQL:", err.message);
      return res.status(500).json({ 
        mensaje: "Error en la base de datos", 
        errorDetallado: err.message,
        codigoError: err.code 
      });
    }
    
    console.log(`✅ Consulta exitosa. Se encontraron ${results.length} productos.`);
    res.json(results);
  });
});

app.get('/api/productos/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        const [rows] = await db.execute(
            `SELECT
                productoID,
                nombreProducto,
                slug,
                descripcion,
                precio,
                stock,
                fechaAgreado,
                pathImagen
             FROM productos
             WHERE slug = ?
             LIMIT 1`,
            [slug]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: 'Error al obtener el producto'
        });
    }
});
