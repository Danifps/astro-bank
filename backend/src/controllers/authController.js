import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Usuario } from '../models/Usuario.js';
import { Perfil } from '../models/Perfil.js';
import {
  registerFailedLoginAttempt,
  clearFailedLoginAttempts,
  createSessionToken,
  getClientIp,
  logError,
  clearSessionCookie,
  setSessionCookie
} from '../middlewares/security.js';

const DOCUMENTS_DIRECTORY = fileURLToPath(new URL('../../uploads/', import.meta.url));

// ── Validaciones de entrada ───────────────────────────────────────────────────

/**
 * Contraseña válida: 8–16 chars, al menos 1 mayúscula, 1 número y 1 carácter especial.
 */
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,16}$/;

/**
 * Validación básica de formato de correo electrónico.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Controlador de Inicio de Sesión Estricto y Seguro
 * Valida credenciales contra la base de datos MongoDB.
 */
export const login = async (req, res) => {
  try {
    clearSessionCookie(res);
    const { usuarioOCedula, claveAcceso } = req.body || {};
    console.log('📡 [AUTH ATTEMPT] Intento de login recibido.');

    // 1. Verificar si la base de datos MongoDB está conectada
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ [AUTH ERROR] MongoDB no está conectado');
      return res.status(503).json({
        ok: false,
        mensaje: 'Error de conexión: El servidor no tiene acceso activo a la base de datos MongoDB. Verifica el MONGODB_URI en tu archivo backend/.env.'
      });
    }

    if (
      typeof usuarioOCedula !== 'string' ||
      typeof claveAcceso !== 'string' ||
      !usuarioOCedula.trim() ||
      !claveAcceso
    ) {
      console.warn('⚠️ [AUTH REJECTED] Faltan campos obligatorios');
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

    // 4. Si el usuario no existe en la base de datos, RECHAZAR acceso y contar fallo por IP
    if (!userFound) {
      const attemptInfo = await registerFailedLoginAttempt(req);
      if (attemptInfo.blocked) {
        if (attemptInfo.permanent) {
          return res.status(403).json({
            ok: false,
            bloqueado: true,
            permanente: true,
            mensaje: 'Tu dirección IP ha sido bloqueada permanentemente por múltiples intentos fallidos.'
          });
        }
        res.setHeader('Retry-After', String(attemptInfo.retryAfterSeconds));
        return res.status(429).json({
          ok: false,
          bloqueado: true,
          segundosRestantes: attemptInfo.retryAfterSeconds,
          mensaje: `Has fallado demasiadas veces. Tu IP está bloqueada por ${attemptInfo.retryAfterSeconds} segundos.`
        });
      }

      console.warn('❌ [AUTH DENIED] Usuario no encontrado.');
      return res.status(401).json({
        ok: false,
        intentosRestantes: attemptInfo.attemptsLeft,
        mensaje: `Acceso denegado: Usuario o cédula no registrados. Intentos restantes antes del bloqueo: ${attemptInfo.attemptsLeft}.`
      });
    }

    // 5. Validación estricta de contraseña — SOLO bcrypt, nunca texto plano
    let passwordMatches = false;

    if (userFound.contrasena.startsWith('$2a$') || userFound.contrasena.startsWith('$2b$')) {
      passwordMatches = await bcrypt.compare(claveAcceso, userFound.contrasena);
    } else {
      // Contraseña no hasheada en BD: rechazar y forzar al admin a migrar los datos
      console.error('[SEGURIDAD] ⚠️ Existe una contraseña en texto plano. Debe rehashearse con bcrypt.');
      passwordMatches = false;
    }

    // Si la contraseña NO coincide, RECHAZAR acceso y contar fallo por IP
    if (!passwordMatches) {
      const attemptInfo = await registerFailedLoginAttempt(req);
      if (attemptInfo.blocked) {
        if (attemptInfo.permanent) {
          return res.status(403).json({
            ok: false,
            bloqueado: true,
            permanente: true,
            mensaje: 'Tu dirección IP ha sido bloqueada permanentemente por múltiples intentos fallidos.'
          });
        }
        res.setHeader('Retry-After', String(attemptInfo.retryAfterSeconds));
        return res.status(429).json({
          ok: false,
          bloqueado: true,
          segundosRestantes: attemptInfo.retryAfterSeconds,
          mensaje: `Has fallado demasiadas veces. Tu IP está bloqueada por ${attemptInfo.retryAfterSeconds} segundos.`
        });
      }

      console.warn('❌ [AUTH DENIED] Credenciales incorrectas.');
      return res.status(401).json({
        ok: false,
        intentosRestantes: attemptInfo.attemptsLeft,
        mensaje: `Acceso denegado: Clave incorrecta. Intentos restantes antes del bloqueo: ${attemptInfo.attemptsLeft}.`
      });
    }

    // Login exitoso: reiniciar contador de intentos fallidos de esta IP
    await clearFailedLoginAttempts(req);

    // 6. Preparar datos de sesión seguros con vigencia máxima de 10 minutos
    const nombreCompleto = perfilFound?.nombre_completo || userFound.usuario;
    const cedula = perfilFound ? `${perfilFound.tipo_documento}-${perfilFound.cedula}` : (userFound.cedula || 'V-00000000');

    const usuarioRespuesta = {
      usuario: userFound.usuario,
      rol: userFound.rol || 'cliente',
      nombre: nombreCompleto,
      cedula: cedula,
      perfil: userFound.rol === 'inversionista' ? 'Inversionista' : 'Personas',
      correo: perfilFound?.correo_electronico || `${userFound.usuario}@astrobank.com`,
      telefono: perfilFound?.telefono || perfilFound?.numero_telefono || '+58-4123807072',
      fechaNacimiento: perfilFound?.fecha_nacimiento || '15/12/2005'
    };

    const session = createSessionToken({
      usuario: usuarioRespuesta.usuario,
      rol: usuarioRespuesta.rol
    }, getClientIp(req));
    setSessionCookie(res, session.token);

    console.log('✅ [AUTH SUCCESS] Usuario autenticado con éxito.');
    return res.status(200).json({
      ok: true,
      mensaje: 'Autenticación exitosa en Astro Bank.',
      usuario: usuarioRespuesta,
      expiresAt: session.expiresAt,
      sessionDurationMs: session.sessionDurationMs
    });

  } catch (error) {
    logError('login', error);
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
  let usuarioCreadoId = null;
  let storedDocumentPath = null;

  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ok: false,
        mensaje: 'Error de conexión con la base de datos MongoDB.'
      });
    }

    const { usuario, perfil } = req.body || {};

    if (
      typeof usuario?.usuario !== 'string' ||
      typeof usuario?.contrasena !== 'string' ||
      typeof perfil?.cedula !== 'string' ||
      !usuario.usuario.trim() ||
      !usuario.contrasena ||
      !perfil.cedula.trim() ||
      !req.file ||
      !req.documentExtension
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Faltan campos obligatorios para el registro.'
      });
    }

    const cleanUser = usuario.usuario.trim().toLowerCase();
    const cleanCedula = perfil.cedula.replace(/\D/g, '');

    if (cleanUser.length < 4) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario debe tener al menos 4 caracteres.'
      });
    }

    if (usuario.contrasena.length < 8 || usuario.contrasena.length > 16) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La contraseña debe tener entre 8 y 16 caracteres.'
      });
    }

    if (!PASSWORD_REGEX.test(usuario.contrasena)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La contraseña debe contener al menos una letra mayúscula, un número y un carácter especial (ej: !@#$%).'
      });
    }

    if (perfil.correo_electronico && !EMAIL_REGEX.test(perfil.correo_electronico)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El correo electrónico ingresado no tiene un formato válido.'
      });
    }

    if (cleanCedula.length < 5 || cleanCedula.length > 9) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La cédula de identidad debe contener entre 5 y 9 dígitos numéricos.'
      });
    }

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
        mensaje: 'La cédula de identidad ingresada ya se encuentra registrada en Astro Bank.'
      });
    }

    const existingUserCedula = await Usuario.findOne({ cedula: cleanCedula });
    if (existingUserCedula) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La cédula de identidad ingresada ya se encuentra registrada en Astro Bank.'
      });
    }

    if (perfil.correo_electronico) {
      const existingEmail = await Perfil.findOne({ correo_electronico: perfil.correo_electronico.trim().toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El correo electrónico ingresado ya está asociado a otra cuenta.'
        });
      }
    }

    // Hashear contraseña con bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(usuario.contrasena, salt);
    // El registro público siempre crea cuentas con rol estándar 'cliente'
    const rolUsuario = 'cliente';

    // Guardar en 'usuarios'
    const nuevoUsuario = new Usuario({
      usuario: cleanUser,
      cedula: cleanCedula,
      contrasena: hashedPassword,
      rol: rolUsuario,
      fecha_registro: new Date()
    });
    await nuevoUsuario.save();
    usuarioCreadoId = nuevoUsuario._id;

    const documentFileName = `${randomUUID()}.${req.documentExtension}`;
    storedDocumentPath = path.join(DOCUMENTS_DIRECTORY, documentFileName);
    await mkdir(DOCUMENTS_DIRECTORY, { recursive: true });
    await writeFile(storedDocumentPath, req.file.buffer, { flag: 'wx', mode: 0o600 });

    // Lista blanca explícita de campos permitidos en Perfil (evita mass assignment)
    const nombresLimpios = typeof perfil.nombres === 'string' ? perfil.nombres.trim() : '';
    const apellidosLimpios = typeof perfil.apellidos === 'string' ? perfil.apellidos.trim() : '';
    const direccionInput = perfil.direccion && typeof perfil.direccion === 'object' ? perfil.direccion : {};

    const nuevoPerfil = new Perfil({
      usuario: cleanUser,
      tipo_documento: perfil.tipo_documento,
      cedula: cleanCedula,
      archivo_documento: documentFileName,
      nombres: nombresLimpios,
      apellidos: apellidosLimpios,
      nombre_completo: `${nombresLimpios} ${apellidosLimpios}`.trim(),
      fecha_nacimiento: perfil.fecha_nacimiento,
      genero: perfil.genero,
      direccion: {
        estado: direccionInput.estado,
        ciudad: direccionInput.ciudad,
        municipio: direccionInput.municipio,
        parroquia: direccionInput.parroquia,
        direccion_detallada: direccionInput.direccion_detallada,
        punto_referencia: direccionInput.punto_referencia || ''
      },
      ocupacion: perfil.ocupacion,
      rango_ingresos: perfil.rango_ingresos,
      operadora: perfil.operadora,
      numero_telefono: perfil.numero_telefono,
      correo_electronico: perfil.correo_electronico,
      tipo_usuario: rolUsuario
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
    // Revertir creación de usuario si falló el guardado del perfil
    if (usuarioCreadoId) {
      await Usuario.deleteOne({ _id: usuarioCreadoId })
        .catch((rollbackError) => logError('register user rollback', rollbackError));
    }
    if (storedDocumentPath) {
      await unlink(storedDocumentPath)
        .catch((cleanupError) => logError('register document cleanup', cleanupError));
    }

    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        ok: false,
        mensaje: `Datos de registro inválidos: ${error.message}`
      });
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        ok: false,
        mensaje: 'El usuario o la cédula ya se encuentran registrados.'
      });
    }

    logError('register', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno al registrar el cliente.'
    });
  }
};
