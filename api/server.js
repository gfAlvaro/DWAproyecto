const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/hola', (req, res) => {
    res.json({
        mensaje: 'Hola desde mi API'
    });
});

app.post('/api/contacto', (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;

  console.log('Nuevo mensaje de contacto:');
  console.log('Nombre:', nombre);
  console.log('Email:', email);
  console.log('Asunto:', asunto);
  console.log('Mensaje:', mensaje);

  res.json({
    ok: true,
    mensaje: 'Mensaje recibido correctamente'
  });
});

app.listen(PORT, () => {
  console.log(`API funcionando en puerto ${PORT}`);
});