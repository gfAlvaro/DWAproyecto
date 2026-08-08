const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/hola', (req, res) => {
  res.json({
    mensaje: 'Hola desde mi API'
  });
});

app.listen(3000, () => {
  console.log('API funcionando en el puerto 3000');
});