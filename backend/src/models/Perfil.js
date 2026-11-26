import mongoose from 'mongoose';

const direccionSchema = new mongoose.Schema({
  estado: { type: String, required: true, trim: true },
  ciudad: { type: String, required: true, trim: true },
  municipio: { type: String, required: true, trim: true },
  parroquia: { type: String, required: true, trim: true },
  direccion_detallada: { type: String, required: true, trim: true },
  punto_referencia: { type: String, trim: true, default: '' }
}, { _id: false });

const perfilSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  tipo_documento: {
    type: String,
    required: true,
    enum: ['V', 'E', 'J', 'P'],
    default: 'V',
    trim: true
  },
  cedula: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  archivo_documento: {
    type: String,
    required: true,
    trim: true
  },
  nombres: {
    type: String,
    required: true,
    trim: true
  },
  apellidos: {
    type: String,
    required: true,
    trim: true
  },
  nombre_completo: {
    type: String,
    required: true,
    trim: true
  },
  fecha_nacimiento: {
    type: String,
    required: true,
    trim: true
  },
  genero: {
    type: String,
    required: true,
    enum: ['Hombre', 'Mujer']
  },
  direccion: {
    type: direccionSchema,
    required: true
  },
  ocupacion: {
    type: String,
    required: true,
    enum: ['Empleado', 'Independiente', 'Comerciante', 'Estudiante', 'Jubilado', 'Otro']
  },
  rango_ingresos: {
    type: String,
    required: true,
    enum: ['Menos de $150', '$150 - $400', '$400 - $800', '$800 - $1,500', 'Más de $1,500']
  },
  operadora: {
    type: String,
    required: true,
    enum: ['0412', '0414', '0424', '0416', '0426']
  },
  numero_telefono: {
    type: String,
    required: true,
    trim: true,
    match: /^\d{7}$/
  },
  correo_electronico: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  tipo_usuario: {
    type: String,
    enum: ['cliente', 'inversionista', 'comercio', 'admin'],
    default: 'cliente'
  }
}, {
  collection: 'perfiles',
  timestamps: false
});

export const Perfil = mongoose.model('Perfil', perfilSchema);
