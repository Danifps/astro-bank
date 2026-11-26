import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
]);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const parseMultipart = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
    fields: 1,
    fieldSize: 64 * 1024
  },
  fileFilter(_req, file, callback) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype) && file.mimetype !== 'application/octet-stream') {
      const error = new Error('Solo se permiten archivos PDF, JPEG, PNG o WebP.');
      error.code = 'UNSUPPORTED_FILE_TYPE';
      return callback(error);
    }
    return callback(null, true);
  }
}).single('archivoDocumento');

export function detectDocumentType(buffer) {
  if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { ext: 'pdf', mime: 'application/pdf' };
  }
  if (buffer.length >= PNG_SIGNATURE.length && buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { ext: 'png', mime: 'image/png' };
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { ext: 'webp', mime: 'image/webp' };
  }
  return null;
}

export function uploadDocument(req, res, next) {
  parseMultipart(req, res, async (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          ok: false,
          mensaje: 'El documento excede el límite de 5 MB.'
        });
      }
      if (error.name === 'MulterError' || error.code === 'UNSUPPORTED_FILE_TYPE') {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se pudo procesar el documento enviado.'
        });
      }
      return next(error);
    }

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debes adjuntar tu documento de identidad.'
      });
    }

    try {
      const detectedType = detectDocumentType(req.file.buffer);
      if (
        !detectedType ||
        !ALLOWED_MIME_TYPES.has(detectedType.mime) ||
        (req.file.mimetype !== 'application/octet-stream' && req.file.mimetype !== detectedType.mime)
      ) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El contenido del documento no es un PDF, JPEG, PNG o WebP válido.'
        });
      }

      req.documentExtension = detectedType.ext;
      return next();
    } catch (validationError) {
      return next(validationError);
    }
  });
}

export function parseRegistrationPayload(req, res, next) {
  try {
    const payload = JSON.parse(req.body?.payload || '');
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Los datos de registro no tienen un formato válido.'
      });
    }
    req.body = payload;
    return next();
  } catch {
    return res.status(400).json({
      ok: false,
      mensaje: 'Los datos de registro no tienen un formato válido.'
    });
  }
}
