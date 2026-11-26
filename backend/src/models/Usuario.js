import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  cedula: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  contrasena: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['cliente', 'inversionista', 'comercio', 'admin'],
    default: 'cliente'
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'usuarios',
  timestamps: false
});

export const Usuario = mongoose.model('Usuario', usuarioSchema);
