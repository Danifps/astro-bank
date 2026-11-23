import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileCheck, Info } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import '../styles/Register.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModal, setSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cedulaFileName, setCedulaFileName] = useState('');

  // Único estado JSON con todos los datos del formulario bancario
  const [formData, setFormData] = useState({
    // Paso 1: Datos iniciales y documento
    tipoDocumento: 'V',
    numeroDocumento: '',
    archivoDocumento: null,
    nombresApellidos: '',

    // Paso 2: Datos personales y socioeconómicos
    fechaNacimiento: '',
    genero: '', // 'Hombre' | 'Mujer'
    direccion: '',
    ocupacion: '', // Ocupación general (empleado, independiente, estudiante...)
    rangoIngresos: '', // Rango aproximado de ingresos / movilización mensual

    // Paso 3: Contacto
    operadora: '0412',
    numeroTelefono: '',
    correoElectronico: '',

    // Paso 4: Seguridad
    usuario: '',
    contrasena: '',
    confirmarContrasena: ''
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Número de documento: solo dígitos y máximo 9
    if (name === 'numeroDocumento') {
      const numericVal = value.replace(/\D/g, '').slice(0, 9);
      setFormData((prev) => ({ ...prev, [name]: numericVal }));
      if (errorMessage) setErrorMessage('');
      return;
    }

    // Teléfono: solo dígitos y máximo 7
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

  // Validador detallado de fecha de nacimiento (días, meses, años)
  const validateDateOfBirth = (dateStr) => {
    if (!dateStr || dateStr.trim().length < 8) {
      return 'Por favor ingrese su fecha de nacimiento completa (DD/MM/AAAA).';
    }

    const parts = dateStr.split('/');
    if (parts.length !== 3) {
      return 'Formato de fecha inválido. Ingrese DD/MM/AAAA.';
    }

    const dia = parseInt(parts[0], 10);
    const mes = parseInt(parts[1], 10);
    const anio = parseInt(parts[2], 10);
    const currentYear = new Date().getFullYear();

    // Validación de mes (no puede ser mayor a 12 ni menor a 1)
    if (isNaN(mes) || mes < 1 || mes > 12) {
      return `El mes ingresado (${parts[1]}) no es válido. Debe estar entre 01 y 12.`;
    }

    // Validación de día (no puede ser mayor a 31 ni menor a 1)
    if (isNaN(dia) || dia < 1 || dia > 31) {
      return `El día ingresado (${parts[0]}) no es válido. Debe estar entre 01 y 31.`;
    }

    // Año completo (soporta 2 o 4 dígitos)
    let fullYear = anio;
    if (parts[2].length === 2) {
      fullYear = anio <= (currentYear % 100) ? 2000 + anio : 1900 + anio;
    }

    // Validar días según el mes específico (meses de 30 días, febrero)
    const diasEnMes = new Date(fullYear || 2024, mes, 0).getDate();
    if (dia > diasEnMes) {
      return `El mes ${parts[1]} solo tiene ${diasEnMes} días.`;
    }

    // Validación de año: no puede ser mayor al año actual
    if (isNaN(anio) || fullYear > currentYear) {
      return `El año ingresado (${parts[2]}) no puede ser mayor al año actual (${currentYear}).`;
    }

    if (fullYear < 1900) {
      return 'Por favor ingrese un año de nacimiento válido.';
    }

    // Comprobar fecha completa en el futuro
    const fechaNac = new Date(fullYear, mes - 1, dia);
    if (fechaNac > new Date()) {
      return 'La fecha de nacimiento no puede ser una fecha futura.';
    }

    return null;
  };

  // Formato automático para fecha DD/MM/AAAA (hasta 8 dígitos numéricos)
  const handleDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);

    let formatted = value;
    if (value.length > 2 && value.length <= 4) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
    } else if (value.length > 4) {
      formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    }

    setFormData((prev) => ({
      ...prev,
      fechaNacimiento: formatted
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleDateBlur = () => {
    if (formData.fechaNacimiento && formData.fechaNacimiento.length >= 8) {
      const dateErr = validateDateOfBirth(formData.fechaNacimiento);
      if (dateErr) setErrorMessage(dateErr);
    }
  };

  // Validaciones por paso
  const validateCurrentStep = () => {
    if (step === 1) {
      if (!formData.numeroDocumento.trim()) {
        setErrorMessage('Por favor ingrese su número de documento.');
        return false;
      }
      if (formData.numeroDocumento.length > 9) {
        setErrorMessage('El número de documento no puede tener más de 9 dígitos.');
        return false;
      }
      if (!formData.archivoDocumento) {
        setErrorMessage('Por favor suba una foto o copia de su cédula de identidad.');
        return false;
      }
      if (!formData.nombresApellidos.trim()) {
        setErrorMessage('Por favor ingrese sus nombres y apellidos completos.');
        return false;
      }
    } else if (step === 2) {
      const dateErr = validateDateOfBirth(formData.fechaNacimiento);
      if (dateErr) {
        setErrorMessage(dateErr);
        return false;
      }
      if (!formData.genero) {
        setErrorMessage('Por favor seleccione su género.');
        return false;
      }
      if (!formData.direccion.trim()) {
        setErrorMessage('Por favor ingrese su dirección.');
        return false;
      }
      if (!formData.ocupacion) {
        setErrorMessage('Por favor seleccione su ocupación o actividad principal.');
        return false;
      }
      if (!formData.rangoIngresos) {
        setErrorMessage('Por favor seleccione su rango estimado de ingresos o movilización mensual.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.numeroTelefono.trim()) {
        setErrorMessage('Por favor ingrese su número de teléfono.');
        return false;
      }
      if (formData.numeroTelefono.length !== 7) {
        setErrorMessage('El número de teléfono debe tener exactamente 7 dígitos.');
        return false;
      }
      if (!formData.correoElectronico.trim() || !formData.correoElectronico.includes('@')) {
        setErrorMessage('Por favor ingrese un correo electrónico válido.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.usuario.trim()) {
        setErrorMessage('Por favor ingrese su usuario.');
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

  const handleNext = (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
      // Finalización del registro: objeto JSON listo para backend
      console.log('Objeto JSON completo para el backend de Astro Bank:', JSON.stringify(formData, null, 2));
      setSuccessModal(true);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/login');
    } else {
      setStep((prev) => prev - 1);
      setErrorMessage('');
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-card">
        {/* Renderizado de encabezados y formularios por paso */}
        {step === 1 && (
          <>
            <h1 className="auth-page-title">Bienvenido a Astro Bank</h1>
            <p className="auth-page-subtitle">Ingresa tus datos</p>
          </>
        )}

        {step === 2 && (
          <h1 className="auth-page-title">Datos para Completar Información</h1>
        )}

        {step === 3 && (
          <h1 className="auth-page-title">Información de Contacto</h1>
        )}

        {step === 4 && (
          <h1 className="auth-page-title">Creacion de Usuario y Contraseña</h1>
        )}

        {errorMessage && (
          <div className="auth-alert-error" role="alert">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleNext} className="bank-form" noValidate>
          {/* PASO 1: Datos iniciales */}
          {step === 1 && (
            <>
              <div className="bank-form-group">
                <label className="bank-label" htmlFor="numeroDocumento">
                  Tipo y número de documento
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
                    placeholder="Número de documento"
                    className="bank-input doc-number-input"
                    maxLength={9}
                    inputMode="numeric"
                    required
                  />
                </div>
              </div>

              {/* Subida de documento de identidad (Cédula) */}
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

              <div className="bank-form-group">
                <label className="bank-label" htmlFor="nombresApellidos">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="nombresApellidos"
                  name="nombresApellidos"
                  value={formData.nombresApellidos}
                  onChange={handleChange}
                  placeholder="Nombres y Apellidos"
                  className="bank-input"
                  required
                />
              </div>
            </>
          )}

          {/* PASO 2: Datos personales */}
          {step === 2 && (
            <>
              <div className="bank-form-group">
                <label className="bank-label" htmlFor="fechaNacimiento">
                  Fecha de Nacimiento
                </label>
                <input
                  type="text"
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleDateChange}
                  onBlur={handleDateBlur}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className="bank-input"
                  required
                />
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

              <div className="bank-form-group">
                <label className="bank-label" htmlFor="direccion">
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Dirección"
                  className="bank-input"
                  required
                />
              </div>

              {/* Declaración económica general en formato de preguntas */}
              <div className="bank-form-group">
                <label className="bank-label" htmlFor="ocupacion">
                  ¿Cuál es tu ocupación o actividad económica principal?
                </label>
                <select
                  name="ocupacion"
                  id="ocupacion"
                  value={formData.ocupacion}
                  onChange={handleChange}
                  className="bank-select"
                  required
                >
                  <option value="">Selecciona tu ocupación</option>
                  <option value="Empleado">Empleado / Asalariado</option>
                  <option value="Independiente">Independiente / Profesional Autónomo</option>
                  <option value="Comerciante">Comerciante / Empresario</option>
                  <option value="Estudiante">Estudiante</option>
                  <option value="Jubilado">Jubilado / Pensionado</option>
                  <option value="Otro">Otro / Sin empleo actual</option>
                </select>
              </div>

              <div className="bank-form-group">
                <label className="bank-label" htmlFor="rangoIngresos">
                  ¿Cuál es tu rango aproximado de ingresos o movilización mensual esperada?
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
                  Declaración informativa referencial. No requieres adjuntar comprobantes ni balances.
                </span>
              </div>
            </>
          )}

          {/* PASO 3: Contacto */}
          {step === 3 && (
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
                    placeholder="Número de teléfono"
                    className="bank-input phone-number-input"
                    maxLength={7}
                    inputMode="numeric"
                    required
                  />
                </div>
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
                  placeholder="Correo Electrónico"
                  className="bank-input"
                  required
                />
              </div>
            </>
          )}

          {/* PASO 4: Seguridad */}
          {step === 4 && (
            <>

              <div className="bank-form-group">
                <label className="bank-label" htmlFor="usuario">
                  Usuario
                </label>
                <input
                  type="text"
                  id="usuario"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleChange}
                  placeholder="Usuario"
                  className="bank-input"
                  autoComplete="username"
                  required
                />
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
                    placeholder="Confirmar Contraseña"
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
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Indicador de 4 puntos en la parte inferior de los inputs */}
          <div className="step-dots-wrapper" aria-label={`Paso ${step} de 4`}>
            {[1, 2, 3, 4].map((dotIndex) => (
              <span
                key={dotIndex}
                className={`step-dot-point ${dotIndex === step ? 'active' : ''} ${dotIndex < step ? 'completed' : ''}`}
              />
            ))}
          </div>

          {/* Botones de navegación: Regresar y Siguiente */}
          <div className="step-actions-row">
            <button
              type="button"
              className="bank-btn bank-btn-secondary"
              onClick={handleBack}
            >
              Regresar
            </button>
            <button
              type="submit"
              className="bank-btn bank-btn-primary"
            >
              {step === 4 ? 'Registrarse' : 'Siguiente'}
            </button>
          </div>
        </form>

        {/* Modal de éxito de registro */}
        {successModal && (
          <div className="success-modal-overlay">
            <div className="success-modal-card">
              <div className="success-modal-icon">✦</div>
              <h2 className="success-modal-title">¡Registro Completado con Éxito!</h2>
              <p className="success-modal-desc">
                Tus datos han sido registrados en <strong>Astro Bank</strong>. Ya puedes iniciar sesión con tu documento y clave.
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
