import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || (
      process.env.NODE_ENV === 'production'
        ? ''
        : 'mongodb://127.0.0.1:27017/AstroBankbd?directConnection=true'
    );
    if (!mongoUri) {
      throw new Error('MONGODB_URI debe configurarse en producción.');
    }

    // Ocultar credenciales si existen en la URL para el log de consola
    const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`📡 Intentando conectar a MongoDB: ${maskedUri}`);

    const isLocalUri = /^mongodb:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/i.test(mongoUri);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      ...(isLocalUri ? { directConnection: true } : {})
    });

    console.log(`✅ MongoDB Conectado exitosamente: Host: ${conn.connection.host} | BD: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    console.warn('⚠️  Verifica que tu servidor de MongoDB (local o Atlas) esté encendido y que el URI en backend/.env sea correcto.');
    throw error;
  }
};
