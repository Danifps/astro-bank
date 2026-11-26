import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import PersonasIllustration from '../components/PersonasIllustration';
import { authService } from '../services/authService';
import '../styles/Login.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usuarioOCedula: '',
    claveAcceso: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Al abrir la página de Login, asegurar que no quede ninguna sesión previa guardada
  useEffect(() => {
    localStorage.removeItem('astro_user');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.usuarioOCedula.trim() || !formData.claveAcceso) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📡 [FRONTEND] Enviando credenciales al backend...', { usuarioOCedula: formData.usuarioOCedula });
      const res = await authService.login(formData.usuarioOCedula, formData.claveAcceso);
      console.log('📡 [FRONTEND] Respuesta del backend:', res);

      if (res && res.ok === true && res.usuario) {
        localStorage.setItem('astro_user', JSON.stringify(res.usuario));
        navigate('/dashboard');
      } else {
        localStorage.removeItem('astro_user');
        setError(res?.mensaje || 'Acceso denegado: Credenciales inválidas.');
      }
    } catch (err) {
      console.error('❌ [FRONTEND] Error al conectar:', err);
      localStorage.removeItem('astro_user');
      setError('Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout visual={<PersonasIllustration />}>
      <div className="auth-form-card">
        {/* Título y subtítulo claros */}
        <h1 className="auth-page-title">Banca Personas</h1>
        <p className="auth-page-subtitle">
          Ingresa a tu cuenta personal para consultar saldos, solicitar créditos y realizar transferencias.
        </p>

        {error && (
          <div className="auth-alert-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bank-form" noValidate>
          {/* Campo 1: Usuario o número de cédula */}
          <div className="bank-form-group">
            <label className="bank-label" htmlFor="usuarioOCedula">
              Usuario o número de cédula
            </label>
            <input
              type="text"
              id="usuarioOCedula"
              name="usuarioOCedula"
              value={formData.usuarioOCedula}
              onChange={handleChange}
              placeholder="Ej: V-12345678 o tu usuario"
              className="bank-input"
              autoComplete="username"
              required
            />
          </div>

          {/* Campo 2: Clave de acceso */}
          <div className="bank-form-group">
            <label className="bank-label" htmlFor="claveAcceso">
              Clave de acceso
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="claveAcceso"
                name="claveAcceso"
                value={formData.claveAcceso}
                onChange={handleChange}
                placeholder="Ingresa tu clave de acceso"
                className="bank-input"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? 'Ocultar clave' : 'Ver clave'}
                aria-label={showPassword ? 'Ocultar clave' : 'Ver clave'}
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

          {/* Fila de acción: Botón Ingresar + Olvidó su clave */}
          <div className="login-actions-row">
            <button type="submit" className="bank-btn bank-btn-primary" disabled={loading}>
              {loading ? 'Verificando...' : 'Ingresar a Banca Personas'}
            </button>
            <a href="#olvide-clave" className="forgot-password-link">
              ¿Olvidaste tu clave?
            </a>
          </div>

          {/* Enlace para ir a registrarse */}
          <div className="register-switch-container">
            <span className="register-switch-text">
              ¿Aún no eres cliente?{' '}
              <Link to="/registro" className="register-switch-link">
                Abre tu cuenta aquí
              </Link>
            </span>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
