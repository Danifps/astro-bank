import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import '../styles/Login.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    usuarioOCedula: '',
    claveAcceso: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.usuarioOCedula.trim() || !formData.claveAcceso) {
      setError('Por favor complete todos los campos');
      return;
    }

    console.log('Login payload preparado para backend:', formData);
    navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <div className="auth-form-card">
        <h1 className="auth-page-title">Bienvenido a Astro Bank</h1>

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
              placeholder="Usuario o número de cédula"
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
            <input
              type="password"
              id="claveAcceso"
              name="claveAcceso"
              value={formData.claveAcceso}
              onChange={handleChange}
              placeholder="Clave de acceso"
              className="bank-input"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Fila de acción: Botón Ingresar + Olvidó su clave */}
          <div className="login-actions-row">
            <button type="submit" className="bank-btn bank-btn-primary">
              Ingresar
            </button>
            <a href="#olvide-clave" className="forgot-password-link">
              Olvidé o desbloqueo de clave
            </a>
          </div>

          {/* Enlace para ir a registrarse */}
          <div className="register-switch-container">
            <span className="register-switch-text">
              ¿Aún no tienes cuenta?{' '}
              <Link to="/registro" className="register-switch-link">
                Regístrate aquí
              </Link>
            </span>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
