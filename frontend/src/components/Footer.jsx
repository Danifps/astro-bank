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
            <li><a href="#quienes-somos">Quiénes somos</a></li>
            <li><a href="#soluciones">Soluciones de crédito</a></li>
            <li><a href="#inversionistas">Para inversionistas</a></li>
            <li><a href="#preguntas">Preguntas frecuentes</a></li>
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
