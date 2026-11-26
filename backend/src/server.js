const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectBd = require('./config/bd');
const Usuario = require('./models/schema_Usuarios');
const Perfil = require('./models/schema_Perfil');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;      

app.use(cors());
app.use(express.json());

// Captura JSON malformado en el cuerpo de la petición
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      estado: 'error',
      mensaje: 'El cuerpo de la petición no es un JSON válido'
    });
  }
  return next(err);
});

function handleRouteError(res, error, baseMessage) {
  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return res.status(400).json({
      estado: 'error',
      mensaje: `${baseMessage}: ${error.message}`
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      estado: 'error',
      mensaje: `${baseMessage}: registro duplicado`
    });
  }

  return res.status(500).json({
    estado: 'error',
    mensaje: `${baseMessage}: ${error?.message || 'error interno del servidor'}`
  });
}

function hasValidBody(req, res) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({
      estado: 'error',
      mensaje: 'Debe enviar un objeto JSON válido en el cuerpo de la petición'
    });
    return false;
  }
  return true;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/usuarios', async (req, res) => {
  if (!hasValidBody(req, res)) return;

  try {
    const { username, password, rol } = req.body;
    const nuevoUsuario = new Usuario({ username, password, rol });
    await nuevoUsuario.save();

    res.status(201).json({
      estado: 'activo',
      mensaje: 'Usuario creado correctamente',
      data: {
        _id: nuevoUsuario._id,
        username: nuevoUsuario.username,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    handleRouteError(res, error, 'Lo sentimos, no se pudo crear el usuario');
  }
});

app.post('/perfil', async (req, res) => {
  if (!hasValidBody(req, res)) return;

  try {
    const {
      tipo_documento,
      cedula,
      nombre_completo,
      genero,
      direccion,
      operadora_telefono,
      numero_telefono,
      correo_electronico,
      imagen_documento,
      tipo_usuario,
      datos_laborales
    } = req.body;

    const nuevoPerfil = new Perfil({
      tipo_documento,
      cedula,
      nombre_completo,
      genero,
      direccion,
      operadora_telefono,
      numero_telefono,
      correo_electronico,
      imagen_documento,
      tipo_usuario,
      datos_laborales
    });

    await nuevoPerfil.save();

    res.status(201).json({
      estado: 'activo',
      mensaje: 'Perfil creado correctamente',
      data: nuevoPerfil
    });
  } catch (error) {
    handleRouteError(res, error, 'Lo sentimos, no se pudo crear el perfil');
  }
});

async function startServer() {
  await connectBd();
  app.listen(port, () => {
    console.log(`Backend escuchando en http://localhost:${port}`);
  });
}

startServer();
