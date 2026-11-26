import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Usuario } from '../models/Usuario.js';
import { Perfil } from '../models/Perfil.js';

/**
 * Controlador de Inicio de Sesión Estricto y Seguro
 * Valida credenciales contra la base de datos MongoDB.
 */
export const login = async (req, res) => {
  try {
    // 1. Verificar si la base de datos MongoDB está conectada
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ok: false,
        mensaje: 'Error de conexión: El servidor no tiene acceso activo a la base de datos MongoDB. Verifica el MONGODB_URI en tu archivo backend/.env.'
      });
    }

    const { usuarioOCedula, claveAcceso } = req.body;

    if (!usuarioOCedula || !claveAcceso) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Por favor ingresa tu usuario o cédula y tu clave de acceso.'
      });
    }

    const inputClean = usuarioOCedula.trim().toLowerCase();
    const digitsOnly = inputClean.replace(/\D/g, '');

    let userFound = null;
    let perfilFound = null;

    // 2. Buscar por nombre de usuario en la colección 'usuarios'
    userFound = await Usuario.findOne({ usuario: inputClean });

    // 3. Si no se encontró por usuario y se ingresó una cédula, buscar en 'perfiles'
    if (!userFound && digitsOnly) {
      perfilFound = await Perfil.findOne({ cedula: digitsOnly });
      if (perfilFound) {
        // Buscar el usuario asociado al perfil
        if (perfilFound.usuario) {
          userFound = await Usuario.findOne({ usuario: perfilFound.usuario });
        } else {
          // Si no tiene campo usuario, buscar por cédula en 'usuarios'
          userFound = await Usuario.findOne({ cedula: digitsOnly });
        }
      }
    }

    // Si encontramos el usuario pero no el perfil, cargamos el perfil para la sesión
    if (userFound && !perfilFound) {
      perfilFound = await Perfil.findOne({
        $or: [
          { usuario: userFound.usuario },
          { cedula: userFound.cedula || '' }
        ]
      });
    }

    // 4. Si el usuario no existe en la base de datos, RECHAZAR acceso
    if (!userFound) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Acceso denegado: Usuario o cédula no registrados en Astro Bank.'
      });
    }

    // 5. Validación estricta de contraseña
    let passwordMatches = false;

    if (userFound.contrasena.startsWith('$2a$') || userFound.contrasena.startsWith('$2b$')) {
      passwordMatches = await bcrypt.compare(claveAcceso, userFound.contrasena);
    } else {
      // Comparación exacta para contraseñas de prueba en texto plano
      passwordMatches = (claveAcceso === userFound.contrasena);
    }

    // Si la contraseña NO coincide, RECHAZAR acceso
    if (!passwordMatches) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Acceso denegado: La clave de acceso ingresada es incorrecta.'
      });
    }

    // 6. Preparar datos de sesión seguros para el cliente
    const nombreCompleto = perfilFound?.nombre_completo || userFound.usuario;
    const cedula = perfilFound ? `${perfilFound.tipo_documento}-${perfilFound.cedula}` : (userFound.cedula || 'V-00000000');

    const usuarioRespuesta = {
      usuario: userFound.usuario,
      rol: userFound.rol || 'cliente',
      nombre: nombreCompleto,
      cedula: cedula,
      perfil: userFound.rol === 'inversionista' ? 'Inversionista' : 'Personas',
      correo: perfilFound?.correo_electronico || `${userFound.usuario}@astrobank.com`
    };

    return res.status(200).json({
      ok: true,
      mensaje: 'Autenticación exitosa en Astro Bank.',
      usuario: usuarioRespuesta
    });

  } catch (error) {
    console.error('Error crítico en login:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno en el servidor de autenticación.'
    });
  }
};

/**
 * Controlador de Registro Estricto
 */
export const register = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ok: false,
        mensaje: 'Error de conexión con la base de datos MongoDB.'
      });
    }

    const { usuario, perfil } = req.body;

    if (!usuario?.usuario || !usuario?.contrasena || !perfil?.cedula) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Faltan campos obligatorios para el registro.'
      });
    }

    const cleanUser = usuario.usuario.trim().toLowerCase();
    const cleanCedula = perfil.cedula.replace(/\D/g, '');

    const existingUser = await Usuario.findOne({ usuario: cleanUser });
    if (existingUser) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre de usuario ya está en uso. Por favor elija otro.'
      });
    }

    const existingCedula = await Perfil.findOne({ cedula: cleanCedula });
    if (existingCedula) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La cédula de identidad ingresada ya se encuentra registrada.'
      });
    }

    // Hashear contraseña con bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(usuario.contrasena, salt);

    // Guardar en 'usuarios'
    const nuevoUsuario = new Usuario({
      usuario: cleanUser,
      cedula: cleanCedula,
      contrasena: hashedPassword,
      rol: usuario.rol || 'cliente',
      fecha_registro: new Date()
    });
    await nuevoUsuario.save();

    // Guardar en 'perfiles'
    const nuevoPerfil = new Perfil({
      ...perfil,
      usuario: cleanUser,
      cedula: cleanCedula,
      nombre_completo: perfil.nombre_completo || `${perfil.nombres} ${perfil.apellidos}`.trim()
    });
    await nuevoPerfil.save();

    return res.status(201).json({
      ok: true,
      mensaje: 'Cliente registrado exitosamente en Astro Bank.',
      usuario: {
        usuario: nuevoUsuario.usuario,
        cedula: nuevoPerfil.cedula,
        rol: nuevoUsuario.rol
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno al registrar el cliente.'
    });
  }
};
