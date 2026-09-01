require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const path = require('path');
const verificarToken = require('./middleware/auth');

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;


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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en el puerto ${PORT}`);
});

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

app.post('/api/admin/login', (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      mensaje: 'Email y contraseña son obligatorios'
    });
  }

  const sql = `
    SELECT
      id,
      nombre,
      email,
      password,
      rol,
      activo
    FROM administradores
    WHERE email = ?
    LIMIT 1
  `;

  db.query(sql, [email], async (err, results) => {

    if (err) {
      console.error('❌ Error buscando administrador:', err.message);

      return res.status(500).json({
        mensaje: 'Error interno del servidor'
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        mensaje: 'Email o contraseña incorrectos'
      });
    }

    const administrador = results[0];

    if (!administrador.activo) {
      return res.status(403).json({
        mensaje: 'La cuenta está desactivada'
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      administrador.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: 'Email o contraseña incorrectos'
      });
    }

    const token = jwt.sign(
      {
        id: administrador.id,
        email: administrador.email,
        rol: administrador.rol
      },
      JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    res.json({
      mensaje: 'Login correcto',
      token,
      administrador: {
        id: administrador.id,
        nombre: administrador.nombre,
        email: administrador.email,
        rol: administrador.rol
      }
    });
  });
});

// =====================================================
// ADMIN - PRODUCTOS
// =====================================================

// OBTENER TODOS LOS PRODUCTOS
app.get(
  '/api/admin/productos',
  verificarToken,
  (req, res) => {

    const sql = `
      SELECT
        productoID,
        nombreProducto,
        slug,
        descripcion,
        precio,
        stock,
        fechaAgregado,
        pathImagen
      FROM productos
      ORDER BY productoID DESC
    `;

    db.query(sql, (err, results) => {

      if (err) {
        console.error(
          '❌ Error obteniendo productos:',
          err.message
        );

        return res.status(500).json({
          mensaje: 'Error en la base de datos'
        });
      }

      res.json(results);
    });
  }
);

// CREAR UN NUEVO PRODUCTO
app.post(
  '/api/admin/productos',
  verificarToken,
  (req, res) => {

    const {
      nombreProducto,
      slug,
      descripcion,
      precio,
      stock,
      pathImagen
    } = req.body;

    if (!nombreProducto || !slug || precio === undefined) {
      return res.status(400).json({
        mensaje: 'Nombre, slug y precio son obligatorios'
      });
    }

    const sql = `
      INSERT INTO productos
      (
        nombreProducto,
        slug,
        descripcion,
        precio,
        stock,
        pathImagen
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      nombreProducto,
      slug,
      descripcion || null,
      precio,
      stock ?? 0,
      pathImagen || null
    ];

    db.query(sql, valores, (err, result) => {

      if (err) {

        console.error(
          '❌ Error creando producto:',
          err.message
        );

        return res.status(500).json({
          mensaje: 'Error creando producto'
        });
      }

      res.status(201).json({
        mensaje: 'Producto creado correctamente',
        productoID: result.insertId
      });
    });
  }
);

// ACTUALIZAR UN PRODUCTO
app.put(
  '/api/admin/productos/:id',
  verificarToken,
  (req, res) => {

    const { id } = req.params;

    const {
      nombreProducto,
      slug,
      descripcion,
      precio,
      stock,
      pathImagen
    } = req.body;

    if (!nombreProducto || !slug || precio === undefined) {
      return res.status(400).json({
        mensaje: 'Nombre, slug y precio son obligatorios'
      });
    }

    const sql = `
      UPDATE productos
      SET
        nombreProducto = ?,
        slug = ?,
        descripcion = ?,
        precio = ?,
        stock = ?,
        pathImagen = ?
      WHERE productoID = ?
    `;

    const valores = [
      nombreProducto,
      slug,
      descripcion || null,
      precio,
      stock ?? 0,
      pathImagen || null,
      id
    ];

    db.query(sql, valores, (err, result) => {

      if (err) {

        console.error(
          '❌ Error actualizando producto:',
          err.message
        );

        return res.status(500).json({
          mensaje: 'Error actualizando producto'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          mensaje: 'Producto no encontrado'
        });
      }

      res.json({
        mensaje: 'Producto actualizado correctamente'
      });
    });
  }
);

// eliminar un producto
app.delete(
  '/api/admin/productos/:id',
  verificarToken,
  (req, res) => {

    const { id } = req.params;

    const sql = `
      DELETE FROM productos
      WHERE productoID = ?
    `;

    db.query(sql, [id], (err, result) => {

      if (err) {

        console.error(
          '❌ Error eliminando producto:',
          err.message
        );

        return res.status(500).json({
          mensaje: 'Error eliminando producto'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          mensaje: 'Producto no encontrado'
        });
      }

      res.json({
        mensaje: 'Producto eliminado correctamente'
      });
    });
  }
);

// OBTENER UN PRODUCTO POR ID
app.get(
  '/api/admin/productos/:id',
  verificarToken,
  (req, res) => {

    const { id } = req.params;

    const sql = `
      SELECT
        productoID,
        nombreProducto,
        slug,
        descripcion,
        precio,
        stock,
        fechaAgregado,
        pathImagen
      FROM productos
      WHERE productoID = ?
      LIMIT 1
    `;

    db.query(sql, [id], (err, results) => {

      if (err) {

        console.error(
          '❌ Error obteniendo producto:',
          err.message
        );

        return res.status(500).json({
          mensaje: 'Error en la base de datos'
        });
      }

      if (results.length === 0) {

        return res.status(404).json({
          mensaje: 'Producto no encontrado'
        });
      }

      res.json(results[0]);
    });
  }
);

// OBTENER TODOS LOS CLIENTES
app.get(
  '/api/admin/clientes',
  verificarToken,
  (req, res) => {

    const sql = `
      SELECT
        clienteID,
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        fechaRegistro
      FROM clientes
      ORDER BY clienteID DESC
    `;

    db.query(sql, (err, results) => {

      if (err) {
        console.error(
          '❌ Error obteniendo clientes:',
          err.message
        );

        return res.status(500).json({
          mensaje: 'Error en la base de datos'
        });
      }

      res.json(results);
    });
  }
);

// OBTENER TODOS LOS PEDIDOS
app.get(
  '/api/admin/pedidos',
  verificarToken,
  (req, res) => {

    const sql = `
      SELECT
        pedidoID,
        clienteID,
        fechaPedido,
        total
      FROM pedidos
      ORDER BY pedidoID DESC
    `;

    db.query(sql, (err, results) => {

      if (err) {
        console.error(
          '❌ Error obteniendo pedidos:',
          err.message
        );

        return res.status(500).json({
          mensaje: 'Error en la base de datos'
        });
      }

      res.json(results);
    });
  }
);

// Servir Angular desde httpdocs
const angularPath = path.join(__dirname, 'httpdocs');

app.use(express.static(angularPath));

// Fallback para Angular Router
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(angularPath, 'index.html'));
});
