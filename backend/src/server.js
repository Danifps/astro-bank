import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a la base de datos MongoDB
connectDB();

// Rutas de la API
app.use('/api/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mensaje: 'Servidor Astro Bank Backend Operativo',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Backend escuchando en http://localhost:${port}`);
});
