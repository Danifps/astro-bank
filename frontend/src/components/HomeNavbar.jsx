import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import logotipoImg from '../assets/logotipo.png';
import '../styles/HomeNavbar.css';

export default function HomeNavbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="home-header">
      <div className="home-nav-container">
        
        {/* Izquierda: Logo + Enlaces de navegación */}
        <div className="home-nav-left">
          <Link to="/" className="home-logo-link" title="Astro Bank - Inicio">
            <img src={logotipoImg} alt="Astro Bank" className="home-logo-img" />
          </Link>

          <nav>
            <ul className="home-links-list">
              <li>
                <a href="#personas" className="home-nav-item-link">
                  Para Personas
                </a>
              </li>
              <li>
                <a href="#inversores" className="home-nav-item-link">
                  Para Inversores
                </a>
              </li>
              <li>
                <a href="#faq" className="home-nav-item-link">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Derecha: Acceso Clientes y Hazte Cliente (Desktop) */}
        <div className="home-nav-right">
          
          {/* Dropdown "Acceso Clientes" */}
          <div className="acceso-dropdown-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className={`acceso-dropdown-trigger ${dropdownOpen ? 'active' : ''}`}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span>Acceso Clientes</span>
              <ChevronDown
                size={16}
                className={`acceso-dropdown-chevron ${dropdownOpen ? 'rotated' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="acceso-dropdown-menu" role="menu">
                <Link
                  to="/login"
                  className="acceso-dropdown-item"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  Personas
                </Link>
                <Link
                  to="/login"
                  className="acceso-dropdown-item"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  Inversores
                </Link>
              </div>
            )}
          </div>

          {/* Botón "Hazte Cliente" */}
          <Link to="/registro" className="btn-hazte-cliente">
            Hazte Cliente
          </Link>
        </div>

        {/* Botón Hamburguesa para Móvil */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Menú Móvil desplegable */}
      {mobileMenuOpen && (
        <div className="mobile-nav-panel">
          <a
            href="#personas"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Para Personas
          </a>
          <a
            href="#inversores"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Para Inversores
          </a>
          <a
            href="#faq"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Preguntas Frecuentes
          </a>

          <div className="mobile-actions-row">
            <button
              type="button"
              className="acceso-dropdown-trigger"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <span>Acceso Clientes</span>
              <ChevronDown
                size={16}
                className={`acceso-dropdown-chevron ${dropdownOpen ? 'rotated' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="acceso-dropdown-menu">
                <Link
                  to="/login"
                  className="acceso-dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    setMobileMenuOpen(false);
                  }}
                >
                  Personas
                </Link>
                <Link
                  to="/login"
                  className="acceso-dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    setMobileMenuOpen(false);
                  }}
                >
                  Inversores
                </Link>
              </div>
            )}

            <Link
              to="/registro"
              className="btn-hazte-cliente"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hazte Cliente
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

