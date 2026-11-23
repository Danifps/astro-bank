import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/QuickMoneyCTA.css';

export default function QuickMoneyCTA() {
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
        threshold: 0.2,
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
      className={`quick-money-section ${isVisible ? 'visible' : ''}`}
      aria-label="¿Necesitas dinero rápido?"
    >
      <div className="quick-money-container">
        <h2 className="quick-money-title">¿Necesitas dinero rápido?</h2>
        <p className="quick-money-subtitle">
          Solicita tu préstamo desde la web en minutos. Sin papeleo, sin filas.
        </p>
        <Link to="/registro" className="quick-money-btn">
          Pide tu crédito ahora
        </Link>
      </div>
    </section>
  );
}

