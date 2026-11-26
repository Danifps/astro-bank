import mongoose from 'mongoose';

/**
 * Modelo para almacenar permanentemente IPs y MACs bloqueadas
 * por intentos de acceso a rutas no autorizadas (backdoor/exploit).
 */
const blacklistedAddressSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    mac: {
      type: String,
      default: null,
      trim: true,
      index: true
    },
    motivo: {
      type: String,
      required: true
    },
    rutaIntentada: {
      type: String,
      default: null
    },
    metodo: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    bloqueadoEn: {
      type: Date,
      default: Date.now,
      index: true
    },
    intentos: {
      type: Number,
      default: 1
    }
  },
  {
    collection: 'blacklisted_addresses',
    timestamps: false
  }
);

// Índice compuesto único para evitar duplicados IP+MAC
blacklistedAddressSchema.index({ ip: 1, mac: 1 }, { unique: true, sparse: true });

export const BlacklistedAddress = mongoose.model('BlacklistedAddress', blacklistedAddressSchema);
