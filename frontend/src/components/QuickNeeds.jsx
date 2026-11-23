import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, CreditCard, TrendingUp, HandCoins, Umbrella, ArrowRight } from 'lucide-react';
import '../styles/QuickNeeds.css';

const NEEDS_ITEMS = [
  {
    id: 1,
    title: 'Una Cuenta',
    icon: Wallet,
    href: '/registro',
    isExternal: false
  },
  {
    id: 2,
    title: 'Una Tarjeta',
    icon: CreditCard,
    href: '#tarjetas',
    isExternal: true
  },
  {
    id: 3,
    title: 'Productos de Inversión',
    icon: TrendingUp,
    href: '#inversiones',
    isExternal: true
  },
  {
    id: 4,
    title: 'Financiamiento',
    icon: HandCoins,
    href: '#financiamiento',
    isExternal: true
  },
  {
    id: 5,
    title: 'Un Seguro',
    icon: Umbrella,
    href: '#seguros',
    isExternal: true
  }
];

export default function QuickNeeds() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Se activa cuando el usuario hace scroll y entra en la sección
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Una sola vez para mantener el estado
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
      className={`quick-needs-section ${isVisible ? 'visible' : ''}`}
      aria-label="Accesos rápidos a productos"
    >
      <div className="quick-needs-container">
        
        {/* Título en formato de pregunta */}
        <div className="quick-needs-header">
          <h2 className="quick-needs-title">Cuéntanos, ¿qué necesitas?</h2>
        </div>

        {/* Cuadrícula de 5 tarjetas con animación de elevación escalonada */}
        <div className="quick-needs-grid">
          {NEEDS_ITEMS.map((item, index) => {
            const IconComponent = item.icon;
            // Retraso escalonado de 100ms entre cada tarjeta para que entren en cascada fluida
            const delay = `${index * 110}ms`;

            const CardContent = (
              <>
                {/* Ícono superior */}
                <div className="quick-needs-icon-wrapper">
                  <IconComponent size={26} strokeWidth={2} />
                </div>

                {/* Título de la necesidad */}
                <h3 className="quick-needs-card-title">{item.title}</h3>

                {/* Flecha inferior derecha interactiva */}
                <div className="quick-needs-arrow-row">
                  <span className="quick-needs-arrow-btn">
                    <ArrowRight size={18} strokeWidth={2.2} />
                  </span>
                </div>
              </>
            );

            return item.isExternal ? (
              <a
                key={item.id}
                href={item.href}
                className="quick-needs-card"
                style={{ transitionDelay: isVisible ? delay : '0ms' }}
                title={`Ver más sobre ${item.title}`}
              >
                {CardContent}
              </a>
            ) : (
              <Link
                key={item.id}
                to={item.href}
                className="quick-needs-card"
                style={{ transitionDelay: isVisible ? delay : '0ms' }}
                title={`Abrir ${item.title}`}
              >
                {CardContent}
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
