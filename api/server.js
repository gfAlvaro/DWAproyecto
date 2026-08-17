require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());

process.on('uncaughtException', (err) => {
  console.error('❌ SE CAYÓ EL SERVIDOR POR UN ERROR NO CONTROLADO:', err);
});

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

// OBTENER TODOS LOS PRODUCTOS
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

// OBTENER UN PRODUCTO POR SLUG
app.get('/api/productos/:slug', (req, res) => {

  console.log(
    '--- 📥 Petición recibida en /api/productos/:slug ---'
  );

  const { slug } = req.params;

  console.log(
    '🔎 Buscando producto con slug:',
    slug
  );

  const sql = `
    SELECT
      productoID,
      nombreProducto,
      slug,
      descripcion,
      precio,
      stock,
      pathImagen
    FROM productos
    WHERE slug = ?
    LIMIT 1
  `;

  db.query(
    sql,
    [slug],
    (err, results) => {

      if (err) {

        console.error(
          '❌ ERROR REAL EN MYSQL:',
          err.message
        );

        return res.status(500).json({
          mensaje: 'Error en la base de datos',
          errorDetallado: err.message,
          codigoError: err.code
        });
      }

      if (results.length === 0) {

        console.log(
          '⚠️ Producto no encontrado:',
          slug
        );

        return res.status(404).json({
          mensaje: 'Producto no encontrado'
        });
      }

      console.log(
        '✅ Producto encontrado:',
        results[0].nombreProducto
      );

      res.json(results[0]);
    }
  );
});

// Servir Angular desde httpdocs
const angularPath = path.join(__dirname, 'httpdocs');

app.use(express.static(angularPath));

// Fallback para Angular Router
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(angularPath, 'index.html'));
});
