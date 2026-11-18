const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectBd = require('./config/bd');
const Usuario = require('./models/schema_Usuarios');

dotenv.config();
connectBd();
const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/usuarios', async (req, res) => {
     try {
      const {nombres} = req.body;
      const nuevoUsuario = new Usuario({ nombres});
      await nuevoUsuario.save();
      res.status(201).json({
        estado: "activo",
        mensaje: "Usuario creado correctamente",
        data: nuevoUsuario
      })
    } catch (error) {
      res.status(500).json({
        estado: error,
        mensaje: `lo sentimos no se pudo crear el usuario ${error.message}`
      });
    } 

     
});

app.listen(port, () => {
  console.log(`Backend escuchando en http://localhost:${port}`)
})
