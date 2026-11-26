import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileCheck,
  Info,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  MapPin,
  Loader2
} from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { authService } from '../services/authService';
import '../styles/Register.css';

// Configuración de los 7 pasos independientes y progresivos
const TOTAL_STEPS = 7;

const STEPS_CONFIG = [
  {
    id: 1,
    title: 'Documento de Identidad',
    subtitle: 'Ingresa tu cédula oficial y adjunta una foto o copia legible.',
    category: 'Identidad'
  },
  {
    id: 2,
    title: '¿Cómo te llamas?',
    subtitle: 'Ingresa tus nombres y apellidos separados, tal como figuran en tu documento.',
    category: 'Nombre'
  },
  {
    id: 3,
    title: 'Datos Personales',
    subtitle: 'Selecciona tu fecha de nacimiento en el calendario y tu género.',
    category: 'Perfil'
  },
  {
    id: 4,
    title: 'Dirección de Residencia',
    subtitle: 'Indica tu ubicación domiciliaria normalizada para registro bancario.',
    category: 'Dirección'
  },
  {
    id: 5,
    title: 'Actividad Económica',
    subtitle: 'Declara tu ocupación principal y tu rango estimado de ingresos mensuales.',
    category: 'Actividad'
  },
  {
    id: 6,
    title: 'Información de Contacto',
    subtitle: 'Teléfono y correo electrónico verificado para alertas de seguridad.',
    category: 'Contacto'
  },
  {
    id: 7,
    title: 'Usuario y Contraseña',
    subtitle: 'Establece tus credenciales privadas para ingresar a Astro Bank.',
    category: 'Seguridad'
  }
];

// Lista oficial de Estados de Venezuela para normalización de direcciones
const VENEZUELA_ESTADOS = [
  'Distrito Capital',
  'Miranda',
  'Zulia',
  'Carabobo',
  'Aragua',
  'Lara',
  'Anzoátegui',
  'Bolívar',
  'Táchira',
  'Mérida',
  'Falcón',
  'Monagas',
  'Nueva Esparta',
  'Sucre',
  'Portuguesa',
  'Barinas',
  'Guárico',
  'Trujillo',
  'Yaracuy',
  'Apure',
  'Cojedes',
  'Delta Amacuro',
  'Amazonas',
  'La Guaira'
];

// Lista negra estricta de proveedores de correo temporal / desechable
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com', 'tempmail.net', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.net',
  'mailinator.com', '10minutemail.com', 'throwawaymail.com', 'yopmail.com', 'yopmail.fr',
  'sharklasers.com', 'trashmail.com', 'trashmail.net', 'dispostable.com', 'fakeinbox.com',
  'fakemailgenerator.com', 'mytemp.email', 'mohmal.com', 'generator.email', 'emailondeck.com',
  'burnermail.io', 'crazymailing.com', 'getnada.com', 'inboxkitten.com', 'dropmail.me',
  'tempail.com', 'zillamail.com', 'maildrop.cc', 'tempinbox.com', 'nada.ltd', 'getairmail.com'
]);

// Lista de dominios de correo legítimos y comunes
const TRUSTED_EMAIL_DOMAINS = new Set([
  'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'live.com',
  'proton.me', 'protonmail.com', 'aol.com', 'zoho.com', 'cantv.net', 'intercable.net',
  'movistar.com.ve', 'ucv.ve', 'usb.ve', 'ula.ve', 'ucab.edu.ve', 'urbe.edu'
]);

// Detector de dominios sospechosos o con patrones de teclado aleatorio (ej: qowidnqowid.com)
const isGibberishDomain = (domainName) => {
  const name = domainName.toLowerCase();

  // 1. Detectar secuencias repetidas de 4+ caracteres (como 'qowid' en 'qowidnqowid' o 'asdfasdf')
  for (let len = 4; len <= Math.floor(name.length / 2); len++) {
    for (let i = 0; i <= name.length - len * 2; i++) {
      const sub = name.slice(i, i + len);
      if (name.slice(i + len).includes(sub)) {
        return true;
      }
    }
  }

  // 2. Bloquear más de 4 consonantes consecutivas (ej: 'dfghj', 'bcdfgh')
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(name)) {
    return true;
  }

  // 3. Debe contener al menos una vocal
  if (!/[aeiou]/i.test(name)) {
    return true;
  }

  // 4. Bloquear repetición excesiva del mismo caracter (ej: 'aaaa', 'xxxx')
  if (/([a-z0-9])\1{3,}/i.test(name)) {
    return true;
  }

  // 5. Proporción de vocales anómala (menor a 15% o mayor a 85%)
  const vowels = (name.match(/[aeiou]/gi) || []).length;
  const ratio = vowels / name.length;
  if (ratio < 0.15 || ratio > 0.85) {
    return true;
  }

  return false;
};

// Validador completo de integridad de correo electrónico
const validateEmailAddress = (email) => {
  if (!email || !email.trim()) {
    return 'Por favor ingrese su correo electrónico.';
  }

  const trimmed = email.trim().toLowerCase();

  // Validación de estructura RFC estándar
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,12}$/;
  if (!emailRegex.test(trimmed)) {
    return 'El formato de correo no es válido (ejemplo: usuario@dominio.com).';
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return 'El correo electrónico no es válido.';
  }

  const [localPart, domain] = parts;

  if (localPart.length < 2) {
    return 'El usuario del correo es demasiado corto.';
  }

  // Verificar si es un dominio temporal conocido
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return 'No se admiten correos electrónicos temporales o desechables por motivos de seguridad bancaria.';
  }

  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return 'El dominio del correo debe incluir una extensión válida (ej: .com, .net).';
  }

  const mainDomain = domainParts[0];
  const tld = domainParts[domainParts.length - 1];

  if (tld.length < 2) {
    return 'La extensión del dominio debe tener al menos 2 caracteres.';
  }

  // Si no es un proveedor común conocido, analizar si el dominio es teclado aleatorio / sospechoso
  if (!TRUSTED_EMAIL_DOMAINS.has(domain)) {
    if (isGibberishDomain(mainDomain)) {
      return `El dominio "@${domain}" parece generado aleatoriamente o no es un servidor de correo válido. Use un correo real.`;
    }
  }

  return null;
};

// Formateador visual a DD/MM/YY a partir del valor ISO (YYYY-MM-DD)
const formatToDDMMYY = (isoDate) => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  const shortYear = year.slice(-2);
  return `${day}/${month}/${shortYear}`;
};

// Obtener fecha límite de mayoría de edad (18 años atrás desde hoy)
const getEighteenYearsAgoDateString = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split('T')[0];
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cedulaFileName, setCedulaFileName] = useState('');

  const maxAllowedBirthDate = getEighteenYearsAgoDateString();

  // Estado único con todos los datos del formulario bancario
  const [formData, setFormData] = useState({
    // Paso 1: Documento y Archivo
    tipoDocumento: 'V',
    numeroDocumento: '',
    archivoDocumento: null,

    // Paso 2: Nombres y Apellidos Separados
    nombres: '',
    apellidos: '',

    // Paso 3: Datos personales (Fecha de nacimiento + Género)
    fechaNacimiento: '', // YYYY-MM-DD desde el input type="date"
    genero: '', // 'Hombre' | 'Mujer'

    // Paso 4: Dirección Normalizada con plano amplio
    estado: '',
    ciudad: '',
    municipio: '',
    parroquia: '',
    direccionDetallada: '',
    puntoReferencia: '',

    // Paso 5: Actividad y ocupación
    ocupacion: '',
    rangoIngresos: '',

    // Paso 6: Contacto
    operadora: '0412',
    numeroTelefono: '',
    correoElectronico: '',

    // Paso 7: Seguridad
    usuario: '',
    contrasena: '',
    confirmarContrasena: ''
  });

  const currentStepConfig = STEPS_CONFIG[step - 1] || STEPS_CONFIG[0];
  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  // Manejo de archivo de cédula
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('El archivo no debe exceder los 5 MB.');
        return;
      }
      setCedulaFileName(file.name);
      setFormData((prev) => ({
        ...prev,
        archivoDocumento: file.name
      }));
      if (errorMessage) setErrorMessage('');
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setCedulaFileName('');
    setFormData((prev) => ({
      ...prev,
      archivoDocumento: null
    }));
  };

  // Manejador estricto para Cédula: bloquea pegado de letras, puntos, comas o símbolos
  const handleCedulaPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const numericOnly = pasted.replace(/\D/g, '').slice(0, 9);
    setFormData((prev) => ({ ...prev, numeroDocumento: numericOnly }));
    if (errorMessage) setErrorMessage('');
  };

  // Bloqueo de teclas no numéricas en cédula
  const handleCedulaKeyDown = (e) => {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Manejador estricto para Nombres y Apellidos: solo letras y espacios
  const handleNameChange = (e) => {
    const { name, value } = e.target;
    const cleanLetters = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    setFormData((prev) => ({ ...prev, [name]: cleanLetters }));
    if (errorMessage) setErrorMessage('');
  };

  const handleNamePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const cleanLetters = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    const { name } = e.target;
    setFormData((prev) => ({ ...prev, [name]: cleanLetters }));
    if (errorMessage) setErrorMessage('');
  };

  // Bloqueo de no números en teléfono
  const handlePhoneKeyDown = (e) => {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Manejo genérico de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Número de cédula: estricto dígitos y máximo 9
    if (name === 'numeroDocumento') {
      const numericVal = value.replace(/\D/g, '').slice(0, 9);
      setFormData((prev) => ({ ...prev, [name]: numericVal }));
      if (errorMessage) setErrorMessage('');
      return;
    }

    // Teléfono: solo 7 dígitos numéricos
    if (name === 'numeroTelefono') {
      const numericVal = value.replace(/\D/g, '').slice(0, 7);
      setFormData((prev) => ({ ...prev, [name]: numericVal }));
      if (errorMessage) setErrorMessage('');
      return;
    }

    // Contraseña: máximo 16 caracteres
    if (name === 'contrasena' || name === 'confirmarContrasena') {
      const limitedVal = value.slice(0, 16);
      setFormData((prev) => ({ ...prev, [name]: limitedVal }));
      if (errorMessage) setErrorMessage('');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleGenderSelect = (gender) => {
    setFormData((prev) => ({
      ...prev,
      genero: gender
    }));
    if (errorMessage) setErrorMessage('');
  };

  // Validador de fecha de nacimiento con calendario
  const validateDateOfBirth = (dateVal) => {
    if (!dateVal) {
      return 'Por favor seleccione su fecha de nacimiento en el calendario.';
    }

    const dateObj = new Date(dateVal);
    if (isNaN(dateObj.getTime())) {
      return 'Fecha de nacimiento no válida.';
    }

    const minDate = new Date('1920-01-01');
    if (dateObj < minDate) {
      return 'Por favor seleccione un año de nacimiento válido (posterior a 1920).';
    }

    const today = new Date();
    if (dateObj > today) {
      return 'La fecha de nacimiento no puede ser futura.';
    }

    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    if (dateObj > eighteenYearsAgo) {
      return 'Debes tener al menos 18 años cumplidos para registrarte en Astro Bank.';
    }

    return null;
  };

  // Validación independiente por cada paso
  const validateCurrentStep = () => {
    // Paso 1: Documento y Archivo adjunto
    if (step === 1) {
      if (!formData.numeroDocumento.trim()) {
        setErrorMessage('Por favor ingrese su número de cédula.');
        return false;
      }
      if (formData.numeroDocumento.length < 5 || formData.numeroDocumento.length > 9) {
        setErrorMessage('El número de cédula debe contener entre 5 y 9 dígitos numéricos.');
        return false;
      }
      if (!formData.archivoDocumento) {
        setErrorMessage('Por favor suba una foto o copia de su cédula de identidad.');
        return false;
      }
    }
    // Paso 2: Nombres y Apellidos Separados
    else if (step === 2) {
      if (!formData.nombres.trim()) {
        setErrorMessage('Por favor ingrese sus nombres.');
        return false;
      }
      if (formData.nombres.trim().length < 2) {
        setErrorMessage('El nombre debe tener al menos 2 caracteres.');
        return false;
      }
      if (!formData.apellidos.trim()) {
        setErrorMessage('Por favor ingrese sus apellidos.');
        return false;
      }
      if (formData.apellidos.trim().length < 2) {
        setErrorMessage('El apellido debe tener al menos 2 caracteres.');
        return false;
      }
    }
    // Paso 3: Fecha de nacimiento y género
    else if (step === 3) {
      const dateErr = validateDateOfBirth(formData.fechaNacimiento);
      if (dateErr) {
        setErrorMessage(dateErr);
        return false;
      }
      if (!formData.genero) {
        setErrorMessage('Por favor seleccione su género.');
        return false;
      }
    }
    // Paso 4: Dirección de residencia normalizada
    else if (step === 4) {
      if (!formData.estado) {
        setErrorMessage('Por favor seleccione su estado de residencia.');
        return false;
      }
      if (!formData.ciudad.trim()) {
        setErrorMessage('Por favor ingrese la ciudad.');
        return false;
      }
      if (!formData.municipio.trim()) {
        setErrorMessage('Por favor ingrese el municipio.');
        return false;
      }
      if (!formData.parroquia.trim()) {
        setErrorMessage('Por favor ingrese la parroquia o sector.');
        return false;
      }
      if (!formData.direccionDetallada.trim()) {
        setErrorMessage('Por favor ingrese la calle, avenida, casa o edificio de su residencia.');
        return false;
      }
    }
    // Paso 5: Ocupación e ingresos
    else if (step === 5) {
      if (!formData.ocupacion) {
        setErrorMessage('Por favor seleccione su ocupación o actividad principal.');
        return false;
      }
      if (!formData.rangoIngresos) {
        setErrorMessage('Por favor seleccione su rango estimado de ingresos.');
        return false;
      }
    }
    // Paso 6: Contacto y validación de correo estricta
    else if (step === 6) {
      if (!formData.numeroTelefono.trim()) {
        setErrorMessage('Por favor ingrese su número de teléfono.');
        return false;
      }
      if (formData.numeroTelefono.length !== 7) {
        setErrorMessage('El número de teléfono debe tener exactamente 7 dígitos.');
        return false;
      }
      const emailErr = validateEmailAddress(formData.correoElectronico);
      if (emailErr) {
        setErrorMessage(emailErr);
        return false;
      }
    }
    // Paso 7: Usuario y contraseña
    else if (step === 7) {
      if (!formData.usuario.trim()) {
        setErrorMessage('Por favor ingrese su usuario deseado.');
        return false;
      }
      if (formData.usuario.trim().length < 4) {
        setErrorMessage('El usuario debe tener al menos 4 caracteres.');
        return false;
      }
      if (!formData.contrasena || formData.contrasena.length < 6) {
        setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
        return false;
      }
      if (formData.contrasena.length > 16) {
        setErrorMessage('La contraseña no puede tener más de 16 caracteres.');
        return false;
      }
      if (formData.contrasena !== formData.confirmarContrasena) {
        setErrorMessage('Las contraseñas no coinciden. Verifíquelas.');
        return false;
      }
    }

    setErrorMessage('');
    return true;
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateCurrentStep()) return;

    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      setIsSubmitting(true);
      setErrorMessage('');

      try {
        const cleanCedula = formData.numeroDocumento.trim().replace(/\D/g, '');
        const cleanUser = formData.usuario.trim().toLowerCase();

        const payload = {
          usuario: {
            usuario: cleanUser,
            contrasena: formData.contrasena,
            rol: 'cliente'
          },
          perfil: {
            tipo_documento: formData.tipoDocumento || 'V',
            cedula: cleanCedula,
            archivo_documento: formData.archivoDocumento || `uploads/documentos/${(formData.tipoDocumento || 'V').toLowerCase()}${cleanCedula}_cedula.pdf`,
            nombres: formData.nombres.trim(),
            apellidos: formData.apellidos.trim(),
            nombre_completo: `${formData.nombres.trim()} ${formData.apellidos.trim()}`,
            fecha_nacimiento: formData.fechaNacimiento,
            genero: formData.genero,
            direccion: {
              estado: formData.estado,
              ciudad: formData.ciudad,
              municipio: formData.municipio,
              parroquia: formData.parroquia,
              direccion_detallada: formData.direccionDetallada,
              punto_referencia: formData.puntoReferencia
            },
            ocupacion: formData.ocupacion,
            rango_ingresos: formData.rangoIngresos,
            operadora: formData.operadora,
            numero_telefono: formData.numeroTelefono.trim(),
            correo_electronico: formData.correoElectronico.trim().toLowerCase(),
            tipo_usuario: 'cliente'
          }
        };

        const res = await authService.register(payload);

        if (res.ok) {
          setSuccessModal(true);
        } else {
          setErrorMessage(res.mensaje || 'Error al procesar el registro en Astro Bank.');
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      } catch (err) {
        console.error('Error al registrar usuario:', err);
        setErrorMessage('No se pudo conectar con el servidor de Astro Bank. Verifica que el backend esté en ejecución.');
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/login');
    } else {
      setStep((prev) => prev - 1);
      setErrorMessage('');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  return (
    <AuthLayout hideVisual={true}>
      <div className="auth-form-card">
        
        {/* ===================================================
            BARRA DE PROGRESO FORMAL, PEQUEÑA Y LIVIANA
           =================================================== */}
        <div className="register-progress-container" aria-label={`Progreso: Paso ${step} de ${TOTAL_STEPS}`}>
          <div className="register-progress-header">
            <div className="register-progress-step-tag">
              <span className="step-badge-number">Paso {step} de {TOTAL_STEPS}</span>
              <span className="step-badge-dot">•</span>
              <span className="step-badge-category">{currentStepConfig.category}</span>
            </div>
            <span className="register-progress-percentage">{progressPercent}%</span>
          </div>

          <div className="register-progress-track">
            <div
              className="register-progress-fill"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Encabezados claros por paso (anti-solape garantizado) */}
        <div className="register-step-heading">
          <h1 className="register-title">{currentStepConfig.title}</h1>
          <p className="register-subtitle">{currentStepConfig.subtitle}</p>
        </div>

        {errorMessage && (
          <div className="register-alert-error" role="alert">
            <AlertCircle size={18} className="register-alert-icon" />
            <span className="register-alert-text">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleNext} className="bank-form" noValidate>
          <div className="register-step-content" key={step}>
            
            {/* PASO 1: Documento de identidad + Foto en una sola vista */}
            {step === 1 && (
              <>
                <div className="bank-form-group">
                  <label className="bank-label" htmlFor="numeroDocumento">
                    Tipo y número de cédula
                  </label>
                  <div className="doc-input-group">
                    <select
                      name="tipoDocumento"
                      id="tipoDocumento"
                      value={formData.tipoDocumento}
                      onChange={handleChange}
                      className="bank-select doc-select"
                      aria-label="Tipo de documento"
                    >
                      <option value="V">V</option>
                      <option value="E">E</option>
                      <option value="J">J</option>
                      <option value="P">P</option>
                    </select>
                    <input
                      type="text"
                      id="numeroDocumento"
                      name="numeroDocumento"
                      value={formData.numeroDocumento}
                      onChange={handleChange}
                      onPaste={handleCedulaPaste}
                      onKeyDown={handleCedulaKeyDown}
                      placeholder="Número de cédula (solo dígitos)"
                      className="bank-input doc-number-input"
                      maxLength={9}
                      inputMode="numeric"
                      autoFocus
                      required
                    />
                  </div>
                  <span className="field-hint-text">
                    Solo números (sin letras, puntos, comas ni caracteres especiales).
                  </span>
                </div>

                {/* Subida de foto o copia de cédula */}
                <div className="bank-form-group">
                  <label className="bank-label">
                    Cédula de identidad (Foto o PDF)
                  </label>
                  <div className="document-upload-zone">
                    <input
                      type="file"
                      id="archivoDocumento"
                      name="archivoDocumento"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="document-file-input"
                    />
                    {cedulaFileName ? (
                      <div className="document-file-info">
                        <div className="document-file-badge">
                          <FileCheck size={20} className="file-check-icon" />
                          <span className="document-file-name">{cedulaFileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="document-remove-btn"
                          title="Quitar archivo"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="archivoDocumento" className="document-upload-label">
                        <Upload size={22} className="upload-icon" />
                        <span className="upload-main-text">Adjuntar foto o copia de cédula</span>
                        <span className="upload-sub-text">Haz clic o arrastra aquí (JPG, PNG o PDF, máx. 5MB)</span>
                      </label>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* PASO 2: Nombres y Apellidos Separados */}
            {step === 2 && (
              <>
                <div className="bank-form-group">
                  <label className="bank-label" htmlFor="nombres">
                    Nombres
                  </label>
                  <input
                    type="text"
                    id="nombres"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleNameChange}
                    onPaste={handleNamePaste}
                    placeholder="Ej: Daniel Alejandro"
                    className="bank-input"
                    autoFocus
                    required
                  />
                  <span className="field-hint-text">
                    Solo letras y espacios. Sin números ni signos especiales.
                  </span>
                </div>

                <div className="bank-form-group">
                  <label className="bank-label" htmlFor="apellidos">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleNameChange}
                    onPaste={handleNamePaste}
                    placeholder="Ej: Morales Castillo"
                    className="bank-input"
                    required
                  />
                  <span className="field-hint-text">
                    Tus apellidos tal como aparecen en tu documento oficial.
                  </span>
                </div>
              </>
            )}

            {/* PASO 3: Fecha de Nacimiento con Calendario y Género */}
            {step === 3 && (
              <>
                <div className="bank-form-group">
                  <div className="label-with-badge">
                    <label className="bank-label" htmlFor="fechaNacimiento">
                      Fecha de Nacimiento
                    </label>
                    {formData.fechaNacimiento && (
                      <span className="date-format-badge">
                        DD/MM/YY: {formatToDDMMYY(formData.fechaNacimiento)}
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    min="1920-01-01"
                    max={maxAllowedBirthDate}
                    className="bank-input bank-input-date"
                    autoFocus
                    required
                  />
                  <span className="field-hint-text">
                    Despliega el calendario para seleccionar tu fecha. Formato bancario: DD/MM/YY (mayor de 18 años).
                  </span>
                </div>

                <div className="bank-form-group">
                  <label className="bank-label">Género</label>
                  <div className="gender-toggle-group">
                    <button
                      type="button"
                      className={`gender-toggle-btn ${formData.genero === 'Hombre' ? 'active' : ''}`}
                      onClick={() => handleGenderSelect('Hombre')}
                    >
                      Hombre
                    </button>
                    <button
                      type="button"
                      className={`gender-toggle-btn ${formData.genero === 'Mujer' ? 'active' : ''}`}
                      onClick={() => handleGenderSelect('Mujer')}
                    >
                      Mujer
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* PASO 4: Dirección de Residencia Normalizada (Plano con amplio espacio) */}
            {step === 4 && (
              <div className="address-step-container">
                <div className="address-grid-2col">
                  {/* Estado */}
                  <div className="bank-form-group">
                    <label className="bank-label" htmlFor="estado">
                      Estado
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="bank-select"
                      autoFocus
                      required
                    >
                      <option value="">Selecciona tu estado</option>
                      {VENEZUELA_ESTADOS.map((est) => (
                        <option key={est} value={est}>{est}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ciudad */}
                  <div className="bank-form-group">
                    <label className="bank-label" htmlFor="ciudad">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      placeholder="Ej: Caracas"
                      className="bank-input"
                      required
                    />
                  </div>
                </div>

                <div className="address-grid-2col">
                  {/* Municipio */}
                  <div className="bank-form-group">
                    <label className="bank-label" htmlFor="municipio">
                      Municipio
                    </label>
                    <input
                      type="text"
                      id="municipio"
                      name="municipio"
                      value={formData.municipio}
                      onChange={handleChange}
                      placeholder="Ej: Libertador / Chacao"
                      className="bank-input"
                      required
                    />
                  </div>

                  {/* Parroquia o Sector */}
                  <div className="bank-form-group">
                    <label className="bank-label" htmlFor="parroquia">
                      Parroquia o Sector
                    </label>
                    <input
                      type="text"
                      id="parroquia"
                      name="parroquia"
                      value={formData.parroquia}
                      onChange={handleChange}
                      placeholder="Ej: El Recreo / Altamira"
                      className="bank-input"
                      required
                    />
                  </div>
                </div>

                {/* Calle / Avenida / Casa / Edificio */}
                <div className="bank-form-group">
                  <label className="bank-label" htmlFor="direccionDetallada">
                    Avenida, Calle, Edificio o Casa
                  </label>
                  <input
                    type="text"
                    id="direccionDetallada"
                    name="direccionDetallada"
                    value={formData.direccionDetallada}
                    onChange={handleChange}
                    placeholder="Ej: Av. Francisco de Miranda, Edif. Centro Plaza, Piso 4, Apto 4-B"
                    className="bank-input"
                    required
                  />
                </div>

                {/* Punto de Referencia */}
                <div className="bank-form-group">
                  <label className="bank-label" htmlFor="puntoReferencia">
                    Punto de Referencia (Opcional)
                  </label>
                  <input
                    type="text"
                    id="puntoReferencia"
                    name="puntoReferencia"
                    value={formData.puntoReferencia}
                    onChange={handleChange}
                    placeholder="Ej: Frente a la estación del metro, diagonal a la farmacia"
                    className="bank-input"
                  />
                </div>
              </div>
            )}

            {/* PASO 5: Actividad y Declaración Económica */}
            {step === 5 && (
              <>
                <div className="bank-form-group">
                  <label className="bank-label" htmlFor="ocupacion">
                    ¿Cuál es tu ocupación o actividad principal?
                  </label>
                  <select
                    name="ocupacion"
                    id="ocupacion"
                    value={formData.ocupacion}
                    onChange={handleChange}
                    className="bank-select"
                    autoFocus
                    required
                  >
                    <option value="">Selecciona tu ocupación</option>
                    <option value="Empleado">Empleado / Asalariado</option>
                    <option value="Independiente">Independiente / Profesional Autónomo</option>
                    <option value="Comerciante">Comerciante / Empresario</option>
                    <option value="Estudiante">Estudiante Universitario</option>
                    <option value="Jubilado">Jubilado / Pensionado</option>
                    <option value="Otro">Otro / Sin empleo actual</option>
                  </select>
                </div>

                <div className="bank-form-group">
                  <label className="bank-label" htmlFor="rangoIngresos">
                    ¿Cuál es tu rango estimado de ingresos mensuales?
                  </label>
                  <select
                    name="rangoIngresos"
                    id="rangoIngresos"
                    value={formData.rangoIngresos}
                    onChange={handleChange}
                    className="bank-select"
                    required
                  >
                    <option value="">Selecciona tu rango estimado</option>
                    <option value="Menos de $150">Menos de $150 USD / mes (o equiv. en Bs)</option>
                    <option value="$150 - $400">$150 a $400 USD / mes</option>
                    <option value="$400 - $800">$400 a $800 USD / mes</option>
                    <option value="$800 - $1,500">$800 a $1,500 USD / mes</option>
                    <option value="Más de $1,500">Más de $1,500 USD / mes</option>
                  </select>
                  <span className="economic-declaration-hint">
                    <Info size={14} />
                    Declaración informativa de perfil bancario. No requieres adjuntar balances ni soportes contables.
                  </span>
                </div>
              </>
            )}

            {/* PASO 6: Información de Contacto con Verificación de Integridad de Correo */}
            {step === 6 && (
              <>
                <div className="bank-form-group">
                  <label className="bank-label" htmlFor="numeroTelefono">
                    Número de Teléfono y Operadora
                  </label>
                  <div className="phone-input-group">
                    <select
                      name="operadora"
                      id="operadora"
                      value={formData.operadora}
                      onChange={handleChange}
                      className="bank-select phone-operator-select"
                      aria-label="Operadora telefónica"
                    >
                      <option value="0412">0412</option>
                      <option value="0414">0414</option>
                      <option value="0424">0424</option>
                      <option value="0416">0416</option>
                      <option value="0426">0426</option>
                    </select>
                    <input
                      type="tel"
                      id="numeroTelefono"
                      name="numeroTelefono"
                      value={formData.numeroTelefono}
                      onChange={handleChange}
                      onKeyDown={handlePhoneKeyDown}
                      placeholder="Número (7 dígitos)"
                      className="bank-input phone-number-input"
                      maxLength={7}
                      inputMode="numeric"
                      autoFocus
                      required
                    />
                  </div>
                  <span className="field-hint-text">
                    Ej: 0412 1234567 (solo dígitos).
                  </span>
                </div>

                <div className="bank-form-group">
                  <label className="bank-label" htmlFor="correoElectronico">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="correoElectronico"
                    name="correoElectronico"
                    value={formData.correoElectronico}
                    onChange={handleChange}
                    placeholder="nombre@ejemplo.com"
                    className="bank-input"
                    autoComplete="email"
                    required
                  />
                  <span className="field-hint-text">
                    Debe ser un correo auténtico y activo. No se admiten correos temporales ni dominios ficticios.
                  </span>
                </div>

                <div className="contact-security-notice">
                  <ShieldCheck size={18} />
                  <span>Enviaremos códigos de seguridad 2FA y notificaciones bancarias a este contacto.</span>
                </div>
              </>
            )}

            {/* PASO 7: Seguridad y Credenciales */}
            {step === 7 && (
              <>
                <div className="bank-form-group">
                  <label className="bank-label" htmlFor="usuario">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    id="usuario"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleChange}
                    placeholder="Usuario para ingresar"
                    className="bank-input"
                    autoComplete="username"
                    autoFocus
                    required
                  />
                  <span className="field-hint-text">
                    Mínimo 4 caracteres (letras y números).
                  </span>
                </div>

                <div className="bank-form-group">
                  <label className="bank-label" htmlFor="contrasena">
                    Contraseña
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="contrasena"
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      placeholder="Contraseña (6 a 16 caracteres)"
                      className="bank-input"
                      autoComplete="new-password"
                      maxLength={16}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bank-form-group">
                  <label className="bank-label" htmlFor="confirmarContrasena">
                    Confirmar Contraseña
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmarContrasena"
                      name="confirmarContrasena"
                      value={formData.confirmarContrasena}
                      onChange={handleChange}
                      placeholder="Repite tu contraseña"
                      className="bank-input"
                      autoComplete="new-password"
                      maxLength={16}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      title={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showConfirmPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Botones de navegación: Regresar y Siguiente */}
          <div className="step-actions-row">
            <button
              type="button"
              className="bank-btn bank-btn-secondary"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Regresar
            </button>
            <button
              type="submit"
              className="bank-btn bank-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Registrando en Astro Bank...</span>
                </span>
              ) : (
                step === TOTAL_STEPS ? 'Crear mi Cuenta' : 'Siguiente'
              )}
            </button>
          </div>
        </form>

        {/* Modal de éxito de registro */}
        {successModal && (
          <div className="success-modal-overlay">
            <div className="success-modal-card">
              <div className="success-modal-icon" aria-hidden="true">
                <svg className="success-check-svg" viewBox="0 0 52 52" width="46" height="46">
                  <circle
                    className="success-check-circle"
                    cx="26"
                    cy="26"
                    r="23"
                    fill="none"
                    stroke="#0000FF"
                    strokeWidth="3.2"
                  />
                  <path
                    className="success-check-tick"
                    fill="none"
                    stroke="#0000FF"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.5 27.5l8 8 16-16"
                  />
                </svg>
              </div>
              <h2 className="success-modal-title">¡Registro Completado con Éxito!</h2>
              <p className="success-modal-desc">
                Tu cuenta para el usuario <strong>@{formData.usuario.trim().toLowerCase()}</strong> ha sido creada y guardada exitosamente en la base de datos de <strong>Astro Bank</strong>. Ya puedes iniciar sesión con tu cédula o usuario y tu clave de acceso.
              </p>
              <button
                type="button"
                className="bank-btn bank-btn-primary"
                style={{ width: '100%' }}
                onClick={() => navigate('/login')}
              >
                Ir al Inicio de Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
