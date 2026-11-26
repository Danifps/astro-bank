import mongoose from 'mongoose';

const perfilSchema = new mongoose.Schema({
  usuario: { type: String, trim: true, lowercase: true, default: null },
  tipo_documento: { type: String, default: 'V' },
  cedula: { type: String, required: true, unique: true },
  archivo_documento: { type: String, default: null },
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  nombre_completo: { type: String, required: true },
  fecha_nacimiento: { type: String },
  genero: { type: String },
  direccion: {
    estado: String,
    ciudad: String,
    municipio: String,
    parroquia: String,
    direccion_detallada: String,
    punto_referencia: String
  },
  ocupacion: { type: String },
  rango_ingresos: { type: String },
  operadora: { type: String },
  numero_telefono: { type: String },
  correo_electronico: { type: String },
  tipo_usuario: { type: String, default: 'cliente' }
}, {
  collection: 'perfiles',
  timestamps: false
});

export const Perfil = mongoose.model('Perfil', perfilSchema);
