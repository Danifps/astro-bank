import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import '../styles/Login.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipoDocumento: 'V',
    numeroDocumento: '',
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
    if (!formData.numeroDocumento.trim() || !formData.claveAcceso) {
      setError('Por favor complete todos los campos');
      return;
    }

    console.log('Login payload preparado para backend:', formData);
    // Simulación de éxito o feedback visual
    alert(`Bienvenido a Astro Bank. Documento: ${formData.tipoDocumento}-${formData.numeroDocumento}`);
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
          {/* Campo 1: Tipo y número de documento */}
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
                autoComplete="username"
                required
              />
            </div>
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
