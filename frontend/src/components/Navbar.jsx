import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, User, TrendingUp, ArrowRight } from 'lucide-react';
import logotipoImg from '../assets/logotipo.png';
import '../styles/HomeNavbar.css';

/**
 * Navbar Estandarizado de Astro Bank
 * Barra institucional unificada para Inicio, Registro, Accesos y demás páginas.
 * Incluye logotipo con estrella, dropdown "Accede", botón "Hazte Cliente",
 * menú responsive móvil y línea inferior curva neón al 90%.
 */
export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const isLogin = location.pathname.startsWith('/login');
  const isRegister = location.pathname.startsWith('/registro');

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

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="home-header">
      <div className="home-nav-container">
        
        {/* Izquierda: Logotipo Astro Bank */}
        <div className="home-nav-left">
          <Link to="/" className="home-logo-link" title="Astro Bank - Inicio">
            <img src={logotipoImg} alt="Astro Bank" className="home-logo-img" />
          </Link>
        </div>

        {/* Derecha: Acciones Contextuales Inteligentes (Desktop) */}
        <div className="home-nav-right">
          
          {/* CONTEXTO 1: EN PÁGINAS DE LOGIN (/login o /login-inversionistas) */}
          {isLogin && (
            <>
              {/* Enlace sutil para alternar entre portales */}
              {location.pathname === '/login-inversionistas' ? (
                <Link to="/login" className="nav-portal-switch-link" title="Cambiar a Banca Personas">
                  <User size={15} />
                  <span>Banca Personas</span>
                </Link>
              ) : (
                <Link to="/login-inversionistas" className="nav-portal-switch-link" title="Cambiar a Portal Inversionistas">
                  <TrendingUp size={15} />
                  <span>Portal Inversionistas</span>
                </Link>
              )}

              {/* Botón para quienes aún no son clientes */}
              <Link to="/registro" className="btn-hazte-cliente">
                Hazte Cliente
              </Link>
            </>
          )}

          {/* CONTEXTO 2: EN PÁGINA DE REGISTRO (/registro) */}
          {isRegister && (
            <div className="nav-register-actions">
              <span className="nav-login-hint">¿Ya tienes cuenta?</span>

              {/* Dropdown "Accede" para entrar a Personas o Inversores */}
              <div className="acceso-dropdown-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className={`acceso-dropdown-trigger ${dropdownOpen ? 'active' : ''}`}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <span>Accede</span>
                  <ChevronDown
                    size={16}
                    className={`acceso-dropdown-chevron ${dropdownOpen ? 'rotated' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="acceso-dropdown-menu" role="menu">
                    <div className="acceso-dropdown-header">
                      <span>Portal de Acceso</span>
                    </div>

                    <Link
                      to="/login"
                      className="acceso-dropdown-item"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="acceso-item-icon">
                        <User size={18} />
                      </div>
                      <div className="acceso-item-text">
                        <span className="acceso-item-title">Personas</span>
                        <span className="acceso-item-desc">Cuentas, créditos y pagos</span>
                      </div>
                      <ArrowRight size={15} className="acceso-item-arrow" />
                    </Link>

                    <Link
                      to="/login-inversionistas"
                      className="acceso-dropdown-item"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="acceso-item-icon">
                        <TrendingUp size={18} />
                      </div>
                      <div className="acceso-item-text">
                        <span className="acceso-item-title">Inversores</span>
                        <span className="acceso-item-desc">Rendimientos y portafolio</span>
                      </div>
                      <ArrowRight size={15} className="acceso-item-arrow" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTEXTO 3: EN HOME (/) O CUALQUIER OTRA PÁGINA DE MARKETING */}
          {!isLogin && !isRegister && (
            <>
              {/* Dropdown "Accede" */}
              <div className="acceso-dropdown-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className={`acceso-dropdown-trigger ${dropdownOpen ? 'active' : ''}`}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <span>Accede</span>
                  <ChevronDown
                    size={16}
                    className={`acceso-dropdown-chevron ${dropdownOpen ? 'rotated' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="acceso-dropdown-menu" role="menu">
                    <div className="acceso-dropdown-header">
                      <span>Portal de Acceso</span>
                    </div>

                    <Link
                      to="/login"
                      className="acceso-dropdown-item"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="acceso-item-icon">
                        <User size={18} />
                      </div>
                      <div className="acceso-item-text">
                        <span className="acceso-item-title">Personas</span>
                        <span className="acceso-item-desc">Cuentas, créditos y pagos</span>
                      </div>
                      <ArrowRight size={15} className="acceso-item-arrow" />
                    </Link>

                    <Link
                      to="/login-inversionistas"
                      className="acceso-dropdown-item"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="acceso-item-icon">
                        <TrendingUp size={18} />
                      </div>
                      <div className="acceso-item-text">
                        <span className="acceso-item-title">Inversores</span>
                        <span className="acceso-item-desc">Rendimientos y portafolio</span>
                      </div>
                      <ArrowRight size={15} className="acceso-item-arrow" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Botón "Hazte Cliente" */}
              <Link to="/registro" className="btn-hazte-cliente">
                Hazte Cliente
              </Link>
            </>
          )}

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

      {/* Línea divisoria inferior al 90% con degradado neón ligero y extremos curvos */}
      <div className="home-nav-neon-divider" aria-hidden="true" />

      {/* Menú Móvil desplegable Contextual */}
      {mobileMenuOpen && (
        <div className="mobile-nav-panel">
          <div className="mobile-actions-row">
            
            {/* Móvil Caso 1: En Login */}
            {isLogin && (
              <>
                {location.pathname === '/login-inversionistas' ? (
                  <Link
                    to="/login"
                    className="nav-portal-switch-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>Ir a Banca Personas</span>
                  </Link>
                ) : (
                  <Link
                    to="/login-inversionistas"
                    className="nav-portal-switch-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <TrendingUp size={16} />
                    <span>Ir a Portal Inversionistas</span>
                  </Link>
                )}

                <Link
                  to="/registro"
                  className="btn-hazte-cliente"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hazte Cliente
                </Link>
              </>
            )}

            {/* Móvil Caso 2: En Registro */}
            {isRegister && (
              <div className="mobile-register-context">
                <span className="nav-login-hint">¿Ya tienes cuenta?</span>
                <Link
                  to="/login"
                  className="btn-hazte-cliente"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Acceder a Banca Personas
                </Link>
                <Link
                  to="/login-inversionistas"
                  className="nav-portal-switch-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <TrendingUp size={16} />
                  <span>Acceder como Inversionista</span>
                </Link>
              </div>
            )}

            {/* Móvil Caso 3: En Home / Otras páginas */}
            {!isLogin && !isRegister && (
              <>
                <button
                  type="button"
                  className="acceso-dropdown-trigger"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <span>Accede</span>
                  <ChevronDown
                    size={16}
                    className={`acceso-dropdown-chevron ${dropdownOpen ? 'rotated' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="acceso-dropdown-menu">
                    <div className="acceso-dropdown-header">
                      <span>Portal de Acceso</span>
                    </div>
                    <Link
                      to="/login"
                      className="acceso-dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className="acceso-item-icon">
                        <User size={18} />
                      </div>
                      <div className="acceso-item-text">
                        <span className="acceso-item-title">Personas</span>
                        <span className="acceso-item-desc">Cuentas, créditos y pagos</span>
                      </div>
                      <ArrowRight size={15} className="acceso-item-arrow" />
                    </Link>
                    <Link
                      to="/login-inversionistas"
                      className="acceso-dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className="acceso-item-icon">
                        <TrendingUp size={18} />
                      </div>
                      <div className="acceso-item-text">
                        <span className="acceso-item-title">Inversores</span>
                        <span className="acceso-item-desc">Rendimientos y portafolio</span>
                      </div>
                      <ArrowRight size={15} className="acceso-item-arrow" />
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
              </>
            )}

          </div>
        </div>
      )}
    </header>
  );
}
