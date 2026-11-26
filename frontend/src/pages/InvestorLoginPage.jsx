import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import InvestorIllustration from '../components/InvestorIllustration';
import { authService } from '../services/authService';
import '../styles/Login.css';

export default function InvestorLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    investorIdOrEmail: '',
    claveAcceso: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(() =>
    searchParams.get('expired') === '1'
      ? 'Tu sesión expiró al cumplirse el límite máximo de 5 minutos. Inicia sesión nuevamente.'
      : ''
  );
  const [loading, setLoading] = useState(false);

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
    if (!formData.investorIdOrEmail.trim() || !formData.claveAcceso) {
      setError('Por favor complete su ID / Correo y su Clave de Inversionista.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.login(formData.investorIdOrEmail, formData.claveAcceso);

      if (res.ok && res.usuario) {
        authService.saveSession({
          ...res.usuario,
          perfil: 'Inversionista'
        }, res);
        navigate('/dashboard');
      } else {
        setError(res.mensaje || 'Credenciales de inversionista inválidas.');
      }
    } catch {
      setError('Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout visual={<InvestorIllustration />}>
      <div className="auth-form-card">
        {/* Título y subtítulo claros */}
        <h1 className="auth-page-title">Banca Inversionistas</h1>
        <p className="auth-page-subtitle">
          Supervisa tus fondos de inversión, rendimientos generados en tiempo real y gobernanza de portafolio en Astro Bank.
        </p>

        {error && (
          <div className="auth-alert-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bank-form" noValidate>
          {/* Campo 1: ID de Inversionista o Correo */}
          <div className="bank-form-group">
            <label className="bank-label" htmlFor="investorIdOrEmail">
              ID de Inversionista o Correo Electrónico
            </label>
            <input
              type="text"
              id="investorIdOrEmail"
              name="investorIdOrEmail"
              value={formData.investorIdOrEmail}
              onChange={handleChange}
              placeholder="Ej: INV-89201 o inversor@empresa.com"
              className="bank-input"
              autoComplete="username"
              required
            />
          </div>

          {/* Campo 2: Clave de acceso */}
          <div className="bank-form-group">
            <label className="bank-label" htmlFor="claveAcceso">
              Clave de acceso de inversionista
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="claveAcceso"
                name="claveAcceso"
                value={formData.claveAcceso}
                onChange={handleChange}
                placeholder="Ingresa tu clave de inversionista"
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

          {/* Fila de acción: Botón Ingresar + Soporte */}
          <div className="login-actions-row">
            <button type="submit" className="bank-btn bank-btn-primary" disabled={loading}>
              {loading ? 'Verificando...' : 'Ingresar al Portal Inversor'}
            </button>
            <a href="#soporte-inversores" className="forgot-password-link">
              Mesa de ayuda a inversores
            </a>
          </div>

          {/* Enlace para convertirse en inversionista */}
          <div className="register-switch-container">
            <span className="register-switch-text">
              ¿Deseas invertir con nosotros?{' '}
              <Link to="/registro" className="register-switch-link">
                Abre tu portafolio de inversión
              </Link>
            </span>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
