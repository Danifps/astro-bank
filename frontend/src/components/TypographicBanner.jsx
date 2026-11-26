import { useState, useEffect, useRef } from 'react';
import '../styles/TypographicBanner.css';

/**
 * Ícono vectorial de la Estrella de Astro Bank según el boceto:
 * Estrella de 4 puntas cóncava con estrella interior concéntrica.
 */
function AstroStar({ className = '' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Estrella Exterior */}
      <path
        d="M50 4 Q50 50 96 50 Q50 50 50 96 Q50 50 4 50 Q50 50 50 4 Z"
        stroke="#0000FF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(238, 244, 255, 0.7)"
      />
      {/* Estrella Interior idéntica al diseño de Astro Bank */}
      <path
        d="M50 26 Q50 50 74 50 Q50 50 50 74 Q50 50 26 50 Q50 50 50 26 Z"
        stroke="#0000FF"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#0000FF"
        fillOpacity="0.18"
      />
    </svg>
  );
}

export default function TypographicBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={bannerRef}
      className={`typographic-banner-section ${isVisible ? 'visible' : ''}`}
      aria-label="El Crédito Que Despega contigo"
    >
      {/* Estrella Flotante Superior Izquierda */}
      <div className="floating-star-wrapper star-top-left">
        <AstroStar className="star-icon-anim" />
      </div>

      {/* Contenedor del Título Principal */}
      <div className="typographic-banner-container">
        <h2 className="typographic-banner-title">
          <span className="typographic-banner-line typographic-line-1">El Crédito</span>
          <span className="typographic-banner-line typographic-line-2">
            Que <span className="typographic-banner-highlight">Despega</span> contigo
          </span>
        </h2>
      </div>

      {/* Estrella Flotante Inferior Derecha */}
      <div className="floating-star-wrapper star-bottom-right">
        <AstroStar className="star-icon-anim" />
      </div>

      {/* Estrella adicional pequeña de acento */}
      <div className="floating-star-wrapper star-accent">
        <AstroStar className="star-icon-anim" />
      </div>
    </section>
  );
}

