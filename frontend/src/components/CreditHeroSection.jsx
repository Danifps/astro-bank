import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import '../styles/CreditHeroSection.css';

/**
 * ========================================================
 * IMAGEN DEL HERO DIVIDIDO
 * ========================================================
 * Para colocar tu foto:
 * 1. Coloca tu imagen en 'frontend/src/assets/' (ej: foto.png)
 * 2. Asigna la ruta aquí o impórtala:
 *    Ejemplo: const HERO_IMAGE = '/src/assets/foto.png'
 */
const HERO_IMAGE = ''; // <-- AGREGA AQUÍ TU FOTO ('/src/assets/foto.png')

export default function CreditHeroSection({ imageSrc = HERO_IMAGE }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`credit-hero-section ${isVisible ? 'visible' : ''}`}
      aria-label="Tu crédito como tú quieras"
    >
      <div className="credit-hero-container">
        
        {/* Columna Izquierda: Título, Descripción y Botón */}
        <div className="credit-hero-left">
          <h2 className="credit-hero-title">
            <span>Tu crédito,</span>
            <span>como tú quieras.</span>
          </h2>

          <p className="credit-hero-description">
            Una sola línea de crédito para comprar, pagar y mover tu dinero:
            úsala por pagomóvil, en tiendas aliadas o pásala directo a tu banco.
          </p>

          <Link to="/registro" className="credit-hero-btn">
            Activa tu credito
          </Link>
        </div>

        {/* Columna Derecha: Contenedor para foto.png */}
        <div className="credit-hero-right">
          <div className="credit-hero-image-wrapper">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Tu crédito, como tú quieras - Astro Bank"
                className="credit-hero-img"
              />
            ) : (
              <div className="credit-hero-placeholder">
                <div className="credit-hero-placeholder-icon">
                  <ImageIcon size={28} />
                </div>
                <span className="credit-hero-placeholder-tag">foto.png</span>
                <span className="credit-hero-placeholder-hint">
                  Espacio reservado para tu imagen lateral
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

