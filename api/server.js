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
const requiereRol = require('./middleware/roles');
const nodemailer = require('nodemailer');

app.use(cors({
  origin: 'https://alvarogfv1-2526.proyectosdwa.es:4200',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

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

// CONFIGURACIÓN DE IMÁGENES DE PRODUCTOS
const carpetaImagenesProductos = path.join(
  __dirname,
  'httpdocs',
  'img',
  'productos'
);

if (!fs.existsSync(carpetaImagenesProductos)) {
  fs.mkdirSync(carpetaImagenesProductos, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaImagenesProductos);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const nombreUnico = crypto.randomUUID() + extension;
    cb(null, nombreUnico);
  }
});

const uploadImagen = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb( new Error('El archivo debe ser una imagen') );
    }
    cb(null, true);
  }
});

app.use((req, res, next) => {
  console.log('🔥 LLEGA A EXPRESS:', req.method, req.originalUrl);
  next();
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

  console.log('--- 📥 Petición recibida en /api/productos/:slug ---');

  const { slug } = req.params;

  console.log('🔎 Buscando producto con slug:', slug);

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

  db.query( sql, [slug], (err, results) => {

      if (err) {
        console.error( '❌ ERROR REAL EN MYSQL:', err.message);
        return res.status(500).json({
          mensaje: 'Error en la base de datos',
          errorDetallado: err.message,
          codigoError: err.code
        });
      }

      if (results.length === 0) {
        console.log( '⚠️ Producto no encontrado:', slug );
        return res.status(404).json({
          mensaje: 'Producto no encontrado'
        });
      }

      console.log( '✅ Producto encontrado:', results[0].nombreProducto );

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
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' });
    }

    const administrador = results[0];

    if (!administrador.activo) {
      return res.status(403).json({ mensaje: 'La cuenta está desactivada' });
    }

    const passwordCorrecta = await bcrypt.compare( password, administrador.password );

    if (!passwordCorrecta) {
      return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' });
    }

    const token = jwt.sign(
      {
        id: administrador.id,
        email: administrador.email,
        tipo: 'administrador',
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


// --- ADMIN - PRODUCTOS ---

// OBTENER TODOS LOS PRODUCTOS
app.get( '/api/admin/productos', verificarToken, requiereRol('administrador'), (req, res) => {

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
        console.error( '❌ Error obteniendo productos:', err.message );
        return res.status(500).json({ mensaje: 'Error en la base de datos' });
      }

      res.json(results);
    });
  }
);

// CREAR UN NUEVO PRODUCTO
app.post( '/api/admin/productos', verificarToken, requiereRol('administrador'), uploadImagen.single('imagen'), (req, res) => {

    const {
      nombreProducto,
      slug,
      descripcion,
      precio,
      stock
    } = req.body;

    // Validaciones
    if ( !nombreProducto || !slug || precio === undefined ) {

      // Si se había subido una imagen pero faltan
      // datos obligatorios, eliminamos la imagen
      if (req.file) {
        fs.unlink( req.file.path, () => {} );
      }

      return res.status(400).json({ mensaje: 'Nombre, slug y precio son obligatorios' });
    }

    // Ruta que guardaremos en MySQL
    let pathImagen = null;

    if (req.file) {
      pathImagen = `/img/productos/${req.file.filename}`;
    }

    // Insertar producto
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

    db.query( sql, valores, (err, result) => {

        if (err) {
          console.error( '❌ Error creando producto:', err.message );

          // Si MySQL falla, borrar imagen subida
          if (req.file) {
            fs.unlink( req.file.path, () => {} );
          }

          // Slug duplicado
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensaje: 'Ya existe un producto con ese slug.' });
          }

          return res.status(500).json({ mensaje: 'Error creando producto' });
        }

        // Todo correcto
        res.status(201).json({
          mensaje: 'Producto creado correctamente',
          productoID: result.insertId,
          pathImagen
        });
      }
    );
  }
);

// editar producto existente
app.put( '/api/admin/productos/:id', verificarToken, requiereRol('administrador'), uploadImagen.single('imagen'), (req, res) => {

    const { id } = req.params;
    const {
      nombreProducto,
      slug,
      descripcion,
      precio,
      stock
    } = req.body;

    // Validaciones
    if ( !nombreProducto || !slug || precio === undefined
    ) {

      // Si se subió una imagen pero los datos son incorrectos, eliminamos la nueva imagen
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }

      return res.status(400).json({ mensaje: 'Nombre, slug y precio son obligatorios' });
    }

    // Primero obtenemos el producto actual
    // para conocer su imagen antigua
    const sqlProducto = `
      SELECT
        pathImagen
      FROM productos
      WHERE productoID = ?
      LIMIT 1
    `;

    db.query( sqlProducto, [id], (err, resultados) => {

        if (err) {
          console.error( '❌ Error obteniendo producto:', err.message );

          if (req.file) {
            fs.unlink(req.file.path, () => {});
          }

          return res.status(500).json({ mensaje: 'Error en la base de datos' });
        }

        // Producto no existe
        if (resultados.length === 0) {

          if (req.file) {
            fs.unlink(req.file.path, () => {});
          }

          return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        const imagenAnterior = resultados[0].pathImagen;

        // Determinar imagen que guardaremos
        let pathImagen = imagenAnterior;

        if (req.file) {
          pathImagen = `/img/productos/${req.file.filename}`;
        }

        // Actualizar producto
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

        db.query( sqlUpdate, valores, (err, result) => {

            if (err) {
              console.error( '❌ Error actualizando producto:', err.message );

              // Eliminar la nueva imagen si MySQL falla
              if (req.file) {
                fs.unlink(req.file.path, () => {});
              }

              if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ mensaje: 'Ya existe un producto con ese slug.' });
              }

              return res.status(500).json({ mensaje: 'Error actualizando producto' });
            }

            // Si se ha subido una imagen nueva,
            // eliminar la imagen antigua
            if ( req.file && imagenAnterior
            ) {
              const nombreImagenAnterior = path.basename(imagenAnterior);
              const rutaImagenAnterior = path.join(
                  carpetaImagenesProductos,
                  nombreImagenAnterior
                );

              fs.unlink( rutaImagenAnterior, (error) => {
                if (error && error.code !== 'ENOENT') {
                  console.error( '⚠️ No se pudo eliminar la imagen anterior:', error.message );
                }
              });
            }

            // Respuesta
            res.json({ mensaje: 'Producto actualizado correctamente', pathImagen });
          }
        );
      }
    );
  }
);

// eliminar un producto
app.delete( '/api/admin/productos/:id', verificarToken, requiereRol('administrador'), (req, res) => {

    const { id } = req.params;
    const sql = `
      DELETE FROM productos
      WHERE productoID = ?
    `;

    db.query(sql, [id], (err, result) => {

      if (err) {
        console.error( '❌ Error eliminando producto:', err.message );
        return res.status(500).json({ mensaje: 'Error eliminando producto' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }

      res.json({ mensaje: 'Producto eliminado correctamente' });
    });
  }
);

// OBTENER UN PRODUCTO POR ID
app.get( '/api/admin/productos/:id', verificarToken, requiereRol('administrador'), (req, res) => {

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
      LIMIT 1`;

    db.query(sql, [id], (err, results) => {

      if (err) {
        console.error( '❌ Error obteniendo producto:', err.message );
        return res.status(500).json({ mensaje: 'Error en la base de datos' });
      }

      if (results.length === 0) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }

      res.json(results[0]);
    });
  }
);

// Obtener lista de clientes
app.get( '/api/admin/clientes', verificarToken, requiereRol('administrador'), (req, res) => {

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
        console.error( '❌ Error obteniendo clientes:', err.message );
        return res.status(500).json({ mensaje: 'Error en la base de datos' });
      }

      res.json(results);
    });
  }
);

// Obtener todos los pedidos
app.get( '/api/admin/pedidos', verificarToken, requiereRol('administrador'), (req, res) => {

    const sql = `SELECT 
      p.pedidoID, 
      p.clienteID, 
      -- Concatenamos nombre y apellidos con un espacio en medio
      CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente, 
      p.fechaPedido, 
      p.total, 
      p.estado 
    FROM pedidos p
    LEFT JOIN clientes c ON p.clienteID = c.clienteID
    ORDER BY p.fechaPedido DESC`;

    db.query(sql, (err, results) => {
      if (err) {
        console.error( '❌ Error obteniendo pedidos:', err.message );
        return res.status(500).json({ mensaje: 'Error en la base de datos', error: err.message });
      }

      res.json(results);
    });
  }
);

// Cambiar el estado de un pedido
app.put('/api/admin/pedidos/:id/estado', verificarToken, requiereRol('administrador'), (req, res) => {
  const { id } = req.params;
  const { nuevoEstado } = req.body;

  const query = 'UPDATE pedidos SET estado = ? WHERE pedidoID = ?';
  db.query(query, [nuevoEstado, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Estado actualizado', pedidoID: id, estado: nuevoEstado });
  });
});

// obtener detalles de un pedido
app.get('/api/admin/pedidos/:id/detalles', verificarToken, requiereRol('administrador'), (req, res) => {
  const { id } = req.params; // Corresponde al pedidoID
  
  const query = `
    SELECT 
      dp.detalleID, 
      dp.productoID, 
      p.nombreProducto, 
      p.pathImagen,
      dp.cantidad, 
      dp.precioUnitario, 
      dp.subtotal 
    FROM detallesPedido dp
    LEFT JOIN productos p ON dp.productoID = p.productoID
    WHERE dp.pedidoID = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error SQL en detalles:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});



// login de clientes
app.post('/api/cliente/login', (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
  }

  const sql = `
    SELECT
      clienteID,
      nombre,
      apellido,
      email,
      password,
      telefono,
      direccion,
      fechaRegistro
    FROM clientes
    WHERE email = ?
    LIMIT 1
  `;

  db.query(sql, [email], async (err, resultados) => {

    if (err) {
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }

    if (resultados.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const cliente = resultados[0];

    try {

      const passwordCorrecta = await bcrypt.compare(
        password,
        cliente.password
      );

      if (!passwordCorrecta) {
        return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
      }

      const token = jwt.sign(
        {
          id: cliente.clienteID,
          email: cliente.email,
          tipo: 'cliente'
        },
        JWT_SECRET,
        {
          expiresIn: '8h'
        }
      );

      return res.json({
        mensaje: 'Login correcto',
        token,
        cliente: {
          clienteID: cliente.clienteID,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          fechaRegistro: cliente.fechaRegistro
        }
      });

    } catch (error) {
      return res.status(500).json({
        mensaje: 'Error interno del servidor',
        errorReal: error.message,
        stackReal: error.stack
      });
    }
  });
});

// conseguir datos del cliente logueado
app.get( '/api/cliente/me', verificarToken, requiereRol('cliente'), (req, res) => {

    const sql = `
      SELECT clienteID, nombre, apellido, email,
             telefono, direccion, fechaRegistro
      FROM clientes
      WHERE clienteID = ?
    `;

    db.query(sql, [req.usuario.id], (error, resultados) => {

      if (error) {
        console.error('❌ Error obteniendo datos del cliente:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
      }

      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }

      res.json(resultados[0]);
    });
  }
);

// conseguir pedidos del cliente logueado
app.get( '/api/cliente/pedidos', verificarToken, requiereRol('cliente'), async (req, res) => {

    try {
      const [pedidos] = await db.promise().query(
        `SELECT pedidoID, clienteID, fechaPedido, total
         FROM pedidos
         WHERE clienteID = ?
         ORDER BY pedidoID DESC`,
        [req.usuario.id]
      );

      res.json(pedidos);

    } catch (error) {

      console.error('❌ Error obteniendo pedidos del cliente:', error);

      res.status(500).json({
        mensaje: 'Error interno del servidor',
        errorReal: error.message,
        stackReal: error.stack
      });
    }
  }
);

// conseguir un pedido específico del cliente logueado
app.get( '/api/cliente/pedidos/:id', verificarToken, requiereRol('cliente'), async (req, res) => {
    try {
      const { id } = req.params;

      const [pedidos] = await db.promise().query(
        `SELECT pedidoID, clienteID, fechaPedido, total
         FROM pedidos
         WHERE pedidoID = ?
           AND clienteID = ?`,
        [id, req.usuario.id]
      );

      if (pedidos.length === 0) {
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      }

      const pedidoGeneral = pedidos[0];

      const [articulos] = await db.promise().query(
        `SELECT dp.cantidad, dp.precioUnitario, dp.subtotal, p.nombreProducto AS nombreProducto
        FROM detallesPedido dp
        INNER JOIN productos p ON dp.productoID = p.productoID
        WHERE dp.pedidoID = ?`,
        [id]
      );

      res.json({
        pedidoID: pedidoGeneral.pedidoID,
        clienteID: pedidoGeneral.clienteID,
        fechaPedido: pedidoGeneral.fechaPedido,
        total: pedidoGeneral.total,
        articulos: articulos || [] 
      });

    } catch (error) {
      console.error('❌ Error obteniendo el pedido:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor',
        errorReal: error.message,
        stackReal: error.stack });
    }
  }
);

// OBTENER DATOS DEL PERFIL
app.get('/api/cliente/perfil', verificarToken, requiereRol('cliente'), async (req, res) => {
  try {
    const [usuarios] = await db.promise().query(
      `SELECT clienteID, nombre, apellido, email, telefono, direccion, fechaRegistro 
       FROM clientes 
       WHERE clienteID = ?`,
      [req.usuario.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Actualizar datos del perfil
app.put('/api/cliente/perfil', verificarToken, requiereRol('cliente'), async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, direccion } = req.body;
    const clienteID = req.usuario.id;

    await db.promise().query(
      `UPDATE clientes 
       SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ? 
       WHERE clienteID = ?`,
      [nombre, apellido, email, telefono, direccion, clienteID]
    );

    res.json({ mensaje: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Cambiar contraseña de perfil
app.put('/api/cliente/seguridad', verificarToken, requiereRol('cliente'), async (req, res) => {
  try {
    const { passwordActual, nuevaPassword } = req.body;
    const clienteID = req.usuario.id;

    const [clientes] = await db.promise().query(
      'SELECT password FROM clientes WHERE clienteID = ?',
      [clienteID]
    );

    if (clientes.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    const passwordGuardada = clientes[0].password;

    const coinciden = await bcrypt.compare(passwordActual, passwordGuardada);
    if (!coinciden) {
      return res.status(400).json({ mensaje: 'La contraseña actual no es correcta' });
    }

    const saltRounds = 10;
    const nuevaPasswordEncriptada = await bcrypt.hash(nuevaPassword, saltRounds);

    await db.promise().query(
      'UPDATE clientes SET password = ? WHERE clienteID = ?',
      [nuevaPasswordEncriptada, clienteID]
    );

    res.json({ mensaje: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Endpoint para insertar pedidos 1: Guarda únicamente el pedido general
app.post('/api/cliente/pedidos/maestro', (req, res) => {
    const { clienteID, total } = req.body;

    if (!clienteID || !total) {
        return res.status(400).json({ error: 'Faltan datos del cliente o total.' });
    }

    const query = 'INSERT INTO pedidos (clienteID, fechaPedido, total, estado) VALUES (?, NOW(), ?, ?)';
    
    db.query(query, [clienteID, total, 'Pendiente'], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error BD Maestro', detalle: err.message });
        }
        // Retorna el ID creado sin tocar los detalles aún
        return res.status(201).json({ pedidoID: result.insertId });
    });
});

// Endpoint para insertar pedidos 2: Guarda los artículos de uno en uno
app.post('/api/cliente/pedidos/detalle', (req, res) => {
    const { pedidoID, productoID, cantidad, precioUnitario } = req.body;

    if (!pedidoID || !productoID || !cantidad || !precioUnitario) {
        return res.status(400).json({ error: 'Datos de detalle incompletos.' });
    }

    const subtotal = cantidad * precioUnitario;
    const query = 'INSERT INTO detallesPedido (pedidoID, productoID, cantidad, precioUnitario, subtotal) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [pedidoID, productoID, cantidad, precioUnitario, subtotal], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error BD Detalle', detalle: err.message });
        }
        return res.status(201).json({ success: true });
    });
});


const googleUser = String(process.env.MAIL_USER).replace(/['"]/g, '').trim();
const googlePass = String(process.env.MAIL_PASS).replace(/['"]/g, '').trim();

// Configuración del transportador de Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Forzamos SSL para el puerto 465
  auth: {
    user: googleUser, // Tu correo de Gmail corregido
    pass: googlePass      // Tus 16 letras de Google (sin espacios)
  },
  tls: {
    // Crucial en Plesk: evita bloqueos por certificados locales
    rejectUnauthorized: false
  }
});

// Ruta del formulario de contacto
app.post('/api/contacto', (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validación de los campos en inglés que vienen de tu Angular
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const mailOptions = {
    from: process.env.MAIL_USER, // El mismo correo autenticado
    to: process.env.MAIL_USER,   // Donde quieres recibir el mensaje
    subject: `Contacto E-commerce: ${subject}`,
    text: `Has recibido un mensaje de: ${name} (${email})\n\nMensaje:\n${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error en Nodemailer:', error.message);
      return res.status(500).json({ 
        error: 'Error al enviar el correo', 
        detalle: { code: error.code, command: error.command, message: error.message }
      });
    }
    return res.status(200).json({ mensaje: 'Correo enviado con éxito' });
  });
});

// registrarse en la web
app.post('/api/registro', async (req, res) => {

  const { nombre, apellido, email, password, telefono, direccion } = req.body;

  if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ error: 'Nombre, apellido, email y contraseña son obligatorios.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO clientes (nombre, apellido, email, password, telefono, direccion) 
      VALUES (?, ?, ?, ?, ?, ?)`;
        
    db.query(query, [nombre, apellido, email, hashedPassword, telefono || null, direccion || null], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }
        return res.status(500).json({ error: 'Error al guardar el cliente en la base de datos.' });
      }
      res.status(201).json({ mensaje: 'Cliente registrado con éxito.' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


// --- ANGULAR ---
const angularPath = path.join(__dirname, 'httpdocs');
const angularIndex = path.join( angularPath, 'index.html' );

console.log('📁 Angular:', angularPath);
console.log('📄 Index:', angularIndex);

// Archivos estáticos de Angular
app.use( express.static(angularPath) );

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
      console.error('❌ Error cargando Angular index.html:', err.message);
      return res.status(500).send('Error cargando Angular');
    }

    res.type('html').send(html);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en el puerto ${PORT}`);
});