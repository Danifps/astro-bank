import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TiltedCard from './TiltedCard';
import AstroCreditCard from './AstroCreditCard';
import '../styles/CreditHeroSection.css';

export default function CreditHeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const sectionRef = useRef(null);

  // Formatear el contador en un número de tarjeta de 16 dígitos agrupados de 4 en 4
  const formatCardNumber = (count) => {
    const padded = String(count).padStart(16, '0');
    return `${padded.slice(0, 4)}  ${padded.slice(4, 8)}  ${padded.slice(8, 12)}  ${padded.slice(12, 16)}`;
  };

  const handleCardClick = () => {
    setClickCount((prev) => prev + 1);
  };

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
            <span>Activa tu crédito</span>
            <ArrowRight size={18} className="credit-hero-btn-arrow" />
          </Link>
        </div>

        {/* Columna Derecha: Tarjeta de Crédito 3D Levitando a todo color */}
        <div className="credit-hero-right">
          <div className="credit-hero-card-stage">
            {/* Halo de luz cósmico de fondo */}
            <div className="credit-hero-ambient-glow" aria-hidden="true" />
            
            <TiltedCard
              maxTilt={22}
              scaleOnHover={1.06}
              perspective={1200}
              showGlare={true}
              showHolo={true}
              onClick={handleCardClick}
            >
              <AstroCreditCard
                cardNumber={formatCardNumber(clickCount)}
                cardHolder="DANIEL MORALES"
                expiryDate="08/29"
              />
            </TiltedCard>
          </div>
        </div>

      </div>
    </section>
  );
}
