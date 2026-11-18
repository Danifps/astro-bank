import Navbar from './Navbar';
import Footer from './Footer';
import logotipoImg from '../assets/logotipo.png';
import isotypeImg from '../assets/logo-Photoroom.png';
import '../styles/AuthLayout.css';

export default function AuthLayout({ children }) {
  return (
    <div className="bank-app-wrapper">
      <Navbar />

      <main className="bank-main-content">
        <div className="auth-two-column-grid">
          {/* Columna Izquierda: Formulario */}
          <section className="auth-form-column">
            {children}
          </section>

          {/* Columna Derecha: Recuadro Visual Institucional */}
          <aside className="auth-visual-column" aria-label="Astro Bank Identidad">
            <div className="visual-card">
              <div className="visual-card-glow" />
              <div className="visual-card-content">
                <img 
                  src={logotipoImg} 
                  alt="Astro Bank Logo" 
                  className="visual-logo-main" 
                />
                <div className="visual-badge">
                  <span>Plataforma Oficial de Inversión y Crédito</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
