import { Link, useLocation } from 'react-router-dom';
import logotipoImg from '../assets/logotipo.png';
import '../styles/Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const isRegister = location.pathname.startsWith('/registro');

  return (
    <header className="bank-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="header-logo-link" title="Astro Bank">
            <img src={logotipoImg} alt="Astro Bank" className="header-logo-img" />
          </Link>
          <span className="header-divider">/</span>
          <span className="header-breadcrumb">
            {isRegister ? 'Registro Natural' : 'Acceso a Personas'}
          </span>
        </div>
        <div className="header-right">
          <Link to="/" className="header-nav-link">
            Ir a Astro Bank
          </Link>
        </div>
      </div>
    </header>
  );
}
