import { Link } from 'react-router-dom';
import logotipoImg from '../assets/logotipo.png';
import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="bank-footer">
      <div className="footer-container">
        {/* Columna 1: Logotipo y Misión */}
        <div className="footer-col footer-col-brand">
          <img src={logotipoImg} alt="Astro Bank" className="footer-logo-img" />
          <p className="footer-brand-text">
            La banca distribuida que orbita alrededor de tus metas
          </p>
          <span className="footer-copy">
            © {new Date().getFullYear()} Astro Bank. Todos los derechos reservados.
          </span>
        </div>

        {/* Columna 2: Sobre Nosotros */}
        <div className="footer-col">
          <h4 className="footer-col-title">Sobre nosotros</h4>
          <ul className="footer-links-list">
            <li><Link to="/quienes-somos">Quiénes somos</Link></li>
            <li><Link to="/soluciones-de-credito">Soluciones de crédito</Link></li>
            <li><Link to="/para-inversionistas">Para inversionistas</Link></li>
            <li><Link to="/preguntas-frecuentes">Preguntas frecuentes</Link></li>
          </ul>
        </div>

        {/* Columna 3: Seguridad y Contacto */}
        <div className="footer-col">
          <h4 className="footer-col-title">Proyecto académico</h4>
          <p className="footer-brand-text">
            No somos una entidad financiera. No se reciben
            fondos ni se otorgan créditos reales.
          </p>
        </div>
      </div>
    </footer>
  );
}
