import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import '../styles/Register.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModal, setSuccessModal] = useState(false);

  // Único estado JSON con todos los datos del formulario bancario
  const [formData, setFormData] = useState({
    // Paso 1: Datos iniciales
    tipoDocumento: 'V',
    numeroDocumento: '',
    nombresApellidos: '',

    // Paso 2: Datos personales
    fechaNacimiento: '',
    genero: '', // 'Hombre' | 'Mujer'
    ocupacion: '',

    // Paso 3: Contacto
    operadora: '0412',
    numeroTelefono: '',
    correoElectronico: '',

    // Paso 4: Seguridad
    contrasena: '',
    confirmarContrasena: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  // Formato automático para fecha DD/MM/AA
  const handleDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 6) value = value.slice(0, 6);

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

  // Validaciones por paso
  const validateCurrentStep = () => {
    if (step === 1) {
      if (!formData.numeroDocumento.trim()) {
        setErrorMessage('Por favor ingrese su número de documento.');
        return false;
      }
      if (!formData.nombresApellidos.trim()) {
        setErrorMessage('Por favor ingrese sus nombres y apellidos completos.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.fechaNacimiento.trim() || formData.fechaNacimiento.length < 8) {
        setErrorMessage('Por favor ingrese su fecha de nacimiento en formato DD/MM/AA.');
        return false;
      }
      if (!formData.genero) {
        setErrorMessage('Por favor seleccione su género.');
        return false;
      }
      if (!formData.ocupacion.trim()) {
        setErrorMessage('Por favor ingrese su ocupación.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.numeroTelefono.trim()) {
        setErrorMessage('Por favor ingrese su número de teléfono.');
        return false;
      }
      if (!formData.correoElectronico.trim() || !formData.correoElectronico.includes('@')) {
        setErrorMessage('Por favor ingrese un correo electrónico válido.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.contrasena || formData.contrasena.length < 6) {
        setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
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
          <h1 className="auth-page-title">Verificación de Contraseña</h1>
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
                    required
                  />
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
                  placeholder="DD/MM/AA"
                  maxLength={8}
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
                <label className="bank-label" htmlFor="ocupacion">
                  Ocupación
                </label>
                <input
                  type="text"
                  id="ocupacion"
                  name="ocupacion"
                  value={formData.ocupacion}
                  onChange={handleChange}
                  placeholder="Ocupación"
                  className="bank-input"
                  required
                />
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
                <label className="bank-label" htmlFor="contrasena">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  className="bank-input"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="bank-form-group">
                <label className="bank-label" htmlFor="confirmarContrasena">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  placeholder="Confirmar Contraseña"
                  className="bank-input"
                  autoComplete="new-password"
                  required
                />
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
              {step === 4 ? 'Siguiente' : 'Siguiente'}
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
