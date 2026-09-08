require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
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

// =====================================================
// CONFIGURACIÓN DE IMÁGENES DE PRODUCTOS
// =====================================================
const carpetaImagenesProductos = path.join(
  __dirname,
  'httpdocs',
  'img',
  'productos'
);

if (!fs.existsSync(carpetaImagenesProductos)) {
  fs.mkdirSync(carpetaImagenesProductos, {
    recursive: true
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaImagenesProductos);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname).toLowerCase();

    const nombreUnico =
      crypto.randomUUID() + extension;

    cb(null, nombreUnico);
  }
});

const uploadImagen = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(
        new Error('El archivo debe ser una imagen')
      );
    }

    cb(null, true);
  }
});

app.use((req, res, next) => {
  console.log('🔥 LLEGA A EXPRESS:', req.method, req.originalUrl);
  next();
});

app.get('/api/prueba-node', (req, res) => {
  const datos = {
    ok: true,
    mensaje: 'Node está funcionando',
    fecha: new Date().toISOString(),
    url: req.originalUrl,
    metodo: req.method,
    pid: process.pid
  };

  console.log('🔥🔥🔥 PRUEBA NODE EJECUTADA 🔥🔥🔥', datos);

  res.json(datos);
});

app.get('/prueba-log', (req, res) => {
  console.log('🚨🚨🚨 HE LLEGADO A PRUEBA-LOG 🚨🚨🚨');
  res.send('HE LLEGADO A EXPRESS');
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

// =====================================================
// CREAR UN NUEVO PRODUCTO
// =====================================================

app.post(
  '/api/admin/productos',
  verificarToken,
  uploadImagen.single('imagen'),
  (req, res) => {

    const {
      nombreProducto,
      slug,
      descripcion,
      precio,
      stock
    } = req.body;

    // -----------------------------------------
    // Validaciones
    // -----------------------------------------

    if (
      !nombreProducto ||
      !slug ||
      precio === undefined
    ) {

      // Si se había subido una imagen pero faltan
      // datos obligatorios, eliminamos la imagen
      if (req.file) {
        fs.unlink(
          req.file.path,
          () => {}
        );
      }

      return res.status(400).json({
        mensaje:
          'Nombre, slug y precio son obligatorios'
      });
    }

    // -----------------------------------------
    // Ruta que guardaremos en MySQL
    // -----------------------------------------

    let pathImagen = null;

    if (req.file) {

      pathImagen =
        `/img/productos/${req.file.filename}`;

    }

    // -----------------------------------------
    // Insertar producto
    // -----------------------------------------

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
      pathImagen
    ];

    db.query(
      sql,
      valores,
      (err, result) => {

        if (err) {

          console.error(
            '❌ Error creando producto:',
            err.message
          );

          // Si MySQL falla, borrar imagen subida
          if (req.file) {
            fs.unlink(
              req.file.path,
              () => {}
            );
          }

          // Slug duplicado
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
              mensaje:
                'Ya existe un producto con ese slug.'
            });
          }

          return res.status(500).json({
            mensaje:
              'Error creando producto'
          });
        }

        // -----------------------------------------
        // Todo correcto
        // -----------------------------------------

        res.status(201).json({

          mensaje:
            'Producto creado correctamente',

          productoID:
            result.insertId,

          pathImagen

        });

      }
    );

  }
);

// editar producto existente
app.put(
  '/api/admin/productos/:id',
  verificarToken,
  uploadImagen.single('imagen'),
  (req, res) => {

    const { id } = req.params;

    const {
      nombreProducto,
      slug,
      descripcion,
      precio,
      stock
    } = req.body;

    // -----------------------------------------
    // Validaciones
    // -----------------------------------------

    if (
      !nombreProducto ||
      !slug ||
      precio === undefined
    ) {

      // Si se subió una imagen pero los datos
      // son incorrectos, eliminamos la nueva imagen
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }

      return res.status(400).json({
        mensaje:
          'Nombre, slug y precio son obligatorios'
      });
    }

    // -----------------------------------------
    // Primero obtenemos el producto actual
    // para conocer su imagen antigua
    // -----------------------------------------

    const sqlProducto = `
      SELECT
        pathImagen
      FROM productos
      WHERE productoID = ?
      LIMIT 1
    `;

    db.query(
      sqlProducto,
      [id],
      (err, resultados) => {

        if (err) {

          console.error(
            '❌ Error obteniendo producto:',
            err.message
          );

          if (req.file) {
            fs.unlink(req.file.path, () => {});
          }

          return res.status(500).json({
            mensaje: 'Error en la base de datos'
          });
        }

        // -----------------------------------------
        // Producto no existe
        // -----------------------------------------

        if (resultados.length === 0) {

          if (req.file) {
            fs.unlink(req.file.path, () => {});
          }

          return res.status(404).json({
            mensaje: 'Producto no encontrado'
          });
        }

        const imagenAnterior =
          resultados[0].pathImagen;

        // -----------------------------------------
        // Determinar imagen que guardaremos
        // -----------------------------------------

        let pathImagen = imagenAnterior;

        if (req.file) {

          pathImagen =
            `/img/productos/${req.file.filename}`;

        }

        // -----------------------------------------
        // Actualizar producto
        // -----------------------------------------

        const sqlUpdate = `
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
          pathImagen,
          id
        ];

        db.query(
          sqlUpdate,
          valores,
          (err, result) => {

            if (err) {

              console.error(
                '❌ Error actualizando producto:',
                err.message
              );

              // Eliminar la nueva imagen si MySQL falla
              if (req.file) {
                fs.unlink(req.file.path, () => {});
              }

              if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                  mensaje:
                    'Ya existe un producto con ese slug.'
                });
              }

              return res.status(500).json({
                mensaje:
                  'Error actualizando producto'
              });
            }

            // -----------------------------------------
            // Si se ha subido una imagen nueva,
            // eliminar la imagen antigua
            // -----------------------------------------

            if (
              req.file &&
              imagenAnterior
            ) {

              const nombreImagenAnterior =
                path.basename(imagenAnterior);

              const rutaImagenAnterior =
                path.join(
                  carpetaImagenesProductos,
                  nombreImagenAnterior
                );

              fs.unlink(
                rutaImagenAnterior,
                (error) => {

                  if (error && error.code !== 'ENOENT') {

                    console.error(
                      '⚠️ No se pudo eliminar la imagen anterior:',
                      error.message
                    );

                  }

                }
              );
            }

            // -----------------------------------------
            // Respuesta
            // -----------------------------------------

            res.json({
              mensaje:
                'Producto actualizado correctamente',

              pathImagen
            });

          }
        );

      }
    );

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

// =====================================================
// ANGULAR
// =====================================================

const angularPath = path.join(__dirname, 'httpdocs');
const angularIndex = path.join(
  angularPath,
  'index.html'
);

console.log('📁 Angular:', angularPath);
console.log('📄 Index:', angularIndex);

// Archivos estáticos de Angular
app.use(
  express.static(angularPath)
);

app.use((req, res, next) => {
  // Las API no pasan por Angular
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // Solo GET
  if (req.method !== 'GET') {
    return next();
  }

  const index = path.join(__dirname, 'httpdocs', 'index.html');

  fs.readFile(index, 'utf8', (err, html) => {
    if (err) {
      return res.status(500).send('Error cargando Angular');
    }

    res.type('html').send(html);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en el puerto ${PORT}`);
});