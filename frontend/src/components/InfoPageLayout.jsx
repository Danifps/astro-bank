import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/InfoPage.css';

const INFO_TABS = [
  { path: '/quienes-somos', label: 'Quiénes somos' },
  { path: '/soluciones-de-credito', label: 'Soluciones de crédito' },
  { path: '/para-inversionistas', label: 'Para inversionistas' },
  { path: '/preguntas-frecuentes', label: 'Preguntas frecuentes' }
];

export default function InfoPageLayout({
  eyebrow = 'Sobre nosotros',
  title,
  subtitle,
  children,
  ctaText = '¿Listo para comenzar en Astro Bank?',
  ctaLabel = 'Abrir cuenta',
  ctaTo = '/registro'
}) {
  const { pathname } = useLocation();

  return (
    <div className="info-page-wrapper">
      <Navbar />

      <header className="info-page-hero">
        <div className="info-page-hero-inner">
          <span className="info-page-eyebrow">{eyebrow}</span>
          <h1 className="info-page-title">{title}</h1>
          {subtitle && <p className="info-page-subtitle">{subtitle}</p>}

          <nav className="info-page-tabs" aria-label="Secciones informativas">
            {INFO_TABS.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`info-page-tab ${pathname === tab.path ? 'active' : ''}`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="info-page-main">
        <article className="info-page-article">
          {children}

          <div className="info-page-cta">
            <p className="info-page-cta-text">{ctaText}</p>
            <Link to={ctaTo} className="info-page-cta-btn">
              {ctaLabel}
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
