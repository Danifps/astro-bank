import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import '../styles/QuickMoneyCTA.css';

/**
 * Ícono vectorial de la Estrella de Astro Bank según el diseño:
 * Estrella de 4 puntas cóncava con estrella interior concéntrica y resplandor azul.
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
        fill="rgba(238, 244, 255, 0.75)"
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

export default function QuickMoneyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Detecta cuando el usuario llega a la mitad de la sección
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.5, // Se activa cuando va por la mitad de la sección (50% visible)
        rootMargin: '0px 0px -20px 0px'
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
      className={`quick-money-section ${isVisible ? 'visible' : ''}`}
      aria-label="¿Necesitas dinero rápido?"
    >
      {/* Resplandor ambiental suave que asciende desde la base */}
      <div className="quick-money-ambient-bottom" aria-hidden="true" />

      {/* Halo ambiental central de resplandor */}
      <div className="quick-money-cone-glow" aria-hidden="true" />

      {/* 
        Estrellas que ascienden suave y pausadamente desde abajo de la pantalla
        hacia sus respectivas posiciones, manteniendo levitación continua.
      */}
      
      {/* 1. Estrella Superior Izquierda (Grande) */}
      <div className="quick-money-star-launcher star-1" aria-hidden="true">
        <div className="quick-money-star-floater float-1">
          <AstroStar />
        </div>
      </div>

      {/* 2. Estrella Inferior Izquierda (Mediana) */}
      <div className="quick-money-star-launcher star-2" aria-hidden="true">
        <div className="quick-money-star-floater float-2">
          <AstroStar />
        </div>
      </div>

      {/* 3. Estrella Acento Superior Izquierda Interior */}
      <div className="quick-money-star-launcher star-3" aria-hidden="true">
        <div className="quick-money-star-floater float-3">
          <AstroStar />
        </div>
      </div>

      {/* Contenedor Central con texto y botón */}
      <div className="quick-money-container">
        <h2 className="quick-money-title">¿Necesitas dinero rápido?</h2>
        <p className="quick-money-subtitle">
          Solicita tu préstamo desde la web en minutos. Sin papeleo, sin filas.
        </p>
        <Link to="/registro" className="quick-money-btn">
          <span>Pide tu crédito ahora</span>
          <ArrowRight size={19} className="quick-money-btn-arrow" />
        </Link>
      </div>

      {/* 4. Estrella Acento Superior Derecha Interior */}
      <div className="quick-money-star-launcher star-4" aria-hidden="true">
        <div className="quick-money-star-floater float-4">
          <AstroStar />
        </div>
      </div>

      {/* 5. Estrella Superior Derecha */}
      <div className="quick-money-star-launcher star-5" aria-hidden="true">
        <div className="quick-money-star-floater float-5">
          <AstroStar />
        </div>
      </div>

      {/* 6. Estrella Inferior Derecha (Grande) */}
      <div className="quick-money-star-launcher star-6" aria-hidden="true">
        <div className="quick-money-star-floater float-6">
          <AstroStar />
        </div>
      </div>
    </section>
  );
}
