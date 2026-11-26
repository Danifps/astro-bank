import Navbar from './Navbar';
import Footer from './Footer';
import logotipoImg from '../assets/logotipo.png';
import '../styles/AuthLayout.css';

export default function AuthLayout({
  children,
  badgeText = 'Plataforma Oficial de Inversión y Crédito',
  hideVisual = false,
  visual = null
}) {
  return (
    <div className="bank-app-wrapper">
      {/* Viewport inicial: Navbar + Contenido principal ocupan como mínimo el 100% de la pantalla (100vh/100dvh) */}
      <div className="bank-viewport-section">
        <Navbar />

        <main className="bank-main-content">
          {hideVisual ? (
            <div className="auth-single-column-centered">
              {children}
            </div>
          ) : (
            <div className="auth-two-column-grid">
              {/* Columna Izquierda: Formulario */}
              <section className="auth-form-column">
                {children}
              </section>

              {/* Columna Derecha: Ilustración Visual Temática */}
              <aside className="auth-visual-column" aria-label="Astro Bank Identidad">
                {visual ? (
                  visual
                ) : (
                  <div className="visual-card">
                    <div className="visual-card-glow" />
                    <div className="visual-card-content">
                      <img 
                        src={logotipoImg} 
                        alt="Astro Bank Logo" 
                        className="visual-logo-main" 
                      />
                      <div className="visual-badge">
                        <span>{badgeText}</span>
                      </div>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          )}
        </main>
      </div>

      {/* Footer ubicado después del viewport: solo accesible si el usuario hace scroll hacia abajo */}
      <Footer />
    </div>
  );
}
